import React from 'react';
import { ChatMessageItem } from '../services/api.ts';
import { Sparkles, User, Ticket as TicketIcon, Check, Copy, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ChatMessageProps {
  message: ChatMessageItem;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedTime = new Date(message.created_at).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={`flex gap-3 my-4 group ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-xs font-semibold shadow-md ${
          isUser
            ? 'bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white'
            : 'bg-gradient-to-tr from-slate-800 to-slate-700 text-indigo-400 border border-indigo-500/30'
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
      </div>

      {/* Bubble Content */}
      <div className={`max-w-[85%] sm:max-w-[75%] space-y-2 ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`relative rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
            isUser
              ? 'bg-indigo-600 text-white rounded-tr-xs'
              : 'bg-slate-800/90 border border-slate-700/80 text-slate-100 rounded-tl-xs'
          }`}
        >
          <div className="whitespace-pre-wrap">{message.message}</div>

          {/* Copy Button on Hover */}
          {!isUser && (
            <button
              onClick={handleCopy}
              className="absolute top-2 right-2 p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Copy message"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>

        {/* Embedded Ticket Card if auto-generated */}
        {message.ticket && (
          <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 shadow-md space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-indigo-300">
              <div className="flex items-center gap-1.5">
                <TicketIcon className="w-4 h-4 text-indigo-400" />
                <span>Ticket Auto-Generated in Database</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                {message.ticket.status}
              </span>
            </div>

            <div className="text-xs text-slate-200 font-medium">
              {message.ticket.title}
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-indigo-900/40 text-[11px] text-slate-400">
              <span className="font-mono text-indigo-300">
                Category: {message.ticket.category} • {message.ticket.priority} Priority
              </span>
              <Link
                to="/tickets"
                className="text-indigo-400 hover:text-indigo-300 font-semibold inline-flex items-center gap-1 hover:underline"
              >
                <span>View on board</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        )}

        {/* Timestamp */}
        <div
          className={`text-[10px] text-slate-500 px-1 font-mono ${
            isUser ? 'text-right' : 'text-left'
          }`}
        >
          {formattedTime}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
