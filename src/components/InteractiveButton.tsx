'use client';

import React, { useState, MouseEvent } from 'react';
import Link from 'next/link';

interface InteractiveButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  className?: string;
  variant?: 'primary' | 'secondary';
  type?: 'button' | 'submit' | 'reset';
}

const InteractiveButton: React.FC<InteractiveButtonProps> = ({
  children,
  href,
  onClick,
  className = '',
  variant = 'primary',
  type = 'button',
}) => {
  const [showRune, setShowRune] = useState(false);
  const [clickCoords, setClickCoords] = useState({ x: 0, y: 0 });

  const handleClick = (e: MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setClickCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });

    setShowRune(true);
    setTimeout(() => setShowRune(false), 600); // Match animation duration

    if (onClick) {
      onClick(e);
    }
  };

  const baseStyles = `
    relative overflow-hidden inline-flex items-center justify-center
    rounded-md px-5 py-3 text-sm font-display font-semibold transition-all duration-300
    focus:outline-none focus-visible:ring-2 focus-visible:ring-royal-amethyst
  `;

  const variantStyles =
    variant === 'primary'
      ? `
        bg-royal-amethyst text-white shadow-lg
        hover:bg-purple-700
        hover:shadow-[0_0_20px_rgba(16,185,129,0.5)]
        border border-transparent
      `
      : `
        bg-charcoal-violet/50 text-royal-amethyst
        border border-royal-amethyst/50
        hover:border-royal-amethyst hover:text-royal-amethyst/80
        hover:shadow-[0_0_15px_rgba(16,185,129,0.3)]
        backdrop-blur-sm
      `;

  const combinedClasses = `${baseStyles} ${variantStyles} ${className}`;

  const renderRune = () => (
    showRune && (
      <span
        className="absolute pointer-events-none text-emerald-green animate-rune-flash text-2xl font-bold select-none z-50"
        style={{
          left: clickCoords.x,
          top: clickCoords.y,
          transform: 'translate(-50%, -50%)',
        }}
        aria-hidden="true"
      >
        ᚲ
      </span>
    )
  );

  if (href) {
    return (
      <Link href={href} className={combinedClasses} onClick={handleClick}>
        <span className="relative z-10">{children}</span>
        {renderRune()}
      </Link>
    );
  }

  return (
    <button type={type} className={combinedClasses} onClick={handleClick}>
      <span className="relative z-10">{children}</span>
      {renderRune()}
    </button>
  );
};

export default InteractiveButton;
