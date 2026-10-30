import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageSquareCode,
  TicketCheck,
  Cpu,
  HeartHandshake,
  Building2,
  HelpCircle,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navItems = [
    {
      name: 'Overview Dashboard',
      to: '/dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      name: 'AI Knowledge Chat',
      to: '/chat',
      icon: MessageSquareCode,
      badge: 'AI Intake',
    },
    {
      name: 'Tickets & Workflows',
      to: '/tickets',
      icon: TicketCheck,
      badge: null,
    },
  ];

  const domains = [
    { name: 'IT Support', icon: Cpu, desc: 'Hardware, software, access', color: 'text-sky-400' },
    { name: 'HR & People', icon: HeartHandshake, desc: 'Leave, payroll, benefits', color: 'text-purple-400' },
    { name: 'Facilities', icon: Building2, desc: 'HVAC, desks, maintenance', color: 'text-amber-400' },
    { name: 'General Ops', icon: HelpCircle, desc: 'Corporate & administrative', color: 'text-slate-400' },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/70 z-40 md:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      <aside
        className={`fixed md:sticky top-16 z-40 h-[calc(100vh-4rem)] w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-4 space-y-6 overflow-y-auto">
          {/* Main Navigation */}
          <div>
            <div className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Workspace
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                      }`
                    }
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.name}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-indigo-400/20 text-indigo-200 border border-indigo-400/30">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Domain Knowledge */}
          <div>
            <div className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Supported Domains
            </div>
            <div className="space-y-1.5 px-1">
              {domains.map((dom) => {
                const Icon = dom.icon;
                return (
                  <div
                    key={dom.name}
                    className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-800/40 border border-slate-800/60"
                  >
                    <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${dom.color}`} />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-200">{dom.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{dom.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* AI Assisted Bottom Card */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/40">
          <div className="p-3 rounded-xl bg-gradient-to-b from-indigo-950/40 to-slate-900 border border-indigo-500/20">
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Zero-Form Ticketing</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Ask any policy question or state an issue in chat. NexusAI automatically categorizes and provisions the ticket.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
