import React from 'react';

export type OperationalStatus = 
  | 'INCOMING' 
  | 'AT_BERTH' 
  | 'DEPARTED' 
  | 'AVAILABLE' 
  | 'OCCUPIED' 
  | 'MAINTENANCE' 
  | 'WARNING' 
  | 'OPTIMAL'
  | 'PENDING';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const normStatus = status.toUpperCase().replace(/\s+/g, '_');

  let style = {
    bg: 'bg-[#121E38]',
    text: 'text-slate-300',
    border: 'border-[#1E2E4A]',
    dot: 'bg-slate-400'
  };

  switch (normStatus) {
    case 'INCOMING':
    case 'PENDING':
      style = {
        bg: 'bg-amber-950/60',
        text: 'text-amber-300',
        border: 'border-amber-800/60',
        dot: 'bg-amber-400'
      };
      break;
    case 'AT_BERTH':
    case 'OPTIMAL':
    case 'AVAILABLE':
      style = {
        bg: 'bg-blue-950/70',
        text: 'text-cyan-300',
        border: 'border-blue-700/60',
        dot: 'bg-cyan-400'
      };
      break;
    case 'OCCUPIED':
      style = {
        bg: 'bg-[#0B1733]',
        text: 'text-slate-300',
        border: 'border-[#1C366B]',
        dot: 'bg-blue-400'
      };
      break;
    case 'WARNING':
      style = {
        bg: 'bg-orange-950/70',
        text: 'text-orange-300',
        border: 'border-orange-800/60',
        dot: 'bg-orange-400'
      };
      break;
    case 'DEPARTED':
    case 'MAINTENANCE':
    case 'CRITICAL':
      style = {
        bg: 'bg-rose-950/70',
        text: 'text-rose-300',
        border: 'border-rose-800/60',
        dot: 'bg-rose-400'
      };
      break;
  }

  const isSmall = size === 'sm';

  return (
    <span className={`inline-flex items-center gap-1.5 font-medium border rounded ${isSmall ? 'px-1.5 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'} ${style.bg} ${style.text} ${style.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot} shrink-0`} />
      <span className="tracking-wide uppercase font-mono-num">{status.replace('_', ' ')}</span>
    </span>
  );
};
