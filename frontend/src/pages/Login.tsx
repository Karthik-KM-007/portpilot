import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
  Anchor, 
  Shield, 
  Radio, 
  KeyRound, 
  ArrowRight, 
  Lock, 
  CheckCircle2, 
  Ship, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  Activity, 
  Wind, 
  Waves
} from 'lucide-react';

interface TacticalVessel {
  id: string;
  name: string;
  type: string;
  flag: string;
  length: string;
  draft: string;
  speed: string;
  heading: string;
  status: 'INBOUND' | 'BERTHING' | 'ANCHORED' | 'STATION';
  berth: string;
  eta: string;
  x: number; // percentage in radar
  y: number;
  color: string;
}

const TACTICAL_VESSELS: TacticalVessel[] = [
  {
    id: 'V-01',
    name: 'MSC ISABELLA',
    type: 'Ultra Large Container',
    flag: 'PA',
    length: '400m',
    draft: '16.2m',
    speed: '14.2 kts',
    heading: '042°',
    status: 'INBOUND',
    berth: 'BERTH B-01',
    eta: 'T-24 min',
    x: 62,
    y: 38,
    color: '#38bdf8'
  },
  {
    id: 'V-02',
    name: 'EVERGREEN V.',
    type: 'Container Mega-Carrier',
    flag: 'TW',
    length: '350m',
    draft: '14.5m',
    speed: '4.1 kts',
    heading: '088°',
    status: 'BERTHING',
    berth: 'BERTH B-02',
    eta: 'ALONGSIDE',
    x: 46,
    y: 48,
    color: '#34d399'
  },
  {
    id: 'V-03',
    name: 'MAERSK MC-KINNEY',
    type: 'Container Triple-E',
    flag: 'DK',
    length: '399m',
    draft: '15.8m',
    speed: '16.8 kts',
    heading: '035°',
    status: 'INBOUND',
    berth: 'BERTH B-03',
    eta: 'T-58 min',
    x: 74,
    y: 72,
    color: '#f59e0b'
  },
  {
    id: 'V-04',
    name: 'PILOT CUTTER 04',
    type: 'Harbor Pilot & Tug',
    flag: 'NL',
    length: '32m',
    draft: '3.8m',
    speed: '8.5 kts',
    heading: '120°',
    status: 'STATION',
    berth: 'PATROL ZONE 2',
    eta: 'STANDBY',
    x: 35,
    y: 32,
    color: '#a78bfa'
  },
  {
    id: 'V-05',
    name: 'CMA CGM JACQUES',
    type: 'LNG Ultra Container',
    flag: 'FR',
    length: '400m',
    draft: '16.0m',
    speed: '0.0 kts',
    heading: '210°',
    status: 'ANCHORED',
    berth: 'OUTER ANCHOR 4',
    eta: 'T-2h 15m',
    x: 22,
    y: 68,
    color: '#818cf8'
  }
];

const AIS_LOGS = [
  '[13:28:10] VTS SECTOR 3: MSC ISABELLA acknowledged pilot boarding coordinates.',
  '[13:26:45] STS CRANE 04: Twin-lift spreader sequence initialized for Berth B-02.',
  '[13:24:22] HARBOR MASTER: Tide window +1.4m confirmed for deep draft entry.',
  '[13:21:04] AI DISPATCH: Optimized berth allocation saved 38 minutes turnaround time.'
];

