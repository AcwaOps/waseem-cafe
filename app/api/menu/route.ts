import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { readMenu, writeMenu, readSettings } from '@/lib/store';

export async function GET() {
  const menu = await readMenu();
  const settings = await readSettings();
  return NextResponse.json({
    cafe: 'Waseem Cafe',
    currency: '⃁',
    phone: '051 131 3965',
    storeOpen: settings.storeOpen,
    paymentSettings: settings.paymentSettings,
    menu,
  });
}

export async function PUT(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await req.json();
  if (!Array.isArray(body.menu)) {
    return NextResponse.json({ error: 'Expected menu array' }, { status: 400 });
  }
  await writeMenu(body.menu);
  return NextResponse.json({ ok: true });
}
