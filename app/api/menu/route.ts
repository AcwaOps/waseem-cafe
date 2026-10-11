import { NextResponse } from 'next/server';

export const dynamic = 'force-static';

const menu = [
  { name: 'Latte', category: 'Coffee', hot: 5, iced: 8 },
  { name: 'Cappuccino', category: 'Coffee', hot: 5, iced: 8 },
  { name: 'Mocha', category: 'Coffee', hot: 5, iced: 8 },
  { name: 'Americano', category: 'Coffee', hot: 5, iced: 10 },
  { name: 'V60', category: 'Coffee', price: 10 },
  { name: 'Karak Tea', category: 'Tea & Juice', hot: 3 },
  { name: 'Fresh Juice', category: 'Tea & Juice', price: 5 },
];

export async function GET() {
  return NextResponse.json({ cafe: 'Waseem Cafe', currency: '⃁', phone: '051 131 3965', menu });
}
