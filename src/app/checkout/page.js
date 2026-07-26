'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ShoppingBag, ChevronRight, Shield, Tag, X } from 'lucide-react'
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
      <div className="min-h-[70vh] bg-warm-bg flex flex-col items-center justify-center text-center px-4 transition-colors duration-300">
        <ShoppingBag size={44} className="text-secondary-text/30 mb-6 stroke-[1]" />
        <h2 className="font-luxury text-[34px] text-charcoal mb-4">Your Bag is Empty</h2>
        <p className="text-secondary-text mb-8 max-w-sm font-light text-[16px]">Select from our premium collections before checking out.</p>
        <Link href="/shop" className="bg-primary-yellow hover:bg-deep-yellow text-charcoal font-bold uppercase text-[15px] tracking-widest px-8 py-3.5 rounded-lg transition-all min-h-[44px] flex items-center justify-center">
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
      } else {
        setAppliedPromo(data)
        setPromoCode('')
      }
    } catch (err) {
      setPromoError('Error applying promo code')
    } finally {
      setPromoLoading(false)
    }
  }

  const handleRemovePromo = () => {
    setAppliedPromo(null)
    setPromoError('')
  }

  // Calculate discount amount
  let discountAmount = 0
  if (appliedPromo) {
    if (appliedPromo.discount_type === 'percentage') {
      discountAmount = Math.round((cartTotal * appliedPromo.discount_value) / 100)
    } else if (appliedPromo.discount_type === 'fixed') {
      discountAmount = appliedPromo.discount_value
    }
  }

  const shippingCost = form.shippingArea === 'dhaka' ? 70 : 130
  const finalTotal = Math.max(0, cartTotal - discountAmount + shippingCost)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return

    setError('')
    setSubmitting(true)

    try {
      if (!form.name.trim() || !form.phone.trim() || !form.address.trim()) {
        throw new Error('Please fill in all required fields.')
      }

      const phoneClean = form.phone.trim()
      if (!/^01[3-9]\d{8}$/.test(phoneClean)) {
        throw new Error('Please enter a valid 11-digit Bangladeshi mobile number.')
      }

      let paymentDetails = ''
      if (form.paymentMethod === 'bKash') {
        if (!bkashLast3 || bkashLast3.length !== 3) {
          throw new Error('Please specify the last 3 digits of your bKash number.')
        }
        paymentDetails = `[Manual] bKash last 3 digits: ${bkashLast3}${bkashTxid ? ` (TxID: ${bkashTxid})` : ''}`
      }

      const orderPayload = {
        customer_name: form.name.trim(),
        customer_phone: phoneClean,
        customer_email: form.email.trim() || null,
        shipping_address: form.address.trim(),
        shipping_area: form.shippingArea,
        payment_method: form.paymentMethod,
        payment_details: paymentDetails,
        total_amount: finalTotal,
        discount_amount: discountAmount,
        shipping_cost: shippingCost,
        promo_code: appliedPromo?.code || null,
        status: 'Pending',
        items: cart.map(item => ({
          product_id: item.id,
          name: item.name,
          price: item.discount_price || item.price,
          quantity: item.quantity,
          image: item.images?.[0] || '/images/Sunglass1.png'
        }))
      }

      const savedOrder = await createOrder(orderPayload)

      if (!savedOrder) {
        throw new Error('Failed to complete checkout. Please try again.')
      }

      try {
        await fetch('/api/orders/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: savedOrder })
        })
      } catch (tgErr) {
        console.error("Telegram notify failed:", tgErr)
      }

      if (typeof window !== 'undefined') {
        window.dataLayer = window.dataLayer || []
        window.dataLayer.push({ ecommerce: null })
        window.dataLayer.push({
          event: 'purchase',
          ecommerce: {
            transaction_id: savedOrder.id.toString(),
            value: finalTotal,
            currency: 'BDT',
            tax: 0,
            shipping: shippingCost,
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

      clearCart()
      router.push(`/order-confirmation/${savedOrder.id}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-warm-bg min-h-screen py-16 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center space-x-2 text-xs tracking-wider uppercase text-secondary-text mb-12 justify-center lg:justify-start">
          <Link href="/" className="hover:text-charcoal">Home</Link>
          <ChevronRight size={12} />
          <Link href="/shop" className="hover:text-charcoal">Shop</Link>
          <ChevronRight size={12} />
          <span className="text-charcoal font-bold">Secure Checkout</span>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-error/10 border border-error/20 text-error text-[16px] font-semibold rounded-xl text-center">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          
          {/* Checkout Form Column */}
          <div className="lg:col-span-7 space-y-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Delivery Details */}
              <div className="bg-white p-6 sm:p-8 rounded-xl border border-soft-border space-y-6 shadow-sm">
                <h2 className="text-[18px] sm:text-[20px] font-bold tracking-wider text-charcoal uppercase border-b border-soft-border pb-4">
                  Delivery Details
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[12px] sm:text-[13px] font-bold uppercase tracking-wider text-charcoal mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Enter your name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full bg-[#F8F6F1] border border-soft-border focus:border-charcoal focus:outline-none rounded-lg px-4 py-3 text-[16px] text-charcoal transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[12px] sm:text-[13px] font-bold uppercase tracking-wider text-charcoal mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. 017XXXXXXXX"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="w-full bg-[#F8F6F1] border border-soft-border focus:border-charcoal focus:outline-none rounded-lg px-4 py-3 text-[16px] text-charcoal transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[12px] sm:text-[13px] font-bold uppercase tracking-wider text-charcoal mb-2">
                        Email Address (Optional)
                      </label>
                      <input
                        type="email"
                        placeholder="e.g. customer@example.com"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full bg-[#F8F6F1] border border-soft-border focus:border-charcoal focus:outline-none rounded-lg px-4 py-3 text-[16px] text-charcoal transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[12px] sm:text-[13px] font-bold uppercase tracking-wider text-charcoal mb-2">
                      Shipping Region *
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <label className={`flex flex-col items-center justify-center border p-3.5 rounded-xl cursor-pointer transition-all ${form.shippingArea === 'dhaka' ? 'border-primary-yellow bg-[#FFF9E8]' : 'border-soft-border bg-white'}`}>
                        <input
                          type="radio"
                          name="shippingArea"
                          value="dhaka"
                          checked={form.shippingArea === 'dhaka'}
                          onChange={() => setForm({ ...form, shippingArea: 'dhaka' })}
                          className="sr-only"
                        />
                        <span className="text-[12px] sm:text-[13px] font-bold uppercase tracking-wider text-charcoal mb-1">Inside Dhaka</span>
                        <span className="text-[12px] text-secondary-text">৳70 Shipping</span>
                      </label>
                      
                      <label className={`flex flex-col items-center justify-center border p-3.5 rounded-xl cursor-pointer transition-all ${form.shippingArea === 'outside' ? 'border-primary-yellow bg-[#FFF9E8]' : 'border-soft-border bg-white'}`}>
                        <input
                          type="radio"
                          name="shippingArea"
                          value="outside"
                          checked={form.shippingArea === 'outside'}
                          onChange={() => setForm({ ...form, shippingArea: 'outside' })}
                          className="sr-only"
                        />
                        <span className="text-[12px] sm:text-[13px] font-bold uppercase tracking-wider text-charcoal mb-1">Outside Dhaka</span>
                        <span className="text-[12px] text-secondary-text">৳130 Shipping</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[12px] sm:text-[13px] font-bold uppercase tracking-wider text-charcoal mb-2">
                      Delivery Address *
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="House, Road, Area, City"
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      className="w-full bg-[#F8F6F1] border border-soft-border focus:border-charcoal focus:outline-none rounded-lg px-4 py-3 text-[16px] text-charcoal transition-colors resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Section */}
              <div className="bg-white p-6 sm:p-8 rounded-xl border border-soft-border space-y-6 shadow-sm">
                <h2 className="text-[18px] sm:text-[20px] font-bold tracking-wider text-charcoal uppercase border-b border-soft-border pb-4">
                  Payment Method
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className={`flex flex-col items-center justify-center border p-4 rounded-xl cursor-pointer transition-all ${form.paymentMethod === 'COD' ? 'border-primary-yellow bg-[#FFF9E8]' : 'border-soft-border bg-white'}`}>
                    <input
                      type="radio"
                      name="payment"
                      value="COD"
                      checked={form.paymentMethod === 'COD'}
                      onChange={() => setForm({ ...form, paymentMethod: 'COD', paymentDetails: '' })}
                      className="sr-only"
                    />
                    <span className="text-[12px] sm:text-[13px] font-bold uppercase tracking-wider text-charcoal mb-1">Cash on Delivery</span>
                    <span className="text-[12px] text-secondary-text">Pay at doorstep</span>
                  </label>

                  <label className={`flex flex-col items-center justify-center border p-4 rounded-xl cursor-pointer transition-all ${form.paymentMethod === 'bKash' ? 'border-primary-yellow bg-[#FFF9E8]' : 'border-soft-border bg-white'}`}>
                    <input
                      type="radio"
                      name="payment"
                      value="bKash"
                      checked={form.paymentMethod === 'bKash'}
                      onChange={() => setForm({ ...form, paymentMethod: 'bKash' })}
                      className="sr-only"
                    />
                    <span className="text-[12px] sm:text-[13px] font-bold uppercase tracking-wider text-pink-600 mb-1">bKash Personal</span>
                    <span className="text-[12px] text-secondary-text">Manual Send Money</span>
                  </label>
                </div>

                {form.paymentMethod !== 'COD' && (
                  <div className="bg-[#FFF9E8] border border-soft-border rounded-xl p-4 sm:p-6 space-y-4">
                    <p className="text-[14px] sm:text-[16px] text-secondary-text leading-relaxed">
                      Please send the total sum of <strong className="text-charcoal font-bold">৳{finalTotal}</strong> to our bKash personal number <strong className="text-charcoal font-bold">01788334122</strong> using Send Money.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-secondary-text mb-2">
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
                          className="w-full bg-white border border-soft-border focus:border-charcoal focus:outline-none rounded-lg px-4 py-2.5 text-[16px] text-charcoal transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-secondary-text mb-2">
                          Transaction ID (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. AH87B8N9"
                          value={bkashTxid}
                          onChange={(e) => setBkashTxid(e.target.value)}
                          className="w-full bg-white border border-soft-border focus:border-charcoal focus:outline-none rounded-lg px-4 py-2.5 text-[16px] text-charcoal transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-primary-yellow hover:bg-deep-yellow text-charcoal font-bold uppercase tracking-widest text-[14px] py-4 rounded-lg transition-all disabled:opacity-50 shadow-sm cursor-pointer min-h-[44px]"
              >
                {submitting ? 'PROCESSING...' : `PLACE ORDER • ৳${finalTotal}`}
              </button>
            </form>
          </div>

          {/* Cart Summary Column */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-white p-6 sm:p-8 rounded-xl border border-soft-border space-y-6 shadow-sm">
              <h2 className="text-[18px] sm:text-[20px] font-bold tracking-wider text-charcoal uppercase border-b border-soft-border pb-4">
                Order Summary
              </h2>

              <div className="divide-y divide-soft-border">
                {cart.map((item) => (
                  <div key={item.id} className="flex py-4 justify-between items-center text-[14px] sm:text-[16px]">
                    <div className="flex items-center space-x-3">
                      <div className="h-12 w-12 rounded-lg border border-soft-border bg-[#F8F6F1] overflow-hidden flex-shrink-0 relative">
                        <img src={item.images?.[0]} alt={item.name} className="object-cover w-full h-full" />
                      </div>
                      <div>
                        <h4 className="text-charcoal font-bold line-clamp-1 text-[14px] sm:text-[16px]">{item.name}</h4>
                        <p className="text-[12px] text-secondary-text font-light">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="text-charcoal font-medium">৳{(item.discount_price || item.price) * item.quantity}</span>
                  </div>
                ))}
              </div>

              {/* Promo Code Form */}
              <div className="border-t border-soft-border pt-4 pb-2">
                {appliedPromo ? (
                  <div className="flex items-center justify-between bg-[#FFF9E8] border border-primary-yellow/20 text-charcoal rounded-lg px-4 py-2.5 text-xs">
                    <div className="flex items-center gap-2">
                      <Tag size={12} />
                      <span>Applied: <strong>{appliedPromo.code}</strong> ({appliedPromo.discount_type === 'percentage' ? `${appliedPromo.discount_value}% Off` : `৳${appliedPromo.discount_value} Off`})</span>
                    </div>
                    <button type="button" onClick={handleRemovePromo} className="text-secondary-text hover:text-charcoal p-1">
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyPromo} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="PROMO CODE"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="flex-1 bg-white border border-soft-border focus:border-charcoal focus:outline-none rounded-lg px-3 py-2 text-xs text-charcoal uppercase transition-colors"
                    />
                    <button
                      type="submit"
                      disabled={promoLoading}
                      className="bg-charcoal text-warm-bg hover:bg-secondary-text font-bold uppercase tracking-widest text-[10px] px-4 rounded-lg transition-all cursor-pointer min-h-[36px]"
                    >
                      {promoLoading ? '...' : 'APPLY'}
                    </button>
                  </form>
                )}
                {promoError && (
                  <p className="text-error text-[12px] mt-1.5 ml-1">{promoError}</p>
                )}
              </div>

              <div className="border-t border-soft-border pt-4 space-y-3">
                <div className="flex justify-between text-[14px] text-secondary-text">
                  <span>Subtotal</span>
                  <span>৳{cartTotal}</span>
                </div>
                {appliedPromo && (
                  <div className="flex justify-between text-[14px] text-error font-medium">
                    <span>Discount</span>
                    <span>-৳{discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between text-[14px] text-secondary-text">
                  <span>Shipping</span>
                  <span>৳{shippingCost}</span>
                </div>
                <div className="border-t border-soft-border pt-3 flex justify-between text-[16px] sm:text-[18px] font-bold text-charcoal">
                  <span>Total</span>
                  <span className="text-[18px] sm:text-[20px] font-extrabold text-charcoal">৳{finalTotal}</span>
                </div>
              </div>
            </div>

            <div className="text-center p-4 border border-dashed border-soft-border rounded-xl bg-[#FFFDF7]">
              <Shield className="h-5 w-5 text-primary-yellow mx-auto mb-2 stroke-[2]" />
              <p className="text-[12px] text-secondary-text font-light leading-relaxed">
                Secure checkout encrypted system. Original premium products guaranteed by Mazish.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
