import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/v1/transactions
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') || '1');
    const pageSize = Math.min(Number(url.searchParams.get('pageSize') || '50'), 200);
    const skip = (Math.max(page, 1) - 1) * pageSize;

    const where: any = {};
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const [data, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: { account: true, category: true, member: true },
        orderBy: { date: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.transaction.count({ where }),
    ]);

    return NextResponse.json({ success: true, data, meta: { page, pageSize, total } });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: { code: 'SERVER_ERROR', message: 'Unable to fetch transactions' } }, { status: 500 });
  }
}

// POST /api/v1/transactions
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { date, amountCents, accountId, categoryId, memberId, description, type, reference } = body;

    // basic validation
    if (!date) return NextResponse.json({ success: false, error: { code: 'VALIDATION', message: 'date is required' } }, { status: 400 });
    if (!amountCents || typeof amountCents !== 'number' || amountCents <= 0) return NextResponse.json({ success: false, error: { code: 'VALIDATION', message: 'amountCents must be a positive integer' } }, { status: 400 });
    if (!accountId) return NextResponse.json({ success: false, error: { code: 'VALIDATION', message: 'accountId is required' } }, { status: 400 });
    if (!type) return NextResponse.json({ success: false, error: { code: 'VALIDATION', message: 'type is required' } }, { status: 400 });

    // ensure account exists
    const acct = await prisma.account.findUnique({ where: { id: accountId } });
    if (!acct) return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'account not found' } }, { status: 404 });

    const tx = await prisma.transaction.create({
      data: {
        date: new Date(date),
        amountCents,
        accountId,
        categoryId: categoryId || undefined,
        memberId: memberId || undefined,
        description: description || undefined,
        type,
        reference: reference || undefined,
        createdBy: 'treasurer',
      },
      include: { account: true, category: true, member: true },
    });

    return NextResponse.json({ success: true, data: tx }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: { code: 'SERVER_ERROR', message: 'Unable to create transaction' } }, { status: 500 });
  }
}
