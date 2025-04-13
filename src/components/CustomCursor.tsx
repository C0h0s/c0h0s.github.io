
import React, { useEffect, useRef } from 'react';

const CustomCursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;
    
    const onMouseMove = (e: MouseEvent) => {
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;
    };
    
    document.addEventListener('mousemove', onMouseMove);
    
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
    };
  }, []);
  
  return (
    <div 
      ref={cursorRef} 
      className="fixed w-4 h-4 rounded-full bg-white/20 pointer-events-none z-50 transform -translate-x-1/2 -translate-y-1/2"
      style={{ transition: 'transform 0.1s ease-out' }}
    />
  );
};

export default CustomCursor;
