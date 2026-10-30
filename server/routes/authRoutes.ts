import { Router } from 'express';
import { register, login, getMe } from '../controllers/authController.ts';
import { validateBody, RegisterSchema, LoginSchema } from '../middleware/validate.ts';
import { authenticateJWT } from '../middleware/auth.ts';

const router = Router();

// POST /api/auth/register
router.post('/register', validateBody(RegisterSchema), register);

// POST /api/auth/login
router.post('/login', validateBody(LoginSchema), login);

// GET /api/auth/me
router.get('/me', authenticateJWT, getMe);

export default router;
