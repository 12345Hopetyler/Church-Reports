"use client";
import React, { useEffect, useState } from 'react';

type Account = { id: string; name: string };
type Tx = { id: string; date: string; amountCents: number; description?: string; type: string; account?: Account };

export default function TransactionsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Tx[]>([]);
  const [date, setDate] = useState(new Date().toISOString().slice(0,10));
  const [amount, setAmount] = useState('0.00');
  const [accountId, setAccountId] = useState('');
  const [type, setType] = useState('INCOME');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  async function loadAccounts() {
    const res = await fetch('/api/v1/accounts');
    const json = await res.json();
    if (json.success) {
      setAccounts(json.data || []);
      if (json.data?.length && !accountId) setAccountId(json.data[0].id);
    }
  }

  async function loadTx() {
    const res = await fetch('/api/v1/transactions');
    const json = await res.json();
    if (json.success) setTransactions(json.data || []);
  }

  useEffect(() => { loadAccounts(); loadTx(); }, []);

  async function createTx(e: React.FormEvent) {
    e.preventDefault();
    if (!accountId) {
      alert('Please create an account first');
      return;
    }
    setLoading(true);
    const amountCents = Math.round(parseFloat(amount || '0') * 100);
    const res = await fetch('/api/v1/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, amountCents, accountId, type, description }),
    });
    const json = await res.json();
    if (json.success) {
      setAmount('0.00'); setDescription('');
      loadTx();
    } else {
      alert(json.error?.message || 'Failed to create');
    }
    setLoading(false);
  }

  const typeColors = {
    INCOME: { bg: 'from-emerald-500 to-teal-600', icon: '📈', label: 'Income' },
    EXPENSE: { bg: 'from-rose-500 to-red-600', icon: '📉', label: 'Expense' },
    TRANSFER: { bg: 'from-blue-500 to-cyan-600', icon: '🔄', label: 'Transfer' },
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-8 text-white shadow-lg">
        <h1 className="text-4xl font-bold mb-2">💳 Transactions</h1>
        <p className="text-emerald-100">Record income, expenses, and transfers</p>
      </div>

      {/* Create Transaction Form */}
      <div className="bg-white rounded-xl shadow-md border border-slate-200 p-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Add New Transaction</h2>
        {accounts.length === 0 ? (
          <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-6 text-center">
            <p className="text-amber-900 font-bold">No accounts available</p>
            <p className="text-amber-700">Please create an account first to add transactions</p>
          </div>
        ) : (
          <form onSubmit={createTx} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Date *</label>
              <input 
                type="date" 
                value={date} 
                onChange={e=>setDate(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-emerald-500 focus:outline-none transition-colors" 
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Type *</label>
              <select 
                value={type} 
                onChange={e=>setType(e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-emerald-500 focus:outline-none transition-colors"
              >
                <option value="INCOME">📈 Income</option>
                <option value="EXPENSE">📉 Expense</option>
                <option value="TRANSFER">🔄 Transfer</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Amount (MWK) *</label>
              <input 
                value={amount} 
                onChange={e=>setAmount(e.target.value)} 
                placeholder="0.00"
                type="number"
                step="0.01"
                required
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-emerald-500 focus:outline-none transition-colors placeholder:text-slate-500" 
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Account *</label>
              <select 
                value={accountId} 
                onChange={e=>setAccountId(e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-emerald-500 focus:outline-none transition-colors"
              >
                <option value="">Select account...</option>
                {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-2">Description (Optional)</label>
              <input 
                value={description} 
                onChange={e=>setDescription(e.target.value)} 
                placeholder="e.g., Sunday collection, Utilities, Salary"
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-emerald-500 focus:outline-none transition-colors placeholder:text-slate-500" 
              />
            </div>

            <div className="sm:col-span-2">
              <button 
                type="submit"
                disabled={loading || !accountId}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
              >
                {loading ? 'Creating...' : '➕ Create Transaction'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Recent Transactions */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Recent Transactions ({transactions.length})</h2>
        {transactions.length === 0 ? (
          <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-8 text-center">
            <p className="text-blue-900 font-bold text-lg">No transactions yet</p>
            <p className="text-blue-700">Start recording your financial activity above</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {transactions.map(t => {
              const tc = typeColors[t.type as keyof typeof typeColors] || typeColors.INCOME;
              return (
                <div key={t.id} className="bg-white rounded-lg border-2 border-slate-200 p-4 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`bg-gradient-to-br ${tc.bg} rounded-full p-3 text-white text-xl`}>
                        {tc.icon}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-slate-800">{t.description || `${t.type} Transaction`}</div>
                        <div className="text-sm text-slate-600">{t.account?.name || 'Unknown Account'} • {new Date(t.date).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div className={`text-2xl font-bold ${t.type === 'INCOME' ? 'text-emerald-700' : t.type === 'EXPENSE' ? 'text-rose-700' : 'text-blue-700'}`}>
                      {t.type === 'INCOME' ? '+' : t.type === 'EXPENSE' ? '-' : '→'} MWK {(t.amountCents/100).toFixed(2)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
