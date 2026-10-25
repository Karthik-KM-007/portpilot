import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { AppLayout } from '../../components/layout/AppLayout';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { 
  Ship, 
  Anchor, 
  GitBranch, 
  Warehouse, 
  ArrowRight, 
  Eye, 
  Clock, 
  Radio, 
  Compass, 
  Cpu,
  Zap,
  Waves,
  Wind,
  Search,
  CheckCircle2,
  TrendingDown,
  Layers,
  Check
} from 'lucide-react';

interface Vessel {
  id: number;
  vessel_name: string;
  imo_number: string;
  vessel_type: string;
  call_sign?: string;
  flag?: string;
  vessel_length?: number;
  vessel_draft?: number;
  eta: string;
  container_count: number;
  origin: string;
  destination: string;
  status: string;
}

interface Resources {
  available_berths: number;
  total_berths: number;
  available_cranes: number;
  total_cranes: number;
  yard_capacity_percent: number;
  active_incoming_vessels: number;
  database_type?: string;
}

interface BerthDetail {
  code: string;
  name: string;
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'MAINTENANCE';
  length: string;
  draft: string;
  currentVessel: string | null;
  assignedCranes: string[];
}

const DEFAULT_BERTHS: BerthDetail[] = [
  {
    code: 'B-01',
    name: 'Berth 01 (Deepwater Quay)',
    status: 'AVAILABLE',
    length: '400m',
    draft: '16.5m',
    currentVessel: null,
    assignedCranes: ['QC-01', 'QC-02']
  },
  {
    code: 'B-02',
    name: 'Berth 02 (Main Terminal)',
    status: 'OCCUPIED',
    length: '350m',
    draft: '15.0m',
    currentVessel: 'Evergreen Voyager',
    assignedCranes: ['QC-03', 'QC-04']
  },
  {
    code: 'B-03',
    name: 'Berth 03 (Outer Quay)',
    status: 'RESERVED',
    length: '320m',
    draft: '14.5m',
    currentVessel: 'MSC Oscar (Approaching)',
    assignedCranes: ['QC-05']
  },
  {
    code: 'B-04',
    name: 'Berth 04 (ULCV Basin)',
    status: 'AVAILABLE',
    length: '450m',
    draft: '18.0m',
    currentVessel: null,
    assignedCranes: ['QC-06']
  }
];

const YARD_BLOCKS = [
  { code: 'Block A', type: 'Dry Containers', density: 84, capacity: 8000, current: 6720 },
  { code: 'Block B', type: 'Reefer Cargo', density: 62, capacity: 5500, current: 3410 },
  { code: 'Block C', type: 'Hazardous / IMDG', density: 45, capacity: 3200, current: 1440 },
  { code: 'Block D', type: 'Empty Storage', density: 78, capacity: 9000, current: 7020 },
  { code: 'Block E', type: 'High Cube Tier', density: 91, capacity: 7500, current: 6825 },
  { code: 'Block F', type: 'Transshipment Buffer', density: 56, capacity: 11000, current: 6160 },
];

