'use client'

import React, { useState, useMemo } from 'react'
import {
  Calendar,
  TrendingUp,
  DollarSign,
  Printer,
  Percent,
  Download,
  AlertCircle
} from 'lucide-react'

export default function ProfitLossReport({ orders = [], expenses = [] }) {
  const [dateRange, setDateRange] = useState('month') // 'month', 'last-month', 'year', 'all'
  const [cogsPercent, setCogsPercent] = useState(42) // Estimated COGS percentage (e.g. 42%)

  // Filter orders by date range
  const filteredOrders = useMemo(() => {
    const now = new Date()
    return orders.filter((o) => {
      if (!o.created_at || o.status === 'Cancelled' || o.status === 'Returned') return false
      const od = new Date(o.created_at)
      if (isNaN(od.getTime())) return false

      if (dateRange === 'month') {
        return od.getMonth() === now.getMonth() && od.getFullYear() === now.getFullYear()
      }
      if (dateRange === 'last-month') {
        const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1
        const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear()
        return od.getMonth() === lastMonth && od.getFullYear() === year
      }
      if (dateRange === 'year') {
        return od.getFullYear() === now.getFullYear()
      }
      return true
    })
  }, [orders, dateRange])

  // Filter expenses by date range
  const filteredExpenses = useMemo(() => {
    const now = new Date()
    return expenses.filter((e) => {
      if (!e.date) return true
      const ed = new Date(e.date)
      if (isNaN(ed.getTime())) return true

      if (dateRange === 'month') {
        return ed.getMonth() === now.getMonth() && ed.getFullYear() === now.getFullYear()
      }
      if (dateRange === 'last-month') {
        const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1
        const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear()
        return ed.getMonth() === lastMonth && ed.getFullYear() === year
      }
      if (dateRange === 'year') {
        return ed.getFullYear() === now.getFullYear()
      }
      return true
    })
  }, [expenses, dateRange])

  // Revenue Metrics
  const grossSales = filteredOrders.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0)
  const shippingCollected = filteredOrders.reduce((sum, o) => sum + parseFloat(o.shipping_cost || 0), 0)
  const productRevenue = Math.max(0, grossSales - shippingCollected)

  // COGS & Gross Profit
  const cogs = Math.round((productRevenue * parseFloat(cogsPercent || 40)) / 100)
  const grossProfit = Math.max(0, productRevenue - cogs)

  // Expenses Breakdown by Category
  const expenseBreakdown = useMemo(() => {
    const map = {
      'Courier & Shipping': 0,
      'Packaging': 0,
      'Marketing & Ads': 0,
      'Office & Rent': 0,
      'Inventory & Sampling': 0,
      'Other': 0,
    }

    filteredExpenses.forEach((e) => {
      const cat = e.category || 'Other'
      const amt = parseFloat(e.amount || 0)
      if (map[cat] !== undefined) {
        map[cat] += amt
      } else {
        map['Other'] += amt
      }
    })

    return map
  }, [filteredExpenses])

  const totalOperatingExpenses = Object.values(expenseBreakdown).reduce((a, b) => a + b, 0)
  const netProfit = grossProfit + shippingCollected - totalOperatingExpenses
  const netMargin = grossSales > 0 ? Math.round((netProfit / grossSales) * 100) : 0

  return (
    <div className="space-y-6">
      
      {/* Top Header & Range Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-soft-border/80 shadow-xs">
        <div>
          <h2 className="font-luxury text-2xl font-bold uppercase tracking-wider text-charcoal flex items-center gap-2">
            <TrendingUp size={22} className="text-emerald-600" />
            Profit & Loss (P&L) Statement
          </h2>
          <p className="text-xs text-secondary-text mt-0.5">
            Real-time financial statement of revenues, costs of goods, and operational expenses
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Preset Buttons */}
          <div className="inline-flex p-1 bg-soft-bg border border-soft-border rounded-xl text-xs">
            {[
              { id: 'month', label: 'This Month' },
              { id: 'last-month', label: 'Last Month' },
              { id: 'year', label: 'This Year' },
              { id: 'all', label: 'All Time' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setDateRange(tab.id)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  dateRange === tab.id
                    ? 'bg-charcoal text-white shadow-xs'
                    : 'text-secondary-text hover:text-charcoal'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 border border-soft-border bg-white text-charcoal hover:bg-soft-bg text-xs font-bold px-3 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <Printer size={13} />
            <span className="hidden sm:inline">Print Statement</span>
          </button>
        </div>
      </div>

      {/* 3 Executive High-Level Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Total Revenue */}
        <div className="bg-white border border-soft-border p-5 rounded-2xl shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-secondary-text uppercase tracking-wider">
            Gross Revenue
          </span>
          <p className="font-luxury text-3xl font-extrabold text-charcoal">
            ৳{grossSales.toLocaleString()}
          </p>
          <span className="text-[10px] text-secondary-text">
            From {filteredOrders.length} confirmed orders
          </span>
        </div>

        {/* Total Operating Costs */}
        <div className="bg-white border border-soft-border p-5 rounded-2xl shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-secondary-text uppercase tracking-wider">
            Total Costs (COGS + Expenses)
          </span>
          <p className="font-luxury text-3xl font-extrabold text-red-600">
            ৳{(cogs + totalOperatingExpenses).toLocaleString()}
          </p>
          <span className="text-[10px] text-secondary-text">
            COGS: ৳{cogs.toLocaleString()} | Ops: ৳{totalOperatingExpenses.toLocaleString()}
          </span>
        </div>

        {/* Net Profit */}
        <div className="bg-white border border-soft-border p-5 rounded-2xl shadow-xs space-y-1 bg-gradient-to-br from-white to-[#FFF9E8]">
          <span className="text-[11px] font-bold text-[#9E7308] uppercase tracking-wider">
            Net Profit (Earnings)
          </span>
          <p className="font-luxury text-3xl font-extrabold text-emerald-700">
            ৳{netProfit.toLocaleString()}
          </p>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full inline-block">
            Net Margin: {netMargin}%
          </span>
        </div>

      </div>

      {/* Detailed P&L Financial Ledger Table */}
      <div className="bg-white border border-soft-border rounded-2xl p-6 shadow-xs space-y-6">
        
        {/* Cost of Goods Sold Assumptions Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 bg-soft-bg border border-soft-border/80 rounded-xl text-xs">
          <div className="flex items-center gap-2 text-secondary-text">
            <AlertCircle size={15} className="text-amber-600" />
            <span>Product Production / Purchase Cost Ratio:</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="20"
              max="70"
              value={cogsPercent}
              onChange={(e) => setCogsPercent(Number(e.target.value))}
              className="w-28 sm:w-36 accent-primary-yellow cursor-pointer"
            />
            <span className="font-bold text-charcoal">{cogsPercent}% of retail</span>
          </div>
        </div>

        {/* Financial Line Items */}
        <div className="space-y-4">
          <h3 className="font-luxury text-lg font-bold uppercase tracking-wider text-charcoal border-b border-soft-border pb-2">
            Statement Breakdown
          </h3>

          <div className="divide-y divide-soft-border/60 text-xs">
            
            {/* 1. Revenue Section */}
            <div className="py-2.5 font-bold uppercase tracking-wider text-charcoal bg-soft-bg/40 px-2 rounded">
              1. Revenue Streams
            </div>
            <div className="py-2 px-3 flex justify-between text-secondary-text">
              <span>Gross Product Sales</span>
              <span className="font-mono font-bold text-charcoal">৳{productRevenue.toLocaleString()}</span>
            </div>
            <div className="py-2 px-3 flex justify-between text-secondary-text">
              <span>Delivery / Shipping Fees Collected</span>
              <span className="font-mono font-bold text-charcoal">৳{shippingCollected.toLocaleString()}</span>
            </div>
            <div className="py-2.5 px-3 flex justify-between font-bold text-charcoal bg-amber-50/50">
              <span>Total Gross Revenue</span>
              <span className="font-mono text-sm">৳{grossSales.toLocaleString()}</span>
            </div>

            {/* 2. Cost of Sales (COGS) */}
            <div className="py-2.5 font-bold uppercase tracking-wider text-charcoal bg-soft-bg/40 px-2 rounded mt-3">
              2. Cost of Goods Sold (COGS)
            </div>
            <div className="py-2 px-3 flex justify-between text-secondary-text">
              <span>Eyewear Frames, Polarized Lenses & Cases (Est. {cogsPercent}%)</span>
              <span className="font-mono text-red-600 font-bold">-৳{cogs.toLocaleString()}</span>
            </div>
            <div className="py-2.5 px-3 flex justify-between font-bold text-emerald-700 bg-emerald-50/40">
              <span>Gross Profit (Revenue - COGS)</span>
              <span className="font-mono text-sm">৳{grossProfit.toLocaleString()}</span>
            </div>

            {/* 3. Operating Expenses */}
            <div className="py-2.5 font-bold uppercase tracking-wider text-charcoal bg-soft-bg/40 px-2 rounded mt-3">
              3. Operating Expenses (OPEX)
            </div>
            {Object.entries(expenseBreakdown).map(([cat, amt]) => (
              <div key={cat} className="py-2 px-3 flex justify-between text-secondary-text">
                <span>{cat}</span>
                <span className="font-mono font-bold text-red-600">-৳{amt.toLocaleString()}</span>
              </div>
            ))}
            <div className="py-2.5 px-3 flex justify-between font-bold text-red-700 bg-red-50/40">
              <span>Total Operating Expenses</span>
              <span className="font-mono text-sm">-৳{totalOperatingExpenses.toLocaleString()}</span>
            </div>

            {/* 4. Net Profit */}
            <div className="py-4 px-3 flex justify-between font-extrabold text-charcoal bg-[#FFF9E8] border border-primary-yellow/40 rounded-xl mt-4">
              <div>
                <span className="font-luxury text-lg uppercase tracking-wider block">
                  Net Profit (Bottom Line)
                </span>
                <span className="text-[11px] text-secondary-text font-normal">
                  Remaining profit after all cost of goods and operational expenses
                </span>
              </div>
              <div className="text-right">
                <span className="font-luxury text-2xl text-emerald-700 block">
                  ৳{netProfit.toLocaleString()}
                </span>
                <span className="text-[11px] font-bold text-emerald-800">
                  {netMargin}% Net Margin
                </span>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  )
}