const Login: React.FC = () => {
  const [email, setEmail] = useState('authority@portpilot.ai');
  const [password, setPassword] = useState('admin123');
  const [selectedRole, setSelectedRole] = useState<'authority' | 'agent'>('authority');
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedVessel, setSelectedVessel] = useState<TacticalVessel>(TACTICAL_VESSELS[0]);
  const [utcTime, setUtcTime] = useState('');
  const [quickFilled, setQuickFilled] = useState<string | null>('authority');
  const [logIndex, setLogIndex] = useState(0);

  const { login, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      if (user.role === 'SHIPPING_AGENT') navigate('/agent');
      else if (user.role === 'PORT_AUTHORITY') navigate('/authority');
    }
  }, [user, navigate]);

  // Live UTC Clock & rotating AIS log ticker
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTime(now.toTimeString().split(' ')[0] + ' UTC');
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    const logTimer = setInterval(() => {
      setLogIndex((prev) => (prev + 1) % AIS_LOGS.length);
    }, 4500);

    return () => {
      clearInterval(timer);
      clearInterval(logTimer);
    };
  }, []);

  const handleKeyModifier = (e: React.KeyboardEvent) => {
    if (e.getModifierState) {
      setCapsLockOn(e.getModifierState('CapsLock'));
    }
  };

  const handleRoleSelect = (role: 'authority' | 'agent') => {
    setSelectedRole(role);
    setError('');
    if (role === 'authority') {
      setEmail('authority@portpilot.ai');
      setPassword('admin123');
    } else {
      setEmail('agent@portpilot.ai');
      setPassword('agent123');
    }
    setQuickFilled(role);
    setTimeout(() => setQuickFilled(null), 1800);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:8000/api/auth/login', {
        email: email.trim(),
        password
      });
      login(response.data.access_token);
    } catch (err: any) {
      console.error('Login error:', err);
      setError(
        err.response?.data?.detail || 
        'Authentication failed. Please verify your credentials or server connection.'
      );
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex flex-col lg:flex-row bg-[#030712] text-slate-100 font-sans select-none overflow-x-hidden">
      
      {/* =========================================================================
          LEFT PANEL: Tactical Operational Command & Authentication Terminal
          ========================================================================= */}
      <div className="w-full lg:w-[480px] xl:w-[510px] shrink-0 bg-[#020409] border-r border-[#142340] flex flex-col justify-between p-8 lg:p-10 relative z-20 shadow-2xl">
        
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute top-0 left-0 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-0 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          {/* Brand Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[#0C2048] to-[#040916] flex items-center justify-center text-cyan-400 border border-blue-500/40 shadow-[0_0_20px_rgba(59,130,246,0.35)]">
                <Anchor className="w-5 h-5 text-cyan-400" />
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-extrabold tracking-wider text-white">PORTPILOT</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-950/80 text-cyan-300 border border-blue-700/60 font-mono-num tracking-wide">
                    AI v2.4
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium tracking-wide">
                  Autonomous Maritime Logistics Platform
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-950/60 border border-blue-800/40 text-[10px] font-mono-num font-semibold text-cyan-300">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span>VTS ONLINE</span>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>Terminal Sign In</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Authenticate with your authorized port clearance to access vessel dispatch, camera streams, and berth optimization.
            </p>
          </div>

          {/* Tactical Role Switcher Tabs */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Operational Clearance Profile
              </label>
              <span className="text-[10px] text-cyan-400 font-mono-num font-semibold">
                {selectedRole === 'authority' ? 'LEVEL 4 HARBOR CONTROL' : 'AGENT WORKSPACE'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[#040816] border border-[#16294D]">
              <button
                type="button"
                onClick={() => handleRoleSelect('authority')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedRole === 'authority'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_2px_14px_rgba(37,99,235,0.45)] border border-blue-400/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#071126]'
                }`}
              >
                <Shield className="w-4 h-4 shrink-0" />
                <span>Port Authority</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect('agent')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedRole === 'agent'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_2px_14px_rgba(37,99,235,0.45)] border border-blue-400/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#071126]'
                }`}
              >
                <Ship className="w-4 h-4 shrink-0" />
                <span>Shipping Agent</span>
              </button>
            </div>

            {/* Dynamic Role Description Badge */}
            <div className="mt-2.5 px-3 py-2 rounded-lg bg-[#071126] border border-[#16294D] text-[11px] text-slate-300 flex items-center gap-2">
              {selectedRole === 'authority' ? (
                <>
                  <Activity className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Harbor master console, vessel radar scheduling, VTS dispatch &amp; berth matrix.</span>
                </>
              ) : (
                <>
                  <Ship className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Vessel manifest declarations, berthing requests &amp; turnaround status.</span>
                </>
              )}
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-950/70 border border-rose-800/80 text-xs text-rose-200 flex items-start gap-2.5 shadow-lg animate-bounce-short">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-rose-300">Access Restricted</p>
                <p className="text-[11px] text-rose-200/90 mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
            {/* Email Input */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-slate-300 tracking-wide uppercase text-[11px]">
                  Operator Email / ID
                </label>
              </div>
              <div className="relative flex items-center rounded-xl bg-[#060D1E] border border-[#16294D] focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-500/25 transition-all">
                <div className="pl-3.5 pr-2 text-slate-400 shrink-0">
                  <Shield className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="e.g. authority@portpilot.ai"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  className="w-full py-2.5 pr-3 text-xs text-white bg-transparent placeholder-slate-500 focus:outline-none"
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-slate-300 tracking-wide uppercase text-[11px]">
                  Security Password
                </label>
                {capsLockOn && (
                  <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 border border-amber-800/50 px-1.5 py-0.5 rounded flex items-center gap-1 font-mono-num">
                    <AlertCircle className="w-3 h-3" /> CAPS LOCK ON
                  </span>
                )}
              </div>
              <div className="relative flex items-center rounded-xl bg-[#060D1E] border border-[#16294D] focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-500/25 transition-all">
                <div className="pl-3.5 pr-2 text-slate-400 shrink-0">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  onKeyDown={handleKeyModifier}
                  onKeyUp={handleKeyModifier}
                  className="w-full py-2.5 pr-10 text-xs text-white bg-transparent placeholder-slate-500 focus:outline-none"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-slate-400 hover:text-slate-200 transition-colors p-1"
                  tabIndex={-1}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 py-3 px-4 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 border border-cyan-400/40 shadow-[0_4px_22px_rgba(37,99,235,0.45)] hover:shadow-[0_6px_28px_rgba(6,182,212,0.6)] flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group active:scale-[0.99]"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying Port Clearance…</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-cyan-200" />
                  <span>Enter Operations Console</span>
                  <ArrowRight className="w-4 h-4 text-cyan-200 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Autofill */}
          <div className="mt-7 pt-5 border-t border-[#142340]">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                1-Click Demo Profiles
              </span>
              <span className="text-[10px] text-cyan-400/90 font-mono-num">
                Instant Auto-Fill
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleRoleSelect('authority')}
                className="p-2.5 rounded-xl bg-[#071126] hover:bg-[#0B1A38] border border-[#16294D] hover:border-blue-500/50 text-left transition-all cursor-pointer group shadow-sm"
              >
                <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Port Authority</span>
                  </div>
                  {quickFilled === 'authority' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                  ) : (
                    <span className="text-[10px] text-cyan-400 font-mono-num opacity-0 group-hover:opacity-100 transition-opacity">
                      FILL
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-slate-400 mt-1 font-mono-num truncate">
                  authority@portpilot.ai
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect('agent')}
                className="p-2.5 rounded-xl bg-[#071126] hover:bg-[#0B1A38] border border-[#16294D] hover:border-blue-500/50 text-left transition-all cursor-pointer group shadow-sm"
              >
                <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
                  <div className="flex items-center gap-1.5">
                    <Ship className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Shipping Agent</span>
                  </div>
                  {quickFilled === 'agent' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                  ) : (
                    <span className="text-[10px] text-cyan-400 font-mono-num opacity-0 group-hover:opacity-100 transition-opacity">
                      FILL
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-slate-400 mt-1 font-mono-num truncate">
                  agent@portpilot.ai
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Security Compliance Note */}
        <div className="pt-5 border-t border-[#142340] flex items-center justify-between text-[10px] text-slate-500 font-mono-num">
          <span>ENC CHART S-57 ACTIVE</span>
          <span>TLS 1.3 / ECDSA ENCRYPTED</span>
        </div>
      </div>

      {/* =========================================================================
          RIGHT PANEL: Tactical Harbor Radar, Live Vessel AIS & Operations Center
          ========================================================================= */}
      <div className="flex-1 hidden md:flex flex-col justify-between p-8 xl:p-10 bg-[#02050E] relative overflow-hidden maritime-grid">
        
        {/* Top Operational Status Bar */}
        <div className="flex items-center justify-between z-10 pb-4 border-b border-[#142340]">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#071126] border border-[#16294D]">
              <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span className="text-[11px] font-bold tracking-wider text-slate-200 uppercase font-mono-num">
                ROTTERDAM VTS • SECTOR 3 RADAR ACTIVE
              </span>
            </div>

            <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#071126] border border-[#16294D] text-[10px] text-slate-400 font-mono-num">
              <Waves className="w-3 h-3 text-cyan-400" />
              <span>WAVE: 0.8m</span>
              <span className="text-slate-600">|</span>
              <Wind className="w-3 h-3 text-blue-400" />
              <span>WIND: 14kts NE</span>
              <span className="text-slate-600">|</span>
              <span>TIDE: +1.2m</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono-num text-cyan-400 bg-[#071126] px-3 py-1.5 rounded-lg border border-[#16294D] font-semibold">
              LAT 51.9244° N, LON 4.4777° E
            </span>
            <span className="text-xs font-mono-num text-slate-300 bg-[#071126] px-3 py-1.5 rounded-lg border border-[#16294D] font-bold">
              {utcTime || '13:30:00 UTC'}
            </span>
          </div>
        </div>

        {/* Center Grid: Radar Scope + Vessel Telemetry & Metrics */}
        <div className="my-auto z-10 grid grid-cols-1 xl:grid-cols-12 gap-6 items-center">
          
          {/* Tactical Circular Radar Display (Takes 7 cols on XL) */}
          <div className="xl:col-span-7 flex flex-col items-center justify-center">
            <div className="relative w-[340px] h-[340px] sm:w-[380px] sm:h-[380px] rounded-full bg-[#030816]/95 border border-blue-500/35 shadow-[0_0_60px_rgba(37,99,235,0.25)] flex items-center justify-center overflow-hidden">
              
              {/* Concentric Range Rings */}
              <div className="radar-scope-circle w-[90%] h-[90%] border-dashed border-blue-400/20" />
              <div className="radar-scope-circle w-[65%] h-[65%] border-blue-400/25" />
              <div className="radar-scope-circle w-[40%] h-[40%] border-blue-400/35" />
              <div className="radar-scope-circle w-[15%] h-[15%] border-blue-400/50" />

              {/* Crosshairs & Compass Bearings */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-full h-[1px] bg-blue-500/15" />
                <div className="h-full w-[1px] bg-blue-500/15 absolute" />
              </div>

              {/* Cardinal Points */}
              <span className="absolute top-2 text-[10px] font-bold text-cyan-400 font-mono-num">000° N</span>
              <span className="absolute bottom-2 text-[10px] font-bold text-cyan-400 font-mono-num">180° S</span>
              <span className="absolute right-2 text-[10px] font-bold text-cyan-400 font-mono-num">090° E</span>
              <span className="absolute left-2 text-[10px] font-bold text-cyan-400 font-mono-num">270° W</span>

              {/* Range Ring Labels */}
              <span className="absolute top-[28%] text-[8px] font-mono-num text-slate-500">6 NM</span>
              <span className="absolute top-[16%] text-[8px] font-mono-num text-slate-500">9 NM</span>

              {/* Sweeping Radar Beam (CSS Animated) */}
              <div 
                className="absolute inset-0 rounded-full animate-radar-sweep pointer-events-none"
                style={{
                  background: 'conic-gradient(from 0deg, rgba(37, 99, 235, 0.45) 0deg, rgba(6, 182, 212, 0.12) 45deg, transparent 60deg, transparent 360deg)'
                }}
              />

              {/* Radar Center Hub with Antenna Pulse */}
              <div className="w-3 h-3 rounded-full bg-cyan-400 z-10 shadow-[0_0_15px_#06b6d4] flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              </div>

              {/* Harbor Channel Markers */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
                <line x1="120" y1="20" x2="220" y2="340" stroke="#3b82f6" strokeWidth="1" strokeDasharray="3,3" />
                <line x1="160" y1="20" x2="260" y2="340" stroke="#3b82f6" strokeWidth="1" strokeDasharray="3,3" />
              </svg>

              {/* Tactical Vessel Blips */}
              {TACTICAL_VESSELS.map((v) => {
                const isSelected = selectedVessel.id === v.id;
                return (
                  <div
                    key={v.id}
                    onClick={() => setSelectedVessel(v)}
                    className="absolute cursor-pointer group z-20 -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-125"
                    style={{ left: `${v.x}%`, top: `${v.y}%` }}
                    title={`${v.name} (${v.speed})`}
                  >
                    {/* Blip Ping Aura */}
                    <span 
                      className="absolute -inset-2 rounded-full animate-radar-ping pointer-events-none"
                      style={{ backgroundColor: v.color, opacity: 0.4 }}
                    />
                    
                    {/* Target Icon / Marker */}
                    <div 
                      className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shadow-lg transition-all ${
                        isSelected ? 'ring-2 ring-white scale-125' : ''
                      }`}
                      style={{ backgroundColor: v.color }}
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    </div>

                    {/* Heading Vector */}
                    <div 
                      className="absolute top-1/2 left-1/2 w-4 h-[1.5px] origin-left pointer-events-none opacity-80"
                      style={{ 
                        backgroundColor: v.color,
                        transform: `rotate(${parseInt(v.heading)}deg)`
                      }}
                    />

                    {/* Vessel Mini Label */}
                    <div className="absolute left-4 top-0 whitespace-nowrap bg-[#040B1A]/90 border border-[#172D56] px-1.5 py-0.5 rounded text-[9px] font-mono-num font-bold text-slate-200 pointer-events-none shadow-md">
                      {v.name.split(' ')[0]}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Radar Caption */}
            <div className="mt-3 flex items-center gap-3 text-[11px] text-slate-400 font-mono-num">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>INBOUND (3)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                <span>BERTHING (1)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                <span>ANCHORED (1)</span>
              </span>
            </div>
          </div>

          {/* Right Column: Selected Vessel Telemetry & Berth Matrix (5 cols on XL) */}
          <div className="xl:col-span-5 space-y-4">
            
            {/* Active Vessel Telemetry Card */}
            <div className="p-4 rounded-xl tactical-glass shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-[#16294D]">
                <div className="flex items-center gap-2">
                  <Ship className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold text-white tracking-wide">
                    {selectedVessel.name}
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-950/80 text-cyan-300 border border-blue-700/50 font-mono-num">
                  {selectedVessel.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] mb-3">
                <div className="p-2 rounded-lg bg-[#071126] border border-[#16294D]">
                  <span className="text-[10px] text-slate-400 block font-mono-num">VESSEL TYPE / BEAM</span>
                  <span className="font-semibold text-slate-200">{selectedVessel.type}</span>
                </div>
                <div className="p-2 rounded-lg bg-[#071126] border border-[#16294D]">
                  <span className="text-[10px] text-slate-400 block font-mono-num">SPEED &amp; HEADING</span>
                  <span className="font-semibold text-cyan-300 font-mono-num">{selectedVessel.speed} • {selectedVessel.heading}</span>
                </div>
                <div className="p-2 rounded-lg bg-[#071126] border border-[#16294D]">
                  <span className="text-[10px] text-slate-400 block font-mono-num">MAX DRAFT</span>
                  <span className="font-semibold text-slate-200 font-mono-num">{selectedVessel.draft}</span>
                </div>
                <div className="p-2 rounded-lg bg-[#071126] border border-[#16294D]">
                  <span className="text-[10px] text-slate-400 block font-mono-num">ASSIGNED BERTH / ETA</span>
                  <span className="font-semibold text-blue-400 font-mono-num">{selectedVessel.berth} ({selectedVessel.eta})</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono-num pt-1 border-t border-[#16294D]">
                <span>PILOT CUTTER: ENGAGED</span>
                <span className="text-cyan-400 font-semibold">TUG ESCORT READY</span>
              </div>
            </div>

            {/* Berth Visual Matrix */}
            <div className="p-4 rounded-xl tactical-glass shadow-xl">
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#16294D]">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 font-mono-num">
                  BERTH OCCUPANCY &amp; CRANE STATUS
                </span>
                <span className="text-[10px] text-cyan-400 font-mono-num font-semibold">
                  5/6 CRANES ACTIVE
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {[
                  { name: 'B-01', vessel: 'MSC ISABELLA', status: 'INBOUND', color: 'text-amber-400', cranes: '2 STS' },
                  { name: 'B-02', vessel: 'EVERGREEN V.', status: 'BERTHING', color: 'text-cyan-400', cranes: '2 STS' },
                  { name: 'B-03', vessel: 'MAERSK MC-K.', status: 'RESERVED', color: 'text-amber-400', cranes: '1 STS' },
                  { name: 'B-04', vessel: 'CLEAR', status: 'STANDBY', color: 'text-slate-400', cranes: 'IDLE' },
                ].map((b, idx) => (
                  <div key={idx} className="p-2 rounded-lg bg-[#071126] border border-[#16294D] text-[10px]">
                    <div className="flex justify-between items-center font-mono-num text-[9px] text-slate-400 mb-0.5">
                      <span>{b.name}</span>
                      <span className={b.color}>●</span>
                    </div>
                    <div className="font-bold text-slate-200 truncate">{b.vessel}</div>
                    <div className="text-[9px] text-slate-400 font-mono-num mt-0.5">{b.cranes}</div>
                  </div>
                ))}
              </div>

              {/* Port Optimization Stats Bar */}
              <div className="mt-3 pt-2.5 border-t border-[#16294D] space-y-1.5">
                <div className="flex justify-between text-[10px] text-slate-400 font-mono-num">
                  <span>YARD DENSITY BUFFER: 78%</span>
                  <span className="text-cyan-300 font-bold">-18% TURNAROUND VIA AI</span>
                </div>
                <div className="w-full bg-[#050A18] rounded-full h-1.5 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400 h-full rounded-full" style={{ width: '78%' }} />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Live AIS Feed Ticker */}
        <div className="flex items-center justify-between text-xs text-slate-400 z-10 border-t border-[#142340] pt-3 font-mono-num">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="px-2 py-0.5 rounded bg-blue-950 text-cyan-300 border border-blue-800/50 text-[10px] font-bold shrink-0">
              LIVE AIS FEED
            </span>
            <span className="text-slate-300 text-[11px] truncate animate-pulse">
              {AIS_LOGS[logIndex]}
            </span>
          </div>
          <span className="hidden lg:inline text-slate-500 text-[11px] shrink-0 ml-4">
            PORTPILOT MARITIME DECISION SUPPORT V2.4
          </span>
        </div>

      </div>

    </div>
  );
};

export default Login;
