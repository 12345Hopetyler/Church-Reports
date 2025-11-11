"use client";
import React, { useEffect, useState } from 'react';

type ReportData = {
  period: string;
  startDate: string;
  endDate: string;
  series: { periodLabel: string; incomeCents: number; expenseCents: number; netCents: number }[];
  totals: { incomeCents: number; expenseCents: number; netCents: number };
  breakdownByCategory: { name?: string; income: number; expense: number }[];
};

export default function ReportsPage() {
  const [report, setReport] = useState<ReportData | null>(null);
  const [period, setPeriod] = useState('monthly');
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  async function loadReport() {
    const url = `/api/v1/reports/income-expense?period=${period}&startDate=${startDate}&endDate=${endDate}`;
    const res = await fetch(url);
    const json = await res.json();
    if (json.success) setReport(json.data);
  }

  useEffect(() => { loadReport(); }, [period, startDate, endDate]);

  const fmt = (cents: number) => (cents / 100).toFixed(2);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white shadow-lg">
        <h1 className="text-4xl font-bold mb-2">📊 Financial Reports</h1>
        <p className="text-purple-100">View detailed income, expenses, and financial trends</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Filters</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Period</label>
            <select 
              value={period} 
              onChange={e => setPeriod(e.target.value)} 
              className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
            >
              <option value="daily">📅 Daily</option>
              <option value="monthly">📆 Monthly</option>
              <option value="yearly">📊 Yearly</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Start Date</label>
            <input 
              type="date" 
              value={startDate} 
              onChange={e => setStartDate(e.target.value)} 
              className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">End Date</label>
            <input 
              type="date" 
              value={endDate} 
              onChange={e => setEndDate(e.target.value)} 
              className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
            />
          </div>
        </div>
      </div>

      {report ? (
        <>
          {/* Summary Cards */}
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Summary</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border-2 border-emerald-200 p-6 shadow-md">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-3xl">📈</span>
                  <span className="font-bold text-emerald-600">Total Income</span>
                </div>
                <div className="text-3xl font-bold text-emerald-700">MWK {fmt(report.totals.incomeCents)}</div>
              </div>
              <div className="bg-gradient-to-br from-rose-50 to-red-50 rounded-xl border-2 border-rose-200 p-6 shadow-md">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-3xl">📉</span>
                  <span className="font-bold text-rose-600">Total Expenses</span>
                </div>
                <div className="text-3xl font-bold text-rose-700">MWK {fmt(report.totals.expenseCents)}</div>
              </div>
              <div className={`rounded-xl border-2 p-6 shadow-md ${report.totals.netCents >= 0 ? 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200' : 'bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-3xl">⚖️</span>
                  <span className={`font-bold ${report.totals.netCents >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>Net</span>
                </div>
                <div className={`text-3xl font-bold ${report.totals.netCents >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                  MWK {fmt(report.totals.netCents)}
                </div>
              </div>
            </div>
          </div>

          {/* Time Series */}
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">By {period.charAt(0).toUpperCase() + period.slice(1)}</h2>
            <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-slate-800 to-slate-700">
                  <tr>
                    <th className="text-left p-4 text-white font-bold">{period.charAt(0).toUpperCase() + period.slice(1)}</th>
                    <th className="text-right p-4 text-white font-bold">Income</th>
                    <th className="text-right p-4 text-white font-bold">Expenses</th>
                    <th className="text-right p-4 text-white font-bold">Net</th>
                  </tr>
                </thead>
                <tbody>
                  {report.series.map((row, i) => (
                    <tr key={i} className={`border-t border-slate-200 ${i % 2 === 0 ? 'bg-slate-50' : 'bg-white'} hover:bg-purple-50 transition-colors`}>
                      <td className="p-4 font-semibold text-slate-800">{row.periodLabel}</td>
                      <td className="p-4 text-right">
                        <span className="text-emerald-700 font-bold">MWK {fmt(row.incomeCents)}</span>
                      </td>
                      <td className="p-4 text-right">
                        <span className="text-rose-700 font-bold">MWK {fmt(row.expenseCents)}</span>
                      </td>
                      <td className="p-4 text-right">
                        <span className={`text-lg font-bold ${row.netCents >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                          MWK {fmt(row.netCents)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* By Category */}
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">By Category</h2>
            <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-slate-800 to-slate-700">
                  <tr>
                    <th className="text-left p-4 text-white font-bold">Category</th>
                    <th className="text-right p-4 text-white font-bold">Income</th>
                    <th className="text-right p-4 text-white font-bold">Expenses</th>
                  </tr>
                </thead>
                <tbody>
                  {report.breakdownByCategory.map((cat: any, i: number) => (
                    <tr key={i} className={`border-t border-slate-200 ${i % 2 === 0 ? 'bg-slate-50' : 'bg-white'} hover:bg-purple-50 transition-colors`}>
                      <td className="p-4 font-semibold text-slate-800">{cat.name || 'Uncategorized'}</td>
                      <td className="p-4 text-right">
                        <span className="text-emerald-700 font-bold">MWK {fmt(cat.income)}</span>
                      </td>
                      <td className="p-4 text-right">
                        <span className="text-rose-700 font-bold">MWK {fmt(cat.expense)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600"></div>
        </div>
      )}
    </div>
  );
}
