import React, { useState, useEffect } from 'react';
import { api, Ticket } from '../services/api.ts';
import TicketCard from '../components/TicketCard.tsx';
import {
  TicketCheck,
  Search,
  Filter,
  LayoutGrid,
  List,
  Sparkles,
  Loader2,
  RefreshCw,
  CheckCircle2,
  Clock,
  TrendingUp,
  Cpu,
  HeartHandshake,
  Building2,
  HelpCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const TicketsPage: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      const data = await api.getTickets({
        status: statusFilter,
        category: categoryFilter,
        search: searchQuery,
      });
      setTickets(data);
    } catch (err) {
      console.error('Failed to load tickets:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [statusFilter, categoryFilter, searchQuery]);

  const handleStatusChange = async (ticketId: string, newStatus: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED') => {
    try {
      const updated = await api.updateTicketStatus(ticketId, newStatus);
      setTickets((prev) =>
        prev.map((t) => (t.id === ticketId ? { ...t, status: updated.status, updated_at: updated.updated_at } : t))
      );
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  // Grouping for Kanban View
  const openTickets = tickets.filter((t) => t.status === 'OPEN');
  const inProgressTickets = tickets.filter((t) => t.status === 'IN_PROGRESS');
  const resolvedTickets = tickets.filter((t) => t.status === 'RESOLVED');

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Enterprise Tickets & Workflows
          </h1>
          <p className="text-xs text-slate-400">
            Real-time status tracking for tickets parsed and generated via NexusAI Knowledge Chat
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* View Mode Switcher */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 text-slate-400">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                viewMode === 'kanban' ? 'bg-indigo-600 text-white shadow-sm' : 'hover:text-white'
              }`}
              title="Kanban Board View"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                viewMode === 'list' ? 'bg-indigo-600 text-white shadow-sm' : 'hover:text-white'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">List</span>
            </button>
          </div>

          <button
            onClick={fetchTickets}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
            title="Refresh Tickets"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <Link
            to="/chat"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate Request via AI</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tickets by title, description or keyword..."
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400 font-medium">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Categories</option>
              <option value="IT_SUPPORT">IT Support</option>
              <option value="HR_REQUEST">HR Request</option>
              <option value="FACILITIES">Facilities</option>
              <option value="GENERAL">General Ops</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content Rendering: Kanban or List */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          <p className="text-sm">Querying PostgreSQL ticket repository...</p>
        </div>
      ) : tickets.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/60 border border-slate-800">
          <TicketCheck className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-200 mb-1">No Tickets Found</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mb-5 leading-relaxed">
            {searchQuery || statusFilter !== 'ALL' || categoryFilter !== 'ALL'
              ? 'No tickets match the selected filters. Try resetting search criteria.'
              : 'You have not created any tickets yet. Simply head to the Knowledge Chat and tell NexusAI what you need!'}
          </p>
          <Link
            to="/chat"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 transition shadow-lg shadow-indigo-600/30"
          >
            <Sparkles className="w-4 h-4" />
            <span>Open Chat to Create Ticket</span>
          </Link>
        </div>
      ) : viewMode === 'kanban' ? (
        /* Kanban Board View */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Column: OPEN */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex flex-col">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>OPEN</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-mono font-bold">
                {openTickets.length}
              </span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-20rem)] pr-1">
              {openTickets.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
                  No open items
                </div>
              ) : (
                openTickets.map((ticket) => (
                  <TicketCard
                    key={ticket.id}
                    ticket={ticket}
                    onStatusChange={handleStatusChange}
                  />
                ))
              )}
            </div>
          </div>

          {/* Column: IN_PROGRESS */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex flex-col">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
                <TrendingUp className="w-4 h-4 text-indigo-400" />
                <span>IN PROGRESS</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-mono font-bold">
                {inProgressTickets.length}
              </span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-20rem)] pr-1">
              {inProgressTickets.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
                  No in-progress items
                </div>
              ) : (
                inProgressTickets.map((ticket) => (
                  <TicketCard
                    key={ticket.id}
                    ticket={ticket}
                    onStatusChange={handleStatusChange}
                  />
                ))
              )}
            </div>
          </div>

          {/* Column: RESOLVED */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex flex-col">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>RESOLVED</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-mono font-bold">
                {resolvedTickets.length}
              </span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-20rem)] pr-1">
              {resolvedTickets.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
                  No resolved items
                </div>
              ) : (
                resolvedTickets.map((ticket) => (
                  <TicketCard
                    key={ticket.id}
                    ticket={ticket}
                    onStatusChange={handleStatusChange}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        /* List View */
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TicketsPage;
