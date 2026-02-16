'use client';

import React from 'react';

interface ContentBoxProps {
  children: React.ReactNode;
  className?: string;
}

const ContentBox: React.FC<ContentBoxProps> = ({ children, className }) => {
  return (
    <div className={`relative group ${className || ''}`}>
      {/* Main Container */}
      <div
        className={`
          relative z-10
          bg-[var(--panel)]
          border-2 border-royal-amethyst/30
          shadow-[0_0_30px_rgba(107,33,168,0.15)]
          rounded-xl
          p-6
          text-sharp-silver
          backdrop-blur-md
          transition-all duration-300
          group-hover:border-royal-amethyst/50
          group-hover:shadow-[0_0_40px_rgba(107,33,168,0.25)]
        `}
      >
        {children}
      </div>

      {/* Corner Thorns/Talons */}
      {/* Top Left */}
      <div className="absolute -top-1 -left-1 w-6 h-6 border-t-2 border-l-2 border-sharp-silver z-20 pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute top-0 left-0 w-2 h-2 bg-sharp-silver rotate-45 -translate-x-1 -translate-y-1 shadow-[0_0_10px_rgba(229,231,235,0.8)]" />
      </div>

      {/* Top Right */}
      <div className="absolute -top-1 -right-1 w-6 h-6 border-t-2 border-r-2 border-sharp-silver z-20 pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute top-0 right-0 w-2 h-2 bg-sharp-silver rotate-45 translate-x-1 -translate-y-1 shadow-[0_0_10px_rgba(229,231,235,0.8)]" />
      </div>

      {/* Bottom Left */}
      <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-2 border-l-2 border-sharp-silver z-20 pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute bottom-0 left-0 w-2 h-2 bg-sharp-silver rotate-45 -translate-x-1 translate-y-1 shadow-[0_0_10px_rgba(229,231,235,0.8)]" />
      </div>

      {/* Bottom Right */}
      <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-2 border-r-2 border-sharp-silver z-20 pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute bottom-0 right-0 w-2 h-2 bg-sharp-silver rotate-45 translate-x-1 translate-y-1 shadow-[0_0_10px_rgba(229,231,235,0.8)]" />
      </div>

      {/* Inner Gemstone Facet Overlay (Subtle Gradient Border) */}
      <div
        className="absolute inset-0 rounded-xl pointer-events-none z-0 opacity-20"
        style={{
          background: 'linear-gradient(135deg, rgba(107,33,168,0.4) 0%, transparent 40%, transparent 60%, rgba(16,185,129,0.2) 100%)',
          margin: '-2px' // Extend slightly outside to match border
        }}
      />
    </div>
  );
};

export default ContentBox;
