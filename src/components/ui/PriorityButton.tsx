import React from 'react';
import { COLORS } from '../../styles/designTokens';
import Button from './Button';

interface PriorityButtonProps {
  priority: 'high' | 'medium' | 'low';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export const PriorityButton: React.FC<PriorityButtonProps> = ({
  priority,
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  children,
  onClick,
  className = '',
  type = 'button',
}) => {
  // Map priority levels to base button styles
  const priorityVariantMap = {
    high: 'danger', // Red - #DC2626
    medium: 'primary', // Orange - #FF6B35
    low: 'secondary', // Gray - #9CA3AF
  };

  // For low priority, use custom styling since it's not a built-in variant
  if (priority === 'low') {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed';
    
    const sizeStyles = {
      sm: 'px-3 py-2 text-label gap-1.5',
      md: 'px-4 py-2 text-body-sm gap-2',
      lg: 'px-6 py-3 text-body gap-2',
    };

    const lowPriorityStyles = `bg-priority-low text-white hover:bg-gray-600 disabled:opacity-50 disabled:bg-gray-400 focus:ring-priority-low`;

    const combinedClassName = `
      ${baseStyles}
      ${lowPriorityStyles}
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
  }

  return (
    <Button
      variant={priorityVariantMap[priority]}
      size={size}
      disabled={disabled}
      loading={loading}
      icon={icon}
      onClick={onClick}
      className={className}
      type={type}
    >
      {children}
    </Button>
  );
};

export default PriorityButton;
