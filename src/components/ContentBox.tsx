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
        bg-charcoal-violet/50
        border border-muted-eldritch-green/40
        shadow-[0_0_6px_rgba(127,222,115,0.15)]
        rounded-lg
        p-6
        ${className || ''}
      `}
    >
      {children}
    </div>
  );
};

export default ContentBox;
