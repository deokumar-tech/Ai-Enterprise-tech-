import { Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import db from '../config/db.ts';
import { AuthenticatedRequest } from '../middleware/auth.ts';

// 14. Exact AI System Instruction specified in requirements
const SYSTEM_INSTRUCTION = `You are NexusAI, an expert Enterprise Assistant. Your job is to answer employee questions regarding company policies. 
Additionally, you have the ability to automatically generate workflow tickets. 
If a user asks a question, answer it professionally. 
If a user explicitly requests an action (e.g., "fix my laptop", "request time off", "order a new monitor"), you MUST output your response as a valid JSON object. DO NOT wrap it in markdown blockquotes.
The JSON must have this exact structure:
{
  "message": "Your conversational response to the user here",
  "ticket_action": true,
  "ticket_payload": {
    "title": "Short summary of request",
    "description": "Detailed description extracted from user",
    "category": "IT_SUPPORT | HR_REQUEST | FACILITIES | GENERAL",
    "priority": "LOW | MEDIUM | HIGH"
  }
}
If NO ticket is needed, output JSON like this:
{
  "message": "Your conversational response",
  "ticket_action": false
}`;

// Strict response schema for Gemini
const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    message: {
      type: Type.STRING,
      description: 'Conversational response to the user',
    },
    ticket_action: {
      type: Type.BOOLEAN,
      description: 'Whether a ticket should be created',
    },
    ticket_payload: {
      type: Type.OBJECT,
      description: 'Payload for creating the ticket if ticket_action is true',
      properties: {
        title: {
          type: Type.STRING,
          description: 'Short summary of request',
        },
        description: {
          type: Type.STRING,
          description: 'Detailed description extracted from user',
        },
        category: {
          type: Type.STRING,
          description: 'Category: IT_SUPPORT | HR_REQUEST | FACILITIES | GENERAL',
        },
        priority: {
          type: Type.STRING,
          description: 'Priority: LOW | MEDIUM | HIGH',
        },
      },
    },
  },
  required: ['message', 'ticket_action'],
};

interface GeminiResult {
  message: string;
  ticket_action: boolean;
  ticket_payload?: {
    title: string;
    description: string;
    category: string;
    priority: string;
  };
}

// Fallback intelligent intent analyzer when API key is unconfigured or rate limited
function fallbackEnterpriseNLP(userMessage: string): GeminiResult {
  const lower = userMessage.toLowerCase();

  const isActionRequest =
    lower.includes('fix') ||
    lower.includes('broken') ||
    lower.includes('order') ||
    lower.includes('request') ||
    lower.includes('open a ticket') ||
    lower.includes('submit a ticket') ||
    lower.includes('issue') ||
    lower.includes('pto') ||
    lower.includes('leave') ||
    lower.includes('reimbursement') ||
    lower.includes('monitor') ||
    lower.includes('laptop') ||
    lower.includes('keyboard') ||
    lower.includes('cooling') ||
    lower.includes('heating') ||
    lower.includes('chair') ||
    lower.includes('desk') ||
    lower.includes('access');

  if (!isActionRequest) {
    if (lower.includes('parental') || lower.includes('maternity') || lower.includes('paternity')) {
      return {
        message: 'Under Nexus Enterprise guidelines, eligible full-time employees are provided 12 weeks of fully paid parental leave, usable within the first 12 months following birth or adoption. When you are ready, simply say "Please submit my parental leave request" and specify your dates.',
        ticket_action: false,
      };
    }
    if (lower.includes('pto') || lower.includes('vacation') || lower.includes('sick')) {
      return {
        message: 'Nexus Enterprise offers flexible Paid Time Off (PTO) accruing at 1.75 days per month (up to 21 days annually), alongside 10 dedicated wellness/sick days. To submit time off, please specify your planned dates.',
        ticket_action: false,
      };
    }
    if (lower.includes('hardware') || lower.includes('equipment') || lower.includes('monitor')) {
      return {
        message: 'Employees receive a $1,500 Home Office & Hardware refresh stipend every 2 years. Standard IT bundles include Apple M-series MacBook Pros or ThinkPad X1 laptops, plus dual 4K external displays.',
        ticket_action: false,
      };
    }

    return {
      message: `I'm NexusAI, your enterprise workflow copilot. I can assist with HR policies, IT provisioning, and facilities requests. If you would like me to take action on your behalf, simply tell me what you need!`,
      ticket_action: false,
    };
  }

  // Detect Category
  let category = 'GENERAL';
  let priority = 'MEDIUM';

  if (
    lower.includes('laptop') ||
    lower.includes('monitor') ||
    lower.includes('mouse') ||
    lower.includes('keyboard') ||
    lower.includes('software') ||
    lower.includes('vpn') ||
    lower.includes('password') ||
    lower.includes('access') ||
    lower.includes('wifi')
  ) {
    category = 'IT_SUPPORT';
    if (lower.includes('urgent') || lower.includes('cannot work') || lower.includes('blocked') || lower.includes('broken')) {
      priority = 'HIGH';
    }
  } else if (
    lower.includes('leave') ||
    lower.includes('pto') ||
    lower.includes('vacation') ||
    lower.includes('payroll') ||
    lower.includes('benefits') ||
    lower.includes('salary') ||
    lower.includes('insurance') ||
    lower.includes('parental')
  ) {
    category = 'HR_REQUEST';
    priority = lower.includes('immediate') ? 'HIGH' : 'MEDIUM';
  } else if (
    lower.includes('ac') ||
    lower.includes('heat') ||
    lower.includes('cold') ||
    lower.includes('light') ||
    lower.includes('chair') ||
    lower.includes('desk') ||
    lower.includes('door') ||
    lower.includes('spill') ||
    lower.includes('leak')
  ) {
    category = 'FACILITIES';
    priority = lower.includes('leak') || lower.includes('spill') ? 'HIGH' : 'LOW';
  }

  const titleWords = userMessage.split(' ').slice(0, 8).join(' ');
  const title = titleWords.length > 50 ? `${titleWords.slice(0, 47)}...` : titleWords;

  return {
    message: `I have automatically generated a structured ${category.replace('_', ' ')} ticket for you. The Operations team has been notified and you can track real-time progress on your Tickets dashboard.`,
    ticket_action: true,
    ticket_payload: {
      title: title || 'Enterprise Request',
      description: userMessage,
      category,
      priority,
    },
  };
}

