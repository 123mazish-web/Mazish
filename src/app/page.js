'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { ShoppingBag, Star, Shield, Truck, RotateCcw } from 'lucide-react'
import { getProducts } from '@/lib/db'
import { useCart } from '@/context/CartContext'

export default function HomePage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const { addToCart } = useCart()

  useEffect(() => {
    async function loadData() {
      const data = await getProducts()
      setProducts(data)
      setLoading(false)
    }
    loadData()
  }, [])

  return (
    <div className="relative overflow-hidden bg-zinc-950">
      {/* Hero Section */}
      <section className="relative flex min-h-[90vh] items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-black px-4 py-20 text-center">
        {/* Subtle light leak animations */}
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-amber-500/5 blur-[128px] animate-pulse pointer-events-none"></div>
        <div className="absolute bottom-1/3 right-1/4 h-96 w-96 rounded-full bg-amber-600/5 blur-[128px] animate-pulse pointer-events-none"></div>

        <div className="relative z-10 max-w-4xl space-y-8">
          <span className="text-xs font-semibold tracking-[0.4em] text-amber-500 uppercase">
            Est. 2026 • Bangladesh
          </span>
          <h1 className="font-luxury text-5xl sm:text-7xl lg:text-8xl tracking-[0.05em] text-white leading-tight">
            MAZISH
          </h1>
          <p className="font-luxury text-xl sm:text-3xl text-zinc-400 tracking-[0.1em] font-light max-w-2xl mx-auto">
            The Hub of Fashion & Luxury
          </p>
          <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto"></div>
          <p className="text-zinc-500 text-sm max-w-md mx-auto font-light leading-relaxed">
            We are not just a store. We are a statement. Starting with our limited-run premium sunglasses collection, we are defining luxury.
          </p>
          <div className="pt-6">
            <a
              href="#shop"
              className="inline-block border border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-zinc-950 font-semibold tracking-widest text-xs uppercase px-8 py-4 rounded-full transition-all duration-300 shadow-[0_0_15px_rgba(245,158,11,0.1)] hover:shadow-[0_0_30px_rgba(245,158,11,0.25)]"
            >
              Explore Sunglasses Collection
            </a>
          </div>
        </div>
      </section>

      {/* Brand Statement / Identity */}
      <section className="border-y border-zinc-900 bg-zinc-950 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div className="flex flex-col items-center md:items-start space-y-3 p-6 border-b md:border-b-0 md:border-r border-zinc-900 last:border-0">
            <Shield className="h-6 w-6 text-amber-500 stroke-[1.2]" />
            <h3 className="text-zinc-200 text-sm font-semibold tracking-wider uppercase">Authentic Luxury</h3>
            <p className="text-zinc-500 text-xs font-light leading-relaxed">Handcrafted frames and top-tier polarized optics. No compromises, only original designs.</p>
          </div>
          <div className="flex flex-col items-center md:items-start space-y-3 p-6 border-b md:border-b-0 md:border-r border-zinc-900 last:border-0">
            <Truck className="h-6 w-6 text-amber-500 stroke-[1.2]" />
            <h3 className="text-zinc-200 text-sm font-semibold tracking-wider uppercase">Steadfast Delivery</h3>
            <p className="text-zinc-500 text-xs font-light leading-relaxed">Rapid home delivery across Bangladesh in partnership with country's premium delivery network.</p>
          </div>
          <div className="flex flex-col items-center md:items-start space-y-3 p-6 last:border-0">
            <RotateCcw className="h-6 w-6 text-amber-500 stroke-[1.2]" />
            <h3 className="text-zinc-200 text-sm font-semibold tracking-wider uppercase">Risk-Free Checkout</h3>
            <p className="text-zinc-500 text-xs font-light leading-relaxed">Pay via Cash on Delivery or fast-track with bKash/Nagad. Inspect at your doorstep.</p>
          </div>
        </div>
      </section>

      {/* FIFA Special Edition Pre-order section */}
      <section className="py-24 bg-gradient-to-b from-zinc-950 via-zinc-900/20 to-zinc-950 border-b border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-4">
            <span className="inline-block px-3.5 py-1 bg-amber-500/10 text-amber-400 text-[10px] tracking-widest font-semibold uppercase rounded-full border border-amber-500/20">
              Limited FIFA Edition Game
            </span>
            <h2 className="font-luxury text-3xl sm:text-5xl text-white tracking-widest uppercase">THE PRE-ORDER BATTLE</h2>
            <div className="h-[1px] w-12 bg-zinc-800 mx-auto"></div>
            <p className="text-zinc-500 text-xs font-light max-w-md mx-auto leading-relaxed">
              Show your colors. Brazil vs Argentina. Handcrafted luxury statements. Pre-order launch offer at ৳950 instead of ৳1400.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
            {/* Brazil Glass */}
            <div className="relative group overflow-hidden rounded-2xl border border-zinc-900 bg-zinc-900/10 p-8 flex flex-col justify-between hover:border-emerald-500/30 transition-all duration-300">
              <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-emerald-500/5 blur-[64px] pointer-events-none"></div>
              <div>
                <span className="text-[10px] font-semibold text-emerald-400 tracking-wider uppercase">Brazil Edition</span>
                <h3 className="font-luxury text-2xl sm:text-3xl text-white tracking-wide mt-2">Brazil Special Edition</h3>
                <p className="text-zinc-500 text-xs font-light mt-3 leading-relaxed max-w-sm">
                  Handcrafted acetate frame with signature green and gold detailing. Fitted with premium polarized golden-yellow gradient lenses.
                </p>
              </div>
              <div className="my-8 aspect-video overflow-hidden rounded-lg bg-zinc-950 border border-zinc-900">
                <img src="/images/BrazilGlass.jpg" alt="Brazil Glass" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xl font-bold text-amber-500">৳950</span>
                  <span className="text-xs text-zinc-600 line-through ml-2">৳1400</span>
                </div>
                <button
                  onClick={() => addToCart({ id: "fifa-brazil", name: "MAZISH Handcrafted Brazil Edition", price: 1400, discount_price: 950, images: ["/images/BrazilGlass.jpg"] })}
                  className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold uppercase tracking-widest text-[9px] px-6 py-3 rounded-full transition-all duration-300"
                >
                  Pre-order Brazil
                </button>
              </div>
            </div>

            {/* Argentina Glass */}
            <div className="relative group overflow-hidden rounded-2xl border border-zinc-900 bg-zinc-900/10 p-8 flex flex-col justify-between hover:border-sky-500/30 transition-all duration-300">
              <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-sky-500/5 blur-[64px] pointer-events-none"></div>
              <div>
                <span className="text-[10px] font-semibold text-sky-400 tracking-wider uppercase">Argentina Edition</span>
                <h3 className="font-luxury text-2xl sm:text-3xl text-white tracking-wide mt-2">Argentina Special Edition</h3>
                <p className="text-zinc-500 text-xs font-light mt-3 leading-relaxed max-w-sm">
                  Pristine sky-blue and white accents, custom handcrafted frame offering unmatched comfort and high-contrast polarized lenses.
                </p>
              </div>
              <div className="my-8 aspect-video overflow-hidden rounded-lg bg-zinc-950 border border-zinc-900">
                <img src="/images/ArgentinaGlass.jpg" alt="Argentina Glass" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xl font-bold text-amber-500">৳950</span>
                  <span className="text-xs text-zinc-600 line-through ml-2">৳1400</span>
                </div>
                <button
                  onClick={() => addToCart({ id: "fifa-argentina", name: "MAZISH Handcrafted Argentina Edition", price: 1400, discount_price: 950, images: ["/images/ArgentinaGlass.jpg"] })}
                  className="bg-sky-500 hover:bg-sky-400 text-zinc-950 font-bold uppercase tracking-widest text-[9px] px-6 py-3 rounded-full transition-all duration-300"
                >
                  Pre-order Argentina
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid Section */}
      <section id="shop" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 space-y-4">
          <span className="text-amber-500 text-xs tracking-widest font-semibold uppercase">Limited Run</span>
          <h2 className="font-luxury text-3xl sm:text-5xl text-white tracking-wider">Premium Sunglasses</h2>
          <div className="h-[1px] w-12 bg-zinc-800 mx-auto"></div>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-amber-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products
              .filter((p) => p.id !== 'fifa-brazil' && p.id !== 'fifa-argentina')
              .map((product) => (
              <div
                key={product.id}
                className="group relative flex flex-col bg-zinc-900/40 rounded-xl overflow-hidden border border-zinc-900 hover:border-zinc-800 transition-all duration-300"
              >
                {/* Image */}
                <Link href={`/product/${product.id}`} className="block relative aspect-square overflow-hidden bg-zinc-950">
                  <img
                    src={product.images?.[0]}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {product.discount_price && (
                    <span className="absolute top-4 left-4 bg-amber-500 text-zinc-950 font-bold text-[10px] tracking-wider uppercase px-2.5 py-1 rounded">
                      Special Offer
                    </span>
                  )}
                </Link>

                {/* Details */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">
                      {product.category}
                    </span>
                    <Link href={`/product/${product.id}`}>
                      <h3 className="text-lg font-medium text-white tracking-wide mt-1 group-hover:text-amber-500 transition-colors duration-200">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="text-zinc-500 text-xs font-light mt-2 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-baseline space-x-2">
                      <span className="text-lg font-bold text-amber-500">
                        ৳{product.discount_price || product.price}
                      </span>
                      {product.discount_price && (
                        <span className="text-xs text-zinc-600 line-through">
                          ৳{product.price}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        addToCart(product, 1)
                        // Trigger custom UI notification if needed
                      }}
                      className="flex items-center justify-center p-2 rounded-full border border-zinc-800 bg-zinc-950 hover:bg-amber-500 hover:text-zinc-950 transition-colors"
                      aria-label="Add to cart"
                    >
                      <ShoppingBag size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Coming Soon Teaser */}
      <section className="relative py-32 bg-zinc-950/80 border-t border-zinc-900 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-10 filter blur-sm" style={{ backgroundImage: "url('/images/sunglasses-2.png')" }}></div>
        <div className="mx-auto max-w-4xl px-4 text-center relative z-10 space-y-6">
          <span className="text-amber-500 text-xs tracking-widest font-semibold uppercase">The Road Ahead</span>
          <h2 className="font-luxury text-3xl sm:text-5xl text-white tracking-widest uppercase">More Luxury Categories</h2>
          <p className="text-zinc-500 text-sm max-w-md mx-auto font-light leading-relaxed">
            High-fashion apparel, bespoke jewelry, and premium leather accessories are currently in production. Be prepared for the expansion.
          </p>
          <div className="inline-block px-8 py-3 text-xs tracking-widest uppercase text-zinc-500 font-semibold border border-dashed border-zinc-800 rounded-full">
            Coming Soon
          </div>
        </div>
      </section>
    </div>
  )
}
