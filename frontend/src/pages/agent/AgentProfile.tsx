import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { AppLayout } from '../../components/layout/AppLayout';
import { PageHeader } from '../../components/ui/PageHeader';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { ShieldCheck, Award } from 'lucide-react';

export const AgentProfile: React.FC = () => {
  const { user } = useAuth();

  return (
    <AppLayout pageTitle="Agent Operational Profile">
      <PageHeader
        title="Shipping Agent Profile & Clearance"
        subtitle="Official maritime agency registration and terminal authority clearance tokens."
        badge="Accredited Agent"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-[#030712] border border-[#142340] rounded-xl p-5 shadow-xl">
            <SectionHeader title="Agency Credentials" subtitle="International Maritime Organization (IMO) Registered" />
            <div className="grid grid-cols-2 gap-4 pt-2 text-xs">
              <div className="p-3 bg-[#060D1E] rounded-lg border border-[#142340]">
                <span className="text-[10px] text-slate-500 font-semibold uppercase block mb-1">Operator Account</span>
                <span className="font-bold text-slate-200">{user?.email}</span>
              </div>
              <div className="p-3 bg-[#060D1E] rounded-lg border border-[#142340]">
                <span className="text-[10px] text-slate-500 font-semibold uppercase block mb-1">Agency Role</span>
                <span className="font-bold text-cyan-400">SHIPPING AGENT</span>
              </div>
              <div className="p-3 bg-[#060D1E] rounded-lg border border-[#142340]">
                <span className="text-[10px] text-slate-500 font-semibold uppercase block mb-1">Clearance Accreditation</span>
                <span className="font-bold text-cyan-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                  FONASBA QUALITY STANDARD
                </span>
              </div>
              <div className="p-3 bg-[#060D1E] rounded-lg border border-[#142340]">
                <span className="text-[10px] text-slate-500 font-semibold uppercase block mb-1">Terminal Harbor Code</span>
                <span className="font-bold text-slate-200 font-mono-num">NLRTM-PORTPILOT-01</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#030712] text-slate-200 border border-[#142340] rounded-xl p-5 shadow-xl text-xs">
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-[#142340]">
              <Award className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold text-white uppercase tracking-wider font-mono-num">
                Authorized Lines
              </h3>
            </div>
            <div className="space-y-2 text-slate-300">
              <div className="p-2.5 bg-[#060D1E] rounded-lg border border-[#142340]">
                <span className="font-semibold text-white">Evergreen Marine Corp</span>
                <p className="text-[11px] text-slate-400 font-mono-num">Agent representation ID: EVG-9901</p>
              </div>
              <div className="p-2.5 bg-[#060D1E] rounded-lg border border-[#142340]">
                <span className="font-semibold text-white">Mediterranean Shipping Company (MSC)</span>
                <p className="text-[11px] text-slate-400 font-mono-num">Agent representation ID: MSC-3342</p>
              </div>
              <div className="p-2.5 bg-[#060D1E] rounded-lg border border-[#142340]">
                <span className="font-semibold text-white">CMA CGM Line</span>
                <p className="text-[11px] text-slate-400 font-mono-num">Agent representation ID: CMA-1029</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
