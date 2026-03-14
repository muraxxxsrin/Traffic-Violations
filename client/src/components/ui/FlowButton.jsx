'use client';
import React from 'react';
import { ArrowRight } from 'lucide-react';

const VARIANT_STYLES = {
  dark: {
    button: 'border-[#111111]/30 text-[#111111] hover:text-white',
    bubble: 'bg-[#111111]',
    arrow: 'stroke-[#111111] group-hover:stroke-white',
  },
  orange: {
    button: 'border-[#ff7043]/40 text-[#ff7043] hover:text-white',
    bubble: 'bg-[#ff7043]',
    arrow: 'stroke-[#ff7043] group-hover:stroke-white',
  },
  light: {
    button: 'border-[#d0d5dd] bg-white text-[#111111] hover:text-white',
    bubble: 'bg-[#111111]',
    arrow: 'stroke-[#111111] group-hover:stroke-white',
  },
  muted: {
    button: 'border-[#d0d5dd] bg-[#f2f4f7] text-[#667085] hover:text-white',
    bubble: 'bg-[#667085]',
    arrow: 'stroke-[#667085] group-hover:stroke-white',
  },
};

const SIZE_STYLES = {
  sm: 'px-5 py-2.5 text-sm',
  md: 'px-8 py-3 text-sm',
  lg: 'px-9 py-3.5 text-base',
};

export function FlowButton({
  text = 'Modern Button',
  onClick,
  type = 'button',
  className = '',
  variant = 'dark',
  size = 'md',
  fullWidth = false,
  disabled = false,
  showArrow = true,
}) {
  const styles = VARIANT_STYLES[variant] || VARIANT_STYLES.dark;
  const sizeClass = SIZE_STYLES[size] || SIZE_STYLES.md;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={[
        'group relative flex items-center justify-center gap-1 overflow-hidden rounded-[100px]',
        'border-[1.5px] font-semibold cursor-pointer transition-all duration-[600ms]',
        'ease-[cubic-bezier(0.23,1,0.32,1)] hover:border-transparent hover:rounded-[12px]',
        'active:scale-[0.95] disabled:cursor-not-allowed disabled:opacity-60',
        sizeClass,
        fullWidth ? 'w-full' : '',
        styles.button,
        className,
      ].join(' ')}
    >
      {showArrow && (
        <ArrowRight
          className={[
            'absolute left-[-25%] z-[9] h-4 w-4 fill-none transition-all duration-[800ms]',
            'ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:left-4',
            styles.arrow,
          ].join(' ')}
        />
      )}
      <span
        className={[
          'relative z-[1] transition-all duration-[800ms] ease-out',
          showArrow ? '-translate-x-3 group-hover:translate-x-3' : 'translate-x-0',
        ].join(' ')}
      >
        {text}
      </span>
      <span
        className={[
          'absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-[50%]',
          'opacity-0 transition-all duration-[800ms] ease-[cubic-bezier(0.19,1,0.22,1)]',
          'group-hover:h-[220px] group-hover:w-[220px] group-hover:opacity-100',
          styles.bubble,
        ].join(' ')}
      />
      {showArrow && (
        <ArrowRight
          className={[
            'absolute right-4 z-[9] h-4 w-4 fill-none transition-all duration-[800ms]',
            'ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:right-[-25%]',
            styles.arrow,
          ].join(' ')}
        />
      )}
    </button>
  );
}
