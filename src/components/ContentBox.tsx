'use client';

import React from 'react';

interface ContentBoxProps {
  children: React.ReactNode;
  className?: string;
}

const ContentBox: React.FC<ContentBoxProps> = ({ children, className }) => {
  return (
    <div
      className={`
        bg-[var(--panel)]
        border border-muted-eldritch-green/35
        shadow-[0_14px_40px_rgba(0,0,0,0.35)]
        rounded-xl
        p-6
        text-off-white
        backdrop-blur-md
        ${className || ''}
      `}
    >
      {children}
    </div>
  );
};

export default ContentBox;
