import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { readMenu, writeMenu, type MenuItem } from '@/lib/store';

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  if (typeof body.name !== 'string' || !body.name.trim()) {
    return NextResponse.json({ error: 'Item name is required' }, { status: 400 });
  }

  const category = (typeof body.category === 'string' && body.category.trim())
    ? body.category.trim()
    : 'Specialty Coffee';

  const hasPrice = [body.hot, body.iced, body.price].some(
    (v) => typeof v === 'number' && v >= 0
  );

  if (!hasPrice) {
    return NextResponse.json({ error: 'Please set at least one price (Hot, Iced, or Single)' }, { status: 400 });
  }

  const items = await readMenu();
  const id = typeof body.id === 'string' && body.id ? body.id : crypto.randomUUID();

  const item: MenuItem = {
    id,
    name: body.name.trim(),
    nameAr: typeof body.nameAr === 'string' && body.nameAr.trim() ? body.nameAr.trim() : undefined,
    category,
    hot: typeof body.hot === 'number' ? body.hot : undefined,
    iced: typeof body.iced === 'number' ? body.iced : undefined,
    price: typeof body.price === 'number' ? body.price : undefined,
    description: typeof body.description === 'string' && body.description.trim() ? body.description.trim() : undefined,
    notes: typeof body.notes === 'string' && body.notes.trim() ? body.notes.trim() : undefined,
    tag: typeof body.tag === 'string' && body.tag.trim() ? body.tag.trim() : undefined,
    image: typeof body.image === 'string' && body.image.trim() ? body.image.trim() : undefined,
    active: body.active !== false,
  };

  const existingIndex = items.findIndex((x) => x.id === id);
  let next: MenuItem[];
  if (existingIndex !== -1) {
    next = [...items];
    next[existingIndex] = item;
  } else {
    next = [...items, item];
  }
  await writeMenu(next);

  return NextResponse.json({ ok: true, item });
}

export async function DELETE(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const id = req.nextUrl.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
  }

  const items = await readMenu();
  await writeMenu(items.filter((x) => x.id !== id));
  return NextResponse.json({ ok: true });
}
