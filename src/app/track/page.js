'use client'

import React, { useState, useEffect } from 'react'
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
    <div className="bg-zinc-950 min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Page Header */}
        <div className="text-center space-y-4">
          <span className="text-[10px] font-semibold text-amber-500 tracking-[0.2em] uppercase">
            Order Status
          </span>
          <h1 className="font-luxury text-3xl sm:text-5xl text-white tracking-wider">
            TRACK YOUR ORDER
          </h1>
          <p className="text-zinc-500 text-xs sm:text-sm font-light max-w-md mx-auto leading-relaxed">
            Enter your 11-digit phone number or the Order ID sent to your email to track the fulfillment status of your luxury statements.
          </p>
        </div>

        {/* Search Panel */}
        <div className="bg-zinc-900/30 border border-zinc-900 p-6 sm:p-8 rounded-2xl max-w-xl mx-auto">
          <form onSubmit={handleTrackSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                Phone Number or Order ID
              </label>
              <div className="relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  required
                  placeholder="e.g. 017XXXXXXXX or 02038e37-..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 focus:border-amber-500 rounded-full pl-10 pr-4 py-3.5 text-xs text-white focus:outline-none transition-colors"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold uppercase tracking-widest text-xs py-3.5 rounded-full transition-all disabled:opacity-50"
            >
              {loading ? 'SEARCHING DETAILS...' : 'TRACK SHIPMENT'}
            </button>
          </form>
        </div>

        {/* Results Panel */}
        {searched && (
          <div className="space-y-8 animate-fadeIn">
            {loading ? (
              <div className="flex h-40 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-amber-500"></div>
              </div>
            ) : error ? (
              <div className="text-center p-12 border border-dashed border-zinc-900 rounded-2xl text-zinc-500 max-w-xl mx-auto flex flex-col items-center justify-center gap-3">
                <AlertCircle className="text-red-500" size={32} />
                <p className="text-sm font-light leading-relaxed">{error}</p>
              </div>
            ) : (
              <div className="space-y-10">
                {orders.map((order) => {
                  const step = getStatusStep(order.status)
                  return (
                    <div key={order.id} className="bg-zinc-900/40 border border-zinc-900 rounded-2xl overflow-hidden divide-y divide-zinc-950">
                      
                      {/* Order Header Summary */}
                      <div className="p-6 sm:p-8 flex flex-col sm:flex-row justify-between gap-4 bg-zinc-900/20">
                        <div>
                          <p className="text-[9px] font-semibold text-zinc-500 uppercase tracking-widest">Order ID</p>
                          <p className="text-xs sm:text-sm font-mono font-semibold text-white mt-1 break-all">{order.id}</p>
                          <p className="text-[10px] text-zinc-500 mt-1">
                            Placed on {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex flex-col sm:items-end justify-between">
                          <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded border ${
                            order.status === 'Shipped' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            order.status === 'Confirmed' ? 'bg-sky-500/10 text-sky-400 border-sky-500/20' :
                            order.status === 'Cancelled' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                            'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}>
                            {order.status}
                          </span>
                          {order.steadfast_tracking_code && (
                            <p className="text-[10px] text-zinc-500 font-mono mt-2">
                              Consignment: <strong className="text-white">{order.steadfast_tracking_code}</strong>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Stepper Progress Bar */}
                      {step !== -1 && (
                        <div className="p-6 sm:p-8">
                          <div className="flex items-center justify-between relative max-w-md mx-auto py-4">
                            {/* Horizontal Line behind icons */}
                            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2px] bg-zinc-900 z-0"></div>
                            <div 
                              className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-amber-500 transition-all duration-500 z-0" 
                              style={{ width: `${((step - 1) / 3) * 100}%` }}
                            ></div>

                            {/* Stepper Items */}
                            {[
                              { label: 'Pending', icon: Clock },
                              { label: 'Confirmed', icon: CheckCircle2 },
                              { label: 'Shipped', icon: Truck },
                              { label: 'Delivered', icon: Check }
                            ].map((s, idx) => {
                              const active = idx + 1 <= step
                              const Icon = s.icon
                              return (
                                <div key={s.label} className="relative z-10 flex flex-col items-center gap-2">
                                  <div className={`h-8 w-8 rounded-full border flex items-center justify-center transition-all ${
                                    active 
                                      ? 'bg-amber-500 border-amber-500 text-zinc-950 shadow-[0_0_15px_rgba(245,158,11,0.2)]' 
                                      : 'bg-zinc-950 border-zinc-900 text-zinc-500'
                                  }`}>
                                    <Icon size={14} className={active ? 'stroke-[2.5]' : 'stroke-[1.5]'} />
                                  </div>
                                  <span className={`text-[10px] font-semibold uppercase tracking-wider ${active ? 'text-white' : 'text-zinc-650'}`}>
                                    {s.label}
                                  </span>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      {/* Order Items & Total details */}
                      <div className="p-6 sm:p-8 space-y-4">
                        <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Order Items</h4>
                        <div className="space-y-3.5">
                          {order.items?.map((item) => (
                            <div key={item.id} className="flex justify-between items-center text-xs sm:text-sm">
                              <span className="text-zinc-400 font-light">
                                {item.name} <strong className="text-zinc-500 text-xs">x{item.quantity}</strong>
                              </span>
                              <span className="text-white font-medium">৳{(item.discount_price || item.price) * item.quantity}</span>
                            </div>
                          ))}
                          {order.shipping_cost !== undefined && order.shipping_cost !== null && (
                            <div className="flex justify-between text-xs sm:text-sm text-zinc-500">
                              <span>Shipping Cost</span>
                              <span>৳{order.shipping_cost}</span>
                            </div>
                          )}
                          {order.discount_amount > 0 && (
                            <div className="flex justify-between text-xs sm:text-sm text-red-400">
                              <span>Discount Applied</span>
                              <span>-৳{order.discount_amount}</span>
                            </div>
                          )}
                          <div className="border-t border-zinc-850 pt-4 flex justify-between text-sm sm:text-base font-bold text-white">
                            <span>Total Amount</span>
                            <span className="text-amber-500">৳{order.total_amount}</span>
                          </div>
                        </div>
                      </div>

                      {/* Shipping address details */}
                      <div className="p-6 sm:p-8 flex items-start space-x-3.5">
                        <MapPin size={18} className="text-amber-500 mt-0.5" />
                        <div>
                          <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Delivery Destination</h4>
                          <p className="text-sm text-zinc-300 font-light mt-1.5 leading-relaxed">{order.customer_name}</p>
                          <p className="text-xs text-zinc-500 font-light mt-1 leading-relaxed">{order.delivery_address}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Customer Support Footer Banner */}
        <div className="bg-zinc-900/20 border border-zinc-900/60 p-6 rounded-2xl max-w-xl mx-auto text-center space-y-3.5">
          <Phone className="h-6 w-6 text-amber-500 mx-auto stroke-[1.2]" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-white">Need Delivery Support?</h3>
          <p className="text-zinc-500 text-xs font-light max-w-sm mx-auto leading-relaxed">
            If you face any issues tracking your shipment, or wish to edit your delivery address, please reach out to our helpdesk:
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
            <a 
              href="tel:01410288630"
              className="text-white hover:text-amber-500 transition-colors font-bold text-sm"
            >
              Call: 01410-288630
            </a>
            <span className="hidden sm:inline text-zinc-700">|</span>
            <a 
              href="https://wa.me/8801410288630" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-emerald-400 hover:underline transition-colors font-semibold text-xs flex items-center gap-1"
            >
              Send WhatsApp Message
            </a>
          </div>
        </div>

      </div>
    </div>
  )
}
