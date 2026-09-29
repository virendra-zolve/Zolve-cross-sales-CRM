import React from 'react';

interface CardProps {
  variant?: 'default' | 'elevated' | 'flat';
  padding?: 'sm' | 'md' | 'lg';
  clickable?: boolean;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  padding = 'md',
  clickable = false,
  children,
  className = '',
  onClick,
}) => {
  const baseStyles = 'bg-white rounded-default border border-neutral-border';

  const variantStyles = {
    default: 'shadow-light',
    elevated: 'shadow-medium',
    flat: 'shadow-none',
  };

  const paddingStyles = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const interactiveStyles = clickable
    ? 'cursor-pointer hover:shadow-medium transition-all duration-150 hover:scale-101'
    : '';

  const combinedClassName = `
    ${baseStyles}
    ${variantStyles[variant]}
    ${paddingStyles[padding]}
    ${interactiveStyles}
    ${className}
  `.trim();

  return (
    <div
      className={combinedClassName}
      onClick={onClick}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyPress={
        clickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                onClick?.();
              }
            }
          : undefined
      }
    >
      {children}
    </div>
  );
};

export default Card;
