'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ShoppingBag, Menu, X, Trash2, Plus, Minus, ArrowRight } from 'lucide-react'
import { useCart } from '@/context/CartContext'

export default function Header() {
  const { cart, removeFromCart, updateQuantity, cartCount, cartTotal } = useCart()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md transition-all duration-300">
        <div className="mx-auto flex max-w-7xl h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Mobile Menu Toggle */}
          <div className="flex lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-zinc-400 hover:text-white focus:outline-none"
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Nav Links - Desktop */}
          <nav className="hidden lg:flex items-center space-x-8 text-sm font-medium tracking-widest uppercase text-zinc-400">
            <Link href="/" className="hover:text-amber-500 transition-colors duration-200">
              Home
            </Link>
            <Link href="/#shop" className="hover:text-amber-500 transition-colors duration-200">
              Shop
            </Link>
            <Link href="/about" className="hover:text-amber-500 transition-colors duration-200">
              About
            </Link>
          </nav>

          {/* Logo */}
          <div className="flex-1 lg:flex-none text-center">
            <Link href="/" className="inline-block">
              <span className="font-luxury text-3xl sm:text-4xl tracking-[0.25em] text-white hover:text-amber-500 transition-colors duration-300">
                MAZISH
              </span>
            </Link>
          </div>

          {/* Cart & Contact Actions */}
          <div className="flex items-center space-x-6">
            <Link
              href="/about#contact"
              className="hidden sm:inline-block text-xs font-semibold tracking-widest uppercase border border-zinc-850 px-5 py-2.5 rounded-full hover:bg-white hover:text-zinc-950 transition-all duration-300"
            >
              Contact
            </Link>

            {/* Cart Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 text-zinc-300 hover:text-amber-500 transition-colors focus:outline-none"
              aria-label="Open Cart"
            >
              <ShoppingBag size={22} className="stroke-[1.5]" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-zinc-950 ring-2 ring-zinc-950 animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-zinc-900 bg-zinc-950 px-4 py-6 space-y-4 text-center">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-base font-medium uppercase tracking-wider text-zinc-400 hover:text-white"
            >
              Home
            </Link>
            <Link
              href="/#shop"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-base font-medium uppercase tracking-wider text-zinc-400 hover:text-white"
            >
              Shop
            </Link>
            <Link
              href="/about"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-base font-medium uppercase tracking-wider text-zinc-400 hover:text-white"
            >
              About
            </Link>
            <Link
              href="/about#contact"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-base font-medium uppercase tracking-wider text-zinc-400 hover:text-white"
            >
              Contact
            </Link>
          </div>
        )}
      </header>

      {/* Cart Sliding Drawer Overlay */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <div className="pointer-events-auto w-screen max-w-md">
                <div className="flex h-full flex-col bg-zinc-900 shadow-2xl border-l border-zinc-800">
                  {/* Cart Header */}
                  <div className="flex items-center justify-between px-6 py-6 border-b border-zinc-800">
                    <h2 className="text-xl font-luxury tracking-wider text-white">Your Selection</h2>
                    <button
                      onClick={() => setIsCartOpen(false)}
                      className="p-1 text-zinc-400 hover:text-white focus:outline-none"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {/* Cart Body */}
                  <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
                    {cart.length === 0 ? (
                      <div className="flex h-64 flex-col items-center justify-center text-center">
                        <ShoppingBag size={48} className="text-zinc-700 mb-4 stroke-[1]" />
                        <p className="text-zinc-500 font-medium tracking-wide">Your cart is empty</p>
                        <button
                          onClick={() => setIsCartOpen(false)}
                          className="mt-6 text-sm font-semibold tracking-wider text-amber-500 uppercase hover:underline"
                        >
                          Continue Browsing
                        </button>
                      </div>
                    ) : (
                      cart.map((item) => (
                        <div key={item.id} className="flex py-4 border-b border-zinc-850 last:border-b-0">
                          {/* Image */}
                          <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-zinc-800 bg-zinc-950">
                            <img
                              src={item.images?.[0] || 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=150'}
                              alt={item.name}
                              className="h-full w-full object-cover"
                            />
                          </div>

                          {/* Info */}
                          <div className="ml-4 flex flex-1 flex-col justify-between">
                            <div>
                              <div className="flex justify-between text-base font-semibold text-white">
                                <h3 className="line-clamp-1">{item.name}</h3>
                                <p className="ml-4 text-amber-500">৳{item.price}</p>
                              </div>
                              <p className="mt-1 text-xs text-zinc-500">Sunglasses</p>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              {/* Quantity Controls */}
                              <div className="flex items-center border border-zinc-800 rounded bg-zinc-950">
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  className="p-1.5 text-zinc-400 hover:text-white"
                                >
                                  <Minus size={14} />
                                </button>
                                <span className="px-2.5 text-xs text-white font-medium">{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="p-1.5 text-zinc-400 hover:text-white"
                                >
                                  <Plus size={14} />
                                </button>
                              </div>

                              {/* Remove Button */}
                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="flex items-center text-zinc-500 hover:text-red-400 transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Cart Footer */}
                  {cart.length > 0 && (
                    <div className="border-t border-zinc-800 bg-zinc-950 px-6 py-6 space-y-6">
                      <div className="flex justify-between text-base font-medium text-white">
                        <p className="tracking-wide">Subtotal</p>
                        <p className="text-xl font-bold text-amber-500">৳{cartTotal}</p>
                      </div>
                      <p className="text-xs text-zinc-500">
                        Shipping and delivery will be calculated at checkout.
                      </p>
                      <div className="space-y-3">
                        <Link
                          href="/checkout"
                          onClick={() => setIsCartOpen(false)}
                          className="flex w-full items-center justify-center gap-2 rounded-full bg-amber-500 px-6 py-3.5 text-sm font-bold uppercase tracking-widest text-zinc-950 hover:bg-amber-400 transition-all duration-300"
                        >
                          Checkout Now
                          <ArrowRight size={16} className="stroke-[2.5]" />
                        </Link>
                        <button
                          onClick={() => setIsCartOpen(false)}
                          className="w-full text-center text-xs font-semibold tracking-widest uppercase text-zinc-400 hover:text-white transition-colors"
                        >
                          Continue Shopping
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