export const AuthorityOverview: React.FC = () => {
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [resources, setResources] = useState<Resources | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'INCOMING' | 'AT_BERTH' | 'DEEP_DRAFT'>('ALL');
  const [selectedBerth, setSelectedBerth] = useState<BerthDetail>(DEFAULT_BERTHS[1]);
  const [aiAdvisoryDismissed, setAiAdvisoryDismissed] = useState(false);
  const [aiAssignedSuccess, setAiAssignedSuccess] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  
  const { token } = useAuth();
  const navigate = useNavigate();

  // Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toTimeString().split(' ')[0] + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch Dashboard Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vesselsRes, resRes] = await Promise.all([
          axios.get('http://localhost:8000/api/vessels', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('http://localhost:8000/api/resources/snapshot', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        setVessels(vesselsRes.data || []);
        setResources(resRes.data || null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  // Filtered vessels
  const filteredVessels = useMemo(() => {
    return vessels.filter((v) => {
      const matchesSearch = 
        v.vessel_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.imo_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.destination.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (statusFilter === 'INCOMING') return v.status === 'INCOMING';
      if (statusFilter === 'AT_BERTH') return v.status === 'AT_BERTH';
      if (statusFilter === 'DEEP_DRAFT') return (v.vessel_draft || 0) >= 15.0;
      return true;
    });
  }, [vessels, searchQuery, statusFilter]);

  const totalContainers = useMemo(() => {
    return vessels.reduce((acc, v) => acc + (v.container_count || 0), 0);
  }, [vessels]);

  const handleApplyAiDispatch = () => {
    setAiAssignedSuccess(true);
    setTimeout(() => {
      setAiAssignedSuccess(false);
      setAiAdvisoryDismissed(true);
    }, 2200);
  };

  if (loading && !resources) {
    return (
      <AppLayout pageTitle="Port Authority Operations">
        <div className="py-24 flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-400/40 flex items-center justify-center text-emerald-400 animate-pulse">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <p className="text-xs font-mono-num font-bold text-emerald-300 tracking-wider uppercase">
            Synchronizing Rotterdam VTS Sector 3 Digital Twin Telemetry...
          </p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout pageTitle="Port Authority Operations">
      
      {/* =========================================================================
          TOP METEOROLOGICAL & SENSOR HUD STRIP
          ========================================================================= */}
      <div className="mb-6 p-3 rounded-xl bg-[#030712]/95 border border-[#142340] flex flex-wrap items-center justify-between gap-3 text-xs shadow-lg backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-gradient-to-r from-[#0C1E40] to-[#081530] border border-blue-500/40 text-cyan-300 font-mono-num font-bold">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>VTS ROTTERDAM • SECTOR 3</span>
          </div>

          <div className="hidden sm:flex items-center gap-2.5 text-slate-400 font-mono-num text-[11px]">
            <span className="flex items-center gap-1 text-slate-300">
              <Waves className="w-3.5 h-3.5 text-cyan-400" />
              <span>Wave: 0.8m (Calm)</span>
            </span>
            <span className="text-slate-600">|</span>
            <span className="flex items-center gap-1 text-slate-300">
              <Wind className="w-3.5 h-3.5 text-blue-400" />
              <span>Wind: 14 kts NE (F4)</span>
            </span>
            <span className="text-slate-600">|</span>
            <span>Tide: +1.2m NAP</span>
            <span className="text-slate-600">|</span>
            <span className="text-cyan-400 font-semibold">Channel: Clear</span>
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono-num text-[11px]">
          <span className="text-slate-400 bg-[#060D1E] px-2.5 py-1 rounded border border-[#142340]">
            LAT 51.9244° N, LON 4.4777° E
          </span>
          <span className="text-cyan-300 font-bold bg-[#060D1E] px-2.5 py-1 rounded border border-blue-500/40">
            {currentTime || 'LIVE UTC'}
          </span>
        </div>
      </div>

      {/* =========================================================================
          PAGE HERO & TACTICAL QUICK ACTION BAR
          ========================================================================= */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
              <span>Port Operations Command</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider font-mono-num bg-blue-950/80 text-cyan-300 border border-blue-600/50 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              DIGITAL TWIN V2.4
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Autonomous vessel sequencing, real-time berth allocation matrix, and container yard telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => navigate('/authority/predictions')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#0A1633] hover:bg-[#10224C] text-cyan-300 border border-blue-500/40 hover:border-cyan-400/60 transition-all cursor-pointer shadow-sm group"
          >
            <Cpu className="w-4 h-4 text-cyan-400 group-hover:rotate-12 transition-transform" />
            <span>AI Predictive Engine</span>
          </button>

          <button
            onClick={() => navigate('/authority/vessels')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-[0_4px_18px_rgba(37,99,235,0.45)] border border-cyan-400/30 transition-all cursor-pointer"
          >
            <Ship className="w-4 h-4" />
            <span>Full Vessel Queue ({vessels.length})</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          HIGH-IMPACT GLASSO-TACTICAL KPI DECK (4 CARDS)
          ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        
        {/* KPI 1: Active Vessels */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0B1733] via-[#071126] to-[#02050E] border border-[#162D58] hover:border-blue-500/50 transition-all shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/15 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400">
              Active Fleet In Queue
            </span>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0E2248] to-[#071228] border border-blue-500/40 flex items-center justify-center text-cyan-400 shadow-sm">
              <Ship className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2.5 my-1">
            <span className="text-3xl font-extrabold text-white font-mono-num tracking-tight">
              {vessels.length}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-950/80 text-cyan-300 border border-blue-700/60 font-mono-num">
              +2 ON SCHEDULE
            </span>
          </div>
          <div className="text-xs text-slate-400 mt-2 flex items-center justify-between font-mono-num">
            <span>{totalContainers.toLocaleString()} Total TEU</span>
            <span className="text-cyan-400">100% AIS Synced</span>
          </div>
          <div className="w-full bg-[#02040A] h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400 h-full rounded-full" style={{ width: '85%' }} />
          </div>
        </div>

        {/* KPI 2: AI Turnaround Time */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0B1733] via-[#071126] to-[#02050E] border border-[#162D58] hover:border-blue-500/50 transition-all shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/15 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400">
              Avg Turnaround Dwell
            </span>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0E2248] to-[#071228] border border-blue-500/40 flex items-center justify-center text-cyan-400 shadow-sm">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2.5 my-1">
            <span className="text-3xl font-extrabold text-white font-mono-num tracking-tight">
              3.4h
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-950/80 text-cyan-300 border border-blue-700/60 font-mono-num flex items-center gap-0.5">
              <TrendingDown className="w-3 h-3" />
              -18.4%
            </span>
          </div>
          <div className="text-xs text-slate-400 mt-2 flex items-center justify-between font-mono-num">
            <span>AI Dispatch Optimization</span>
            <span className="text-cyan-400 font-semibold">Savings: 42m/vessel</span>
          </div>
          <div className="w-full bg-[#02040A] h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-400 h-full rounded-full" style={{ width: '92%' }} />
          </div>
        </div>

        {/* KPI 3: Available Berths */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0B1733] via-[#071126] to-[#02050E] border border-[#162D58] hover:border-blue-500/50 transition-all shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/15 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400">
              Quayside Berth Utilization
            </span>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0E2248] to-[#071228] border border-blue-500/40 flex items-center justify-center text-cyan-400 shadow-sm">
              <Anchor className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2.5 my-1">
            <span className="text-3xl font-extrabold text-white font-mono-num tracking-tight">
              {resources ? `${resources.available_berths} / ${resources.total_berths || 4}` : '2 / 4'}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-950/80 text-cyan-300 border border-blue-700/60 font-mono-num">
              50% FREE
            </span>
          </div>
          <div className="text-xs text-slate-400 mt-2 flex items-center justify-between font-mono-num">
            <span>Berth B-01, B-04 Cleared</span>
            <span className="text-cyan-300">ULCV Ready (18m)</span>
          </div>
          <div className="w-full bg-[#02040A] h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-500 h-full rounded-full" style={{ width: '50%' }} />
          </div>
        </div>

        {/* KPI 4: STS Quay Cranes */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0B1733] via-[#071126] to-[#02050E] border border-[#162D58] hover:border-blue-500/50 transition-all shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/15 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400">
              STS Quay Crane Operations
            </span>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0E2248] to-[#071228] border border-blue-500/40 flex items-center justify-center text-cyan-400 shadow-sm">
              <GitBranch className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2.5 my-1">
            <span className="text-3xl font-extrabold text-white font-mono-num tracking-tight">
              {resources ? `${resources.available_cranes} STS` : '5 STS'}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-950/80 text-cyan-300 border border-blue-700/60 font-mono-num">
              28.4 GMPH
            </span>
          </div>
          <div className="text-xs text-slate-400 mt-2 flex items-center justify-between font-mono-num">
            <span>QC-01 to QC-05 Online</span>
            <span className="text-cyan-300">83% Gantry Ready</span>
          </div>
          <div className="w-full bg-[#02040A] h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-cyan-400 h-full rounded-full" style={{ width: '83%' }} />
          </div>
        </div>

      </div>

      {/* =========================================================================
          AI REAL-TIME DISPATCH ADVISORY BANNER
          ========================================================================= */}
      {!aiAdvisoryDismissed && (
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-[#0E2248] via-[#081632] to-[#030612] border border-blue-500/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden animate-fade-in">
          <div className="flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/50 text-cyan-300 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
              <Cpu className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white tracking-wide uppercase font-mono-num">
                  AI Dynamic Berth Dispatch Advisory
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-950 text-cyan-300 border border-blue-700/60 font-mono-num">
                  94.8% OPTIMAL
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Direct <span className="text-white font-bold">MSC Oscar</span> (19,224 TEU) to <span className="text-cyan-300 font-bold">Berth B-02</span> with STS Cranes <span className="text-cyan-300 font-mono-num">QC-03 &amp; QC-04</span>. Avoids outer anchorage congestion and reduces total port dwell time by <span className="text-cyan-400 font-bold">48 minutes</span>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-end md:self-center shrink-0">
            {aiAssignedSuccess ? (
              <span className="px-3.5 py-1.5 rounded-lg bg-blue-950 border border-blue-600 text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                Dispatched to B-02
              </span>
            ) : (
              <button
                onClick={handleApplyAiDispatch}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-bold shadow-[0_2px_14px_rgba(37,99,235,0.45)] border border-cyan-400/30 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Auto-Allocate Berth</span>
              </button>
            )}
            <button
              onClick={() => setAiAdvisoryDismissed(true)}
              className="text-slate-400 hover:text-slate-200 text-xs px-2.5 py-1.5 rounded hover:bg-[#0B1A38] transition-colors cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          THE MAIN SHOWCASE: ROTTERDAM TERMINAL DIGITAL TWIN & BERTH VISUALIZER
          ========================================================================= */}
      <div className="mb-6 p-5 rounded-2xl bg-[#030712] border border-[#142340] shadow-xl relative overflow-hidden">
        
        {/* Section Title & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-[#142340]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#0C1E40] border border-blue-500/40 flex items-center justify-center text-cyan-400">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide uppercase font-mono-num">
                Rotterdam Terminal Quayside Digital Twin
              </h2>
              <p className="text-[11px] text-slate-400">
                Interactive real-time berth status, quay crane gantries &amp; fairway channel
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono-num">
            <span className="flex items-center gap-1 text-[11px] text-cyan-400">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              AVAILABLE (2)
            </span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center gap-1 text-[11px] text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              OCCUPIED (1)
            </span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center gap-1 text-[11px] text-blue-300">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              RESERVED (1)
            </span>
          </div>
        </div>

        {/* Interactive Berth Deck (4 Berths with visual gantry and water channel) */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
          {DEFAULT_BERTHS.map((berth) => {
            const isSelected = selectedBerth.code === berth.code;
            const statusConfig = {
              AVAILABLE: { color: 'text-cyan-300', bg: 'bg-blue-950/80', border: 'border-blue-700/60', label: 'CLEAR / AVAILABLE' },
              OCCUPIED: { color: 'text-amber-400', bg: 'bg-amber-950/60', border: 'border-amber-700/50', label: 'BERTHED / WORKING' },
              RESERVED: { color: 'text-blue-300', bg: 'bg-[#0B1A38]', border: 'border-[#1C3668]', label: 'INBOUND RESERVED' },
              MAINTENANCE: { color: 'text-slate-400', bg: 'bg-slate-900', border: 'border-slate-700', label: 'MAINTENANCE' },
            }[berth.status];

            return (
              <div
                key={berth.code}
                onClick={() => setSelectedBerth(berth)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden group ${
                  isSelected 
                    ? 'bg-gradient-to-br from-[#0E2450] to-[#07142E] border-cyan-400/80 shadow-[0_0_22px_rgba(6,182,212,0.3)]' 
                    : 'bg-[#060D1E] border-[#142340] hover:border-blue-500/50 hover:bg-[#091530]'
                }`}
              >
                {/* Top Berth Code & Status */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-black text-white font-mono-num flex items-center gap-1.5">
                      <span>{berth.code}</span>
                      <span className="text-[10px] text-slate-400 font-normal">({berth.length})</span>
                    </span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded border font-mono-num ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border}`}>
                      {statusConfig.label}
                    </span>
                  </div>

                  {/* Vessel Information */}
                  <div className="my-2.5 p-2 rounded-lg bg-[#02050E] border border-[#142340]">
                    <span className="text-[9px] uppercase tracking-wider text-slate-500 font-mono-num block">
                      Assigned Vessel
                    </span>
                    <span className="text-xs font-bold text-slate-100 truncate block mt-0.5">
                      {berth.currentVessel || 'No Vessel Moored'}
                    </span>
                  </div>
                </div>

                {/* Crane and Draft Telemetry */}
                <div className="pt-2.5 border-t border-[#142340] flex items-center justify-between text-[10px] font-mono-num text-slate-400">
                  <span className="flex items-center gap-1">
                    <GitBranch className="w-3 h-3 text-cyan-400" />
                    <span>{berth.assignedCranes.join(', ')}</span>
                  </span>
                  <span>MAX DRAFT {berth.draft}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Berth Detail Flyout / Tactical Inspector */}
        <div className="p-3.5 rounded-xl bg-[#060D1E] border border-[#142340] flex flex-wrap items-center justify-between gap-4 text-xs font-mono-num">
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 rounded bg-blue-950 text-cyan-300 font-bold text-[11px] border border-blue-700/60">
              INSPECTING {selectedBerth.code}
            </span>
            <span className="text-slate-300 font-semibold">{selectedBerth.name}</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400">Gantry Capacity: 2 Twin-Lift STS</span>
            <span className="text-slate-500">|</span>
            <span className="text-cyan-400">Bollard Pull: 150t Certified</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/authority/berths')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>Manage Berth Allocations</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* =========================================================================
          MAIN WORKSPACE: INCOMING VESSEL TABLE (LEFT 2 COLS) + RESOURCE HUDS (RIGHT 1 COL)
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Vessel Queue Table (8 cols on LG) */}
        <div className="lg:col-span-8 space-y-6">
          
          <div className="p-5 rounded-2xl bg-[#030712] border border-[#142340] shadow-xl">
            
            {/* Table Header with Filters & Search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-[#142340]">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white tracking-wide uppercase font-mono-num">
                    Incoming Vessel Queue &amp; Berthing Schedule
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0A1733] text-cyan-300 border border-blue-700/50 font-mono-num">
                    {filteredVessels.length}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Real-time AIS sequence, cargo TEU specifications &amp; berthing authorization
                </p>
              </div>

              {/* Status Filter Chips */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#060D1E] border border-[#142340]">
                {[
                  { key: 'ALL', label: 'All' },
                  { key: 'INCOMING', label: 'Inbound' },
                  { key: 'AT_BERTH', label: 'Berth' },
                  { key: 'DEEP_DRAFT', label: 'Deep Draft (>15m)' },
                ].map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setStatusFilter(f.key as any)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer font-mono-num ${
                      statusFilter === f.key
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-[#0B1834]'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Search Field */}
            <div className="mb-4 relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search vessel by name, IMO number, origin or destination..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-2 pl-10 pr-4 text-xs text-slate-200 bg-[#060D1E] border border-[#142340] rounded-xl focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </div>

            {/* Responsive Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#142340] text-slate-400 uppercase tracking-wider font-semibold text-[10px] bg-[#060D1E]">
                    <th className="py-3 px-3.5">Vessel Name &amp; IMO</th>
                    <th className="py-3 px-3">Type / Draft</th>
                    <th className="py-3 px-3">ETA (UTC)</th>
                    <th className="py-3 px-3">Cargo Load</th>
                    <th className="py-3 px-3">Route Fairway</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#142340]">
                  {filteredVessels.map((v) => (
                    <tr key={v.id} className="hover:bg-[#081530] transition-colors group">
                      
                      {/* Vessel Name & IMO */}
                      <td className="py-3.5 px-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0C2048] to-[#060D1E] border border-blue-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                            <Ship className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-white group-hover:text-cyan-300 transition-colors">
                              {v.vessel_name}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono-num">
                              {v.imo_number} {v.call_sign ? `• ${v.call_sign}` : ''}
                            </div>
                          </div>
                        </div>
                      </td>

                       {/* Type / Draft */}
                      <td className="py-3.5 px-3">
                        <div className="font-medium text-slate-200">{v.vessel_type}</div>
                        <div className="text-[10px] text-slate-400 font-mono-num">
                          Draft: <span className="text-cyan-400 font-semibold">{v.vessel_draft ? `${v.vessel_draft}m` : '15.5m'}</span>
                        </div>
                      </td>

                      {/* ETA */}
                      <td className="py-3.5 px-3 font-mono-num">
                        <div className="text-slate-200 font-semibold">
                          {new Date(v.eta).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false
                          })}
                        </div>
                        <div className="text-[10px] text-cyan-400 font-bold">
                          ON SCHEDULE
                        </div>
                      </td>

                      {/* Containers */}
                      <td className="py-3.5 px-3 font-mono-num">
                        <div className="font-bold text-slate-200">
                          {v.container_count ? v.container_count.toLocaleString() : '14,200'} TEU
                        </div>
                        <div className="w-16 bg-[#02050E] h-1.5 rounded-full mt-1 overflow-hidden">
                          <div className="bg-gradient-to-r from-blue-600 to-cyan-400 h-full rounded-full" style={{ width: '74%' }} />
                        </div>
                      </td>

                      {/* Route */}
                      <td className="py-3.5 px-3 text-slate-300">
                        <div className="flex items-center gap-1 text-[11px]">
                          <span>{v.origin}</span>
                          <span className="text-slate-500">→</span>
                          <span className="font-bold text-white">{v.destination}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3">
                        <StatusBadge status={v.status} size="sm" />
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-3 text-right">
                        <button
                          onClick={() => navigate(`/authority/vessels/${v.id}`)}
                          className="px-2.5 py-1.5 rounded-lg bg-[#0A1633] hover:bg-blue-600 border border-[#182E56] hover:border-blue-500 text-slate-300 hover:text-white transition-all cursor-pointer font-semibold text-[11px] inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect</span>
                        </button>
                      </td>

                    </tr>
                  ))}

                  {filteredVessels.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-slate-500">
                        No vessels match the specified search or filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="mt-4 pt-3 border-t border-[#142340] flex items-center justify-between text-xs text-slate-400 font-mono-num">
              <span>Showing {filteredVessels.length} of {vessels.length} vessels</span>
              <button
                onClick={() => navigate('/authority/vessels')}
                className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>View Full Vessel Management Registry</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

        </div>

        {/* Right Column: Yard Telemetry & Live AIS Event Stream (4 cols on LG) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Container Yard Density Heatmap */}
          <div className="p-5 rounded-2xl bg-[#030712] border border-[#142340] shadow-xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#142340]">
              <div className="flex items-center gap-2">
                <Warehouse className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono-num">
                  Container Yard Capacity Heatmap
                </h3>
              </div>
              <span className="text-[10px] font-mono-num text-cyan-400 font-bold">
                72% OPTIMAL
              </span>
            </div>

            {/* Stacking Blocks Progress Bars */}
            <div className="space-y-3.5 text-xs">
              {YARD_BLOCKS.map((block) => {
                const isHigh = block.density >= 85;
                const isMed = block.density >= 70 && block.density < 85;
                const colorClass = isHigh ? 'bg-rose-500' : isMed ? 'bg-amber-400' : 'bg-gradient-to-r from-blue-600 to-cyan-400';
                const textClass = isHigh ? 'text-rose-400' : isMed ? 'text-amber-400' : 'text-cyan-300';

                return (
                  <div key={block.code}>
                    <div className="flex justify-between items-center mb-1 text-slate-300 font-mono-num text-[11px]">
                      <span className="font-bold text-slate-200">{block.code} ({block.type})</span>
                      <span className={`font-bold ${textClass}`}>{block.density}%</span>
                    </div>
                    <div className="w-full bg-[#02050E] rounded-full h-2 overflow-hidden border border-[#142340]">
                      <div className={`${colorClass} h-full rounded-full transition-all duration-500`} style={{ width: `${block.density}%` }} />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 mt-0.5 font-mono-num">
                      <span>{block.current.toLocaleString()} TEU occupied</span>
                      <span>Max {block.capacity.toLocaleString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-[#142340]">
              <button
                onClick={() => navigate('/authority/yard')}
                className="w-full py-2 px-3 rounded-xl bg-[#0A1633] hover:bg-[#10224C] text-cyan-300 border border-blue-500/40 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Open Interactive Yard Stacking Map</span>
              </button>
            </div>
          </div>

          {/* Chronological Live AIS Events Feed */}
          <div className="p-5 rounded-2xl bg-[#030712] border border-[#142340] shadow-xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#142340]">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono-num">
                  Live Port Traffic Dispatch Feed
                </h3>
              </div>
              <span className="text-[10px] font-mono-num text-slate-400">REALTIME</span>
            </div>

            <div className="space-y-3.5 text-xs">
              
              <div className="p-3 rounded-xl bg-[#060D1E] border border-[#142340] flex items-start gap-2.5">
                <Radio className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-100">Pilot Boarding Coordinates Synced</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Harbor Pilot boat assigned to MSC Oscar at fairway marker Alpha-2.
                  </p>
                  <span className="text-[10px] text-slate-500 font-mono-num mt-1 block">13:34 UTC • VTS DISPATCH</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#060D1E] border border-[#142340] flex items-start gap-2.5">
                <Anchor className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-100">Berth B-02 Cargo Discharge</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Stevedore shift 2 initiated twin-lift moves on Evergreen Voyager.
                  </p>
                  <span className="text-[10px] text-slate-500 font-mono-num mt-1 block">13:12 UTC • CRANE OPS</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#060D1E] border border-[#142340] flex items-start gap-2.5">
                <Cpu className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-100">AI Turnaround Prediction Generated</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Expected wait time reduced to 3.4h via dynamic crane balancing.
                  </p>
                  <span className="text-[10px] text-slate-500 font-mono-num mt-1 block">12:55 UTC • ML ENGINE</span>
                </div>
              </div>

            </div>

            <div className="mt-4 pt-3 border-t border-[#142340]">
              <button
                onClick={() => navigate('/authority/history')}
                className="w-full py-2 px-3 rounded-xl bg-[#0A1633] hover:bg-[#10224C] text-slate-300 hover:text-white border border-[#182E56] text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>View Full Chronological History Log</span>
              </button>
            </div>
          </div>

        </div>

      </div>

    </AppLayout>
  );
};

export default AuthorityOverview;
