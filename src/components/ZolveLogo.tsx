import React from 'react';

interface ZolveLogoProps {
  className?: string;
  showTagline?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const ZolveLogo: React.FC<ZolveLogoProps> = ({
  className = '',
  showTagline = false,
  size = 'md',
}) => {
  const height = size === 'sm' ? 24 : size === 'lg' ? 48 : 32;

  return (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      <img
        src="/Zolve logo png.png"
        alt="Zolve"
        style={{ height: `${height}px`, width: 'auto' }}
        className="shrink-0"
      />

      {showTagline && (
        <div className="hidden sm:flex flex-col border-l border-slate-200 pl-2.5 ml-0.5 leading-none">
          <span className="text-[10px] font-bold text-slate-800 tracking-wide uppercase">
            Jedi / Yoda
          </span>
          <span className="text-[9px] text-slate-500 font-medium">
            Lead Management V1
          </span>
        </div>
      )}
    </div>
  );
};
