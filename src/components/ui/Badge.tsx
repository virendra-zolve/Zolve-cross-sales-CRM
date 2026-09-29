import React from 'react';

interface BadgeProps {
  status?: 'active' | 'inactive' | 'qualified' | 'pending' | 'breached' | 'due' | 'priority-high' | 'priority-medium' | 'priority-low';
  children: React.ReactNode;
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  status = 'active',
  children,
  size = 'md',
  className = '',
}) => {
  const baseStyles = 'inline-flex items-center rounded-full font-medium whitespace-nowrap';

  const sizeStyles = {
    sm: 'px-2 py-1 text-label',
    md: 'px-3 py-1.5 text-body-sm',
  };

  // Status color mappings
  const statusStyles = {
    active: 'bg-status-active text-white',
    inactive: 'bg-status-inactive text-white',
    qualified: 'bg-status-qualified text-white',
    pending: 'bg-status-pending text-neutral-text-primary',
    breached: 'bg-status-breached text-white',
    due: 'bg-status-due text-white',
    'priority-high': 'bg-priority-high text-white',
    'priority-medium': 'bg-priority-medium text-neutral-text-primary',
    'priority-low': 'bg-priority-low text-white',
  };

  const combinedClassName = `
    ${baseStyles}
    ${sizeStyles[size]}
    ${statusStyles[status] || statusStyles.active}
    ${className}
  `.trim();

  return <span className={combinedClassName}>{children}</span>;
};

export default Badge;
