import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'accountability_info_production_secret_key_2026';

export interface AuthRequest extends Request {
  userId?: string;
  userEmail?: string;
}

/**
 * Generate signed JWT token valid for 30 days
 */
export function generateToken(userId: string, email: string): string {
  return jwt.sign({ id: userId, email }, JWT_SECRET, { expiresIn: '30d' });
}

/**
 * Hash password with bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compare plain password against bcrypt hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Express middleware to authenticate and enforce protected routes
 */
export function authenticateUser(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  let token: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.headers['x-access-token']) {
    token = req.headers['x-access-token'] as string;
  } else if (req.headers.cookie) {
    // Parse cookie token if present
    const match = req.headers.cookie.match(/accountability_token=([^;]+)/);
    if (match) {
      token = match[1];
    }
  }

  if (!token) {
    res.status(401).json({ error: 'Authentication required. Access token missing or invalid.' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
    req.userId = decoded.id;
    req.userEmail = decoded.email;
    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      res.status(401).json({ error: 'Your session has expired. Please log in again.' });
    } else {
      res.status(401).json({ error: 'Invalid authentication token. Access denied.' });
    }
  }
}
