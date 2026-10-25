import React from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { PageHeader } from '../../components/ui/PageHeader';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { Clock } from 'lucide-react';

export const HistoryView: React.FC = () => {
  const historyLogs = [
    { timestamp: '2026-08-16 13:45 UTC', event: 'Vessel Arrival Logged', detail: 'Evergreen Voyager submitted by Demo Agent (agent@portpilot.ai)', tag: 'SUBMISSION' },
    { timestamp: '2026-08-16 12:30 UTC', event: 'Harbor Clearance Granted', detail: 'Port Authority approved tidal window clearance for IMO9836074', tag: 'CLEARANCE' },
    { timestamp: '2026-08-16 10:15 UTC', event: 'Berth Shift Operation', detail: 'Cranes QC-03 and QC-04 repositioned to Berth B-02', tag: 'LOGISTICS' },
    { timestamp: '2026-08-16 08:00 UTC', event: 'Shift Handover Complete', detail: 'Operations Watch Officer shift log verified and archived', tag: 'SECURITY' },
  ];

  return (
    <AppLayout pageTitle="Operations Audit Log & History">
      <PageHeader
        title="Port Logistics Audit Trail & History"
        subtitle="Chronological audit record of vessel submissions, clearances, and berth maneuvers."
        badge="Immutable Ledger"
      />

      <div className="bg-[#0D1629] border border-[#192742] rounded-md p-5 shadow-2xs">
        <SectionHeader title="System Chronology Log" subtitle="Filtered by last 24 hours" />
        <div className="divide-y divide-[#142036] text-xs">
          {historyLogs.map((log, i) => (
            <div key={i} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-100">{log.event}</span>
                    <span className="text-[10px] font-mono-num text-slate-400 bg-[#091020] px-1.5 py-0.2 rounded border border-[#162238]">
                      {log.tag}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] mt-0.5">{log.detail}</p>
                </div>
              </div>
              <span className="text-[11px] font-mono-num text-slate-500 shrink-0">{log.timestamp}</span>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};
