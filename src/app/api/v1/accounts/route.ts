import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const data = await prisma.account.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: { code: 'SERVER_ERROR', message: 'Unable to fetch accounts' } }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, type, number, opening } = body;
    if (!name) return NextResponse.json({ success: false, error: { code: 'VALIDATION', message: 'name is required' } }, { status: 400 });

    const openingCents = opening ? Math.round(Number(opening) * 100) : 0;

    const acct = await prisma.account.create({
      data: {
        name,
        type: type || 'OTHER',
        number: number || undefined,
        openingCents,
      },
    });

    return NextResponse.json({ success: true, data: acct }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: { code: 'SERVER_ERROR', message: 'Unable to create account' } }, { status: 500 });
  }
}
