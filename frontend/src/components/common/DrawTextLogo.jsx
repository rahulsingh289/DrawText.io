import React from 'react';

export const DrawTextLogo = ({ size = 36, className = '' }) => {
  return (
    <div 
      className={`rounded-2xl flex items-center justify-center shadow-glow overflow-hidden shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg 
        viewBox="0 0 100 100" 
        fill="none" 
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="logoFlowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="50%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
          <filter id="logoGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        
        <rect width="100" height="100" rx="26" fill="#121626" stroke="#2a324d" strokeWidth="3"/>
        
        <path 
          d="M 28 50 C 28 36, 42 34, 50 48 C 58 62, 72 64, 72 50 C 72 36, 58 36, 50 50 C 42 64, 28 64, 28 50 Z" 
          stroke="url(#logoFlowGrad)" 
          strokeWidth="9" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          filter="url(#logoGlow)"
        />

        <circle cx="50" cy="50" r="5" fill="#ffffff" filter="url(#logoGlow)"/>
        <circle cx="72" cy="50" r="3.5" fill="#ec4899"/>
        <circle cx="28" cy="50" r="3.5" fill="#6366f1"/>
      </svg>
    </div>
  );
};

// Backwards compatibility alias
export const DrawFlowLogo = DrawTextLogo;
export default DrawTextLogo;
