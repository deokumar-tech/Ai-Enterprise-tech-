import { Router } from 'express';
import { getTickets, updateTicketStatus, getTicketStats } from '../controllers/ticketController.ts';
import { authenticateJWT } from '../middleware/auth.ts';
import { validateBody, TicketStatusSchema } from '../middleware/validate.ts';

const router = Router();

// Apply JWT authentication to all ticket endpoints
router.use(authenticateJWT);

// GET /api/tickets
router.get('/', getTickets);

// GET /api/tickets/stats
router.get('/stats', getTicketStats);

// PATCH /api/tickets/:id/status
router.patch('/:id/status', validateBody(TicketStatusSchema), updateTicketStatus);

export default router;
