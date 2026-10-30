import React, { useState } from 'react';
import ChatInterface from '../components/ChatInterface.tsx';
import { Ticket } from '../services/api.ts';
import { Sparkles, CheckCircle2, Ticket as TicketIcon, ArrowRight, ShieldAlert, Cpu, HeartHandshake, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ChatPage: React.FC = () => {
  const [lastCreatedTicket, setLastCreatedTicket] = useState<Ticket | null>(null);

  const handleTicketCreated = (ticket: Ticket) => {
    setLastCreatedTicket(ticket);
    setTimeout(() => {
      // Keep alert visible for 8 seconds
    }, 8000);
  };

  return (
    <div className="space-y-4">
      {/* Page Title & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            AI Policy & Workflow Intake Chat
          </h1>
          <p className="text-xs text-slate-400">
            Powered by Google Gemini 3.8 Flash • Automatic PostgreSQL Entity Extraction
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>RLS Protected Session</span>
          </span>
        </div>
      </div>

      {/* Ticket Creation Toast Banner */}
      {lastCreatedTicket && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 border border-emerald-500/30 text-emerald-200 shadow-xl flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-300">
                Action Trigger Detected & Database Ticket Created!
              </p>
              <p className="text-xs text-slate-300">
                "{lastCreatedTicket.title}" was saved into PostgreSQL ({lastCreatedTicket.category} • {lastCreatedTicket.priority} Priority).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              to="/tickets"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow transition"
            >
              <span>View in Tickets</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <button
              onClick={() => setLastCreatedTicket(null)}
              className="text-slate-400 hover:text-white text-xs px-2 py-1"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Chat Interface */}
      <ChatInterface onTicketCreated={handleTicketCreated} />
    </div>
  );
};

export default ChatPage;
