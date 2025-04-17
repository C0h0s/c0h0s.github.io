
import { toast } from "sonner";

/**
 * Removes the background from an uploaded image
 * @param imageUrl URL of the image to process
 * @returns Promise that resolves to a processed image data URL
 */
export const removeBackground = async (imageUrl: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        // Create canvas for processing
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Could not create canvas context'));
          return;
        }
        
        // Set canvas size to match image
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw the original image
        ctx.drawImage(img, 0, 0);
        
        // Get image data for processing
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Process the image data - simple background removal simulation
        // In a real implementation, we would use ML models or algorithms
        // This is a simplified version for demonstration
        for (let y = 0; y < canvas.height; y++) {
          for (let x = 0; x < canvas.width; x++) {
            const i = (y * canvas.width + x) * 4;
            
            // Calculate distance from center
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const distanceFromCenter = Math.sqrt(
              Math.pow((x - centerX) / centerX, 2) + 
              Math.pow((y - centerY) / centerY, 2)
            );
            
            // Apply graduated transparency effect
            if (distanceFromCenter > 0.7) {
              // Calculate alpha based on distance from center
              const alphaFactor = 1 - (distanceFromCenter - 0.7) * 3.3;
              data[i + 3] = Math.max(0, Math.min(255, data[i + 3] * alphaFactor));
            }
          }
        }
        
        // Put the processed image data back on the canvas
        ctx.putImageData(imageData, 0, 0);
        
        // Convert to PNG with transparency
        const processedImageUrl = canvas.toDataURL('image/png');
        
        // Return the processed image URL
        resolve(processedImageUrl);
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      img.src = imageUrl;
    } catch (error) {
      console.error('Background removal error:', error);
      reject(error);
    }
  });
};

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
  
  // Check file size (5MB max)
  const MAX_SIZE = 5 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    toast.error('Image must be smaller than 5MB');
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
