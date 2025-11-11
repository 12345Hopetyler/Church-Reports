"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';

type SummaryData = {
  monthIncomeCents: number;
  monthExpenseCents: number;
  monthNetCents: number;
  totalIncomeCents: number;
  totalExpenseCents: number;
  totalNetCents: number;
  accountCount: number;
  totalBalanceCents: number;
  accountBalances: { id: string; name: string; type: string; balanceCents: number }[];
};

export default function Dashboard() {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/meta/summary')
      .then(r => r.json())
      .then(json => {
        if (json.success) setSummary(json.data);
        setLoading(false);
      })
      .catch(e => {
        console.error(e);
        setLoading(false);
      });
  }, []);

  const fmt = (cents: number) => (cents / 100).toFixed(2);

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 shadow-xl text-white">
        <h1 className="text-4xl font-bold mb-2">Welcome to Church Financial Dashboard</h1>
        <p className="text-indigo-100 text-lg">Manage your church finances with transparency and ease</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600"></div>
        </div>
      ) : summary ? (
        <>
          {/* Main Summary Cards - This Month */}
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">This Month Overview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Income Card */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border-2 border-emerald-200 p-6 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl">📈</span>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded">INCOME</span>
                </div>
                <div className="text-slate-600 font-medium text-sm mb-1">This Month Income</div>
                <div className="text-3xl font-bold text-emerald-700">MWK {fmt(summary.monthIncomeCents)}</div>
              </div>

              {/* Expenses Card */}
              <div className="bg-gradient-to-br from-rose-50 to-red-50 rounded-xl border-2 border-rose-200 p-6 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl">📉</span>
                  <span className="text-xs font-bold text-rose-600 bg-rose-100 px-2 py-1 rounded">EXPENSES</span>
                </div>
                <div className="text-slate-600 font-medium text-sm mb-1">This Month Expenses</div>
                <div className="text-3xl font-bold text-rose-700">MWK {fmt(summary.monthExpenseCents)}</div>
              </div>

              {/* Net Card */}
              <div className={`rounded-xl border-2 p-6 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 ${
                summary.monthNetCents >= 0 
                  ? 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200' 
                  : 'bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl">⚖️</span>
                  <span className={`text-xs font-bold px-2 py-1 rounded ${summary.monthNetCents >= 0 ? 'text-blue-600 bg-blue-100' : 'text-orange-600 bg-orange-100'}`}>
                    NET
                  </span>
                </div>
                <div className="text-slate-600 font-medium text-sm mb-1">This Month Net</div>
                <div className={`text-3xl font-bold ${summary.monthNetCents >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                  MWK {fmt(summary.monthNetCents)}
                </div>
              </div>

              {/* Total Balance Card */}
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200 p-6 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl">💎</span>
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-100 px-2 py-1 rounded">TOTAL</span>
                </div>
                <div className="text-slate-600 font-medium text-sm mb-1">Total Balance</div>
                <div className="text-3xl font-bold text-indigo-700">MWK {fmt(summary.totalBalanceCents)}</div>
              </div>
            </div>
          </div>

          {/* Account Balances */}
          {summary.accountBalances.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-4">Your Accounts</h2>
              <div className="bg-white rounded-xl shadow-md overflow-hidden border border-slate-200">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-slate-800 to-slate-700">
                    <tr>
                      <th className="text-left p-4 text-white font-bold">Account Name</th>
                      <th className="text-left p-4 text-white font-bold">Type</th>
                      <th className="text-right p-4 text-white font-bold">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.accountBalances.map((acc, idx) => (
                      <tr key={acc.id} className={`border-t border-slate-200 ${idx % 2 === 0 ? 'bg-slate-50' : 'bg-white'} hover:bg-indigo-50 transition-colors`}>
                        <td className="p-4 font-semibold text-slate-800">{acc.name}</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                            acc.type === 'BANK' ? 'bg-blue-100 text-blue-700' : 
                            acc.type === 'CASH' ? 'bg-amber-100 text-amber-700' : 
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {acc.type === 'BANK' ? '🏦 Bank' : acc.type === 'CASH' ? '💵 Cash' : acc.type}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <span className="text-lg font-bold text-indigo-700">MWK {fmt(acc.balanceCents)}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* All-Time Stats */}
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">All-Time Summary</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl border-2 border-cyan-200 p-6 shadow-md">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">💰</span>
                  <span className="font-bold text-cyan-600">TOTAL INCOME</span>
                </div>
                <div className="text-3xl font-bold text-cyan-700">MWK {fmt(summary.totalIncomeCents)}</div>
                <p className="text-cyan-600 text-sm mt-2">All contributions received</p>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl border-2 border-red-200 p-6 shadow-md">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">💸</span>
                  <span className="font-bold text-red-600">TOTAL EXPENSES</span>
                </div>
                <div className="text-3xl font-bold text-red-700">MWK {fmt(summary.totalExpenseCents)}</div>
                <p className="text-red-600 text-sm mt-2">All expenses incurred</p>
              </div>
            </div>
          </div>

          {/* Quick Action Links */}
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link 
                href="/accounts" 
                className="group bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 text-white text-center"
              >
                <div className="text-4xl mb-2 group-hover:scale-125 transition-transform">🏦</div>
                <h3 className="font-bold text-lg mb-1">Manage Accounts</h3>
                <p className="text-blue-100 text-sm">Create and manage your bank and cash accounts</p>
              </Link>
              <Link 
                href="/transactions" 
                className="group bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 text-white text-center"
              >
                <div className="text-4xl mb-2 group-hover:scale-125 transition-transform">💳</div>
                <h3 className="font-bold text-lg mb-1">Add Transaction</h3>
                <p className="text-emerald-100 text-sm">Record income, expenses, and transfers</p>
              </Link>
              <Link 
                href="/reports" 
                className="group bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 text-white text-center"
              >
                <div className="text-4xl mb-2 group-hover:scale-125 transition-transform">📊</div>
                <h3 className="font-bold text-lg mb-1">View Reports</h3>
                <p className="text-purple-100 text-sm">Analyze income, expenses, and trends</p>
              </Link>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-6 text-center">
          <p className="text-amber-900 font-semibold text-lg">Unable to load dashboard</p>
          <p className="text-amber-700 text-sm mt-1">Please refresh the page or try again later</p>
        </div>
      )}
    </div>
  );
}
