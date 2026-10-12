import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { readSettings, writeSettings } from '@/lib/store';

export async function GET() {
  const settings = await readSettings();
  return NextResponse.json({
    storeOpen: settings.storeOpen,
  });
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const settings = await readSettings();

  if (typeof body.storeOpen === 'boolean') {
    settings.storeOpen = body.storeOpen;
    await writeSettings(settings);
    return NextResponse.json({ ok: true, storeOpen: settings.storeOpen });
  }

  if (typeof body.newPasscode === 'string') {
    const current = (body.currentPasscode || '').trim();
    const nextPin = body.newPasscode.trim();

    if (current !== settings.adminPasscode) {
      return NextResponse.json({ error: 'Current passcode is incorrect' }, { status: 400 });
    }
    if (nextPin.length < 4) {
      return NextResponse.json({ error: 'New passcode must be at least 4 characters' }, { status: 400 });
    }

    settings.adminPasscode = nextPin;
    await writeSettings(settings);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'Invalid settings update request' }, { status: 400 });
}
