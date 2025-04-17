
import { toast } from "sonner";
import { pipeline, env } from '@huggingface/transformers';

// Configure transformers.js to always download models
env.allowLocalModels = false;
env.useBrowserCache = false;

const MAX_IMAGE_DIMENSION = 1024;

// Device options and capability detection
const EXECUTION_PROVIDERS = ['wasm', 'webgl', 'cpu'];

/**
 * Removes the background from an uploaded image using AI
 * @param imageUrl URL of the image to process
 * @returns Promise that resolves to a processed image data URL
 */
export const removeBackground = async (imageUrl: string): Promise<string> => {
  try {
    toast.info('Initializing AI system...');
    
    // Load the image
    const img = await loadImageFromUrl(imageUrl);
    console.log('Original image dimensions:', img.naturalWidth, 'x', img.naturalHeight);
    
    // Create a canvas for the input image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Could not create canvas context');
    }
    
    // Resize image if needed and draw it to canvas
    resizeImageIfNeeded(canvas, ctx, img);
    console.log('Processing image dimensions:', canvas.width, 'x', canvas.height);
    
    // Detect best available device for processing
    const device = await detectBestDevice();
    console.log(`Using device: ${device}`);
    toast.info(`Initializing AI model on ${device}...`);
    
    // Use the segmentation model to identify foreground
    // We'll try multiple models for better results
    const modelOptions = [
      'Xenova/segformer-b0-finetuned-ade-512-512', 
      'Xenova/u2net-portrait', 
      'Xenova/isnet-general-use'
    ];
    
    let result = null;
    let modelUsed = '';
    
    // Try models in order until one works
    for (const model of modelOptions) {
      try {
        toast.info(`Loading ${model.split('/')[1]} model...`);
        console.log(`Attempting with model: ${model}`);
        
        // Create a new segmenter with the current model
        const segmenter = await pipeline('image-segmentation', model, {
          quantized: device !== 'cpu', // Use quantized models when possible
          device: device as any,
          progress_callback: (progress: number) => {
            // Custom event for model loading progress
            const event = new CustomEvent('ai-progress', {
              detail: { 
                status: `Loading model (${Math.round(progress * 100)}%)`,
                progress 
              }
            });
            window.dispatchEvent(event);
          }
        });
        
        // Get image data as base64
        const imageData = canvas.toDataURL('image/jpeg', 0.9);
        
        // Process with segmentation model
        toast.info(`Processing with ${model.split('/')[1]}...`);
        result = await segmenter(imageData, {
          threshold: 0.5, // Adjust threshold for better segmentation
        });
        
        // If we got a valid result, use this model
        if (result && Array.isArray(result) && result.length > 0 && result[0].mask) {
          modelUsed = model;
          console.log(`Successfully processed with ${model}`);
          break;
        }
      } catch (error) {
        console.warn(`Failed with model ${model}:`, error);
        // Continue to next model
      }
    }
    
    if (!result || !Array.isArray(result) || result.length === 0 || !result[0].mask) {
      throw new Error('Could not segment image with any available model');
    }
    
    console.log(`Using segmentation result from ${modelUsed}`);
    
    // Post-process the segmentation mask
    const enhancedMask = enhanceSegmentationMask(result[0].mask, canvas.width, canvas.height);
    
    // Create a new canvas for the masked image
    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = canvas.width;
    outputCanvas.height = canvas.height;
    const outputCtx = outputCanvas.getContext('2d', { willReadFrequently: true });
    
    if (!outputCtx) throw new Error('Could not get output canvas context');
    
    // Draw original image
    outputCtx.drawImage(canvas, 0, 0);
    
    // Apply the mask with feathering
    const outputImageData = outputCtx.getImageData(0, 0, outputCanvas.width, outputCanvas.height);
    applyMaskWithFeathering(outputImageData, enhancedMask);
    outputCtx.putImageData(outputImageData, 0, 0);
    
    // Optional: Apply color correction to reduce edge artifacts
    colorCorrectEdges(outputCanvas, outputCtx);
    
    // Convert to PNG with transparency
    const processedImageUrl = outputCanvas.toDataURL('image/png');
    
    toast.success(`Background removed using ${modelUsed.split('/')[1]} model`);
    
    // Return the processed image URL
    return processedImageUrl;
  } catch (error) {
    console.error('Background removal error:', error);
    toast.error('Failed to remove background');
    throw error;
  }
};

/**
 * Detects the best available device for AI processing
 */
