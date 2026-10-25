'use client'

import React, { useState, useMemo } from 'react'
import {
  ShoppingBag,
  Clock,
  RotateCcw,
  Link as LinkIcon,
  Receipt,
  AlertTriangle,
  Calendar,
  TrendingUp,
  RefreshCw,
  Eye,
  CheckCircle2,
  DollarSign,
  Download
} from 'lucide-react'

export default function DashboardAnalytics({
  orders = [],
  products = [],
  expenses = [],
  onReload,
  steadfastBalance = 13185,
}) {
  const [timeFilter, setTimeFilter] = useState('all')

  // Filter orders according to timeFilter
  const filteredOrders = useMemo(() => {
    const now = new Date()
    return orders.filter((o) => {
      if (!o.created_at) return true
      const orderDate = new Date(o.created_at)
      if (isNaN(orderDate.getTime())) return true

      if (timeFilter === 'today') {
        return (
          orderDate.getDate() === now.getDate() &&
          orderDate.getMonth() === now.getMonth() &&
          orderDate.getFullYear() === now.getFullYear()
        )
      }
      if (timeFilter === 'month') {
        return (
          orderDate.getMonth() === now.getMonth() &&
          orderDate.getFullYear() === now.getFullYear()
        )
      }
      if (timeFilter === 'year') {
        return orderDate.getFullYear() === now.getFullYear()
      }
      return true
    })
  }, [orders, timeFilter])

  // Filter expenses
  const filteredExpenses = useMemo(() => {
    const now = new Date()
    return expenses.filter((e) => {
      if (!e.date) return true
      const expDate = new Date(e.date)
      if (isNaN(expDate.getTime())) return true

      if (timeFilter === 'today') {
        return (
          expDate.getDate() === now.getDate() &&
          expDate.getMonth() === now.getMonth() &&
          expDate.getFullYear() === now.getFullYear()
        )
      }
      if (timeFilter === 'month') {
        return (
          expDate.getMonth() === now.getMonth() &&
          expDate.getFullYear() === now.getFullYear()
        )
      }
      if (timeFilter === 'year') {
        return expDate.getFullYear() === now.getFullYear()
      }
      return true
    })
  }, [expenses, timeFilter])

  // KPI calculations
  const totalOrdersCount = filteredOrders.length

  const pendingProcessCount = filteredOrders.filter(
    (o) => o.status === 'Pending' || o.status === 'Processing'
  ).length

  const returnsCount = filteredOrders.filter(
    (o) => o.status === 'Returned'
  ).length

  const nonCancelledOrders = filteredOrders.filter(
    (o) => o.status !== 'Cancelled' && o.status !== 'Returned'
  )

  const totalSales = nonCancelledOrders.reduce(
    (sum, o) => sum + parseFloat(o.total_amount || 0),
    0
  )

  const totalExpense = filteredExpenses.reduce(
    (sum, e) => sum + parseFloat(e.amount || 0),
    0
  )

  const lowStockCount = products.filter(
    (p) => (p.stock !== undefined && p.stock !== null ? p.stock <= 3 : false)
  ).length

  const aov =
    nonCancelledOrders.length > 0
      ? Math.round(totalSales / nonCancelledOrders.length)
      : 0

  const inTransitCount = filteredOrders.filter(
    (o) => o.status === 'Shipped' || (o.status === 'Processing' && o.steadfast_consignment_id)
  ).length

  const deliveredCount = filteredOrders.filter(
    (o) => o.status === 'Delivered'
  ).length

  // Net Profit = Total Sales - Total Expenses
  const netProfit = totalSales - totalExpense

  // 12 Months Sales Overview (2026)
  const monthlyData = useMemo(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const year = 2026

    const data = monthNames.map((name, mIdx) => {
      const monthOrders = orders.filter((o) => {
        if (!o.created_at || o.status === 'Cancelled' || o.status === 'Returned') return false
        const od = new Date(o.created_at)
        return od.getMonth() === mIdx && od.getFullYear() === year
      })

      const rev = monthOrders.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0)
      return {
        label: name,
        revenue: rev,
        orderCount: monthOrders.length,
      }
    })

    const maxRev = Math.max(...data.map((m) => m.revenue), 1000)
    return data.map((m) => ({
      ...m,
      heightPct: m.revenue > 0 ? Math.max(14, Math.round((m.revenue / maxRev) * 100)) : 8,
    }))
  }, [orders])

  // Payment Distribution Calculations
  const paymentStats = useMemo(() => {
    let cod = 0
    let bkash = 0
    let pos = 0
    let other = 0

    filteredOrders.forEach((o) => {
      const pm = String(o.payment_method || '').toUpperCase()
      const pd = String(o.payment_details || '').toUpperCase()
      const amt = parseFloat(o.total_amount || 0)
      if (pm === 'CASH' || pm === 'COUNTER' || pd.includes('POS') || pd.includes('WALK-IN')) {
        pos += amt
      } else if (pm === 'BKASH' || pd.includes('BKASH')) {
        bkash += amt
      } else if (pm === 'COD' || pd.includes('COD') || pm === 'CASH ON DELIVERY') {
        cod += amt
      } else {
        other += amt
      }
    })

    const grand = cod + bkash + pos + other || 1
    return {
      cod: { amt: cod, pct: Math.round((cod / grand) * 100) },
      bkash: { amt: bkash, pct: Math.round((bkash / grand) * 100) },
      pos: { amt: pos, pct: Math.round((pos / grand) * 100) },
      other: { amt: other, pct: Math.round((other / grand) * 100) },
    }
  }, [filteredOrders])

  return (
    <div className="space-y-6 sm:space-y-7">
      
      {/* Top Header Breadcrumbs & Action Buttons */}
      <div className="flex items-center justify-between pb-1">
        <span className="font-luxury text-xl sm:text-2xl text-charcoal font-medium">Dashboard</span>

        <div className="flex items-center gap-3">
          <a
            href="/api/admin/export-customers?token=mazish-secure-admin-token"
            download="Mazish_Customer_Data.xlsx"
            className="flex items-center gap-2 bg-[#EAF7EE] hover:bg-[#D7F3E2] text-[#0F766E] border border-[#A6E6BD] px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold uppercase transition-all shadow-xs"
            title="Download full customer & order database in Excel"
          >
            <Download size={14} />
            <span>EXPORT EXCEL</span>
          </a>

          <button
            onClick={onReload}
            className="flex items-center gap-2 bg-white hover:bg-zinc-50 border border-soft-border/90 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold uppercase text-charcoal transition-all shadow-xs cursor-pointer"
          >
            <RefreshCw size={14} />
            <span>REFRESH</span>
          </button>

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-[#F5C443] hover:bg-[#E5B537] text-charcoal px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold uppercase transition-all shadow-xs"
          >
            <Eye size={15} className="stroke-[2.5]" />
            <span>VIEW SITE</span>
          </a>
        </div>
      </div>

      {/* Main Title, Steadfast Live Wallet Badge & Time Filter Dropdown */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="font-luxury text-3xl sm:text-4xl lg:text-[38px] font-normal text-charcoal tracking-wide">
          Admin Dashboard
        </h1>

        <div className="flex items-center gap-3">
          {/* Steadfast Balance Pill */}
          <div className="flex items-center gap-2.5 bg-[#EAF7EE] border border-[#A6E6BD] px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold text-[#0F766E] shadow-xs">
            <span className="h-2.5 w-2.5 rounded-full bg-[#10B981] animate-pulse"></span>
            <span>Steadfast Balance: ৳{Number(steadfastBalance).toLocaleString()}</span>
          </div>

          {/* Time Filter Select */}
          <div className="relative">
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="appearance-none bg-white border border-soft-border rounded-xl pl-10 pr-9 py-2.5 text-xs sm:text-sm font-semibold text-charcoal focus:outline-none shadow-xs cursor-pointer"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
            <Calendar size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary-text pointer-events-none" />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] text-secondary-text pointer-events-none">▼</span>
          </div>
        </div>
      </div>

      {/* KPI CARDS: ROW 1 (3 Balanced Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* 1. TOTAL ORDERS */}
        <div className="bg-white border border-soft-border/90 rounded-2xl p-6 shadow-xs flex items-center justify-between hover:border-blue-400 transition-all">
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-secondary-text uppercase tracking-wider block">
              TOTAL ORDERS
            </span>
            <p className="font-sans text-3xl sm:text-4xl font-extrabold text-charcoal tracking-tight">
              {totalOrdersCount}
            </p>
          </div>
          <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-xs shrink-0">
            <ShoppingBag size={26} />
          </div>
        </div>

        {/* 2. PENDING PROCESS */}
        <div className="bg-white border border-soft-border/90 rounded-2xl p-6 shadow-xs flex items-center justify-between hover:border-amber-400 transition-all">
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-secondary-text uppercase tracking-wider block">
              PENDING PROCESS
            </span>
            <p className="font-sans text-3xl sm:text-4xl font-extrabold text-charcoal tracking-tight">
              {pendingProcessCount}
            </p>
          </div>
          <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shadow-xs shrink-0">
            <Clock size={26} />
          </div>
        </div>

        {/* 3. RETURNS */}
        <div className="bg-white border border-soft-border/90 rounded-2xl p-6 shadow-xs flex items-center justify-between hover:border-rose-400 transition-all">
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-secondary-text uppercase tracking-wider block">
              RETURNS
            </span>
            <p className="font-sans text-3xl sm:text-4xl font-extrabold text-charcoal tracking-tight">
              {returnsCount}
            </p>
          </div>
          <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 shadow-xs shrink-0">
            <RotateCcw size={26} />
          </div>
        </div>

      </div>

      {/* KPI CARDS: ROW 2 (3 Balanced Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* 4. TOTAL SALES */}
        <div className="bg-white border border-soft-border/90 rounded-2xl p-6 shadow-xs flex items-center justify-between hover:border-emerald-400 transition-all">
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-secondary-text uppercase tracking-wider block">
              TOTAL SALES
            </span>
            <p className="font-sans text-3xl sm:text-4xl font-extrabold text-charcoal tracking-tight">
              ৳{totalSales.toLocaleString()}
            </p>
          </div>
          <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-xs shrink-0">
            <LinkIcon size={26} />
          </div>
        </div>

        {/* 5. TOTAL EXPENSE */}
        <div className="bg-white border border-soft-border/90 rounded-2xl p-6 shadow-xs flex items-center justify-between hover:border-purple-400 transition-all">
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-secondary-text uppercase tracking-wider block">
              TOTAL EXPENSE
            </span>
            <p className="font-sans text-3xl sm:text-4xl font-extrabold text-charcoal tracking-tight">
              ৳{totalExpense.toLocaleString()}
            </p>
          </div>
          <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shadow-xs shrink-0">
            <Receipt size={26} />
          </div>
        </div>

        {/* 6. LOW STOCK */}
        <div className="bg-white border border-soft-border/90 rounded-2xl p-6 shadow-xs flex items-center justify-between hover:border-amber-400 transition-all">
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-secondary-text uppercase tracking-wider block">
              LOW STOCK
            </span>
            <p className="font-sans text-3xl sm:text-4xl font-extrabold text-charcoal tracking-tight">
              {lowStockCount}
            </p>
          </div>
          <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500 shadow-xs shrink-0">
            <AlertTriangle size={26} />
          </div>
        </div>

      </div>

      {/* KPI CARDS: ROW 3 (4 Clean Metric Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* Card 7: NET PROFIT */}
        <div className="bg-white border border-soft-border/90 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between hover:border-emerald-400 transition-all">
          <span className="text-xs font-bold text-secondary-text uppercase tracking-wider block mb-1">
            NET PROFIT
          </span>
          <p className={`font-sans text-2xl sm:text-3xl font-extrabold ${netProfit < 0 ? 'text-charcoal' : 'text-emerald-700'}`}>
            {netProfit < 0 ? `-৳${Math.abs(netProfit).toLocaleString()}` : `৳${netProfit.toLocaleString()}`}
          </p>
        </div>

        {/* Card 8: AVG ORDER VALUE (AOV) */}
        <div className="bg-white border border-soft-border/90 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between hover:border-purple-400 transition-all">
          <span className="text-xs font-bold text-secondary-text uppercase tracking-wider block mb-1">
            AVG ORDER VALUE (AOV)
          </span>
          <p className="font-sans text-2xl sm:text-3xl font-extrabold text-charcoal">
            ৳{aov.toLocaleString()}
          </p>
        </div>

        {/* Card 9: COURIER IN-TRANSIT */}
        <div className="bg-white border border-soft-border/90 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between hover:border-blue-400 transition-all">
          <span className="text-xs font-bold text-secondary-text uppercase tracking-wider block mb-1">
            COURIER IN-TRANSIT
          </span>
          <p className="font-sans text-2xl sm:text-3xl font-extrabold text-charcoal">
            {inTransitCount} parcels
          </p>
        </div>

        {/* Card 10: DELIVERED ORDERS */}
        <div className="bg-white border border-soft-border/90 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between hover:border-emerald-400 transition-all">
          <span className="text-xs font-bold text-secondary-text uppercase tracking-wider block mb-1">
            DELIVERED ORDERS
          </span>
          <p className="font-sans text-2xl sm:text-3xl font-extrabold text-charcoal">
            {deliveredCount}
          </p>
        </div>

      </div>

      {/* SALES OVERVIEW (2026) CHART CARD */}
      <div className="bg-white border border-soft-border/90 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-luxury text-2xl sm:text-3xl font-bold tracking-wider uppercase text-charcoal">
              SALES OVERVIEW (2026)
            </h2>
            <p className="text-xs sm:text-sm text-secondary-text mt-1 font-light">
              Real monthly revenue generated from customer checkout & counter sales.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-[#EAF7EE] text-[#0F766E] border border-[#A6E6BD] px-4 py-2 rounded-full text-xs font-bold shadow-xs">
            <TrendingUp size={15} />
            <span>Live Revenue Chart</span>
          </div>
        </div>

        {/* 12-Month Bar Chart */}
        <div className="pt-4 pb-2">
          <div className="h-64 sm:h-72 flex items-end justify-between gap-2.5 sm:gap-4 px-1 sm:px-4">
            {monthlyData.map((m, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2.5 group h-full justify-end relative">
                {/* Revenue Tag above bar if revenue exists */}
                {m.revenue > 0 && (
                  <span className="text-[10px] sm:text-xs font-bold text-charcoal bg-zinc-100 px-1.5 py-0.5 rounded mb-0.5 shadow-2xs">
                    ৳{(m.revenue / 1000).toFixed(0)}k
                  </span>
                )}

                {/* Tooltip on hover */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-charcoal text-white text-xs py-2 px-3 rounded-xl absolute -translate-y-24 pointer-events-none shadow-xl z-20 whitespace-nowrap">
                  <p className="font-bold text-sm">৳{m.revenue.toLocaleString()}</p>
                  <p className="text-xs text-zinc-300">{m.orderCount} orders in {m.label}</p>
                </div>

                {/* Bar */}
                <div
                  style={{ height: `${m.heightPct}%` }}
                  className={`w-full max-w-[48px] sm:max-w-[54px] rounded-t-xl transition-all duration-300 shadow-xs ${
                    m.revenue > 0
                      ? 'bg-gradient-to-t from-[#E5B537] to-[#F5C443] group-hover:from-charcoal group-hover:to-charcoal'
                      : 'bg-zinc-100 group-hover:bg-zinc-200'
                  }`}
                ></div>

                {/* Month Label */}
                <span className="text-xs font-bold text-secondary-text uppercase tracking-wider">
                  {m.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* EXECUTIVE BREAKDOWN PANELS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Payment Channels Breakdown Panel */}
        <div className="bg-white border border-soft-border/90 rounded-2xl p-6 sm:p-7 shadow-xs space-y-5">
          <div>
            <h3 className="font-luxury text-xl sm:text-2xl font-bold tracking-wide uppercase text-charcoal">
              Payment Methods Distribution
            </h3>
            <p className="text-xs text-secondary-text mt-0.5">
              Breakdown of collected revenue across Cash on Delivery, bKash, and POS walk-in sales.
            </p>
          </div>

          <div className="space-y-3.5 pt-1">
            <div>
              <div className="flex justify-between text-xs sm:text-sm font-semibold text-charcoal mb-1">
                <span>Cash on Delivery (COD)</span>
                <span>৳{paymentStats.cod.amt.toLocaleString()} ({paymentStats.cod.pct}%)</span>
              </div>
              <div className="h-2.5 bg-zinc-100 rounded-full overflow-hidden">
                <div style={{ width: `${paymentStats.cod.pct}%` }} className="h-full bg-blue-500 rounded-full"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs sm:text-sm font-semibold text-charcoal mb-1">
                <span>bKash Instant Gateway</span>
                <span>৳{paymentStats.bkash.amt.toLocaleString()} ({paymentStats.bkash.pct}%)</span>
              </div>
              <div className="h-2.5 bg-zinc-100 rounded-full overflow-hidden">
                <div style={{ width: `${paymentStats.bkash.pct}%` }} className="h-full bg-[#E2136E] rounded-full"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs sm:text-sm font-semibold text-charcoal mb-1">
                <span>POS & Walk-in Boutique</span>
                <span>৳{paymentStats.pos.amt.toLocaleString()} ({paymentStats.pos.pct}%)</span>
              </div>
              <div className="h-2.5 bg-zinc-100 rounded-full overflow-hidden">
                <div style={{ width: `${paymentStats.pos.pct}%` }} className="h-full bg-[#F5C443] rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Courier Pipeline Summary Panel */}
        <div className="bg-white border border-soft-border/90 rounded-2xl p-6 sm:p-7 shadow-xs space-y-5">
          <div>
            <h3 className="font-luxury text-xl sm:text-2xl font-bold tracking-wide uppercase text-charcoal">
              Courier & Fulfillment Pipeline
            </h3>
            <p className="text-xs text-secondary-text mt-0.5">
              Live parcel statuses integrated with Steadfast Courier domestic delivery API.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3.5 pt-1">
            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-4 space-y-0.5">
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">Delivered</span>
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-700">{deliveredCount}</p>
              <span className="text-[11px] text-emerald-600 font-medium">Successfully completed</span>
            </div>

            <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-4 space-y-0.5">
              <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider block">In-Transit</span>
              <p className="text-2xl sm:text-3xl font-extrabold text-blue-700">{inTransitCount}</p>
              <span className="text-[11px] text-blue-600 font-medium">With Steadfast riders</span>
            </div>

            <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 space-y-0.5">
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">Pending Packing</span>
              <p className="text-2xl sm:text-3xl font-extrabold text-amber-700">{pendingProcessCount}</p>
              <span className="text-[11px] text-amber-600 font-medium">Ready to dispatch</span>
            </div>

            <div className="bg-rose-50/70 border border-rose-200/80 rounded-xl p-4 space-y-0.5">
              <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider block">Returns</span>
              <p className="text-2xl sm:text-3xl font-extrabold text-rose-700">{returnsCount}</p>
              <span className="text-[11px] text-rose-600 font-medium">Returned to hub</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  )
}
