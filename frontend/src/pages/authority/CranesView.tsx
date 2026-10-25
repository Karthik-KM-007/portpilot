import React from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import { GitBranch, Activity, Wrench } from 'lucide-react';

export const CranesView: React.FC = () => {
  const cranes = [
    { id: 'QC-01', name: 'STS Super Post-Panamax 01', status: 'AVAILABLE', movesPerHour: 32, maxReach: '24 rows', assignedBerth: 'Berth B-01', loadCap: '65 Ton' },
    { id: 'QC-02', name: 'STS Super Post-Panamax 02', status: 'AVAILABLE', movesPerHour: 30, maxReach: '24 rows', assignedBerth: 'Berth B-01', loadCap: '65 Ton' },
    { id: 'QC-03', name: 'STS Dual-Trolley Mega 03', status: 'OPTIMAL', movesPerHour: 36, maxReach: '26 rows', assignedBerth: 'Berth B-02', loadCap: '80 Ton' },
    { id: 'QC-04', name: 'STS Dual-Trolley Mega 04', status: 'OPTIMAL', movesPerHour: 35, maxReach: '26 rows', assignedBerth: 'Berth B-02', loadCap: '80 Ton' },
    { id: 'QC-05', name: 'STS Feeder Gantry 05', status: 'AVAILABLE', movesPerHour: 26, maxReach: '18 rows', assignedBerth: 'Berth B-03', loadCap: '50 Ton' },
    { id: 'QC-06', name: 'STS Super Post-Panamax 06', status: 'MAINTENANCE', movesPerHour: 0, maxReach: '24 rows', assignedBerth: 'Berth B-04', loadCap: '65 Ton' },
  ];

  return (
    <AppLayout pageTitle="STS Quay Cranes Operations">
      <PageHeader
        title="Ship-to-Shore (STS) Crane Fleet"
        subtitle="Live crane cycle metrics, spreader telemetry, and gang assignment logs."
        badge="5 of 6 Active"
        actions={
          <Button
            variant="secondary"
            size="sm"
            icon={<Wrench className="w-3.5 h-3.5 text-slate-400" />}
            onClick={() => alert('Maintenance diagnostics initiated.')}
          >
            Diagnostics
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cranes.map((c) => (
          <div key={c.id} className="bg-[#030712] border border-[#142340] rounded-2xl p-5 shadow-xl hover:border-blue-500/50 transition-all">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-bold text-white font-mono-num">{c.id}</h3>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{c.name}</p>
              </div>
              <StatusBadge status={c.status} size="sm" />
            </div>

            <div className="p-3 bg-[#060D1E] rounded-xl border border-[#142340] mb-4 text-xs font-mono-num space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">ASSIGNED QUAY:</span>
                <span className="font-semibold text-slate-200">{c.assignedBerth}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">OUTREACH:</span>
                <span className="font-semibold text-slate-200">{c.maxReach}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">SWL CAPACITY:</span>
                <span className="font-semibold text-slate-200">{c.loadCap}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-[#142340] flex items-center justify-between text-xs font-mono-num">
              <span className="text-slate-400 flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                GMPH Speed:
              </span>
              <span className="text-sm font-bold text-cyan-300">{c.movesPerHour} moves/hr</span>
            </div>
          </div>
        ))}
      </div>
    </AppLayout>
  );
};
