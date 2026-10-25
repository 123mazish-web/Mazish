'use client'

import React, { useState, useMemo } from 'react'
import {
  Receipt,
  Plus,
  Trash2,
  Search,
  Filter,
  DollarSign,
  Calendar,
  Tag,
  CheckCircle,
  X
} from 'lucide-react'

export const DEFAULT_EXPENSE_CATEGORIES = [
  'Courier & Shipping',
  'Packaging',
  'Marketing & Ads',
  'Office & Rent',
  'Inventory & Sampling',
  'Other',
]

export default function ExpensesLedger({
  expenses = [],
  onAddExpense,
  onDeleteExpense,
}) {
  // Modal State
  const [showAddModal, setShowAddModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')

  // Form State
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState(DEFAULT_EXPENSE_CATEGORIES[0])
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10))
  const [notes, setNotes] = useState('')

  // Submit Handler
  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim() || !amount) {
      alert('Please fill in title and amount.')
      return
    }

    const newExpense = {
      id: `exp-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      title: title.trim(),
      amount: parseFloat(amount),
      category,
      date,
      notes: notes.trim(),
      created_at: new Date().toISOString(),
    }

    if (onAddExpense) {
      onAddExpense(newExpense)
    }

    setTitle('')
    setAmount('')
    setNotes('')
    setShowAddModal(false)
  }

  // Filtered Expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const matchesSearch =
        e.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory =
        categoryFilter === 'All' || e.category === categoryFilter
      return matchesSearch && matchesCategory
    })
  }, [expenses, searchTerm, categoryFilter])

  const totalExpenseSum = filteredExpenses.reduce(
    (sum, e) => sum + parseFloat(e.amount || 0),
    0
  )

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-soft-border/80 shadow-xs">
        <div>
          <h2 className="font-luxury text-2xl font-bold uppercase tracking-wider text-charcoal flex items-center gap-2">
            <Receipt size={22} className="text-primary-yellow" />
            Operational Expenses Ledger
          </h2>
          <p className="text-xs text-secondary-text mt-0.5">
            Track courier packaging, advertising spend, utility bills, and supply costs
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 bg-primary-yellow hover:bg-deep-yellow text-charcoal font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-full transition-all shadow-xs cursor-pointer"
        >
          <Plus size={15} />
          <span>+ Add New Expense</span>
        </button>
      </div>

      {/* Filter Toolbar & Summary */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-soft-border/80 shadow-xs">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-60">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary-text" />
            <input
              type="text"
              placeholder="Search expenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-soft-bg border border-soft-border rounded-xl pl-9 pr-3 py-2 text-xs text-charcoal focus:outline-none"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-soft-bg border border-soft-border rounded-xl px-3 py-2 text-xs text-charcoal focus:outline-none cursor-pointer"
          >
            <option value="All">All Categories</option>
            {DEFAULT_EXPENSE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Sum of Filtered Expenses */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-secondary-text font-bold uppercase">Total Listed:</span>
          <span className="font-luxury text-xl font-extrabold text-red-600">
            ৳{totalExpenseSum.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white border border-soft-border rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-soft-bg border-b border-soft-border text-secondary-text uppercase font-bold tracking-wider text-[11px]">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Expense Title</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Notes</th>
                <th className="py-3 px-4 text-right">Amount (BDT)</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-soft-border/60">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-secondary-text">
                    No expense records found. Click "+ Add New Expense" to create one.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-soft-bg/40 transition-colors">
                    <td className="py-3 px-4 text-secondary-text font-mono">
                      {exp.date || new Date().toISOString().substring(0, 10)}
                    </td>
                    <td className="py-3 px-4 font-bold text-charcoal">
                      {exp.title}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-block bg-primary-yellow/15 text-[#9E7308] border border-primary-yellow/30 px-2 py-0.5 rounded-full font-bold text-[10px]">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-secondary-text max-w-xs truncate">
                      {exp.notes || '—'}
                    </td>
                    <td className="py-3 px-4 text-right font-luxury font-extrabold text-sm text-red-600">
                      ৳{parseFloat(exp.amount || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => {
                          if (confirm(`Delete expense "${exp.title}"?`)) {
                            onDeleteExpense(exp.id)
                          }
                        }}
                        className="text-secondary-text hover:text-red-600 p-1 transition-colors cursor-pointer"
                        title="Delete record"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white max-w-md w-full rounded-2xl p-6 border border-soft-border shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-soft-border">
              <h3 className="font-luxury text-xl font-bold uppercase tracking-wider text-charcoal flex items-center gap-2">
                <Plus size={18} className="text-primary-yellow" />
                Record New Expense
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-secondary-text hover:text-charcoal p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-charcoal uppercase block mb-1">
                  Expense Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Courier Flyer Bags Purchase (500 pcs)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-soft-bg border border-soft-border rounded-xl px-3 py-2 text-charcoal focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-charcoal uppercase block mb-1">
                    Amount (৳) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 2500"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-soft-bg border border-soft-border rounded-xl px-3 py-2 text-charcoal font-bold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-charcoal uppercase block mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-soft-bg border border-soft-border rounded-xl px-3 py-2 text-charcoal focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-charcoal uppercase block mb-1">
                  Expense Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-soft-bg border border-soft-border rounded-xl px-3 py-2 text-charcoal focus:outline-none"
                >
                  {DEFAULT_EXPENSE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-charcoal uppercase block mb-1">
                  Notes / Receipt Ref (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Invoice number, supplier name, or notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-soft-bg border border-soft-border rounded-xl px-3 py-2 text-charcoal focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-primary-yellow hover:bg-deep-yellow text-charcoal font-bold py-2.5 rounded-xl uppercase tracking-wider transition-all cursor-pointer"
                >
                  Save Expense
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-soft-bg hover:bg-white border border-soft-border text-charcoal font-bold py-2.5 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
