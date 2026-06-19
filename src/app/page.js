'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { ShoppingBag, Star, Shield, Truck, RotateCcw, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import { DEFAULT_PRODUCTS } from '@/lib/products'
import { getProducts } from '@/lib/db'
import { useCart } from '@/context/CartContext'

export default function HomePage() {
  const [products, setProducts] = useState(DEFAULT_PRODUCTS)
  const [loading, setLoading] = useState(false)
  const { addToCart } = useCart()

  // Slider State
  const [currentSlide, setCurrentSlide] = useState(0)

  const slides = [
    {
      image: "/images/banner1.png",
      title: "MAZISH LUXURY",
      subtitle: "The Hub of Fashion & Luxury in Bangladesh"
    },
    {
      image: "/images/banner2.jpg",
      title: "PREMIUM CAPSULES",
      subtitle: "Handcrafted sunglasses with scratch-resistant polarized protection"
    },
    {
      image: "/images/BrazilBanner.png",
      title: "SUPPORT SELEÇÃO",
      subtitle: "Pre-order Brazil Edition Custom Handcrafted Sunglasses"
    },
    {
      image: "/images/ArgentinaBanner.png",
      title: "SUPPORT ALBICELESTE",
      subtitle: "Pre-order Argentina Edition Custom Handcrafted Sunglasses"
    }
  ]

  useEffect(() => {
    async function loadData() {
      const data = await getProducts()
      if (data && data.length > 0) {
        setProducts(data)
      }
    }
    loadData()
  }, [])

  // Auto-slide effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [slides.length])

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  // Filter featured products (excluding preorders)
  const featuredProducts = products
    .filter(p => p.id !== 'fifa-brazil' && p.id !== 'fifa-argentina' && p.is_featured)
    .slice(0, 3)

  return (
    <div className="relative overflow-hidden bg-zinc-950">
      {/* Banner Image Slider Hero */}
      <section className="relative w-full max-w-[1920px] mx-auto aspect-[1920/800] overflow-hidden bg-black">
        {/* Slides */}
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <Link href="/shop" className="block w-full h-full cursor-pointer">
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
            </Link>
          </div>
        ))}

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full border border-white/10 bg-black/25 hover:bg-amber-500 hover:text-zinc-950 text-white transition-all focus:outline-none"
          aria-label="Previous slide"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full border border-white/10 bg-black/25 hover:bg-amber-500 hover:text-zinc-950 text-white transition-all focus:outline-none"
          aria-label="Next slide"
        >
          <ChevronRight size={20} />
        </button>

        {/* Indicator Dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex space-x-2.5">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'w-8 bg-amber-500' : 'w-2 bg-white/40'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            ></button>
          ))}
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

      {/* FIFA Specials section */}
      <section className="py-24 bg-gradient-to-b from-zinc-950 via-zinc-900/20 to-zinc-950 border-b border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-4">
            <span className="inline-block px-3.5 py-1 bg-amber-500/10 text-amber-400 text-[10px] tracking-widest font-semibold uppercase rounded-full border border-amber-500/20">
              Limited FIFA Edition Game
            </span>
            <h2 className="font-luxury text-3xl sm:text-5xl text-white tracking-widest uppercase">THE FIFA SPECIALS</h2>
            <div className="h-[1px] w-12 bg-zinc-800 mx-auto"></div>
            <p className="text-zinc-500 text-xs font-light max-w-md mx-auto leading-relaxed">
              Show your colors. Brazil vs Argentina. Handcrafted luxury statements. Special launch offer at ৳999 instead of ৳1500.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
            {/* Brazil Glass */}
            <div className="relative group overflow-hidden rounded-2xl border border-zinc-900 bg-zinc-900/10 p-8 flex flex-col justify-between hover:border-emerald-500/30 transition-all duration-300">
              <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-emerald-500/5 blur-[64px] pointer-events-none"></div>
              <div>
                <span className="text-[10px] font-semibold text-emerald-400 tracking-wider uppercase">Brazil Edition</span>
                <Link href="/product/fifa-brazil">
                  <h3 className="font-luxury text-2xl sm:text-3xl text-white tracking-wide mt-2 hover:text-amber-500 transition-colors">Brazil Special Edition</h3>
                </Link>
                <p className="text-zinc-500 text-xs font-light mt-3 leading-relaxed max-w-sm">
                  Handcrafted acetate frame with signature green and gold detailing. Fitted with premium polarized golden-yellow gradient lenses.
                </p>
              </div>
              <Link href="/product/fifa-brazil" className="block my-8 aspect-video overflow-hidden rounded-lg bg-zinc-950 border border-zinc-900 cursor-pointer">
                <img src="/images/Brazil1.jpg" alt="Brazil Glass" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </Link>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xl font-bold text-amber-500">৳999</span>
                  <span className="text-xs text-zinc-600 line-through ml-2">৳1500</span>
                </div>
                <Link
                  href="/product/fifa-brazil"
                  className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold uppercase tracking-widest text-[9px] px-8 py-3.5 rounded-full transition-all duration-300 text-center"
                >
                  Order Now
                </Link>
              </div>
            </div>

            {/* Argentina Glass */}
            <div className="relative group overflow-hidden rounded-2xl border border-zinc-900 bg-zinc-900/10 p-8 flex flex-col justify-between hover:border-sky-500/30 transition-all duration-300">
              <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-sky-500/5 blur-[64px] pointer-events-none"></div>
              <div>
                <span className="text-[10px] font-semibold text-sky-400 tracking-wider uppercase">Argentina Edition</span>
                <Link href="/product/fifa-argentina">
                  <h3 className="font-luxury text-2xl sm:text-3xl text-white tracking-wide mt-2 hover:text-amber-500 transition-colors">Argentina Special Edition</h3>
                </Link>
                <p className="text-zinc-500 text-xs font-light mt-3 leading-relaxed max-w-sm">
                  Pristine sky-blue and white accents, custom handcrafted frame offering unmatched comfort and high-contrast polarized lenses.
                </p>
              </div>
              <Link href="/product/fifa-argentina" className="block my-8 aspect-video overflow-hidden rounded-lg bg-zinc-950 border border-zinc-900 cursor-pointer">
                <img src="/images/Argentina1.jpg" alt="Argentina Glass" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </Link>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xl font-bold text-amber-500">৳999</span>
                  <span className="text-xs text-zinc-600 line-through ml-2">৳1500</span>
                </div>
                <Link
                  href="/product/fifa-argentina"
                  className="bg-sky-500 hover:bg-sky-400 text-zinc-950 font-bold uppercase tracking-widest text-[9px] px-8 py-3.5 rounded-full transition-all duration-300 text-center"
                >
                  Order Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Collection Grid Section */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 space-y-4">
          <span className="text-amber-500 text-xs tracking-widest font-semibold uppercase">Featured Capsule</span>
          <h2 className="font-luxury text-3xl sm:text-5xl text-white tracking-wider">Premium Featured Sunglasses</h2>
          <div className="h-[1px] w-12 bg-zinc-800 mx-auto"></div>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-amber-500"></div>
          </div>
        ) : (
          <div className="space-y-16">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProducts.map((product) => (
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
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">
                          {product.category}
                        </span>
                        <span className="text-[9px] font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded uppercase tracking-wider">
                          {product.gender}
                        </span>
                      </div>
                      <Link href={`/product/${product.id}`}>
                        <h3 className="text-lg font-medium text-white tracking-wide mt-2.5 group-hover:text-amber-500 transition-colors duration-200">
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

            <div className="text-center pt-4">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 border border-zinc-800 hover:border-zinc-700 bg-zinc-900/40 text-xs font-semibold tracking-widest uppercase text-white hover:text-amber-500 px-8 py-4 rounded-full transition-all duration-300"
              >
                Explore All Products
                <ArrowRight size={14} />
              </Link>
            </div>
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
