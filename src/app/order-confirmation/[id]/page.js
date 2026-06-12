'use client'

import React, { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { Check, Package, MapPin, Phone, CreditCard, ShoppingBag } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function OrderConfirmationPage({ params, searchParams }) {
  const { id } = use(params)
  const resolvedSearchParams = use(searchParams)
  const isDemo = resolvedSearchParams?.demo === 'true'

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadOrder() {
      if (isDemo) {
        // Fetch from local storage demo orders
        const savedOrders = JSON.parse(localStorage.getItem('mazish_orders') || '[]')
        const found = savedOrders.find(o => o.id === id)
        setOrder(found)
      } else {
        try {
          const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('id', id)
            .single()

          if (!error && data) {
            setOrder(data)
          } else {
            // Check local storage just in case
            const savedOrders = JSON.parse(localStorage.getItem('mazish_orders') || '[]')
            const found = savedOrders.find(o => o.id === id)
            setOrder(found)
          }
        } catch (e) {
          console.error("Failed to load order from database:", e)
        }
      }
      setLoading(false)
    }

    if (id) {
      loadOrder()
    }
  }, [id, isDemo])

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-zinc-950">
        <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-amber-500"></div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-[70vh] bg-zinc-950 px-4 py-20 text-center flex flex-col items-center justify-center">
        <h2 className="font-luxury text-3xl text-white mb-4">Order Not Found</h2>
        <p className="text-zinc-500 mb-8 max-w-sm font-light">We could not locate this order. Please verify your order ID.</p>
        <Link href="/" className="text-amber-500 border border-amber-500/30 px-6 py-2.5 rounded-full hover:bg-amber-500 hover:text-zinc-950 transition-all font-semibold uppercase text-xs tracking-wider">
          Return to Store
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-zinc-950 min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-12">
        {/* Success Header */}
        <div className="text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Check size={32} className="stroke-[2.5]" />
          </div>
          <span className="text-[10px] font-semibold text-amber-500 tracking-[0.2em] uppercase">
            Order Complete
          </span>
          <h1 className="font-luxury text-3xl sm:text-4xl text-white tracking-wider">
            THANK YOU FOR YOUR PURCHASE
          </h1>
          <p className="text-zinc-500 text-sm font-light max-w-md mx-auto leading-relaxed">
            Your order is being processed. We will contact you shortly to confirm your dispatch.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-zinc-900/40 border border-zinc-900 rounded-2xl overflow-hidden divide-y divide-zinc-950">
          {/* Header Info */}
          <div className="p-6 sm:p-8 flex flex-col sm:flex-row justify-between gap-4 bg-zinc-900/20">
            <div>
              <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">Order ID</p>
              <p className="text-sm font-semibold text-white mt-1 break-all">{order.id}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">Order Status</p>
              <span className="inline-block bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded mt-1">
                {order.status}
              </span>
            </div>
          </div>

          {/* Customer & Shipping Details */}
          <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-start space-x-3.5">
                <MapPin size={18} className="text-amber-500 mt-0.5" />
                <div>
                  <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Delivery Destination</h4>
                  <p className="text-sm text-zinc-300 font-light mt-1.5 leading-relaxed">{order.customer_name}</p>
                  <p className="text-sm text-zinc-500 font-light mt-1 leading-relaxed">{order.delivery_address}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3.5">
                <Phone size={18} className="text-amber-500 mt-0.5" />
                <div>
                  <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Contact Number</h4>
                  <p className="text-sm text-zinc-300 font-light mt-1.5">{order.phone}</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-3.5">
                <CreditCard size={18} className="text-amber-500 mt-0.5" />
                <div>
                  <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Payment Details</h4>
                  <p className="text-sm text-zinc-300 font-light mt-1.5 uppercase tracking-wide">{order.payment_method}</p>
                  {order.payment_details && order.payment_details !== 'N/A' && (
                    <p className="text-xs text-zinc-500 font-light mt-1 font-mono">TXID: {order.payment_details}</p>
                  )}
                </div>
              </div>

              {order.steadfast_tracking_code && (
                <div className="flex items-start space-x-3.5">
                  <Package size={18} className="text-amber-500 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Steadfast Tracking</h4>
                    <p className="text-sm text-zinc-300 font-medium mt-1.5">{order.steadfast_tracking_code}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Items Summary */}
          <div className="p-6 sm:p-8 space-y-4">
            <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Order Items</h4>
            <div className="space-y-3.5">
              {order.items?.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-sm">
                  <span className="text-zinc-400 font-light">
                    {item.name} <strong className="text-zinc-500 text-xs">x{item.quantity}</strong>
                  </span>
                  <span className="text-white font-medium">৳{item.price * item.quantity}</span>
                </div>
              ))}
              <div className="border-t border-zinc-850 pt-4 flex justify-between text-base font-bold text-white">
                <span>Total Paid</span>
                <span className="text-amber-500">৳{order.total_amount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Links */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/"
            className="w-full sm:w-auto text-center bg-zinc-900 border border-zinc-850 hover:bg-white hover:text-zinc-950 text-white font-bold uppercase tracking-widest text-xs px-8 py-3.5 rounded-full transition-all duration-300"
          >
            Continue Shopping
          </Link>
          <a
            href="https://wa.me/+8801700000000"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto text-center bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold uppercase tracking-widest text-xs px-8 py-3.5 rounded-full transition-all duration-300"
          >
            WhatsApp Support
          </a>
        </div>
      </div>
    </div>
  )
}
