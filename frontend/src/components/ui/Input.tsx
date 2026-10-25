import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  prefixElement?: React.ReactNode;
  suffixElement?: React.ReactNode;
  mono?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  prefixElement,
  suffixElement,
  mono = false,
  className = '',
  id,
  required,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5"
        >
          {label} {required && <span className="text-rose-400">*</span>}
        </label>
      )}

      <div className="relative flex items-center rounded bg-[#060D1E] border border-[#16294D] focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500/35 transition-colors shadow-2xs">
        {prefixElement && (
          <div className="pl-3 pr-2 text-slate-500 text-xs shrink-0 select-none">
            {prefixElement}
          </div>
        )}

        <input
          id={inputId}
          required={required}
          className={`w-full py-2 px-3 text-xs text-slate-100 bg-transparent placeholder-slate-500 focus:outline-none disabled:bg-[#050912] disabled:text-slate-600 ${mono ? 'font-mono-num' : ''} ${className}`}
          {...props}
        />

        {suffixElement && (
          <div className="pr-3 pl-2 text-slate-500 text-xs shrink-0 select-none">
            {suffixElement}
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1 text-[11px] text-rose-400 font-medium">{error}</p>
      )}

      {helperText && !error && (
        <p className="mt-1 text-[11px] text-slate-500">{helperText}</p>
      )}
    </div>
  );
};
