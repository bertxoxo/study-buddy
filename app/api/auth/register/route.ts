import { NextRequest, NextResponse } from 'next/server';
import { hashPassword, generateToken } from '@/lib/auth';
import { runQuery, getOne } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, school } = await req.json();
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }
    const existing = await getOne('SELECT id FROM users WHERE email = ?', [email]);
    if (existing) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
    }
    const hashedPassword = await hashPassword(password);
    const result = await runQuery('INSERT INTO users (name, email, password, school) VALUES (?, ?, ?, ?)', [name, email, hashedPassword, school || null]);
    const token = generateToken(result.lastID, email);
    return NextResponse.json({ token, userId: result.lastID }, { status: 201 });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
