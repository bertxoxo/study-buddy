'use strict';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { getOne } from '@/lib/db';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRY = '7d';
export async function hashPassword(password) { return bcrypt.hash(password, 10); }
export async function verifyPassword(password, hash) { return bcrypt.compare(password, hash); }
export function generateToken(userId, email) { return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: JWT_EXPIRY }); }
export function verifyToken(token) { try { return jwt.verify(token, JWT_SECRET); } catch { return null; } }
export async function getUserFromToken(token) { const decoded = verifyToken(token); if (!decoded) return null; return await getOne('SELECT * FROM users WHERE id = ?', [decoded.userId]) || null; }
export function getTokenFromRequest(req) { const authHeader = req.headers?.get ? req.headers.get('authorization') : req.headers?.authorization; if (!authHeader || !authHeader.startsWith('Bearer ')) return null; return authHeader.substring(7); }
export async function authenticateRequest(req) { const token = getTokenFromRequest(req); if (!token) return null; return getUserFromToken(token); }
