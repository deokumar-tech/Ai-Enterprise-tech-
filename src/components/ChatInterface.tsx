import React, { useState, useEffect, useRef } from 'react';
import { api, ChatMessageItem, Ticket } from '../services/api.ts';
import ChatMessage from './ChatMessage.tsx';
import { Send, Loader2, Sparkles, Trash2, HelpCircle, ArrowUpCircle } from 'lucide-react';

interface ChatInterfaceProps {
  onTicketCreated?: (ticket: Ticket) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ onTicketCreated }) => {
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingHistory, setIsFetchingHistory] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedPrompts = [
    'How do I request parental leave and what is our policy?',
    'Please open a request for my parental leave starting next Monday.',
    'My MacBook screen is flickering, please file an IT support ticket.',
    'The 4th floor conference room AC is freezing cold, need facilities check.',
  ];

  // Load chat history on mount
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const history = await api.getChatHistory();
        setMessages(history);
      } catch (err) {
        console.error('Failed to load chat history:', err);
      } finally {
        setIsFetchingHistory(false);
      }
    };
    loadHistory();
  }, []);

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (messageText?: string) => {
    const textToSend = (messageText || input).trim();
    if (!textToSend || isLoading) return;

    setInput('');
    const tempUserMessage: ChatMessageItem = {
      id: `temp-${Date.now()}`,
      message: textToSend,
      role: 'user',
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempUserMessage]);
    setIsLoading(true);

    try {
      const response = await api.sendMessage(textToSend);

      const aiMessage: ChatMessageItem = {
        id: `ai-${Date.now()}`,
        message: response.message,
        role: 'model',
        created_at: new Date().toISOString(),
        ticket: response.ticket,
      };

      setMessages((prev) => [...prev, aiMessage]);

      if (response.ticket && onTicketCreated) {
        onTicketCreated(response.ticket);
      }
    } catch (err: any) {
      console.error('Failed to send message:', err);
      const errorMessage: ChatMessageItem = {
        id: `err-${Date.now()}`,
        message: `⚠️ System error: ${err.message || 'Could not process message'}. Please try again.`,
        role: 'model',
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure you want to clear your enterprise chat history?')) return;
    try {
      await api.clearChatHistory();
      setMessages([]);
    } catch (err) {
      console.error('Failed to clear history:', err);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
      {/* Chat Header */}
      <div className="px-5 py-3.5 bg-slate-800/80 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              NexusAI Intake Copilot
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            </h2>
            <p className="text-[11px] text-slate-400">Policy inquiries & Natural Language Workflow Dispatcher</p>
          </div>
        </div>

        {messages.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
            title="Clear Chat History"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear History</span>
          </button>
        )}
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-2">
        {isFetchingHistory ? (
          <div className="h-full flex items-center justify-center text-slate-400">
            <div className="flex items-center gap-2 text-sm">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
              <span>Loading conversation history...</span>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto px-4 py-8">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mb-3 shadow-inner">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-100 mb-1">
              How can NexusAI assist your workflow today?
            </h3>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Ask any enterprise policy question or request assistance. NexusAI recognizes your intent and automatically creates IT, HR, or Facilities tickets without manual forms.
            </p>

            <div className="w-full space-y-2 text-left">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-1">
                Suggested Prompts
              </div>
              {suggestedPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(prompt)}
                  className="w-full p-2.5 rounded-xl bg-slate-800/60 hover:bg-indigo-950/40 border border-slate-700/60 hover:border-indigo-500/30 text-xs text-slate-300 hover:text-white transition flex items-center justify-between group"
                >
                  <span className="line-clamp-1">{prompt}</span>
                  <ArrowUpCircle className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-400 shrink-0 ml-2" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}

            {isLoading && (
              <div className="flex items-center gap-3 my-4">
                <div className="w-8 h-8 rounded-xl bg-slate-800 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl px-4 py-3 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                  <span className="text-xs font-medium text-slate-300">
                    NexusAI is consulting policy docs and processing intent...
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="p-3 sm:p-4 bg-slate-800/90 border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative flex items-end gap-2 bg-slate-900 border border-slate-700 focus-within:border-indigo-500 rounded-xl p-2 transition shadow-inner"
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a policy question or describe an issue (e.g. 'Please open a request for my parental leave...')"
            rows={2}
            className="w-full bg-transparent text-slate-100 placeholder-slate-400 text-sm focus:outline-none resize-none px-2 py-1 leading-relaxed max-h-28"
          />

          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white transition shrink-0 shadow-md shadow-indigo-600/30"
            title="Send Message (Enter)"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>

        <div className="flex items-center justify-between mt-2 px-1 text-[11px] text-slate-400">
          <span>Press <kbd className="px-1 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[10px]">Enter</kbd> to submit, <kbd className="px-1 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[10px]">Shift+Enter</kbd> for newline</span>
          <span className="text-indigo-400/80 font-medium hidden sm:inline">Zero-Form Entity Extraction Active</span>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
