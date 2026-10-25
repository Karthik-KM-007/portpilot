import React from 'react';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string | number;
  actions?: React.ReactNode;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  badge,
  actions,
}) => {
  return (
    <div className="flex items-center justify-between gap-4 mb-3 pb-2 border-b border-[#16274C]">
      <div className="flex items-center gap-2">
        <div className="w-1 h-3.5 bg-gradient-to-b from-cyan-400 to-blue-600 rounded-xs shadow-[0_0_8px_rgba(59,130,246,0.7)]" />
        <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
          {title}
        </h2>
        {badge !== undefined && (
          <span className="text-[11px] font-mono-num font-semibold px-1.5 py-0.2 rounded bg-[#0B1733] text-blue-300 border border-[#1E3768]">
            {badge}
          </span>
        )}
        {subtitle && (
          <span className="text-xs text-slate-500 font-normal hidden sm:inline">
            — {subtitle}
          </span>
        )}
      </div>
      {actions && <div>{actions}</div>}
    </div>
  );
};
