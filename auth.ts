import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { getOne } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRY = '7d';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(userId: number, email: string): string {
  return jwt.sign(
    { userId, email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );
}

export function verifyToken(token: string): { userId: number; email: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: number;
      email: string;
    };
    return decoded;
  } catch (error) {
    return null;
  }
}

export async function getUserFromToken(token: string): Promise<any | null> {
  const decoded = verifyToken(token);
  if (!decoded) return null;

  const user = await getOne('SELECT * FROM users WHERE id = ?', [
    decoded.userId,
  ]);
  return user || null;
}

export function getTokenFromRequest(req: any): string | null {
  const authHeader = req.headers?.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  return authHeader.substring(7);
}

export async function authenticateRequest(req: any): Promise<any | null> {
  const token = getTokenFromRequest(req);
  if (!token) {
    return null;
  }

  return getUserFromToken(token);
}