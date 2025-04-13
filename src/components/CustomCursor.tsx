
import React, { useEffect, useRef } from 'react';

const CustomCursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorOuterRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const cursor = cursorRef.current;
    const cursorOuter = cursorOuterRef.current;
    if (!cursor || !cursorOuter) return;
    
    const onMouseMove = (e: MouseEvent) => {
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;
      
      cursorOuter.style.left = `${e.clientX}px`;
      cursorOuter.style.top = `${e.clientY}px`;
    };
    
    const onMouseDown = () => {
      cursor.classList.add('scale-75');
      cursorOuter.classList.add('scale-150');
    };
    
    const onMouseUp = () => {
      cursor.classList.remove('scale-75');
      cursorOuter.classList.remove('scale-150');
    };
    
    const onMouseEnterClickable = () => {
      cursor.classList.add('scale-150');
      cursorOuter.classList.add('scale-75', 'opacity-50');
    };
    
    const onMouseLeaveClickable = () => {
      cursor.classList.remove('scale-150');
      cursorOuter.classList.remove('scale-75', 'opacity-50');
    };
    
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mouseup', onMouseUp);
    
    // Apply to all clickable elements including navbar elements
    const clickableElements = document.querySelectorAll('a, button, [role="button"], input, .cursor-pointer, nav *, .search-bar, .nav-item');
    clickableElements.forEach(element => {
      element.addEventListener('mouseenter', onMouseEnterClickable);
      element.addEventListener('mouseleave', onMouseLeaveClickable);
    });
    
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mouseup', onMouseUp);
      
      clickableElements.forEach(element => {
        element.removeEventListener('mouseenter', onMouseEnterClickable);
        element.removeEventListener('mouseleave', onMouseLeaveClickable);
      });
    };
  }, []);
  
  return (
    <>
      <div 
        ref={cursorOuterRef} 
        className="fixed w-8 h-8 rounded-full bg-white/10 pointer-events-none z-[9999] transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-300 border border-white/20"
      />
      <div 
        ref={cursorRef} 
        className="fixed w-4 h-4 rounded-full bg-white/30 pointer-events-none z-[9999] transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300"
      />
    </>
  );
};

export default CustomCursor;