async function detectBestDevice(): Promise<string> {
  // Try each device in order of preference
  for (const device of EXECUTION_PROVIDERS) {
    try {
      // Use a small test to verify device capability
      if (device === 'webgpu') {
        // Check if WebGPU is available
        if (!navigator.gpu) {
          console.log('WebGPU not available');
          continue;
        }
        
        try {
          const adapter = await navigator.gpu.requestAdapter();
          if (!adapter) {
            console.log('WebGPU adapter not available');
            continue;
          }
          return 'webgpu';
        } catch (e) {
          console.log('WebGPU check failed:', e);
          continue;
        }
      } else if (device === 'webgl') {
        // Check if WebGL is available
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
        if (!gl) {
          console.log('WebGL not available');
          continue;
        }
        return 'webgl';
      } else {
        // WASM and CPU should always be available
        return device;
      }
    } catch (e) {
      console.log(`Device ${device} check failed:`, e);
    }
  }
  
  // Fallback to safest option
  return 'wasm';
}

/**
 * Enhances the segmentation mask for better quality
 */
function enhanceSegmentationMask(
  mask: { data: number[], width: number, height: number }, 
  width: number, 
  height: number
): Float32Array {
  const enhancedMask = new Float32Array(width * height);
  
  // Resize the mask if needed
  if (mask.width !== width || mask.height !== height) {
    // Simple bilinear interpolation for resizing
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const srcX = (x / width) * mask.width;
        const srcY = (y / height) * mask.height;
        const x1 = Math.floor(srcX);
        const y1 = Math.floor(srcY);
        const x2 = Math.min(x1 + 1, mask.width - 1);
        const y2 = Math.min(y1 + 1, mask.height - 1);
        
        const dx = srcX - x1;
        const dy = srcY - y1;
        
        // Bilinear interpolation
        const value = 
          mask.data[y1 * mask.width + x1] * (1 - dx) * (1 - dy) +
          mask.data[y1 * mask.width + x2] * dx * (1 - dy) +
          mask.data[y2 * mask.width + x1] * (1 - dx) * dy +
          mask.data[y2 * mask.width + x2] * dx * dy;
        
        enhancedMask[y * width + x] = value;
      }
    }
  } else {
    // Copy the mask directly if sizes match
    for (let i = 0; i < mask.data.length; i++) {
      enhancedMask[i] = mask.data[i];
    }
  }
  
  // Apply edge refinement - smoothing for more natural edges
  const smoothedMask = new Float32Array(enhancedMask.length);
  const kernelSize = 3;
  const halfKernel = Math.floor(kernelSize / 2);
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sum = 0;
      let count = 0;
      
      // Apply smoothing kernel
      for (let ky = -halfKernel; ky <= halfKernel; ky++) {
        const py = y + ky;
        if (py < 0 || py >= height) continue;
        
        for (let kx = -halfKernel; kx <= halfKernel; kx++) {
          const px = x + kx;
          if (px < 0 || px >= width) continue;
          
          sum += enhancedMask[py * width + px];
          count++;
        }
      }
      
      smoothedMask[y * width + x] = sum / count;
    }
  }
  
  // Apply a threshold adjustment for better foreground/background separation
  for (let i = 0; i < smoothedMask.length; i++) {
    // Adjust the contrast of the mask to make edges more defined
    const value = smoothedMask[i];
    // Sigmoid function to enhance contrast
    smoothedMask[i] = 1 / (1 + Math.exp(-10 * (value - 0.5)));
  }
  
  return smoothedMask;
}

/**
 * Applies the mask to the image with feathered edges
 */
function applyMaskWithFeathering(imageData: ImageData, mask: Float32Array) {
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;
  
  // Create a distance field for feathering effect
  const distanceField = createDistanceField(mask, width, height);
  
  // Apply the mask with feathering to alpha channel
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const pixelIdx = idx * 4;
      
      // Calculate alpha based on the distance field (0-255)
      const alpha = clamp(Math.round((1 - mask[idx]) * 255), 0, 255);
      
      // Apply feathering at the edges
      const distance = distanceField[idx];
      const featherWidth = 3.0; // Feathering width in pixels
      
      let featheredAlpha = alpha;
      if (distance < featherWidth) {
        // Smooth transition at edges
        const featherFactor = distance / featherWidth;
        featheredAlpha = Math.round(alpha * featherFactor);
      }
      
      // Set the alpha channel
      data[pixelIdx + 3] = 255 - featheredAlpha;
    }
  }
}

