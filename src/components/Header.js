'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingBag, Menu, X, Trash2, Plus, Minus, ArrowRight } from 'lucide-react'
import { useCart } from '@/context/CartContext'

export default function Header() {
  const { cart, removeFromCart, updateQuantity, cartCount, cartTotal } = useCart()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-soft-border bg-warm-bg/95 backdrop-blur-md transition-all duration-300">
        <div className="mx-auto relative flex max-w-7xl h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
          
          {/* Left Side Navigation Links - Desktop & Mobile Toggle + Icon Logo */}
          <div className="flex-1 flex justify-start items-center space-x-4">
            {/* Mobile Menu Toggle */}
            <div className="flex lg:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-secondary-text hover:text-charcoal focus:outline-none p-2"
                aria-label="Toggle Menu"
              >
                {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
            <nav className="hidden lg:flex items-center space-x-8 text-[14px] font-semibold tracking-widest uppercase text-secondary-text">
              <Link href="/" className="hover:text-primary-yellow transition-colors duration-200">
                Home
              </Link>
              <Link href="/shop" className="hover:text-primary-yellow transition-colors duration-200">
                Shop Sunglasses
              </Link>
              <Link href="/track" className="hover:text-primary-yellow transition-colors duration-200">
                Track Order
              </Link>
            </nav>
          </div>

          {/* Logo Wordmark - Centered */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-10">
            <Link href="/" className="inline-flex items-center justify-center gap-5">
              <img
                src="https://res.cloudinary.com/kp0jicx3/image/upload/v1785265523/main_logo_ffrk6k.png"
                alt="MAZISH"
                className="h-10 w-auto object-contain mix-blend-multiply"
              />
              <span className="font-luxury text-2xl sm:text-3xl font-light tracking-[0.35em] text-charcoal hover:text-primary-yellow transition-colors duration-300 uppercase">
                MAZISH
              </span>
            </Link>
          </div>

          {/* Right Side Actions: Contact, Cart */}
          <div className="flex-1 flex justify-end items-center space-x-4 sm:space-x-6 z-10">
            <a
              href="https://www.facebook.com/profile.php?id=61590005602732"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-block text-[12px] font-bold tracking-widest uppercase border border-soft-border px-5 py-2.5 rounded-full hover:bg-charcoal hover:text-warm-bg transition-all duration-300"
            >
              Contact
            </a>

            {/* Cart Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-secondary-text hover:text-charcoal transition-colors focus:outline-none cursor-pointer"
              aria-label="Open Cart"
            >
              <ShoppingBag size={20} className="stroke-[1.7]" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary-yellow text-[10px] font-bold text-charcoal ring-2 ring-warm-bg">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-soft-border bg-warm-bg px-6 py-8 space-y-6 text-center transition-all duration-300">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-[16px] font-semibold uppercase tracking-wider text-secondary-text hover:text-charcoal"
            >
              Home
            </Link>
            <Link
              href="/shop"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-[16px] font-semibold uppercase tracking-wider text-secondary-text hover:text-charcoal"
            >
              Shop Sunglasses
            </Link>
            <Link
              href="/track"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-[16px] font-semibold uppercase tracking-wider text-secondary-text hover:text-charcoal"
            >
              Track Order
            </Link>
            <a
              href="https://www.facebook.com/profile.php?id=61590005602732"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-[16px] font-semibold uppercase tracking-wider text-secondary-text hover:text-charcoal"
            >
              Contact
            </a>
          </div>
        )}
      </header>

      {/* Cart Sliding Drawer Overlay */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-charcoal/40 backdrop-blur-sm">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <div className="pointer-events-auto w-screen max-w-md">
                <div className="flex h-full flex-col bg-pure-white shadow-2xl border-l border-soft-border">
                  
                  {/* Cart Header */}
                  <div className="flex items-center justify-between px-6 py-6 border-b border-soft-border">
                    <h2 className="text-lg font-luxury tracking-wider text-charcoal uppercase">Your Selection</h2>
                    <button
                      onClick={() => setIsCartOpen(false)}
                      className="p-1.5 text-secondary-text hover:text-charcoal focus:outline-none"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Cart Body */}
                  <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
                    {cart.length === 0 ? (
                      <div className="flex h-64 flex-col items-center justify-center text-center">
                        <ShoppingBag size={44} className="text-secondary-text/30 mb-4 stroke-[1]" />
                        <p className="text-secondary-text text-sm font-light tracking-wide">Your selection bag is empty</p>
                        <button
                          onClick={() => setIsCartOpen(false)}
                          className="mt-6 text-xs font-semibold tracking-widest text-primary-yellow uppercase hover:text-deep-yellow"
                        >
                          Continue Browsing
                        </button>
                      </div>
                    ) : (
                      cart.map((item) => (
                        <div key={item.id} className="flex py-4 border-b border-soft-border last:border-b-0">
                          {/* Image */}
                          <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-soft-border bg-soft-bg relative">
                             <Image
                               src={item.images?.[0] || 'https://res.cloudinary.com/kp0jicx3/image/upload/f_auto,q_auto/v1785265528/Sunglass1_zufdif.png'}
                               alt={item.name}
                               fill
                               className="object-cover"
                             />
                          </div>

                          {/* Info */}
                          <div className="ml-4 flex flex-1 flex-col justify-between">
                            <div>
                              <div className="flex justify-between text-sm font-semibold text-charcoal">
                                <h3 className="line-clamp-1">{item.name}</h3>
                                <p className="ml-4 text-charcoal">৳{item.discount_price || item.price}</p>
                              </div>
                              <p className="mt-1 text-[10px] text-secondary-text uppercase tracking-wider">{item.category || 'Sunglasses'}</p>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              {/* Quantity Controls */}
                              <div className="flex items-center border border-soft-border rounded-lg bg-soft-bg">
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  className="p-1.5 text-secondary-text hover:text-charcoal"
                                >
                                  <Minus size={12} />
                                </button>
                                <span className="px-2 text-xs text-charcoal font-medium">{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="p-1.5 text-secondary-text hover:text-charcoal"
                                >
                                  <Plus size={12} />
                                </button>
                              </div>

                              {/* Remove Button */}
                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="flex items-center text-secondary-text hover:text-error transition-colors p-1"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Cart Footer */}
                  {cart.length > 0 && (
                    <div className="border-t border-soft-border bg-soft-bg px-6 py-6 space-y-6">
                      <div className="flex justify-between text-sm font-semibold text-charcoal">
                        <p className="tracking-wide uppercase text-xs">Subtotal</p>
                        <p className="text-lg font-bold">৳{cartTotal}</p>
                      </div>
                      <p className="text-[10px] text-secondary-text leading-relaxed">
                        Shipping cost and delivery timeframe will be determined during checkout.
                      </p>
                      <div className="space-y-3">
                        <Link
                          href="/checkout"
                          onClick={() => setIsCartOpen(false)}
                          className="flex w-full items-center justify-center gap-2 rounded-full bg-charcoal px-6 py-3.5 text-xs font-bold uppercase tracking-widest text-warm-bg hover:bg-secondary-text transition-all duration-300 shadow-md"
                        >
                          Checkout Now
                          <ArrowRight size={14} className="stroke-[2]" />
                        </Link>
                        <button
                          onClick={() => setIsCartOpen(false)}
                          className="w-full text-center text-[10px] font-bold tracking-widest uppercase text-secondary-text hover:text-charcoal transition-colors"
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
