'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Search, MapPin, Phone, CreditCard, Clock, CheckCircle2, Truck, Check, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function TrackOrderPage() {
  const [query, setQuery] = useState('')
  const [orders, setOrders] = useState([])
  const [searched, setSearched] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleTrackSubmit = async (e) => {
    e.preventDefault()
    const trimmedQuery = query.trim()
    if (!trimmedQuery) return

    setLoading(true)
    setError('')
    setOrders([])
    setSearched(true)

    // Check if the query matches a UUID format (Order ID) or is a phone number
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    const isOrderId = uuidRegex.test(trimmedQuery)

    let fetchedOrders = []

    try {
      if (isOrderId) {
        // Query by Order ID
        const { data, error: dbError } = await supabase
          .from('orders')
          .select('*')
          .eq('id', trimmedQuery)

        if (!dbError && data) {
          fetchedOrders = data
        }
      } else {
        // Query by Phone Number
        const { data, error: dbError } = await supabase
          .from('orders')
          .select('*')
          .eq('phone', trimmedQuery)
          .order('created_at', { ascending: false })

        if (!dbError && data) {
          fetchedOrders = data
        }
      }
    } catch (err) {
      console.warn("Database lookup failed, falling back to local cache:", err)
    }

    // Merge with any matching local sandbox orders stored in the user's browser cache
    try {
      const localOrders = JSON.parse(localStorage.getItem('mazish_orders') || '[]')
      const matchingLocal = localOrders.filter(o => 
        isOrderId 
          ? o.id === trimmedQuery 
          : o.phone === trimmedQuery
      )
      
      // Combine and filter duplicates (database takes priority)
      const combined = [...fetchedOrders]
      matchingLocal.forEach(lo => {
        if (!combined.find(dbOrder => dbOrder.id === lo.id)) {
          combined.push(lo)
        }
      })

      setOrders(combined)
      if (combined.length === 0) {
        setError('No orders found matching your search. Please check the Phone Number or Order ID.')
      }
    } catch (cacheErr) {
      console.error("Local storage error:", cacheErr)
      setOrders(fetchedOrders)
    }

    setLoading(false)
  }

  const getStatusStep = (status) => {
    switch (status) {
      case 'Pending': return 1
      case 'Confirmed': return 2
      case 'Shipped': return 3
      case 'Delivered': return 4
      case 'Cancelled': return -1
      default: return 1
    }
  }

  return (
    <div className="bg-warm-bg dark:bg-[#111111] min-h-screen py-16 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Page Header */}
        <div className="text-center space-y-4">
          <span className="text-[10px] font-bold text-primary-yellow tracking-[0.2em] uppercase">
            Order Status
          </span>
          <h1 className="font-luxury text-3xl sm:text-4xl text-charcoal dark:text-white tracking-wider uppercase">
            TRACK YOUR ORDER
          </h1>
          <p className="text-secondary-text text-xs sm:text-sm font-light max-w-md mx-auto leading-relaxed">
            Enter your 11-digit phone number or the Order ID sent to you during checkout to track the status of your luxury statements.
          </p>
        </div>

        {/* Search Panel */}
        <div className="bg-pure-white dark:bg-[#191919] border border-soft-border p-6 sm:p-8 rounded-2xl max-w-xl mx-auto shadow-md">
          <form onSubmit={handleTrackSubmit} className="space-y-4">
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-wider text-secondary-text mb-2">
                Phone Number or Order ID
              </label>
              <div className="relative">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary-text" />
                <input
                  type="text"
                  required
                  placeholder="e.g. 017XXXXXXXX or order-uuid..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-cream-surface/40 dark:bg-warm-bg/10 border border-soft-border focus:border-charcoal focus:outline-none rounded-full pl-10 pr-4 py-3.5 text-xs text-charcoal dark:text-white transition-colors"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-charcoal text-warm-bg dark:bg-primary-yellow dark:text-charcoal font-bold uppercase tracking-widest text-[10px] py-3.5 rounded-full transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'SEARCHING DETAILS...' : 'TRACK SHIPMENT'}
            </button>
          </form>
        </div>

        {/* Results Panel */}
        {searched && (
          <div className="space-y-8">
            {loading ? (
              <div className="flex h-40 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-primary-yellow"></div>
              </div>
            ) : error ? (
              <div className="text-center p-12 border border-dashed border-soft-border rounded-2xl text-secondary-text max-w-xl mx-auto flex flex-col items-center justify-center gap-3">
                <AlertCircle className="text-error" size={28} />
                <p className="text-xs font-light leading-relaxed">{error}</p>
              </div>
            ) : (
              <div className="space-y-10">
                {orders.map((order) => {
                  const step = getStatusStep(order.status)
                  return (
                    <div key={order.id} className="bg-pure-white dark:bg-[#191919] border border-soft-border rounded-2xl overflow-hidden divide-y divide-soft-border shadow-md">
                      
                      {/* Order Header Summary */}
                      <div className="p-6 sm:p-8 flex flex-col sm:flex-row justify-between gap-4 bg-cream-surface/20">
                        <div>
                          <p className="text-[9px] font-bold text-secondary-text uppercase tracking-widest">Order ID</p>
                          <p className="text-xs sm:text-sm font-mono font-semibold text-charcoal dark:text-white mt-1 break-all">{order.id}</p>
                          <p className="text-[10px] text-secondary-text mt-1 font-light">
                            Placed on {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex flex-col sm:items-end justify-between gap-2">
                          <span className={`inline-block text-[9px] font-bold uppercase tracking-wider px-3 py-1 rounded border ${
                            order.status === 'Shipped' ? 'bg-success/10 text-success border-success/20' :
                            order.status === 'Confirmed' ? 'bg-primary-yellow/10 text-charcoal dark:text-primary-yellow border-primary-yellow/20' :
                            order.status === 'Cancelled' ? 'bg-error/10 text-error border-error/20' :
                            'bg-primary-yellow/10 text-charcoal dark:text-primary-yellow border-primary-yellow/20'
                          }`}>
                            {order.status}
                          </span>
                          {order.steadfast_tracking_code && (
                            <p className="text-[10px] text-secondary-text font-mono">
                              Consignment: <strong className="text-charcoal dark:text-white">{order.steadfast_tracking_code}</strong>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Stepper Progress Bar */}
                      {step !== -1 && (
                        <div className="p-6 sm:p-8">
                          <div className="flex items-center justify-between relative max-w-md mx-auto py-4">
                            {/* Horizontal Line behind icons */}
                            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2px] bg-soft-border z-0"></div>
                            <div 
                              className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-primary-yellow transition-all duration-500 z-0" 
                              style={{ width: `${((step - 1) / 3) * 100}%` }}
                            ></div>

                            {/* Stepper Items */}
                            {[1, 2, 3, 4].map((s) => {
                              const active = s <= step
                              const label = s === 1 ? 'Pending' : s === 2 ? 'Confirmed' : s === 3 ? 'Shipped' : 'Delivered'
                              return (
                                <div key={s} className="flex flex-col items-center relative z-10">
                                  <div className={`h-8 w-8 rounded-full border flex items-center justify-center text-xs font-bold transition-all duration-500 ${
                                    active 
                                      ? 'bg-primary-yellow border-primary-yellow text-charcoal' 
                                      : 'bg-pure-white dark:bg-[#191919] border-soft-border text-secondary-text'
                                  }`}>
                                    {active && s < step ? <Check size={12} /> : s}
                                  </div>
                                  <span className={`text-[9px] font-bold uppercase tracking-wider mt-2.5 transition-colors duration-300 ${
                                    active ? 'text-charcoal dark:text-white' : 'text-secondary-text/60'
                                  }`}>
                                    {label}
                                  </span>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      {/* Customer & Items Panel */}
                      <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 text-xs sm:text-sm font-light text-secondary-text">
                        <div className="space-y-4">
                          <h4 className="font-bold text-charcoal dark:text-white uppercase tracking-wider text-[10px]">Shipping Details</h4>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <MapPin size={14} className="text-primary-yellow" />
                              <span>{order.customer_name} — {order.shipping_address}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone size={14} className="text-primary-yellow" />
                              <span>{order.customer_phone}</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h4 className="font-bold text-charcoal dark:text-white uppercase tracking-wider text-[10px]">Payment Summary</h4>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <CreditCard size={14} className="text-primary-yellow" />
                              <span>Method: <strong className="text-charcoal dark:text-white">{order.payment_method}</strong></span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock size={14} className="text-primary-yellow" />
                              <span>Total Amount Paid: <strong className="text-charcoal dark:text-white">৳{order.total_amount}</strong></span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
