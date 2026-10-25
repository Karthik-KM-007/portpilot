import React from 'react';

interface MetricPanelProps {
  label: string;
  value: string | number;
  indicator?: {
    text: string;
    type?: 'positive' | 'warning' | 'negative' | 'neutral';
  };
  subtext?: string;
  icon?: React.ReactNode;
}

export const MetricPanel: React.FC<MetricPanelProps> = ({
  label,
  value,
  indicator,
  subtext,
  icon
}) => {
  const indicatorColor = {
    positive: 'text-cyan-300 bg-blue-950/70 border-blue-700/60',
    warning: 'text-amber-300 bg-amber-950/70 border-amber-800/60',
    negative: 'text-rose-300 bg-rose-950/70 border-rose-800/60',
    neutral: 'text-slate-300 bg-[#0B1733] border-[#1C366B]',
  }[indicator?.type || 'neutral'];

  return (
    <div className="bg-[#071126] border border-[#16294D] rounded-xl p-4 flex flex-col justify-between hover:border-blue-500/40 transition-colors shadow-sm">
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase">
          {label}
        </span>
        {icon && <div className="text-slate-500">{icon}</div>}
      </div>

      <div className="flex items-baseline gap-2.5 my-1">
        <span className="text-2xl font-bold text-slate-100 font-mono-num tracking-tight">
          {value}
        </span>
        {indicator && (
          <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded border font-mono-num ${indicatorColor}`}>
            {indicator.text}
          </span>
        )}
      </div>

      {subtext && (
        <span className="text-xs text-slate-400 mt-1">
          {subtext}
        </span>
      )}
    </div>
  );
};
