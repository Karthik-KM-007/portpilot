import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Bell, LogOut, Shield, Wifi } from 'lucide-react';

interface TopBarProps {
  pageTitle?: string;
}

export const TopBar: React.FC<TopBarProps> = () => {
  const { user, logout } = useAuth();
  const [timeUtc, setTimeUtc] = useState<string>('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const iso = now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
      setTimeUtc(iso);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const isAuthority = user?.role === 'PORT_AUTHORITY';

  return (
    <header className="h-14 bg-[#030611] border-b border-[#142340] px-6 flex items-center justify-between shrink-0 select-none z-10">
      {/* Left side: Operational Domain & Live Telemetry */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-xs font-bold text-slate-200 tracking-wide uppercase">
            PORT OPERATIONS
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Wifi className="w-3 h-3 text-cyan-400" />
            <span className="text-blue-400 font-medium">System Operational</span>
          </span>
        </div>
      </div>

      {/* Right side: UTC Clock, Alerts, Profile & Logout */}
      <div className="flex items-center gap-5">
        {/* Real-time Maritime UTC Clock */}
        <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded bg-[#071126] border border-[#16294D] text-slate-300 font-mono-num text-xs">
          <span className="text-slate-500 font-medium text-[10px]">SYS TIME</span>
          <span className="font-semibold text-cyan-300">{timeUtc || 'SYNCING...'}</span>
        </div>

        {/* Notifications / Alerts Pill */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-[#0B1A38] transition-colors relative cursor-pointer"
            title="Operational Alerts"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-cyan-400" />
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-[#071126] border border-[#1C3566] rounded-xl shadow-2xl py-2 z-50 text-xs">
              <div className="px-3 py-1.5 border-b border-[#16294D] font-semibold text-slate-200 flex justify-between items-center">
                <span>Operational Alerts</span>
                <span className="text-[10px] text-cyan-300 bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-800/60 font-mono-num">
                  2 NEW
                </span>
              </div>
              <div className="divide-y divide-[#14264A]">
                <div className="p-3 hover:bg-[#0B1A38] transition-colors">
                  <p className="font-medium text-slate-200">Berth B-02 Clearance</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Tug assist confirmed for Evergreen Voyager.</p>
                  <span className="text-[10px] text-slate-500 font-mono-num mt-1 block">5m ago</span>
                </div>
                <div className="p-3 hover:bg-[#0B1A38] transition-colors">
                  <p className="font-medium text-slate-200">Yard Density Advisory</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Block C-04 operating at 82% capacity.</p>
                  <span className="text-[10px] text-slate-500 font-mono-num mt-1 block">22m ago</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="h-5 w-px bg-[#142340]" />

        {/* User Identity & Logout Action */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-gradient-to-br from-[#0C1E40] to-[#060D1E] border border-blue-500/40 text-blue-300 flex items-center justify-center font-bold text-xs shadow-sm">
              {user?.email.charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-200 leading-tight">
                {user?.email}
              </span>
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider flex items-center gap-1">
                <Shield className="w-2.5 h-2.5 text-cyan-400" />
                {isAuthority ? 'Port Authority' : 'Shipping Agent'}
              </span>
            </div>
          </div>

          <button
            onClick={logout}
            className="p-1.5 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
