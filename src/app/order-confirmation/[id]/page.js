'use client'

import React, { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { Check, Package, MapPin, Phone, CreditCard } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function OrderConfirmationPage({ params, searchParams }) {
  const unwrappedParams = params && typeof params.then === 'function' ? use(params) : params
  const id = unwrappedParams?.id
  const resolvedSearchParams = searchParams && typeof searchParams.then === 'function' ? use(searchParams) : searchParams
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

  useEffect(() => {
    if (order && typeof window !== 'undefined') {
      const trackedOrders = JSON.parse(localStorage.getItem('mazish_tracked_orders') || '[]')
      if (trackedOrders.includes(order.id)) {
        console.log(`Order ${order.id} already tracked. Skipping duplicate dataLayer push.`);
        return
      }

      window.dataLayer = window.dataLayer || []
      window.dataLayer.push({ ecommerce: null })
      window.dataLayer.push({
        event: 'purchase',
        ecommerce: {
          transaction_id: order.id,
          value: parseFloat(order.total_amount || 0),
          tax: 0,
          shipping: parseFloat(order.shipping_cost || 0),
          currency: 'BDT',
          coupon: order.promo_code || undefined,
          items: order.items?.map(item => ({
            item_id: item.id,
            item_name: item.name,
            price: item.discount_price || item.price,
            item_category: item.category,
            item_gender: item.gender,
            quantity: item.quantity
          }))
        }
      })

      // Mark as tracked
      trackedOrders.push(order.id)
      localStorage.setItem('mazish_tracked_orders', JSON.stringify(trackedOrders))
    }
  }, [order])

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-warm-bg dark:bg-[#111111] transition-colors duration-300">
        <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-primary-yellow"></div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-[70vh] bg-warm-bg dark:bg-[#111111] px-4 py-20 text-center flex flex-col items-center justify-center transition-colors duration-300">
        <h2 className="font-luxury text-2xl sm:text-3xl text-charcoal dark:text-white mb-4">Order Not Found</h2>
        <p className="text-secondary-text mb-8 max-w-sm font-light text-xs sm:text-sm">We could not locate this order. Please verify your order ID.</p>
        <Link href="/" className="text-charcoal dark:text-white border border-soft-border px-6 py-2.5 rounded-full hover:bg-charcoal hover:text-warm-bg transition-all font-semibold uppercase text-xs tracking-wider">
          Return to Store
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-warm-bg dark:bg-[#111111] min-h-screen py-16 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-3xl mx-auto space-y-12">
        {/* Success Header */}
        <div className="text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10 border border-success/20 text-success">
            <Check size={28} className="stroke-[2.5]" />
          </div>
          <span className="text-[10px] font-bold text-primary-yellow tracking-[0.2em] uppercase">
            Order Complete
          </span>
          <h1 className="font-luxury text-2xl sm:text-3xl text-charcoal dark:text-white tracking-wider uppercase">
            THANK YOU FOR YOUR PURCHASE
          </h1>
          <p className="text-secondary-text text-xs sm:text-sm font-light max-w-md mx-auto leading-relaxed">
            Your order is being processed. We will contact you shortly to confirm your dispatch.
          </p>
        </div>

        {/* Announcement Banner */}
        <div className="bg-primary-yellow/5 border border-primary-yellow/15 rounded-2xl p-6 text-center space-y-4">
          <p className="text-secondary-text text-xs sm:text-sm font-light leading-relaxed max-w-xl mx-auto">
            If you do not receive a confirmation call within the next <strong>24 hours</strong>, please call us directly or send a message to our Facebook page.
          </p>
          <div className="flex flex-wrap gap-4 justify-center items-center">
            <a href="tel:01410288630" className="inline-flex items-center gap-2 bg-charcoal text-warm-bg dark:bg-primary-yellow dark:text-charcoal text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-full transition-all shadow-md">
              <Phone size={12} />
              Call 01410288630
            </a>
            <a href="https://www.facebook.com/profile.php?id=61590005602732" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 border border-soft-border bg-pure-white hover:bg-charcoal hover:text-warm-bg dark:bg-[#191919] dark:hover:bg-primary-yellow dark:hover:text-charcoal text-charcoal dark:text-white text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-full transition-all">
              Message on Facebook
            </a>
          </div>
        </div>

        {/* Order Details Card */}
        <div className="bg-pure-white dark:bg-[#191919] border border-soft-border rounded-2xl overflow-hidden divide-y divide-soft-border shadow-md">
          {/* Header Info */}
          <div className="p-6 sm:p-8 flex flex-col sm:flex-row justify-between gap-4 bg-cream-surface/20">
            <div>
              <p className="text-[10px] font-bold text-secondary-text uppercase tracking-widest">Order ID</p>
              <p className="text-xs sm:text-sm font-mono font-semibold text-charcoal dark:text-white mt-1 break-all">{order.id}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-secondary-text uppercase tracking-widest">Order Status</p>
              <span className="inline-block bg-primary-yellow/10 text-charcoal dark:text-primary-yellow border border-primary-yellow/20 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded mt-1">
                {order.status}
              </span>
            </div>
          </div>

          {/* Customer & Shipping Details */}
          <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-start space-x-3.5">
                <MapPin size={18} className="text-primary-yellow mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-charcoal dark:text-white uppercase tracking-wider">Delivery Destination</h4>
                  <p className="text-xs sm:text-sm text-secondary-text font-light mt-1.5 leading-relaxed">{order.customer_name}</p>
                  <p className="text-xs sm:text-sm text-secondary-text font-light mt-1 leading-relaxed">{order.delivery_address || order.shipping_address}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3.5">
                <Phone size={18} className="text-primary-yellow mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-charcoal dark:text-white uppercase tracking-wider">Contact Info</h4>
                  <p className="text-xs sm:text-sm text-secondary-text font-light mt-1.5">Phone: {order.phone || order.customer_phone}</p>
                  {order.email && <p className="text-xs text-secondary-text font-light mt-1">Email: {order.email}</p>}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-3.5">
                <CreditCard size={18} className="text-primary-yellow mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-charcoal dark:text-white uppercase tracking-wider">Payment Details</h4>
                  <p className="text-xs sm:text-sm text-secondary-text font-light mt-1.5 uppercase tracking-wide">{order.payment_method}</p>
                  {order.payment_details && order.payment_details !== 'N/A' && (
                    <p className="text-xs text-secondary-text font-light mt-1 font-mono break-all">{order.payment_details}</p>
                  )}
                </div>
              </div>

              {order.steadfast_tracking_code && (
                <div className="flex items-start space-x-3.5">
                  <Package size={18} className="text-primary-yellow mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-charcoal dark:text-white uppercase tracking-wider">Steadfast Tracking</h4>
                    <p className="text-xs sm:text-sm text-secondary-text font-medium mt-1.5">{order.steadfast_tracking_code}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Items Summary */}
          <div className="p-6 sm:p-8 space-y-4">
            <h4 className="text-xs font-bold text-charcoal dark:text-white uppercase tracking-wider mb-2">Order Items</h4>
            <div className="space-y-3.5">
              {order.items?.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="text-secondary-text font-light">
                    {item.name} <strong className="text-secondary-text font-bold text-xs">x{item.quantity}</strong>
                  </span>
                  <span className="text-charcoal dark:text-white font-medium">৳{(item.discount_price || item.price) * item.quantity}</span>
                </div>
              ))}
              {order.shipping_cost !== undefined && order.shipping_cost !== null && (
                <div className="flex justify-between text-xs sm:text-sm text-secondary-text">
                  <span>Shipping Cost</span>
                  <span>৳{order.shipping_cost}</span>
                </div>
              )}
              {order.discount_amount > 0 && (
                <div className="flex justify-between text-xs sm:text-sm text-error font-medium">
                  <span>Discount</span>
                  <span>-৳{order.discount_amount}</span>
                </div>
              )}
              <div className="border-t border-soft-border pt-4 flex justify-between text-sm sm:text-base font-bold text-charcoal dark:text-white">
                <span>Total Paid</span>
                <span className="text-charcoal dark:text-white">৳{order.total_amount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Links */}
        <div className="flex items-center justify-center pt-4">
          <Link
            href="/"
            className="w-full sm:w-auto text-center bg-charcoal text-warm-bg dark:bg-primary-yellow dark:text-charcoal font-bold uppercase tracking-widest text-[10px] px-10 py-4 rounded-full transition-all duration-300 shadow-md cursor-pointer"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}
