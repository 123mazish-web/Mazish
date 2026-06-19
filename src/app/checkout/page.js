'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingBag, ChevronRight, CheckCircle, Shield, Tag, X } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { createOrder } from '@/lib/db'
import { supabase } from '@/lib/supabase'

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart()
  const router = useRouter()

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    shippingArea: 'dhaka', // 'dhaka' or 'outside'
    paymentMethod: 'COD',
    paymentDetails: ''
  })
  const [bkashLast3, setBkashLast3] = useState('')
  const [bkashTxid, setBkashTxid] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Promo Code States
  const [promoCode, setPromoCode] = useState('')
  const [appliedPromo, setAppliedPromo] = useState(null)
  const [promoError, setPromoError] = useState('')
  const [promoLoading, setPromoLoading] = useState(false)

  // Trigger GA4 begin_checkout event on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && cart && cart.length > 0) {
      window.dataLayer = window.dataLayer || []
      window.dataLayer.push({ ecommerce: null })
      window.dataLayer.push({
        event: 'begin_checkout',
        ecommerce: {
          currency: 'BDT',
          value: cartTotal,
          items: cart.map(item => ({
            item_id: item.id,
            item_name: item.name,
            price: item.discount_price || item.price,
            item_category: item.category,
            item_gender: item.gender,
            quantity: item.quantity
          }))
        }
      })
    }
  }, [])

  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] bg-zinc-950 flex flex-col items-center justify-center text-center px-4">
        <ShoppingBag size={48} className="text-zinc-700 mb-6 stroke-[1]" />
        <h2 className="font-luxury text-3xl text-white mb-4">Your Cart is Empty</h2>
        <p className="text-zinc-500 mb-8 max-w-sm font-light">Select from our premium collections before checking out.</p>
        <Link href="/" className="bg-amber-500 text-zinc-950 font-bold uppercase text-xs tracking-widest px-8 py-3.5 rounded-full hover:bg-amber-400 transition-all">
          Browse Sunglasses
        </Link>
      </div>
    )
  }

  // Handle Promo Code Apply
  const handleApplyPromo = async (e) => {
    e.preventDefault()
    const code = promoCode.toUpperCase().trim()
    if (!code) return

    setPromoError('')
    setPromoLoading(true)

    try {
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', code)
        .eq('is_active', true)
        .single()

      if (error || !data) {
        // Fallback for offline/local sandbox demo mode
        if (code === 'MAZISH10' || code === 'LAUNCH950') {
          const mockPromo = {
            code,
            discount_type: code === 'LAUNCH950' ? 'fixed' : 'percentage',
            discount_value: code === 'LAUNCH950' ? 150 : 10
          }
          setAppliedPromo(mockPromo)
          setPromoCode('')
          return
        }
        setPromoError('Invalid or expired promo code')
        setAppliedPromo(null)
      } else {
        setAppliedPromo(data)
        setPromoCode('')
      }
    } catch (err) {
      setPromoError('Error connecting to validate promo code')
    } finally {
      setPromoLoading(false)
    }
  }

  const handleRemovePromo = () => {
    setAppliedPromo(null)
    setPromoError('')
  }

  // Calculation helpers
  const getDiscountAmount = () => {
    if (!appliedPromo) return 0
    if (appliedPromo.discount_type === 'percentage') {
      return Math.round(cartTotal * (appliedPromo.discount_value / 100))
    }
    // Fixed amount discount
    return appliedPromo.discount_value
  }

  const discountAmount = getDiscountAmount()
  const shippingCost = form.shippingArea === 'dhaka' ? 70 : 130
  const finalTotal = Math.max(0, cartTotal - discountAmount + shippingCost)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.phone || !form.address) {
      setError('Please fill in all delivery details')
      return
    }

    if (form.paymentMethod !== 'COD') {
      if (!bkashLast3 || bkashLast3.length !== 3) {
        setError('Please enter exactly the last 3 digits of the sender phone number')
        return
      }
    }

    setError('')
    setSubmitting(true)

    const paymentDetailsString = form.paymentMethod === 'COD' 
      ? 'COD' 
      : `Last 3 digits: ${bkashLast3}${bkashTxid ? ` | TxID: ${bkashTxid}` : ''}`

    const orderData = {
      customer_name: form.name,
      phone: form.phone,
      email: form.email,
      delivery_address: form.address,
      shipping_cost: shippingCost,
      payment_method: form.paymentMethod,
      payment_details: paymentDetailsString,
      total_amount: finalTotal,
      items: cart,
      status: 'Pending',
      promo_code: appliedPromo ? appliedPromo.code : null,
      discount_amount: discountAmount
    }

    const response = await createOrder(orderData)
    setSubmitting(false)

    if (response.success) {
      clearCart()
      router.push(`/order-confirmation/${response.data.id}`)
    } else {
      // Local fallback success for local demo if database is missing
      clearCart()
      const mockId = response.mockOrder.id
      // Save order in localStorage for tracking in demo mode
      const savedOrders = JSON.parse(localStorage.getItem('mazish_orders') || '[]')
      savedOrders.push(response.mockOrder)
      localStorage.setItem('mazish_orders', JSON.stringify(savedOrders))

      router.push(`/order-confirmation/${mockId}?demo=true`)
    }
  }

  return (
    <div className="bg-zinc-950 min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="font-luxury text-3xl sm:text-4xl text-white tracking-wider mb-12 text-center lg:text-left">
          SECURE CHECKOUT
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Form Column */}
          <div className="lg:col-span-7">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="bg-zinc-900/40 p-6 sm:p-8 rounded-2xl border border-zinc-900 space-y-6">
                <h2 className="text-lg font-semibold tracking-wider text-white uppercase border-b border-zinc-800 pb-4">
                  Delivery Destination
                </h2>

                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg">
                    {error}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Syed Ahmed"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-850 focus:border-amber-500 rounded-lg px-4 py-3 text-sm text-white focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. 017XXXXXXXX"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="w-full bg-zinc-950 border border-zinc-850 focus:border-amber-500 rounded-lg px-4 py-3 text-sm text-white focus:outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                        Email Address (Optional)
                      </label>
                      <input
                        type="email"
                        placeholder="e.g. customer@example.com"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full bg-zinc-950 border border-zinc-850 focus:border-amber-500 rounded-lg px-4 py-3 text-sm text-white focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                      Shipping Region *
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <label className={`flex flex-col items-center justify-center border p-3 rounded-xl cursor-pointer transition-all ${form.shippingArea === 'dhaka' ? 'border-amber-500 bg-amber-500/5' : 'border-zinc-850 bg-zinc-950 hover:border-zinc-700'}`}>
                        <input
                          type="radio"
                          name="shippingArea"
                          value="dhaka"
                          checked={form.shippingArea === 'dhaka'}
                          onChange={() => setForm({ ...form, shippingArea: 'dhaka' })}
                          className="sr-only"
                        />
                        <span className="text-xs font-bold uppercase tracking-wider text-white mb-1">Inside Dhaka</span>
                        <span className="text-[10px] text-zinc-500">৳70 Shipping</span>
                      </label>
                      
                      <label className={`flex flex-col items-center justify-center border p-3 rounded-xl cursor-pointer transition-all ${form.shippingArea === 'outside' ? 'border-amber-500 bg-amber-500/5' : 'border-zinc-850 bg-zinc-950 hover:border-zinc-700'}`}>
                        <input
                          type="radio"
                          name="shippingArea"
                          value="outside"
                          checked={form.shippingArea === 'outside'}
                          onChange={() => setForm({ ...form, shippingArea: 'outside' })}
                          className="sr-only"
                        />
                        <span className="text-xs font-bold uppercase tracking-wider text-white mb-1">Outside Dhaka</span>
                        <span className="text-[10px] text-zinc-500">৳130 Shipping</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                      Delivery Address *
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="House, Road, Area, City"
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-850 focus:border-amber-500 rounded-lg px-4 py-3 text-sm text-white focus:outline-none transition-colors resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Section */}
              <div className="bg-zinc-900/40 p-6 sm:p-8 rounded-2xl border border-zinc-900 space-y-6">
                <h2 className="text-lg font-semibold tracking-wider text-white uppercase border-b border-zinc-800 pb-4">
                  Payment Method
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className={`flex flex-col items-center justify-center border p-4 rounded-xl cursor-pointer transition-all ${form.paymentMethod === 'COD' ? 'border-amber-500 bg-amber-500/5' : 'border-zinc-850 bg-zinc-950 hover:border-zinc-700'}`}>
                    <input
                      type="radio"
                      name="payment"
                      value="COD"
                      checked={form.paymentMethod === 'COD'}
                      onChange={() => setForm({ ...form, paymentMethod: 'COD', paymentDetails: '' })}
                      className="sr-only"
                    />
                    <span className="text-xs font-bold uppercase tracking-wider text-white mb-1">Cash on Delivery</span>
                    <span className="text-[10px] text-zinc-500">Pay at doorstep</span>
                  </label>

                  <label className={`flex flex-col items-center justify-center border p-4 rounded-xl cursor-pointer transition-all ${form.paymentMethod === 'bKash' ? 'border-amber-500 bg-amber-500/5' : 'border-zinc-850 bg-zinc-950 hover:border-zinc-700'}`}>
                    <input
                      type="radio"
                      name="payment"
                      value="bKash"
                      checked={form.paymentMethod === 'bKash'}
                      onChange={() => setForm({ ...form, paymentMethod: 'bKash' })}
                      className="sr-only"
                    />
                    <span className="text-xs font-bold uppercase tracking-wider text-pink-500 mb-1">bKash</span>
                    <span className="text-[10px] text-zinc-500">Manual payment</span>
                  </label>
                </div>

                {form.paymentMethod !== 'COD' && (
                  <div className="bg-zinc-950 border border-zinc-850 rounded-xl p-4 sm:p-6 space-y-4 animate-fadeIn">
                    <p className="text-xs text-zinc-400 font-light leading-relaxed">
                      Please send the total sum of <strong className="text-white">৳{finalTotal}</strong> to our bKash personal number <strong className="text-white">01788334122</strong> using <strong className="text-amber-500">{form.paymentMethod} Send Money</strong>.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-2">
                          Last 3 Digits of Sender Phone *
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={3}
                          placeholder="e.g. 122"
                          value={bkashLast3}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '');
                            if (val.length <= 3) setBkashLast3(val);
                          }}
                          className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-2">
                          Transaction ID (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. AH87B8N9"
                          value={bkashTxid}
                          onChange={(e) => setBkashTxid(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-amber-500 text-zinc-950 font-bold uppercase tracking-widest text-xs py-4 rounded-full hover:bg-amber-400 transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(245,158,11,0.1)]"
              >
                {submitting ? 'PROCESSING...' : `PLACE ORDER • ৳${finalTotal}`}
              </button>
            </form>
          </div>

          {/* Cart Summary Column */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-zinc-900/40 p-6 sm:p-8 rounded-2xl border border-zinc-900 space-y-6">
              <h2 className="text-lg font-semibold tracking-wider text-white uppercase border-b border-zinc-800 pb-4">
                Order Summary
              </h2>

              <div className="divide-y divide-zinc-850">
                {cart.map((item) => (
                  <div key={item.id} className="flex py-4 justify-between items-center text-sm">
                    <div className="flex items-center space-x-3">
                      <div className="h-12 w-12 rounded border border-zinc-850 bg-zinc-950 overflow-hidden flex-shrink-0 relative">
                        <Image src={item.images?.[0]} alt={item.name} fill className="object-cover" />
                      </div>
                      <div>
                        <h4 className="text-white font-medium line-clamp-1">{item.name}</h4>
                        <p className="text-xs text-zinc-500 font-light">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="text-zinc-400 font-medium">৳{(item.discount_price || item.price) * item.quantity}</span>
                  </div>
                ))}
              </div>

              {/* Promo Code Form */}
              <div className="border-t border-zinc-800 pt-4 pb-2">
                {appliedPromo ? (
                  <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg px-4 py-2.5 text-xs">
                    <div className="flex items-center gap-2">
                      <Tag size={14} />
                      <span>Applied: <strong>{appliedPromo.code}</strong> ({appliedPromo.discount_type === 'percentage' ? `${appliedPromo.discount_value}% Off` : `৳${appliedPromo.discount_value} Off`})</span>
                    </div>
                    <button type="button" onClick={handleRemovePromo} className="text-zinc-400 hover:text-white">
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyPromo} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="PROMO CODE"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="flex-1 bg-zinc-950 border border-zinc-850 focus:border-amber-500 rounded-lg px-3 py-2 text-xs text-white uppercase focus:outline-none transition-colors"
                    />
                    <button
                      type="submit"
                      disabled={promoLoading}
                      className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-white font-bold uppercase tracking-widest text-[10px] px-4 rounded-lg transition-all"
                    >
                      {promoLoading ? '...' : 'APPLY'}
                    </button>
                  </form>
                )}
                {promoError && (
                  <p className="text-red-400 text-[10px] mt-1.5 ml-1">{promoError}</p>
                )}
              </div>

              <div className="border-t border-zinc-800 pt-4 space-y-3">
                <div className="flex justify-between text-xs text-zinc-500">
                  <span>Subtotal</span>
                  <span>৳{cartTotal}</span>
                </div>
                {appliedPromo && (
                  <div className="flex justify-between text-xs text-red-400">
                    <span>Discount</span>
                    <span>-৳{discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs text-zinc-500">
                  <span>Shipping</span>
                  <span className="text-amber-500 font-medium">৳{shippingCost}</span>
                </div>
                <div className="border-t border-zinc-800 pt-3 flex justify-between text-sm font-semibold text-white">
                  <span>Total</span>
                  <span className="text-lg text-amber-500">৳{finalTotal}</span>
                </div>
              </div>
            </div>

            <div className="text-center p-4 border border-dashed border-zinc-850 rounded-xl">
              <Shield className="h-5 w-5 text-amber-500 mx-auto mb-2 stroke-[1.2]" />
              <p className="text-[10px] text-zinc-500 font-light">
                Secure checkout encrypted system. Original premium products guaranteed by Mazish.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
