import React from 'react';
import { Ticket } from '../services/api.ts';
import {
  Cpu,
  HeartHandshake,
  Building2,
  HelpCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  ChevronDown,
} from 'lucide-react';

interface TicketCardProps {
  ticket: Ticket;
  onStatusChange?: (ticketId: string, newStatus: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED') => void;
}

export const TicketCard: React.FC<TicketCardProps> = ({ ticket, onStatusChange }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  // Status badge config
  const getStatusBadge = (status: Ticket['status']) => {
    switch (status) {
      case 'OPEN':
        return {
          label: 'Open',
          badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
          dotClass: 'bg-amber-400',
        };
      case 'IN_PROGRESS':
        return {
          label: 'In Progress',
          badgeClass: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
          dotClass: 'bg-indigo-400',
        };
      case 'RESOLVED':
        return {
          label: 'Resolved',
          badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
          dotClass: 'bg-emerald-400',
        };
    }
  };

  // Category config
  const getCategoryConfig = (category: Ticket['category']) => {
    switch (category) {
      case 'IT_SUPPORT':
        return {
          name: 'IT Support',
          icon: Cpu,
          badgeClass: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
        };
      case 'HR_REQUEST':
        return {
          name: 'HR Request',
          icon: HeartHandshake,
          badgeClass: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
        };
      case 'FACILITIES':
        return {
          name: 'Facilities',
          icon: Building2,
          badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        };
      case 'GENERAL':
      default:
        return {
          name: 'General',
          icon: HelpCircle,
          badgeClass: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
        };
    }
  };

  // Priority config
  const getPriorityConfig = (priority: Ticket['priority']) => {
    switch (priority) {
      case 'HIGH':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/25';
      case 'MEDIUM':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/25';
      case 'LOW':
      default:
        return 'text-slate-400 bg-slate-500/10 border-slate-500/25';
    }
  };

  const statusInfo = getStatusBadge(ticket.status);
  const categoryInfo = getCategoryConfig(ticket.category);
  const CategoryIcon = categoryInfo.icon;

  const formattedDate = new Date(ticket.created_at).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="bg-slate-800/60 hover:bg-slate-800/90 border border-slate-700/60 hover:border-slate-600 rounded-xl p-4 transition-all duration-200 shadow-sm flex flex-col justify-between">
      <div>
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Category */}
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${categoryInfo.badgeClass}`}
            >
              <CategoryIcon className="w-3.5 h-3.5" />
              <span>{categoryInfo.name}</span>
            </span>

            {/* Priority */}
            <span
              className={`px-2 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wider border ${getPriorityConfig(
                ticket.priority
              )}`}
            >
              {ticket.priority} Priority
            </span>
          </div>

          {/* Status Badge */}
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusInfo.badgeClass}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotClass}`} />
            <span>{statusInfo.label}</span>
          </span>
        </div>

        {/* Title */}
        <h3 className="text-base font-semibold text-slate-100 mb-2 leading-snug group-hover:text-indigo-300 transition-colors">
          {ticket.title}
        </h3>

        {/* Description */}
        <p
          className={`text-sm text-slate-300 leading-relaxed ${
            isExpanded ? '' : 'line-clamp-2'
          }`}
        >
          {ticket.description}
        </p>

        {ticket.description.length > 120 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium mt-1.5 flex items-center gap-1"
          >
            {isExpanded ? 'Show less' : 'Read more'}
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            />
          </button>
        )}
      </div>

      {/* Footer / Meta & Status Actions */}
      <div className="mt-4 pt-3 border-t border-slate-700/50 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
        <div className="flex items-center gap-1.5 font-mono">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{formattedDate}</span>
        </div>

        {/* Status Actions */}
        {onStatusChange && (
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-slate-400 mr-1">Move:</span>
            {ticket.status !== 'OPEN' && (
              <button
                onClick={() => onStatusChange(ticket.id, 'OPEN')}
                className="px-2 py-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 transition"
              >
                Open
              </button>
            )}
            {ticket.status !== 'IN_PROGRESS' && (
              <button
                onClick={() => onStatusChange(ticket.id, 'IN_PROGRESS')}
                className="px-2 py-1 rounded bg-indigo-900/60 hover:bg-indigo-800 text-indigo-200 border border-indigo-700/50 transition"
              >
                In Progress
              </button>
            )}
            {ticket.status !== 'RESOLVED' && (
              <button
                onClick={() => onStatusChange(ticket.id, 'RESOLVED')}
                className="px-2 py-1 rounded bg-emerald-900/50 hover:bg-emerald-800 text-emerald-200 border border-emerald-700/50 transition flex items-center gap-1"
              >
                <CheckCircle2 className="w-3 h-3" />
                <span>Resolve</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketCard;
