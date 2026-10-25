import React from 'react';
import { Anchor } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No records found',
  description = 'There are currently no active operations or vessels matching the criteria.',
  action,
  icon,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-[#1E2E4A] rounded-md bg-[#0A1020]/40">
      <div className="w-10 h-10 rounded-full bg-[#101B33] border border-[#1C2C48] flex items-center justify-center text-slate-400 mb-3">
        {icon || <Anchor className="w-5 h-5" />}
      </div>
      <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">{title}</h3>
      <p className="text-xs text-slate-400 max-w-sm mt-1 mb-4">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};
