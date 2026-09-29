import React from 'react';
import { COLORS } from '../../styles/designTokens';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  children,
  onClick,
  className = '',
  type = 'button',
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed';

  const variantStyles = {
    primary: `bg-brand-orange text-white hover:bg-brand-orange-dark disabled:opacity-50 disabled:bg-gray-400 focus:ring-brand-orange`,
    secondary: `bg-neutral-bg-tertiary text-neutral-text-primary border border-neutral-border hover:bg-gray-100 disabled:opacity-50 focus:ring-gray-400`,
    tertiary: `bg-transparent text-neutral-text-primary hover:bg-neutral-bg-secondary disabled:opacity-50 focus:ring-gray-400`,
    danger: `bg-error text-white hover:bg-error-dark disabled:opacity-50 disabled:bg-gray-400 focus:ring-error`,
  };

  const sizeStyles = {
    sm: 'px-3 py-2 text-label gap-1.5',
    md: 'px-4 py-2 text-body-sm gap-2',
    lg: 'px-6 py-3 text-body gap-2',
  };

  const combinedClassName = `
    ${baseStyles}
    ${variantStyles[variant]}
    ${sizeStyles[size]}
    ${className}
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
  `.trim();

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={combinedClassName}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : icon ? (
        icon
      ) : null}
      {children}
    </button>
  );
};

export default Button;
