import { NextRequest,NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { readMenu,writeMenu } from '@/lib/store';
export async function GET(){const admin=await requireAdmin();const menu=await readMenu();return NextResponse.json({cafe:'Waseem Cafe',currency:'⃁',phone:'051 131 3965',menu:admin?menu:menu.filter(x=>x.active)})}
export async function PUT(req:NextRequest){if(!await requireAdmin())return NextResponse.json({error:'Unauthorized'}, {status:401});const body=await req.json();if(!Array.isArray(body.menu))return NextResponse.json({error:'Expected menu array'}, {status:400});await writeMenu(body.menu);return NextResponse.json({ok:true})}
