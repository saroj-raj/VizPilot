import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'subtle';
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export default function Button({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  type = 'button',
  className = '',
}: ButtonProps) {
  const baseStyles = 'px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantStyles: Record<string, string> = {
    primary: 'bg-primary-green hover:bg-green-600 text-white',
    secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-700',
    danger: 'bg-danger hover:bg-red-600 text-white',
    subtle: 'bg-transparent hover:bg-slate-50 text-slate-600',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={baseStyles + ' ' + variantStyles[variant] + ' ' + className}
    >
      {children}
    </button>
  );
}
