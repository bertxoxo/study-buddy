import { NextRequest, NextResponse } from 'next/server';
import { runQuery, getOne } from '@/lib/db';
import { hashPassword, generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, school } = await request.json();

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await getOne('SELECT id FROM users WHERE email = ?', [
      email,
    ]);

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const result = await runQuery(
      `INSERT INTO users (name, email, password, school) 
       VALUES (?, ?, ?, ?)`,
      [name, email, hashedPassword, school || null]
    );

    const userId = (result as any).lastID;

    // Generate token
    const token = generateToken(userId, email);

    return NextResponse.json(
      {
        message: 'User created successfully',
        token,
        user: { id: userId, name, email },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'An error occurred during registration' },
      { status: 500 }
    );
  }
}