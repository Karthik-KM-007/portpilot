import React from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
  helperText?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  options,
  helperText,
  className = '',
  id,
  required,
  ...props
}) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5"
        >
          {label} {required && <span className="text-rose-400">*</span>}
        </label>
      )}

      <div className="relative rounded bg-[#060D1E] border border-[#16294D] focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500/35 transition-colors shadow-2xs">
        <select
          id={selectId}
          required={required}
          className={`w-full py-2 pl-3 pr-8 text-xs text-slate-100 bg-transparent focus:outline-none appearance-none cursor-pointer disabled:bg-[#040814] ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[#0B1733] text-slate-100">
              {opt.label}
            </option>
          ))}
        </select>

        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-500">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
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
