"use client";
import React, { useEffect, useState } from 'react';

type Account = {
  id: string;
  name: string;
  type: string;
  number?: string | null;
  openingCents: number;
};

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [name, setName] = useState('');
  const [type, setType] = useState('BANK');
  const [number, setNumber] = useState('');
  const [opening, setOpening] = useState('0.00');
  const [loading, setLoading] = useState(false);

  async function load() {
    const res = await fetch('/api/v1/accounts');
    const json = await res.json();
    if (json.success) setAccounts(json.data || []);
  }

  useEffect(() => { load(); }, []);

  async function createAccount(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/v1/accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, type, number, opening }),
    });
    const json = await res.json();
    if (json.success) {
      setName(''); setNumber(''); setOpening('0.00');
      load();
    } else {
      alert(json.error?.message || 'Failed');
    }
    setLoading(false);
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-8 text-white shadow-lg">
        <h1 className="text-4xl font-bold mb-2">🏦 Manage Accounts</h1>
        <p className="text-blue-100">Create and manage your bank and cash accounts</p>
      </div>

      {/* Create Account Form */}
      <div className="bg-white rounded-xl shadow-md border border-slate-200 p-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Add New Account</h2>
        <form onSubmit={createAccount} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-bold text-slate-700 mb-2">Account Name *</label>
            <input 
              value={name} 
              onChange={e => setName(e.target.value)} 
              placeholder="e.g., Main Bank Account"
              required
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors placeholder:text-slate-500" 
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Account Type *</label>
            <select 
              value={type} 
              onChange={e => setType(e.target.value)}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
            >
              <option value="BANK">🏦 Bank</option>
              <option value="CASH">💵 Cash</option>
              <option value="OTHER">📋 Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Account Number (Optional)</label>
            <input 
              value={number} 
              onChange={e => setNumber(e.target.value)} 
              placeholder="e.g., 123456789"
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors placeholder:text-slate-500" 
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Opening Balance (MWK)</label>
            <input 
              value={opening} 
              onChange={e => setOpening(e.target.value)} 
              placeholder="0.00"
              type="number"
              step="0.01"
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors placeholder:text-slate-500" 
            />
          </div>

          <div className="sm:col-span-2">
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
            >
              {loading ? 'Creating...' : '➕ Create Account'}
            </button>
          </div>
        </form>
      </div>

      {/* Accounts List */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Your Accounts ({accounts.length})</h2>
        {accounts.length === 0 ? (
          <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-8 text-center">
            <p className="text-amber-900 font-bold text-lg">No accounts yet</p>
            <p className="text-amber-700">Create your first account above to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {accounts.map(a => (
              <div key={a.id} className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border-2 border-slate-200 p-6 shadow-md hover:shadow-lg transition-all duration-300">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">{a.name}</h3>
                    <p className="text-sm text-slate-600">{a.number ? `• ${a.number}` : '• No account number'}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                    a.type === 'BANK' ? 'bg-blue-100 text-blue-700' : 
                    a.type === 'CASH' ? 'bg-amber-100 text-amber-700' : 
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {a.type === 'BANK' ? '🏦' : a.type === 'CASH' ? '💵' : '📋'} {a.type}
                  </span>
                </div>
                <div className="text-2xl font-bold text-indigo-700">
                  MWK {(a.openingCents/100).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
