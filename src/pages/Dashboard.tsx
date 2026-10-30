import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { api, TicketStats, Ticket } from '../services/api.ts';
import TicketCard from '../components/TicketCard.tsx';
import {
  Sparkles,
  Ticket as TicketIcon,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Cpu,
  HeartHandshake,
  Building2,
  HelpCircle,
  PlusCircle,
  Loader2,
  RefreshCw,
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<TicketStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getStats();
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard statistics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleStatusChange = async (ticketId: string, newStatus: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED') => {
    try {
      await api.updateTicketStatus(ticketId, newStatus);
      fetchDashboardData();
    } catch (err) {
      console.error('Failed to update ticket:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="relative rounded-2xl bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900 border border-indigo-500/30 p-6 shadow-xl overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Enterprise Copilot Ready</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Welcome back, {user?.full_name || 'Team Member'}
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              NexusAI connects your policy queries with automated IT, HR, and Facilities ticketing. Ask questions or trigger workflow tasks directly in natural language.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={fetchDashboardData}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <Link
              to="/chat"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 transition hover:scale-[1.02]"
            >
              <Sparkles className="w-4 h-4" />
              <span>Ask NexusAI</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {isLoading && !stats ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          <p className="text-sm">Aggregating enterprise telemetry & tickets...</p>
        </div>
      ) : (
        <>
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Tickets */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm hover:border-slate-700 transition">
              <div className="flex items-center justify-between text-slate-400 mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Tickets</span>
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                  <TicketIcon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-bold text-white tracking-tight">{stats?.total ?? 0}</div>
              <p className="text-xs text-slate-400 mt-1">Generated via natural language chat</p>
            </div>

            {/* Open Tickets */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm hover:border-slate-700 transition">
              <div className="flex items-center justify-between text-slate-400 mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider">Open Inquiries</span>
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-bold text-amber-400 tracking-tight">{stats?.open ?? 0}</div>
              <p className="text-xs text-slate-400 mt-1">Awaiting enterprise resolution</p>
            </div>

            {/* In Progress */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm hover:border-slate-700 transition">
              <div className="flex items-center justify-between text-slate-400 mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider">In Progress</span>
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-300 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-bold text-indigo-300 tracking-tight">{stats?.inProgress ?? 0}</div>
              <p className="text-xs text-slate-400 mt-1">Active operations handling</p>
            </div>

            {/* Resolved */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm hover:border-slate-700 transition">
              <div className="flex items-center justify-between text-slate-400 mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider">Resolved</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-bold text-emerald-400 tracking-tight">{stats?.resolved ?? 0}</div>
              <p className="text-xs text-slate-400 mt-1">Successfully fulfilled</p>
            </div>
          </div>

          {/* Breakdown & Domain Telemetry */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Category Distribution */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-200">Category Breakdown</h2>
                <span className="text-xs text-slate-400 font-mono">4 Target Domains</span>
              </div>

              <div className="space-y-3">
                {/* IT_SUPPORT */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="flex items-center gap-1.5 text-sky-400 font-medium">
                      <Cpu className="w-3.5 h-3.5" />
                      IT Support
                    </span>
                    <span className="text-slate-300 font-semibold">{stats?.byCategory.IT_SUPPORT ?? 0}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-sky-500 transition-all duration-500"
                      style={{
                        width: `${stats?.total ? ((stats.byCategory.IT_SUPPORT / stats.total) * 100) : 0}%`,
                      }}
                    />
                  </div>
                </div>

                {/* HR_REQUEST */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="flex items-center gap-1.5 text-purple-400 font-medium">
                      <HeartHandshake className="w-3.5 h-3.5" />
                      HR & Leave
                    </span>
                    <span className="text-slate-300 font-semibold">{stats?.byCategory.HR_REQUEST ?? 0}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-purple-500 transition-all duration-500"
                      style={{
                        width: `${stats?.total ? ((stats.byCategory.HR_REQUEST / stats.total) * 100) : 0}%`,
                      }}
                    />
                  </div>
                </div>

                {/* FACILITIES */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="flex items-center gap-1.5 text-amber-400 font-medium">
                      <Building2 className="w-3.5 h-3.5" />
                      Facilities
                    </span>
                    <span className="text-slate-300 font-semibold">{stats?.byCategory.FACILITIES ?? 0}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-amber-500 transition-all duration-500"
                      style={{
                        width: `${stats?.total ? ((stats.byCategory.FACILITIES / stats.total) * 100) : 0}%`,
                      }}
                    />
                  </div>
                </div>

                {/* GENERAL */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="flex items-center gap-1.5 text-slate-400 font-medium">
                      <HelpCircle className="w-3.5 h-3.5" />
                      General Ops
                    </span>
                    <span className="text-slate-300 font-semibold">{stats?.byCategory.GENERAL ?? 0}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-slate-500 transition-all duration-500"
                      style={{
                        width: `${stats?.total ? ((stats.byCategory.GENERAL / stats.total) * 100) : 0}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Intake Guidance */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 lg:col-span-2 flex flex-col justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-200 mb-1">How AI Auto-Ticketing Works</h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Traditional ticketing requires navigating drop-downs, SLA fields, and asset IDs. NexusAI replaces all manual intake forms with Gemini JSON entity extraction:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs">
                    <span className="font-semibold text-indigo-300 block mb-1">1. Ask Policy Queries</span>
                    <p className="text-slate-400 text-[11px]">
                      "How many sick days do I have?" or "What are the remote monitor allowances?" gets direct policy answers.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs">
                    <span className="font-semibold text-emerald-300 block mb-1">2. State an Action</span>
                    <p className="text-slate-400 text-[11px]">
                      "Please order a 27-inch monitor" automatically creates a PostgreSQL record linked to your user account.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400">Ready to submit a request?</span>
                <Link
                  to="/chat"
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1"
                >
                  <span>Open Knowledge Chat</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Recent Tickets Activity */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">Recent Enterprise Requests</h2>
                <p className="text-xs text-slate-400">Latest tickets generated in your workspace</p>
              </div>
              <Link
                to="/tickets"
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1.5"
              >
                <span>View all tickets</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {stats?.recentTickets && stats.recentTickets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stats.recentTickets.map((ticket) => (
                  <TicketCard
                    key={ticket.id}
                    ticket={ticket}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>
            ) : (
              <div className="p-8 text-center rounded-2xl bg-slate-900/50 border border-slate-800/80">
                <TicketIcon className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-300">No tickets generated yet</p>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Start a conversation in Knowledge Chat to automatically generate your first IT, HR, or Facilities ticket.
                </p>
                <Link
                  to="/chat"
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 transition"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Go to Chat</span>
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
