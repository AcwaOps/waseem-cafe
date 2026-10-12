import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

export const SESSION_SECRET_KEY =
  process.env.SESSION_SECRET || 'waseem-cafe-production-secret-key-2026';

export async function requireAdmin() {
  const token = (await cookies()).get('waseem_admin')?.value;
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(SESSION_SECRET_KEY)
    );
    return payload.role === 'admin';
  } catch {
    return false;
  }
}
