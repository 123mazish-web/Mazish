'use client'

import React, { useState } from 'react'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  ClipboardList,
  BarChart3,
  Receipt,
  Tag,
  MessageSquare,
  ShieldAlert,
  Settings,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'

export default function AdminSidebar({ activeTab, setActiveTab, counts = {} }) {
  const [openSections, setOpenSections] = useState({
    products: true,
    reports: false,
    expenses: false,
    blocking: false,
    settings: false,
  })

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const isCurrent = (tab) => activeTab === tab

  return (
    <aside className="w-72 shrink-0 bg-[#0E0E0E] min-h-screen text-zinc-200 flex flex-col justify-between p-5 border-r border-zinc-800/90 select-none">
      <div className="space-y-6">
        

        {/* Navigation Items: Prominent, Big, Highly Legible */}
        <nav className="space-y-1.5 text-sm font-semibold">
          
          {/* 1. Dashboard (Active Bright Yellow Pill) */}
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl font-bold transition-all cursor-pointer ${
              isCurrent('dashboard')
                ? 'bg-[#F5C443] text-black shadow-md'
                : 'text-zinc-200 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <LayoutDashboard size={20} className={isCurrent('dashboard') ? 'text-black' : 'text-zinc-300'} />
            <span className="text-sm tracking-wide">Dashboard</span>
          </button>

          {/* 2. Products (Accordion) */}
          <div>
            <button
              onClick={() => toggleSection('products')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all cursor-pointer ${
                activeTab.startsWith('product') || activeTab === 'categories' || activeTab === 'new-product'
                  ? 'text-white font-bold bg-zinc-800/80'
                  : 'text-zinc-200 hover:text-white hover:bg-zinc-850/60'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <Package size={20} />
                <span className="text-sm tracking-wide">Products</span>
              </div>
              {openSections.products ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>

            {openSections.products && (
              <div className="ml-8 pl-3.5 border-l-2 border-zinc-700/80 my-1.5 space-y-1 text-[13.5px]">
                <button
                  onClick={() => setActiveTab('products')}
                  className={`w-full text-left py-2 px-3 rounded-xl transition-colors cursor-pointer ${
                    isCurrent('products')
                      ? 'text-[#F5C443] font-bold bg-zinc-800/50'
                      : 'text-zinc-300 hover:text-white hover:bg-zinc-800/30'
                  }`}
                >
                  View Products
                </button>
                <button
                  onClick={() => setActiveTab('new-product')}
                  className={`w-full text-left py-2 px-3 rounded-xl transition-colors cursor-pointer ${
                    isCurrent('new-product')
                      ? 'text-[#F5C443] font-bold bg-zinc-800/50'
                      : 'text-zinc-300 hover:text-white hover:bg-zinc-800/30'
                  }`}
                >
                  Add Product
                </button>
                <button
                  onClick={() => setActiveTab('categories')}
                  className={`w-full text-left py-2 px-3 rounded-xl transition-colors cursor-pointer ${
                    isCurrent('categories')
                      ? 'text-[#F5C443] font-bold bg-zinc-800/50'
                      : 'text-zinc-300 hover:text-white hover:bg-zinc-800/30'
                  }`}
                >
                  Category
                </button>
                <button
                  onClick={() => setActiveTab('products')}
                  className="w-full text-left py-2 px-3 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800/30 transition-colors cursor-pointer"
                >
                  Stock
                </button>
              </div>
            )}
          </div>

          {/* 3. POS (Add Sale) */}
          <button
            onClick={() => setActiveTab('pos')}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all cursor-pointer ${
              isCurrent('pos')
                ? 'bg-[#F5C443] text-black font-bold shadow-md'
                : 'text-zinc-200 hover:text-white hover:bg-zinc-850/60'
            }`}
          >
            <ShoppingCart size={20} className={isCurrent('pos') ? 'text-black' : 'text-zinc-300'} />
            <span className="text-sm tracking-wide">POS (Add Sale)</span>
          </button>

          {/* 4. Orders */}
          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all cursor-pointer ${
              isCurrent('orders') || isCurrent('manual-orders')
                ? 'bg-[#F5C443] text-black font-bold shadow-md'
                : 'text-zinc-200 hover:text-white hover:bg-zinc-850/60'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <ClipboardList size={20} className={isCurrent('orders') ? 'text-black' : 'text-zinc-300'} />
              <span className="text-sm tracking-wide">Orders</span>
            </div>
            {counts.orders > 0 && (
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-extrabold ${
                isCurrent('orders') ? 'bg-black text-[#F5C443]' : 'bg-zinc-800 text-zinc-200'
              }`}>
                {counts.orders}
              </span>
            )}
          </button>

          {/* 5. Reports */}
          <div>
            <button
              onClick={() => toggleSection('reports')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all cursor-pointer ${
                isCurrent('profit-loss')
                  ? 'text-white font-bold bg-zinc-800/80'
                  : 'text-zinc-200 hover:text-white hover:bg-zinc-850/60'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <BarChart3 size={20} />
                <span className="text-sm tracking-wide">Reports</span>
              </div>
              {openSections.reports ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>

            {openSections.reports && (
              <div className="ml-8 pl-3.5 border-l-2 border-zinc-700/80 my-1.5 space-y-1 text-[13.5px]">
                <button
                  onClick={() => setActiveTab('profit-loss')}
                  className={`w-full text-left py-2 px-3 rounded-xl transition-colors cursor-pointer ${
                    isCurrent('profit-loss')
                      ? 'text-[#F5C443] font-bold bg-zinc-800/50'
                      : 'text-zinc-300 hover:text-white hover:bg-zinc-800/30'
                  }`}
                >
                  P&L Statement
                </button>
              </div>
            )}
          </div>

          {/* 6. Expenses */}
          <div>
            <button
              onClick={() => toggleSection('expenses')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all cursor-pointer ${
                isCurrent('expenses-ledger') || isCurrent('add-expense')
                  ? 'text-white font-bold bg-zinc-800/80'
                  : 'text-zinc-200 hover:text-white hover:bg-zinc-850/60'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <Receipt size={20} />
                <span className="text-sm tracking-wide">Expenses</span>
              </div>
              {openSections.expenses ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>

            {openSections.expenses && (
              <div className="ml-8 pl-3.5 border-l-2 border-zinc-700/80 my-1.5 space-y-1 text-[13.5px]">
                <button
                  onClick={() => setActiveTab('expenses-ledger')}
                  className={`w-full text-left py-2 px-3 rounded-xl transition-colors cursor-pointer ${
                    isCurrent('expenses-ledger')
                      ? 'text-[#F5C443] font-bold bg-zinc-800/50'
                      : 'text-zinc-300 hover:text-white hover:bg-zinc-800/30'
                  }`}
                >
                  View Expenses
                </button>
                <button
                  onClick={() => setActiveTab('add-expense')}
                  className={`w-full text-left py-2 px-3 rounded-xl transition-colors cursor-pointer ${
                    isCurrent('add-expense')
                      ? 'text-[#F5C443] font-bold bg-zinc-800/50'
                      : 'text-zinc-300 hover:text-white hover:bg-zinc-800/30'
                  }`}
                >
                  + Add Expense
                </button>
              </div>
            )}
          </div>

          {/* 7. Coupons */}
          <button
            onClick={() => setActiveTab('promo-codes')}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all cursor-pointer ${
              isCurrent('promo-codes')
                ? 'bg-[#F5C443] text-black font-bold shadow-md'
                : 'text-zinc-200 hover:text-white hover:bg-zinc-850/60'
            }`}
          >
            <Tag size={20} className={isCurrent('promo-codes') ? 'text-black' : 'text-zinc-300'} />
            <span className="text-sm tracking-wide">Coupons</span>
          </button>

          {/* 8. Messages */}
          <button
            onClick={() => setActiveTab('messages')}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all cursor-pointer ${
              isCurrent('messages')
                ? 'bg-[#F5C443] text-black font-bold shadow-md'
                : 'text-zinc-200 hover:text-white hover:bg-zinc-850/60'
            }`}
          >
            <MessageSquare size={20} className={isCurrent('messages') ? 'text-black' : 'text-zinc-300'} />
            <span className="text-sm tracking-wide">Messages</span>
          </button>

          {/* 9. Blocking */}
          <div>
            <button
              onClick={() => toggleSection('blocking')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all cursor-pointer ${
                isCurrent('fraud-blocking')
                  ? 'text-white font-bold bg-zinc-800/80'
                  : 'text-zinc-200 hover:text-white hover:bg-zinc-850/60'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <ShieldAlert size={20} />
                <span className="text-sm tracking-wide">Blocking</span>
              </div>
              {openSections.blocking ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>

            {openSections.blocking && (
              <div className="ml-8 pl-3.5 border-l-2 border-zinc-700/80 my-1.5 space-y-1 text-[13.5px]">
                <button
                  onClick={() => setActiveTab('fraud-blocking')}
                  className={`w-full text-left py-2 px-3 rounded-xl transition-colors cursor-pointer ${
                    isCurrent('fraud-blocking')
                      ? 'text-[#F5C443] font-bold bg-zinc-800/50'
                      : 'text-zinc-300 hover:text-white hover:bg-zinc-800/30'
                  }`}
                >
                  Block Numbers & IPs
                </button>
              </div>
            )}
          </div>

          {/* 10. Settings */}
          <div>
            <button
              onClick={() => toggleSection('settings')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all cursor-pointer ${
                isCurrent('settings-profile') || isCurrent('settings-courier')
                  ? 'text-white font-bold bg-zinc-800/80'
                  : 'text-zinc-200 hover:text-white hover:bg-zinc-850/60'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <Settings size={20} />
                <span className="text-sm tracking-wide">Settings</span>
              </div>
              {openSections.settings ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>

            {openSections.settings && (
              <div className="ml-8 pl-3.5 border-l-2 border-zinc-700/80 my-1.5 space-y-1 text-[13.5px]">
                <button
                  onClick={() => setActiveTab('settings-profile')}
                  className={`w-full text-left py-2 px-3 rounded-xl transition-colors cursor-pointer ${
                    isCurrent('settings-profile')
                      ? 'text-[#F5C443] font-bold bg-zinc-800/50'
                      : 'text-zinc-300 hover:text-white hover:bg-zinc-800/30'
                  }`}
                >
                  Store Profile
                </button>
                <button
                  onClick={() => setActiveTab('settings-courier')}
                  className={`w-full text-left py-2 px-3 rounded-xl transition-colors cursor-pointer ${
                    isCurrent('settings-courier')
                      ? 'text-[#F5C443] font-bold bg-zinc-800/50'
                      : 'text-zinc-300 hover:text-white hover:bg-zinc-800/30'
                  }`}
                >
                  Courier API Setup
                </button>
              </div>
            )}
          </div>

        </nav>
      </div>

      {/* User Avatar Footer */}
      <div className="pt-5 border-t border-zinc-800/90 flex items-center gap-3.5 px-3">
        <div className="h-10 w-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-white text-base shadow-xs">
          M
        </div>
        <div className="text-xs">
          <p className="font-bold text-white text-sm">MAZISH Admin</p>
          <p className="text-[11px] text-zinc-400">Super Administrator</p>
        </div>
      </div>

    </aside>
  )
}
