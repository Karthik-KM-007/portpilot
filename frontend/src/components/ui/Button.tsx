import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'operational';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  className = '',
  disabled,
  ...props
}) => {
  const sizeClasses = {
    sm: 'px-2.5 py-1 text-xs gap-1.5',
    md: 'px-3.5 py-1.5 text-xs font-medium gap-2',
    lg: 'px-4 py-2 text-sm font-medium gap-2.5',
  }[size];

  const variantClasses = {
    primary: 'bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 text-white hover:from-blue-500 hover:to-cyan-400 border border-blue-400/40 shadow-[0_2px_14px_rgba(37,99,235,0.4)] focus:ring-2 focus:ring-blue-500',
    secondary: 'bg-[#0A1326] text-slate-200 hover:bg-[#101F3E] hover:text-white border border-[#1C325B] shadow-xs focus:ring-2 focus:ring-blue-500',
    operational: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white border border-blue-400/50 shadow-[0_2px_14px_rgba(37,99,235,0.4)] focus:ring-2 focus:ring-blue-400',
    danger: 'bg-rose-950/70 text-rose-300 hover:bg-rose-900/70 border border-rose-800/60 focus:ring-2 focus:ring-rose-500',
    ghost: 'bg-transparent text-slate-400 hover:bg-[#0D1830] hover:text-slate-200 border-transparent',
  }[variant];

  return (
    <button
      className={`inline-flex items-center justify-center rounded transition-all cursor-pointer select-none font-medium tracking-tight disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses} ${variantClasses} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin -ml-0.5 h-3.5 w-3.5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      <span>{children}</span>
    </button>
  );
};
