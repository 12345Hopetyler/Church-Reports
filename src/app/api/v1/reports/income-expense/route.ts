import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Helper to get first day of month
function getFirstDayOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

// Helper to get last day of month
function getLastDayOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const period = url.searchParams.get('period') || 'monthly';
    const startDateParam = url.searchParams.get('startDate');
    const endDateParam = url.searchParams.get('endDate');

    let startDate: Date;
    let endDate: Date;

    if (period === 'yearly') {
      startDate = new Date(new Date().getFullYear(), 0, 1);
      endDate = new Date(new Date().getFullYear(), 11, 31);
    } else if (startDateParam && endDateParam) {
      startDate = new Date(startDateParam);
      endDate = new Date(endDateParam);
    } else {
      // default monthly (this month)
      startDate = getFirstDayOfMonth(new Date());
      endDate = getLastDayOfMonth(new Date());
    }

    // Get all transactions in date range
    const txs = await prisma.transaction.findMany({
      where: {
        date: { gte: startDate, lte: endDate },
      },
      include: { category: true },
    });

    // Aggregate by period (daily, weekly, monthly, yearly)
    const periodKey = period === 'yearly' ? 'year' : period === 'monthly' ? 'month' : 'day';
    const byPeriod: { [key: string]: { income: number; expense: number } } = {};

    txs.forEach((tx: any) => {
      let key = '';
      const txDate = new Date(tx.date);
      if (periodKey === 'year') {
        key = txDate.getFullYear().toString();
      } else if (periodKey === 'month') {
        key = `${txDate.getFullYear()}-${String(txDate.getMonth() + 1).padStart(2, '0')}`;
      } else {
        key = txDate.toISOString().split('T')[0];
      }

      if (!byPeriod[key]) byPeriod[key] = { income: 0, expense: 0 };
      if (tx.type === 'INCOME') byPeriod[key].income += tx.amountCents;
      else if (tx.type === 'EXPENSE') byPeriod[key].expense += tx.amountCents;
    });

    // Aggregate by category
    const byCategory: { [key: string]: { income: number; expense: number; name?: string } } = {};
    txs.forEach((tx: any) => {
      const catName = tx.category?.name || 'Uncategorized';
      if (!byCategory[catName]) byCategory[catName] = { income: 0, expense: 0, name: catName };
      if (tx.type === 'INCOME') byCategory[catName].income += tx.amountCents;
      else if (tx.type === 'EXPENSE') byCategory[catName].expense += tx.amountCents;
    });

    // Totals
    let totalIncome = 0;
    let totalExpense = 0;
    Object.values(byPeriod).forEach(p => {
      totalIncome += p.income;
      totalExpense += p.expense;
    });

    const series = Object.entries(byPeriod)
      .sort()
      .map(([label, data]) => ({
        periodLabel: label,
        incomeCents: data.income,
        expenseCents: data.expense,
        netCents: data.income - data.expense,
      }));

    return NextResponse.json({
      success: true,
      data: {
        period,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        series,
        totals: {
          incomeCents: totalIncome,
          expenseCents: totalExpense,
          netCents: totalIncome - totalExpense,
        },
        breakdownByCategory: Object.values(byCategory),
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: { code: 'SERVER_ERROR', message: 'Unable to fetch report' } }, { status: 500 });
  }
}
