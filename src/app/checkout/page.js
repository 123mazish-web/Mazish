'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ShoppingBag, ChevronRight, CheckCircle, Shield } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { createOrder } from '@/lib/db'

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart()
  const router = useRouter()

  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    paymentMethod: 'COD',
    paymentDetails: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.phone || !form.address) {
      setError('Please fill in all delivery details')
      return
    }

    if (form.paymentMethod !== 'COD' && !form.paymentDetails) {
      setError('Please enter the Transaction ID for verification')
      return
    }

    setError('')
    setSubmitting(true)

    const orderData = {
      customer_name: form.name,
      phone: form.phone,
      delivery_address: form.address,
      payment_method: form.paymentMethod,
      payment_details: form.paymentDetails || 'N/A',
      total_amount: cartTotal,
      items: cart,
      status: 'Pending'
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

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

                  <label className={`flex flex-col items-center justify-center border p-4 rounded-xl cursor-pointer transition-all ${form.paymentMethod === 'Nagad' ? 'border-amber-500 bg-amber-500/5' : 'border-zinc-850 bg-zinc-950 hover:border-zinc-700'}`}>
                    <input
                      type="radio"
                      name="payment"
                      value="Nagad"
                      checked={form.paymentMethod === 'Nagad'}
                      onChange={() => setForm({ ...form, paymentMethod: 'Nagad' })}
                      className="sr-only"
                    />
                    <span className="text-xs font-bold uppercase tracking-wider text-orange-500 mb-1">Nagad</span>
                    <span className="text-[10px] text-zinc-500">Manual payment</span>
                  </label>
                </div>

                {form.paymentMethod !== 'COD' && (
                  <div className="bg-zinc-950 border border-zinc-850 rounded-xl p-4 sm:p-6 space-y-4 animate-fadeIn">
                    <p className="text-xs text-zinc-400 font-light leading-relaxed">
                      Please send the total sum of <strong className="text-white">৳{cartTotal}</strong> to our merchant number <strong className="text-white">01700000000</strong> using <strong className="text-amber-500">{form.paymentMethod} Send Money</strong>, then input the Transaction ID below.
                    </p>
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-2">
                        Transaction ID *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. AH87B8N9"
                        value={form.paymentDetails}
                        onChange={(e) => setForm({ ...form, paymentDetails: e.target.value })}
                        className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-amber-500 text-zinc-950 font-bold uppercase tracking-widest text-xs py-4 rounded-full hover:bg-amber-400 transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(245,158,11,0.1)]"
              >
                {submitting ? 'PROCESSING...' : `PLACE ORDER • ৳${cartTotal}`}
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
                      <div className="h-12 w-12 rounded border border-zinc-850 bg-zinc-950 overflow-hidden flex-shrink-0">
                        <img src={item.images?.[0]} alt={item.name} className="h-full w-full object-cover" />
                      </div>
                      <div>
                        <h4 className="text-white font-medium line-clamp-1">{item.name}</h4>
                        <p className="text-xs text-zinc-500 font-light">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="text-zinc-400 font-medium">৳{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-zinc-800 pt-4 space-y-3">
                <div className="flex justify-between text-xs text-zinc-500">
                  <span>Subtotal</span>
                  <span>৳{cartTotal}</span>
                </div>
                <div className="flex justify-between text-xs text-zinc-500">
                  <span>Shipping</span>
                  <span className="text-amber-500 font-medium">Free Delivery</span>
                </div>
                <div className="border-t border-zinc-800 pt-3 flex justify-between text-sm font-semibold text-white">
                  <span>Total</span>
                  <span className="text-lg text-amber-500">৳{cartTotal}</span>
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