/**
 * Creates a distance field from mask for feathering effects
 */
function createDistanceField(mask: Float32Array, width: number, height: number): Float32Array {
  const distanceField = new Float32Array(mask.length);
  const threshold = 0.5;
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const isForeground = mask[idx] >= threshold;
      
      if (isForeground) {
        // For foreground pixels, calculate distance to nearest background pixel
        let minDistance = 100000; // Large initial value
        const searchRadius = 5;
        
        for (let ny = Math.max(0, y - searchRadius); ny < Math.min(height, y + searchRadius); ny++) {
          for (let nx = Math.max(0, x - searchRadius); nx < Math.min(width, x + searchRadius); nx++) {
            const nidx = ny * width + nx;
            if (mask[nidx] < threshold) {
              const dx = nx - x;
              const dy = ny - y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              if (distance < minDistance) {
                minDistance = distance;
              }
            }
          }
        }
        
        distanceField[idx] = Math.min(minDistance, searchRadius);
      } else {
        distanceField[idx] = 0; // Background pixels have zero distance
      }
    }
  }
  
  return distanceField;
}

/**
 * Color correction to reduce edge artifacts
 */
function colorCorrectEdges(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;
  const width = canvas.width;
  const height = canvas.height;
  
  // Look for semi-transparent pixels (edge pixels)
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = (y * width + x) * 4;
      const alpha = data[i + 3];
      
      // Only process semi-transparent edge pixels
      if (alpha > 0 && alpha < 255) {
        // Find nearest fully opaque pixel for color sampling
        const nearestColor = findNearestOpaquePixelColor(data, x, y, width, height);
        
        if (nearestColor) {
          // Adjust color while preserving alpha
          data[i] = nearestColor[0];     // R
          data[i + 1] = nearestColor[1]; // G
          data[i + 2] = nearestColor[2]; // B
        }
      }
    }
  }
  
  // Put the modified image data back to the canvas
  ctx.putImageData(imgData, 0, 0);
}

/**
 * Finds the nearest opaque pixel for color correction
 */
function findNearestOpaquePixelColor(data: Uint8ClampedArray, x: number, y: number, width: number, height: number): number[] | null {
  const radius = 5;
  let nearestDistance = radius * radius + 1;
  let color = null;
  
  // Search in a square around the pixel
  for (let ny = Math.max(0, y - radius); ny < Math.min(height, y + radius); ny++) {
    for (let nx = Math.max(0, x - radius); nx < Math.min(width, x + radius); nx++) {
      const idx = (ny * width + nx) * 4;
      
      // Only consider fully opaque pixels
      if (data[idx + 3] === 255) {
        const dx = nx - x;
        const dy = ny - y;
        const distance = dx * dx + dy * dy;
        
        if (distance < nearestDistance) {
          nearestDistance = distance;
          color = [data[idx], data[idx + 1], data[idx + 2]];
        }
      }
    }
  }
  
  return color;
}

/**
 * Helper function to clamp values
 */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Resizes an image if it's larger than MAX_IMAGE_DIMENSION
 */
function resizeImageIfNeeded(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, image: HTMLImageElement) {
  let width = image.naturalWidth;
  let height = image.naturalHeight;

  if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
    if (width > height) {
      height = Math.round((height * MAX_IMAGE_DIMENSION) / width);
      width = MAX_IMAGE_DIMENSION;
    } else {
      width = Math.round((width * MAX_IMAGE_DIMENSION) / height);
      height = MAX_IMAGE_DIMENSION;
    }
  }

  canvas.width = width;
  canvas.height = height;
  
  // Use higher quality image rendering
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  
  ctx.drawImage(image, 0, 0, width, height);
}

/**
 * Loads an image from a URL
 */
function loadImageFromUrl(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = url;
  });
}

/**
 * Validates an image before processing
 * @param file The file to validate
 * @returns True if valid, false otherwise
 */
export const validateImage = (file: File): boolean => {
  // Check file type
  if (!file.type.startsWith('image/')) {
    toast.error('Please select a valid image file');
    return false;
  }
  
  // Check file size (20MB max)
  const MAX_SIZE = 20 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    toast.error('Image must be smaller than 20MB');
    return false;
  }
  
  return true;
};

/**
 * Converts a File to a data URL
 * @param file The file to convert
 * @returns Promise that resolves to a data URL
 */
export const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string);
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
