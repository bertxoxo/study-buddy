import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { runQuery } from '@/lib/db';

export async function PUT(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, school, program, semester } = await request.json();

    await runQuery(
      `UPDATE users SET name = ?, school = ?, program = ?, semester = ? WHERE id = ?`,
      [name, school || null, program || null, semester || null, user.id]
    );

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: { id: user.id, name, email: user.email },
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}