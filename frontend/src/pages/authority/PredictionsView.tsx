import React, { useState } from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { PageHeader } from '../../components/ui/PageHeader';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { Button } from '../../components/ui/Button';
import { Cpu, CheckCircle2, TrendingUp } from 'lucide-react';

export const PredictionsView: React.FC = () => {
  const [running, setRunning] = useState(false);

  const handleSimulate = () => {
    setRunning(true);
    setTimeout(() => {
      setRunning(false);
    }, 1200);
  };

  return (
    <AppLayout pageTitle="AI Decision Support & Turnaround Forecasts">
      <PageHeader
        title="AI Decision-Support & Congestion Forecasting"
        subtitle="Predictive berth allocation, turnaround optimization, and turnaround confidence scoring."
        badge="Engine: Q-Allocation v1.0"
        actions={
          <Button
            variant="operational"
            size="sm"
            loading={running}
            icon={<Cpu className="w-3.5 h-3.5" />}
            onClick={handleSimulate}
          >
            RUN AI PREDICTION
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#030712] border border-[#142340] rounded-2xl p-5 shadow-xl">
            <SectionHeader
              title="Quay Congestion & Turnaround Model"
              subtitle="72-hour rolling horizon projection"
            />
            
            <div className="p-4 bg-gradient-to-r from-[#0C1E40] to-[#060D1E] border border-blue-500/40 rounded-xl mb-4 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wide">Optimal Berth Schedule Detected</h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  Allocating Berth B-02 to Evergreen Voyager and Berth B-01 to MSC Isabella minimizes overall waiting time by 
                  <strong className="text-cyan-300 font-mono-num ml-1">3.4 hours per vessel</strong>.
                </p>
              </div>
            </div>

            <div className="space-y-3 font-mono-num text-xs">
              <div className="p-3.5 bg-[#060D1E] rounded-xl border border-[#142340] hover:border-blue-500/40 flex justify-between items-center transition-colors">
                <div>
                  <span className="font-bold text-slate-100">Evergreen Voyager (IMO9811001)</span>
                  <p className="text-[11px] text-slate-400 font-sans mt-0.5">Recommended: Berth B-02 • 3 STS Cranes</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-cyan-400">95.4% Confidence</span>
                  <p className="text-[11px] text-slate-500">18.5h Est. Turnaround</p>
                </div>
              </div>

              <div className="p-3.5 bg-[#060D1E] rounded-xl border border-[#142340] hover:border-blue-500/40 flex justify-between items-center transition-colors">
                <div>
                  <span className="font-bold text-slate-100">MSC Isabella (IMO9836074)</span>
                  <p className="text-[11px] text-slate-400 font-sans mt-0.5">Recommended: Berth B-04 • 4 STS Cranes</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-cyan-400">92.8% Confidence</span>
                  <p className="text-[11px] text-slate-500">24.2h Est. Turnaround</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#030712] text-slate-200 border border-[#142340] rounded-2xl p-5 shadow-xl text-xs">
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-[#142340]">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold text-slate-100 uppercase tracking-wider font-mono-num">
                Optimization Objectives
              </h3>
            </div>
            <div className="space-y-3 text-slate-300">
              <div className="flex justify-between border-b border-[#142340] pb-2 font-mono-num">
                <span className="text-slate-400">Average Vessel Wait:</span>
                <span className="text-cyan-400 font-bold">1.2 hrs (-34%)</span>
              </div>
              <div className="flex justify-between border-b border-[#142340] pb-2 font-mono-num">
                <span className="text-slate-400">Crane Idleness Rate:</span>
                <span className="text-amber-400 font-bold">4.8%</span>
              </div>
              <div className="flex justify-between font-mono-num">
                <span className="text-slate-400">Yard Shunting Trips:</span>
                <span className="text-cyan-400 font-bold">-18% Reduction</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
