
import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Slider } from '@/components/ui/slider';

interface ImageComparisonSliderProps {
  originalImage: string;
  processedImage: string;
}

const ImageComparisonSlider = ({ originalImage, processedImage }: ImageComparisonSliderProps) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  
  // Handle mouse drag for interactive sliding
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const handleMouseDown = () => {
      isDragging.current = true;
    };
    
    const handleMouseUp = () => {
      isDragging.current = false;
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      
      const rect = container.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      const newPosition = (x / rect.width) * 100;
      setSliderPosition(newPosition);
    };
    
    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="w-full h-full">
      {/* Controls */}
      <div className="mb-4">
        <p className="text-sm text-muted-foreground mb-2">
          Drag the slider to compare original and processed images
        </p>
        <Slider
          value={[sliderPosition]}
          onValueChange={(values) => setSliderPosition(values[0])}
          min={0}
          max={100}
          step={1}
          className="my-2"
        />
      </div>
      
      {/* Image container */}
      <div 
        ref={containerRef}
        className="relative w-full h-full rounded-xl overflow-hidden cursor-ew-resize"
      >
        {/* Checkerboard background (visible through transparent areas) */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundSize: '20px 20px',
            backgroundImage: 'linear-gradient(45deg, #aaaaaa 25%, transparent 25%), linear-gradient(-45deg, #aaaaaa 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #aaaaaa 75%), linear-gradient(-45deg, transparent 75%, #aaaaaa 75%)',
            backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
            opacity: 0.2,
          }}
        />
        
        {/* Original image (full width) */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${originalImage})`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
          }}
        />
        
        {/* Processed image (partial width based on slider) */}
        <div 
          className="absolute inset-0 overflow-hidden"
          style={{
            width: `${sliderPosition}%`,
          }}
        >
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${processedImage})`,
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              width: `${100 * (100 / sliderPosition)}%`,
              transform: `translateX(${sliderPosition === 0 ? 0 : -(100 - sliderPosition) * (100 / sliderPosition)}%)`,
            }}
          />
        </div>
        
        {/* Slider handle */}
        <motion.div 
          className="absolute top-0 bottom-0 w-0.5 bg-white cursor-ew-resize z-10 shadow-lg"
          style={{
            left: `${sliderPosition}%`,
            x: '-50%',
          }}
          animate={{ x: '-50%' }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <motion.div 
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 bg-white rounded-full border-2 border-blue-500 flex items-center justify-center shadow-lg"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="w-0.5 h-4 bg-blue-500 rounded-full"></div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default ImageComparisonSlider;
