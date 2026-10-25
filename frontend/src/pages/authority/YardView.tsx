import React from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { PageHeader } from '../../components/ui/PageHeader';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { Button } from '../../components/ui/Button';
import { Warehouse, RefreshCw } from 'lucide-react';

export const YardView: React.FC = () => {
  const blocks = [
    { code: 'BLK-A1', type: 'Reefer Stacks', capacity: 1200, current: 890, density: 74, status: 'NORMAL' },
    { code: 'BLK-A2', type: 'Dry Containers 40ft', capacity: 3500, current: 2800, density: 80, status: 'NORMAL' },
    { code: 'BLK-B1', type: 'Dry Containers 20ft', capacity: 4200, current: 3600, density: 85, status: 'WARNING' },
    { code: 'BLK-B2', type: 'Dangerous Cargo (IMO)', capacity: 800, current: 420, density: 52, status: 'OPTIMAL' },
    { code: 'BLK-C1', type: 'Transshipment Buffer', capacity: 2500, current: 1950, density: 78, status: 'NORMAL' },
    { code: 'BLK-C2', type: 'Empty Container Depot', capacity: 5000, current: 3200, density: 64, status: 'OPTIMAL' },
  ];

  return (
    <AppLayout pageTitle="Container Yard Telemetry">
      <PageHeader
        title="Container Yard Capacity & Block Density"
        subtitle="Real-time RTG crane stacking, TEU ground slots, and dwell time analysis."
        badge="78% Total Yard Density"
        actions={
          <Button
            variant="secondary"
            size="sm"
            icon={<RefreshCw className="w-3.5 h-3.5 text-slate-400" />}
            onClick={() => alert('Yard slotting updated.')}
          >
            Re-balance Yard
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {blocks.map((b) => (
          <div key={b.code} className="bg-[#030712] border border-[#142340] rounded-2xl p-5 shadow-xl hover:border-blue-500/50 transition-all">
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="flex items-center gap-2">
                  <Warehouse className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-bold text-white font-mono-num">{b.code}</h3>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{b.type}</p>
              </div>
              <span className={`text-[11px] font-mono-num font-bold px-2 py-0.5 rounded border ${
                b.density > 80 ? 'bg-amber-950/70 text-amber-300 border-amber-800/60' : 'bg-[#060D1E] text-cyan-300 border border-blue-500/40'
              }`}>
                {b.density}%
              </span>
            </div>

            <div className="w-full bg-[#02050E] rounded-full h-2 my-3 overflow-hidden border border-[#142340]">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${b.density > 80 ? 'bg-amber-400' : 'bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400'}`}
                style={{ width: `${b.density}%` }}
              />
            </div>

            <div className="flex justify-between text-xs font-mono-num text-slate-400 pt-2 border-t border-[#142340]">
              <span>UTILIZATION:</span>
              <span className="font-bold text-slate-200">{b.current.toLocaleString()} / {b.capacity.toLocaleString()} TEU</span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[#030712] border border-[#142340] rounded-2xl p-5 shadow-xl">
        <SectionHeader title="Yard Optimization Summary" subtitle="Automated stacking algorithm v2.1" />
        <p className="text-xs text-slate-400">
          Average TEU dwell time across active yard blocks is currently <strong className="text-cyan-300 font-mono-num">3.2 days</strong>. 
          Buffer blocks A1 and C1 are cleared for incoming MSC Isabella and Evergreen Voyager cargo discharges.
        </p>
      </div>
    </AppLayout>
  );
};
