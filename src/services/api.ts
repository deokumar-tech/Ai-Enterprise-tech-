// Centralized API client for NexusAI Enterprise Frontend

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('nexusai_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export interface User {
  id: string;
  email: string;
  full_name: string;
  created_at?: string;
}

export interface Ticket {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: 'IT_SUPPORT' | 'HR_REQUEST' | 'FACILITIES' | 'GENERAL';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  created_at: string;
  updated_at: string;
}

export interface ChatMessageItem {
  id: string;
  user_id?: string;
  message: string;
  role: 'user' | 'model';
  created_at: string;
  ticket?: Ticket | null;
}

export interface TicketStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  byCategory: {
    IT_SUPPORT: number;
    HR_REQUEST: number;
    FACILITIES: number;
    GENERAL: number;
  };
  byPriority: {
    HIGH: number;
    MEDIUM: number;
    LOW: number;
  };
  recentTickets: Ticket[];
}

export const api = {
  // Auth
  async register(email: string, password: string, full_name: string) {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, full_name }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    return data;
  },

  async login(email: string, password: string) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    return data;
  },

  async getMe() {
    const res = await fetch('/api/auth/me', {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Session validation failed');
    return data.user as User;
  },

  // Tickets
  async getTickets(filters?: { status?: string; category?: string; search?: string }) {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.search) params.append('search', filters.search);

    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`/api/tickets${query}`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch tickets');
    return data.tickets as Ticket[];
  },

  async updateTicketStatus(id: string, status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED') {
    const res = await fetch(`/api/tickets/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update ticket status');
    return data.ticket as Ticket;
  },

  async getStats() {
    const res = await fetch('/api/tickets/stats', {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch stats');
    return data as TicketStats;
  },

  // Chat
  async getChatHistory() {
    const res = await fetch('/api/chat/history', {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch chat history');
    return data.chats as ChatMessageItem[];
  },

  async clearChatHistory() {
    const res = await fetch('/api/chat/history', {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to clear chat history');
    return data;
  },

  async sendMessage(message: string) {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ message }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to send message');
    return data as {
      message: string;
      ticket_action: boolean;
      ticket?: Ticket;
    };
  },
};
