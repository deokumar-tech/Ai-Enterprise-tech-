import { Response } from 'express';
import db from '../config/db.ts';
import { AuthenticatedRequest } from '../middleware/auth.ts';

// 12. Backend API Routes: GET /api/tickets
// 11. Row Level Security: user_id = req.user.id
export const getTickets = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { status, category, search } = req.query;

    let queryText = 'SELECT * FROM tickets WHERE user_id = $1';
    const queryParams: any[] = [req.user.id];

    if (status && typeof status === 'string' && status !== 'ALL') {
      queryParams.push(status);
      queryText += ` AND status = $${queryParams.length}`;
    }

    if (category && typeof category === 'string' && category !== 'ALL') {
      queryParams.push(category);
      queryText += ` AND category = $${queryParams.length}`;
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      queryParams.push(`%${search.trim().toLowerCase()}%`);
      queryText += ` AND (LOWER(title) LIKE $${queryParams.length} OR LOWER(description) LIKE $${queryParams.length})`;
    }

    queryText += ' ORDER BY created_at DESC';

    const result = await db.query(queryText, queryParams);
    res.json({ tickets: result.rows });
  } catch (err: any) {
    console.error('Error fetching tickets:', err);
    res.status(500).json({ error: 'Failed to retrieve tickets' });
  }
};

// PATCH /api/tickets/:id/status
export const updateTicketStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const { status } = req.body;

    if (!['OPEN', 'IN_PROGRESS', 'RESOLVED'].includes(status)) {
      res.status(400).json({ error: 'Invalid status. Must be OPEN, IN_PROGRESS, or RESOLVED' });
      return;
    }

    const result = await db.query(
      `UPDATE tickets 
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND user_id = $3
       RETURNING *`,
      [status, id, req.user.id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Ticket not found or unauthorized' });
      return;
    }

    res.json({ ticket: result.rows[0], message: 'Ticket status updated' });
  } catch (err: any) {
    console.error('Error updating ticket status:', err);
    res.status(500).json({ error: 'Failed to update ticket status' });
  }
};

// GET /api/tickets/stats
export const getTicketStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const result = await db.query(
      'SELECT id, title, category, status, priority, created_at FROM tickets WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );

    const tickets = result.rows;
    const total = tickets.length;
    const open = tickets.filter((t) => t.status === 'OPEN').length;
    const inProgress = tickets.filter((t) => t.status === 'IN_PROGRESS').length;
    const resolved = tickets.filter((t) => t.status === 'RESOLVED').length;

    const byCategory = {
      IT_SUPPORT: tickets.filter((t) => t.category === 'IT_SUPPORT').length,
      HR_REQUEST: tickets.filter((t) => t.category === 'HR_REQUEST').length,
      FACILITIES: tickets.filter((t) => t.category === 'FACILITIES').length,
      GENERAL: tickets.filter((t) => t.category === 'GENERAL').length,
    };

    const byPriority = {
      HIGH: tickets.filter((t) => t.priority === 'HIGH').length,
      MEDIUM: tickets.filter((t) => t.priority === 'MEDIUM').length,
      LOW: tickets.filter((t) => t.priority === 'LOW').length,
    };

    res.json({
      total,
      open,
      inProgress,
      resolved,
      byCategory,
      byPriority,
      recentTickets: tickets.slice(0, 5),
    });
  } catch (err: any) {
    console.error('Error fetching ticket stats:', err);
    res.status(500).json({ error: 'Failed to retrieve stats' });
  }
};
