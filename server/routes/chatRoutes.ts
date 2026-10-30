import { Router } from 'express';
import { handleChat, getChatHistory, clearChatHistory } from '../controllers/chatController.ts';
import { authenticateJWT } from '../middleware/auth.ts';
import { validateBody, ChatSchema } from '../middleware/validate.ts';

const router = Router();

// Apply JWT authentication to all chat endpoints
router.use(authenticateJWT);

// GET /api/chat/history
router.get('/history', getChatHistory);

// DELETE /api/chat/history
router.delete('/history', clearChatHistory);

// POST /api/chat
router.post('/', validateBody(ChatSchema), handleChat);

export default router;
