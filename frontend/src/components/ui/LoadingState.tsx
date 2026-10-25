import React from 'react';

interface LoadingStateProps {
  label?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  label = 'Loading operational telemetry...'
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-16 text-center">
      <div className="relative w-12 h-12 mb-4 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border border-blue-500/30" />
        <div className="absolute inset-2 rounded-full border border-cyan-400/50" />
        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
        <div className="w-2 h-2 rounded-full bg-blue-500" />
      </div>
      <span className="text-xs font-semibold text-slate-300 tracking-wider uppercase">
        {label}
      </span>
      <span className="text-[11px] text-slate-500 mt-1 font-mono-num">
        ESTABLISHING TELEMETRY STREAM
      </span>
    </div>
  );
};
