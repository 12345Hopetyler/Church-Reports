import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Ensure this API route runs under the Node.js runtime (Prisma needs a Node environment)
export const runtime = 'nodejs';

export async function GET() {
  try {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // --- Efficiently fetch monthly and total stats in parallel ---
    const [monthlyStats, totalStats, accounts, transactionSums] = await Promise.all([
      // Get income and expense for the current month
      prisma.transaction.groupBy({
        by: ['type'],
        where: { date: { gte: monthStart }, type: { in: ['INCOME', 'EXPENSE'] } },
        _sum: { amountCents: true },
      }),
      // Get all-time income and expense
      prisma.transaction.groupBy({
        by: ['type'],
        where: { type: { in: ['INCOME', 'EXPENSE'] } },
        _sum: { amountCents: true },
      }),
      // Get all accounts
      prisma.account.findMany(),
      // Get the sum of all transactions grouped by account
      prisma.transaction.groupBy({
        by: ['accountId', 'type'],
        _sum: { amountCents: true },
      }),
    ]);

    // --- Process the results ---

    const getSum = (results: typeof monthlyStats, type: 'INCOME' | 'EXPENSE') =>
      results.find(r => r.type === type)?._sum.amountCents || 0;

    const monthIncomeCents = getSum(monthlyStats, 'INCOME');
    const monthExpenseCents = getSum(monthlyStats, 'EXPENSE');
    const totalIncomeCents = getSum(totalStats, 'INCOME');
    const totalExpenseCents = getSum(totalStats, 'EXPENSE');

    // Create a map for quick lookup of transaction sums per account
    const txSumMap = new Map<string, number>();
    for (const group of transactionSums) {
      if (!group.accountId) continue;
      const currentSum = txSumMap.get(group.accountId) || 0;
      const amount = group._sum.amountCents || 0;
      // Subtract expenses, add everything else (INCOME, TRANSFER)
      const newSum = group.type === 'EXPENSE' ? currentSum - amount : currentSum + amount;
      txSumMap.set(group.accountId, newSum);
    }

    const accountBalances = accounts.map(acc => {
      const txSum = txSumMap.get(acc.id) || 0;
      return {
        id: acc.id,
        name: acc.name,
        type: acc.type,
        balanceCents: (acc.openingCents || 0) + txSum,
      };
    });

    const totalBalance = accountBalances.reduce((s, a) => s + a.balanceCents, 0);

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
