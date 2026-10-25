import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Anchor, 
  LayoutDashboard, 
  Ship, 
  Warehouse, 
  GitBranch, 
  Clock, 
  Cpu, 
  PlusCircle, 
  User as UserIcon,
  ShieldCheck,
  Radio
} from 'lucide-react';

interface SidebarProps {
  collapsed?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = () => {
  const { user } = useAuth();
  const location = useLocation();

  const isAuthority = user?.role === 'PORT_AUTHORITY';

  const authorityNav = [
    { to: '/authority', label: 'Overview', icon: LayoutDashboard, exact: true },
    { to: '/authority/vessels', label: 'Incoming Vessels', icon: Ship },
    { to: '/authority/berths', label: 'Berths', icon: Anchor },
    { to: '/authority/cranes', label: 'Cranes', icon: GitBranch },
    { to: '/authority/yard', label: 'Yard', icon: Warehouse },
    { to: '/authority/predictions', label: 'Predictions', icon: Cpu },
    { to: '/authority/history', label: 'History', icon: Clock },
  ];

  const agentNav = [
    { to: '/agent', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { to: '/agent/create-report', label: 'Vessel Arrival Report', icon: PlusCircle },
    { to: '/agent/my-reports', label: 'My Reports', icon: Ship },
    { to: '/agent/profile', label: 'Profile', icon: UserIcon },
  ];

  const navItems = isAuthority ? authorityNav : agentNav;

  return (
    <aside className="w-60 shrink-0 bg-[#020409] border-r border-[#142340] text-slate-300 flex flex-col justify-between select-none">
      <div>
        {/* Brand Header */}
        <div className="h-14 px-4 flex items-center gap-3 border-b border-[#142340]">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0C1E40] to-[#060D1E] border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
            <Anchor className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white tracking-wider">PORTPILOT</span>
              <span className="text-[10px] font-semibold px-1 py-0.2 rounded bg-blue-950/80 text-blue-300 border border-blue-800/60 font-mono-num">
                VTS
              </span>
            </div>
            <span className="text-[10px] text-slate-400 tracking-tight">
              {isAuthority ? 'Port Operations Control' : 'Agent Operations Portal'}
            </span>
          </div>
        </div>

        {/* Operational Scope Tag */}
        <div className="px-3 pt-3 pb-1">
          <div className="px-2 py-1 rounded bg-[#040816] border border-[#16294D] flex items-center justify-between text-[10px]">
            <span className="text-slate-400 font-medium">TERMINAL</span>
            <span className="text-cyan-400 font-mono-num font-semibold">T-ROTTERDAM-01</span>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="p-3">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-2 py-1 mb-1">
            Navigation
          </div>
          <nav className="space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact 
                ? location.pathname === item.to 
                : location.pathname.startsWith(item.to);

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-2.5 px-2.5 py-2 rounded text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-[#0C2048] to-[#081530] text-white border border-blue-500/60 shadow-[0_0_15px_rgba(59,130,246,0.25)]'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#071124]'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span className="tracking-tight">{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      {/* System Telemetry & Role Footer */}
      <div className="p-3 border-t border-[#142340] bg-[#010206]">
        <div className="flex items-center justify-between text-[11px] mb-2 px-1 text-slate-400">
          <span className="flex items-center gap-1.5">
            <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
            <span className="font-mono-num">VHF CH-16 ACTIVE</span>
          </span>
          <span className="text-[10px] font-mono-num text-cyan-400 font-semibold">99.98%</span>
        </div>

        <div className="flex items-center gap-2.5 p-2 rounded bg-[#071126] border border-[#16294D]">
          <div className="w-7 h-7 rounded bg-[#0A1836] border border-[#1C3872] flex items-center justify-center text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] font-semibold text-slate-200 truncate">
              {user?.email.split('@')[0]}
            </span>
            <span className="text-[10px] text-blue-400/90 uppercase font-mono-num truncate">
              {isAuthority ? 'PORT CONTROLLER' : 'SHIPPING AGENT'}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
