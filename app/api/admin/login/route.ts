import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { SESSION_SECRET_KEY } from '@/lib/auth';
import { readSettings } from '@/lib/store';

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  const settings = await readSettings();
  const expected = settings.adminPasscode || process.env.ADMIN_PASSWORD || '1234';

  if (typeof password !== 'string' || password.trim() !== expected) {
    return NextResponse.json({ error: 'Invalid passcode / password' }, { status: 401 });
  }

  const key = new TextEncoder().encode(SESSION_SECRET_KEY);
  const token = await new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(key);

  const res = NextResponse.json({ ok: true });
  res.cookies.set('waseem_admin', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