import { randomUUID } from 'crypto';

// 12. Backend API Routes: GET /api/chat/history
export const getChatHistory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const result = await db.query(
      'SELECT id, message, role, created_at FROM chats WHERE user_id = $1 ORDER BY created_at ASC',
      [req.user.id]
    );

    res.json({ chats: result.rows });
  } catch (err: any) {
    console.error('Error fetching chat history:', err);
    res.status(500).json({ error: 'Failed to retrieve chat history' });
  }
};

// DELETE /api/chat/history - Clear current user's chat history
export const clearChatHistory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    await db.query('DELETE FROM chats WHERE user_id = $1', [req.user.id]);
    res.json({ message: 'Chat history cleared' });
  } catch (err: any) {
    console.error('Error clearing chat history:', err);
    res.status(500).json({ error: 'Failed to clear chat history' });
  }
};

// 12. Backend API Routes: POST /api/chat
export const handleChat = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { message } = req.body;
    const userId = req.user.id;
    const userMessageId = randomUUID();

    // Save user's message to chats table
    await db.query(
      'INSERT INTO chats (id, user_id, message, role) VALUES ($1, $2, $3, $4)',
      [userMessageId, userId, message, 'user']
    );

    // Retrieve previous 8 messages for context
    const previousChats = await db.query(
      'SELECT role, message FROM chats WHERE user_id = $1 ORDER BY created_at DESC LIMIT 8',
      [userId]
    );

    // Format chat history chronologically
    const historyContext = previousChats.rows
      .reverse()
      .map((c) => `${c.role === 'user' ? 'User' : 'NexusAI'}: ${c.message}`)
      .join('\n');

    let parsedResult: GeminiResult | null = null;

    // Check if GEMINI_API_KEY is available
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== 'MY_GEMINI_API_KEY' && apiKey.trim() !== '') {
      try {
        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            },
          },
        });

        const promptText = `
User Context: Employee: ${req.user.full_name} (${req.user.email}).
Recent conversation history:
${historyContext}

Latest message from user:
"${message}"
`;

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Gemini API timeout (2.5s limit reached)')), 2500)
        );

        const response = await Promise.race([
          ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: promptText,
            config: {
              systemInstruction: SYSTEM_INSTRUCTION,
              responseMimeType: 'application/json',
              responseSchema: RESPONSE_SCHEMA,
            },
          }),
          timeoutPromise,
        ]);

        const rawText = response.text;
        if (rawText) {
          parsedResult = JSON.parse(rawText.trim()) as GeminiResult;
        }
      } catch (geminiError: any) {
        console.warn('Gemini API call failed or timed out, falling back to enterprise NLP:', geminiError?.message || geminiError);
      }
    }

    // If Gemini wasn't called or failed, use rule-based fallback
    if (!parsedResult || !parsedResult.message) {
      parsedResult = fallbackEnterpriseNLP(message);
    }

    let createdTicket = null;

    // 15. If ticket_action is true, insert into tickets table
    if (parsedResult.ticket_action && parsedResult.ticket_payload) {
      const payload = parsedResult.ticket_payload;

      // Validate/normalize category
      let category = (payload.category || 'GENERAL').toUpperCase().replace(/[\s-]/g, '_');
      if (!['IT_SUPPORT', 'HR_REQUEST', 'FACILITIES', 'GENERAL'].includes(category)) {
        category = 'GENERAL';
      }

      // Validate/normalize priority
      let priority = (payload.priority || 'MEDIUM').toUpperCase();
      if (!['LOW', 'MEDIUM', 'HIGH'].includes(priority)) {
        priority = 'MEDIUM';
      }

      const title = (payload.title || 'Enterprise Request').slice(0, 200);
      const description = payload.description || message;
      const ticketId = randomUUID();

      const ticketInsert = await db.query(
        `INSERT INTO tickets (id, user_id, title, description, category, status, priority)
         VALUES ($1, $2, $3, $4, $5, 'OPEN', $6)
         RETURNING *`,
        [ticketId, userId, title, description, category, priority]
      );

      createdTicket = ticketInsert.rows[0];
    }

    // Save AI model response to chats table
    const aiMessageId = randomUUID();
    await db.query(
      'INSERT INTO chats (id, user_id, message, role) VALUES ($1, $2, $3, $4)',
      [aiMessageId, userId, parsedResult.message, 'model']
    );

    res.json({
      message: parsedResult.message,
      ticket_action: parsedResult.ticket_action,
      ticket: createdTicket,
    });
  } catch (err: any) {
    console.error('Error handling chat message:', err);
    res.status(500).json({ error: 'Failed to process chat message' });
  }
};
