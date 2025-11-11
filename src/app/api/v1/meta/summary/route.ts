import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Total income this month
    const incomeResult = await prisma.transaction.aggregate({
      where: { type: 'INCOME', date: { gte: monthStart } },
      _sum: { amountCents: true },
    });

    // Total expenses this month
    const expenseResult = await prisma.transaction.aggregate({
      where: { type: 'EXPENSE', date: { gte: monthStart } },
      _sum: { amountCents: true },
    });

    // All transactions (total ever)
    const allIncome = await prisma.transaction.aggregate({
      where: { type: 'INCOME' },
      _sum: { amountCents: true },
    });

    const allExpense = await prisma.transaction.aggregate({
      where: { type: 'EXPENSE' },
      _sum: { amountCents: true },
    });

    // Account balances
    const accounts = await prisma.account.findMany({
      include: {
        // grab type so we can treat EXPENSEs as negative when summing balances
        transactions: { select: { amountCents: true, type: true } },
      },
    });

    const monthIncomeCents = incomeResult._sum.amountCents || 0;
    const monthExpenseCents = expenseResult._sum.amountCents || 0;
    const totalIncomeCents = allIncome._sum.amountCents || 0;
    const totalExpenseCents = allExpense._sum.amountCents || 0;

    const accountBalances = accounts.map((acc: any) => {
      const txSum = acc.transactions.reduce((s: number, t: any) => {
        // Treat expenses as negative amounts; income and other types add
        if (t.type === 'EXPENSE') return s - t.amountCents;
        return s + t.amountCents;
      }, 0);
      return {
        id: acc.id,
        name: acc.name,
        type: acc.type,
        balanceCents: acc.openingCents + txSum,
      };
    });

    const totalBalance = accountBalances.reduce((s: number, a: any) => s + a.balanceCents, 0);

    return NextResponse.json({
      success: true,
      data: {
        monthIncomeCents,
        monthExpenseCents,
        monthNetCents: monthIncomeCents - monthExpenseCents,
        totalIncomeCents,
        totalExpenseCents,
        totalNetCents: totalIncomeCents - totalExpenseCents,
        accountCount: accounts.length,
        totalBalanceCents: totalBalance,
        accountBalances,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: { code: 'SERVER_ERROR', message: 'Unable to fetch summary' } }, { status: 500 });
  }
}
