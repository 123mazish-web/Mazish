'use client'

import React from 'react'
import { RefreshCw, Trash2, LogOut, Wallet, ShoppingCart, ShieldCheck } from 'lucide-react'

export default function AdminHeader({
  loading,
  onReload,
  onClearSandbox,
  onLogout,
  onOpenPOS,
  steadfastBalance = 6150,
}) {
  return (
    <header className="bg-white border-b border-soft-border/80 sticky top-0 z-30 shadow-xs">
      <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand & Subtitle */}
        <div className="flex items-center gap-3.5 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-3">
            <img
              src="https://res.cloudinary.com/kp0jicx3/image/upload/v1785265523/main_logo_ffrk6k.png"
              alt="MAZISH"
              className="h-8 w-auto object-contain mix-blend-multiply"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-luxury text-xl sm:text-2xl font-bold tracking-[0.25em] text-charcoal uppercase leading-none">
                  MAZISH
                </span>
                <span className="text-[10px] bg-primary-yellow/20 text-[#9E7308] border border-primary-yellow/40 font-bold px-2 py-0.5 rounded-full tracking-wider uppercase">
                  Admin
                </span>
              </div>
              <p className="text-[11px] text-secondary-text tracking-wide mt-0.5 font-light">
                Enterprise Commerce & Operations Hub
              </p>
            </div>
          </div>
        </div>

        {/* Center / Right Metrics & Quick Actions */}
        <div className="flex items-center flex-wrap gap-2.5 sm:gap-3.5 w-full md:w-auto justify-end">
          
          {/* Steadfast Live Wallet Badge */}
          <div className="flex items-center gap-2.5 bg-[#FFF9E8] border border-[#F4C542]/50 px-3.5 py-1.5 rounded-full shadow-xs">
            <div className="relative flex items-center justify-center">
              <span className="absolute h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="h-2 w-2 rounded-full bg-emerald-600"></span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <Wallet size={14} className="text-[#B18512]" />
              <span className="text-[11px] font-semibold text-secondary-text uppercase tracking-wider">
                Steadfast Wallet:
              </span>
              <span className="font-luxury text-[15px] font-extrabold text-charcoal">
                ৳{Number(steadfastBalance).toLocaleString('en-US')}
              </span>
            </div>
          </div>

          {/* Quick POS Terminal Button */}
          {onOpenPOS && (
            <button
              onClick={onOpenPOS}
              className="flex items-center gap-1.5 bg-primary-yellow hover:bg-deep-yellow text-charcoal text-xs font-bold uppercase tracking-wider px-3.5 py-2 rounded-full transition-all shadow-xs cursor-pointer"
              title="Open Walk-in POS Terminal"
            >
              <ShoppingCart size={13} className="stroke-[2.5]" />
              <span>POS Terminal</span>
            </button>
          )}

          {/* Reload Data */}
          <button
            onClick={onReload}
            disabled={loading}
            className="flex items-center gap-1.5 bg-soft-bg hover:bg-white text-secondary-text hover:text-charcoal border border-soft-border text-xs font-semibold px-3 py-2 rounded-full transition-all cursor-pointer"
            title="Reload live database orders"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* Clear Sandbox Data */}
          <button
            onClick={onClearSandbox}
            className="flex items-center gap-1 text-[11px] font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100/70 border border-red-200/80 px-2.5 py-2 rounded-full transition-all cursor-pointer"
            title="Clear browser cached test data"
          >
            <Trash2 size={12} />
            <span className="hidden lg:inline">Clear Sandbox</span>
          </button>

          {/* Logout */}
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 text-xs font-semibold text-charcoal hover:text-red-600 bg-soft-bg hover:bg-white border border-soft-border px-3 py-2 rounded-full transition-all cursor-pointer"
            title="Log out of admin session"
          >
            <LogOut size={13} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  )
}
