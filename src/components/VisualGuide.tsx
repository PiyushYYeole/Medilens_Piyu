import React, { useState, useEffect } from 'react';
import { X, ArrowDown } from 'lucide-react';

interface VisualGuideProps {
  targetId: string;
  isVisible: boolean;
  onDismiss: () => void;
}

const VisualGuide: React.FC<VisualGuideProps> = ({ targetId, isVisible, onDismiss }) => {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    if (isVisible) {
      const updatePosition = () => {
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          const rect = targetElement.getBoundingClientRect();
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
          
          setPosition({
            top: rect.top + scrollTop - 120, // Position above the button
            left: rect.left + scrollLeft + rect.width / 2 - 150 // Center horizontally
          });
        }
      };

      updatePosition();
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition);

      // Fade in animation delay
      const timer = setTimeout(() => setShowGuide(true), 500);

      return () => {
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition);
        clearTimeout(timer);
      };
    } else {
      setShowGuide(false);
    }
  }, [isVisible, targetId]);

  if (!isVisible) return null;

  return (
    <div 
      className={`visual-guide fixed z-[200] pointer-events-none transition-all duration-500 ${
        showGuide ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
      }`}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: 'translateX(-50%)'
      }}
    >
      {/* Tooltip Popup */}
      <div className="guide-popup relative bg-gradient-to-r from-[var(--primary-cyan)] to-[var(--accent-teal)] p-4 rounded-2xl shadow-[0_20px_40px_rgba(0,212,170,0.3)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] max-w-[300px] pointer-events-auto">
        {/* Close button */}
        <button
          onClick={onDismiss}
          className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-all duration-200 shadow-lg"
        >
          <X className="w-3 h-3" />
        </button>
        
        {/* Popup content */}
        <div className="text-white">
          <p className="text-sm font-medium leading-relaxed">
            Click here to upload your doctor's prescription securely.
          </p>
        </div>
        
        {/* Arrow tail pointing down */}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2">
          <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-t-[12px] border-l-transparent border-r-transparent border-t-[var(--accent-teal)]"></div>
        </div>
      </div>

      {/* Animated Arrow */}
      <div className="arrow-container absolute top-full left-1/2 transform -translate-x-1/2 mt-4">
        <div className="glowing-arrow animate-bounce">
          <ArrowDown 
            className="w-8 h-8 text-[var(--primary-cyan)] filter drop-shadow-[0_0_10px_rgba(0,212,170,0.8)]" 
            style={{
              animation: 'arrowGlow 2s ease-in-out infinite alternate, bounce 1s ease-in-out infinite'
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default VisualGuide;