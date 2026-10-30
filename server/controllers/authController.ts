import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/db.ts';
import { AuthenticatedRequest } from '../middleware/auth.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'nexusai_enterprise_super_secret_jwt_key_2026';

// 12. Backend API Routes: POST /api/auth/register
export const register = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { email, password, full_name } = req.body;

    // Check if user already exists
    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (existing.rows.length > 0) {
      res.status(409).json({ error: 'An enterprise account with this email already exists.' });
      return;
    }

    // 18. Security: Hash password with bcrypt (salt rounds: 10)
    const password_hash = await bcrypt.hash(password, 10);

    const insertResult = await db.query(
      `INSERT INTO users (email, password_hash, full_name)
       VALUES ($1, $2, $3)
       RETURNING id, email, full_name, created_at`,
      [email.toLowerCase().trim(), password_hash, full_name.trim()]
    );

    const newUser = insertResult.rows[0];

    // Sign JWT (expires in 24h)
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, full_name: newUser.full_name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Account registered successfully',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        full_name: newUser.full_name,
        created_at: newUser.created_at,
      },
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Internal server error while registering account' });
  }
};

// 12. Backend API Routes: POST /api/auth/login
export const login = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const result = await db.query(
      'SELECT id, email, password_hash, full_name, created_at FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    if (result.rows.length === 0) {
      res.status(401).json({ error: 'Invalid enterprise email or password.' });
      return;
    }

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      res.status(401).json({ error: 'Invalid enterprise email or password.' });
      return;
    }

    // Sign JWT (expires in 24h)
    const token = jwt.sign(
      { id: user.id, email: user.email, full_name: user.full_name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Authentication successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        created_at: user.created_at,
      },
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error during authentication' });
  }
};

// GET /api/auth/me - Current verified user session
export const getMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const result = await db.query(
      'SELECT id, email, full_name, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User record not found' });
      return;
    }

    res.json({ user: result.rows[0] });
  } catch (err: any) {
    console.error('getMe error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
