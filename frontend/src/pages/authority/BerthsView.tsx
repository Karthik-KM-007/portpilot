import React from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { PageHeader } from '../../components/ui/PageHeader';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import { Anchor, Cpu } from 'lucide-react';

export const BerthsView: React.FC = () => {
  const berths = [
    { id: 'B-01', name: 'Berth 01 (North Terminal)', status: 'AVAILABLE', depth: '16.5m', length: '400m', bollards: 24, cranes: 2, currentVessel: null },
    { id: 'B-02', name: 'Berth 02 (Deepwater Quay)', status: 'INCOMING', depth: '15.0m', length: '350m', bollards: 20, cranes: 3, currentVessel: 'Evergreen Voyager (ETA 14:00 UTC)' },
    { id: 'B-03', name: 'Berth 03 (Feeder Terminal)', status: 'AVAILABLE', depth: '14.5m', length: '320m', bollards: 18, cranes: 2, currentVessel: null },
    { id: 'B-04', name: 'Berth 04 (ULCV Mega Pier)', status: 'AVAILABLE', depth: '18.0m', length: '450m', bollards: 28, cranes: 4, currentVessel: null },
  ];

  return (
    <AppLayout pageTitle="Quay Berth Management">
      <PageHeader
        title="Quayside Berth Allocation & Mooring"
        subtitle="Live hydrographic depth, bollard pull capacity, and berth mooring telemetry."
        badge="4 Quays Online"
        actions={
          <Button
            variant="operational"
            size="sm"
            icon={<Cpu className="w-3.5 h-3.5" />}
            onClick={() => alert('Automated berth optimization scheduled.')}
          >
            Optimize Allocations
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {berths.map((b) => (
          <div key={b.id} className="bg-[#030712] border border-[#142340] rounded-2xl p-5 shadow-xl hover:border-blue-500/50 transition-all">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <Anchor className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-bold text-white font-mono-num">{b.name}</h3>
                </div>
                <span className="text-[11px] font-mono-num text-slate-400">QUAY CODE: {b.id}</span>
              </div>
              <StatusBadge status={b.status} size="sm" />
            </div>

            <div className="p-3 bg-[#060D1E] rounded-xl border border-[#142340] mb-4 text-xs">
              <span className="text-[10px] text-slate-500 font-semibold uppercase block mb-1">
                Mooring / Assigned Traffic
              </span>
              <span className="font-semibold text-slate-200">
                {b.currentVessel || 'No active vessel berthed • Clear for assignment'}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2 pt-2 border-t border-[#142340] text-center font-mono-num text-xs">
              <div className="p-2 bg-[#060D1E] rounded-lg border border-[#142340]">
                <span className="text-[10px] text-slate-500 block">DEPTH</span>
                <span className="font-bold text-slate-200">{b.depth}</span>
              </div>
              <div className="p-2 bg-[#060D1E] rounded-lg border border-[#142340]">
                <span className="text-[10px] text-slate-500 block">LENGTH</span>
                <span className="font-bold text-slate-200">{b.length}</span>
              </div>
              <div className="p-2 bg-[#060D1E] rounded-lg border border-[#142340]">
                <span className="text-[10px] text-slate-500 block">BOLLARDS</span>
                <span className="font-bold text-slate-200">{b.bollards}</span>
              </div>
              <div className="p-2 bg-[#060D1E] rounded-lg border border-[#142340]">
                <span className="text-[10px] text-slate-500 block">STS CRANES</span>
                <span className="font-bold text-cyan-400">{b.cranes}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[#030712] border border-[#142340] rounded-2xl p-5 shadow-xl">
        <SectionHeader title="Mooring Safety Guidelines" subtitle="Harbor Master Protocol 2026.4" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-400 pt-2">
          <div className="p-3 bg-[#060D1E] rounded-xl border border-[#142340]">
            <span className="font-bold text-white block mb-1 font-mono-num">Under-Keel Clearance</span>
            <span>Minimum 1.5m UKC required for all inbound container vessels during low tide windows.</span>
          </div>
          <div className="p-3 bg-[#060D1E] rounded-xl border border-[#142340]">
            <span className="font-bold text-white block mb-1 font-mono-num">Tugboat Escort Rules</span>
            <span>Vessels &gt;300m LOA mandate at least two 70T BP azimuth stern drive tugs.</span>
          </div>
          <div className="p-3 bg-[#060D1E] rounded-xl border border-[#142340]">
            <span className="font-bold text-white block mb-1 font-mono-num">Bollard Pull Monitoring</span>
            <span>Continuous strain gauge telemetry active across Berth B-01 through B-04.</span>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
