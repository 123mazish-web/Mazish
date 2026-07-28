'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { ShoppingBag, Shield, Truck, RotateCcw, MessageCircle, Star, ArrowRight } from 'lucide-react'
import { DEFAULT_PRODUCTS } from '@/lib/products'
import { getProducts } from '@/lib/db'
import { useCart } from '@/context/CartContext'

export default function HomePage() {
  const [products, setProducts] = useState(DEFAULT_PRODUCTS)
  const [loading, setLoading] = useState(false)
  const { addToCart } = useCart()

  // Category Filter State
  const [activeFilter, setActiveFilter] = useState('All')

  // Newsletter Form State
  const [emailOrPhone, setEmailOrPhone] = useState('')
  const [notifySuccess, setNotifySuccess] = useState('')

  // Banner Slider State
  const [currentSlide, setCurrentSlide] = useState(0)

  const bannerSlides = [
    { desktop: 'https://res.cloudinary.com/kp0jicx3/image/upload/f_auto,q_auto/v1785265520/banner1_ooav5q.png', mobile: 'https://res.cloudinary.com/kp0jicx3/image/upload/f_auto,q_auto/v1785265520/banner1_ooav5q.png' },
    { desktop: 'https://res.cloudinary.com/kp0jicx3/image/upload/f_auto,q_auto/v1785265521/banner2_ubqtfd.png', mobile: 'https://res.cloudinary.com/kp0jicx3/image/upload/f_auto,q_auto/v1785265521/banner2_ubqtfd.png' },
    { desktop: 'https://res.cloudinary.com/kp0jicx3/image/upload/f_auto,q_auto/v1785265521/banner3_cnesab.png', mobile: 'https://res.cloudinary.com/kp0jicx3/image/upload/f_auto,q_auto/v1785265521/banner3_cnesab.png' }
  ]

  // Auto-slide effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerSlides.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [bannerSlides.length])

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + bannerSlides.length) % bannerSlides.length)
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % bannerSlides.length)
  }

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      const data = await getProducts()
      if (data && data.length > 0) {
        setProducts(data)
      }
      setLoading(false)
    }
    loadData()
  }, [])

  // Filter products dynamically
  const filteredProducts = products.filter(p => {
    if (activeFilter === 'All') return p.is_featured
    if (activeFilter === 'Men') return p.gender === 'Men' && p.is_featured
    if (activeFilter === 'Women') return p.gender === 'Women' && p.is_featured
    if (activeFilter === 'Unisex') return p.gender === 'Unisex' && p.is_featured
    if (activeFilter === 'Limited Edition') return p.category === 'FIFA Special Edition'
    return p.is_featured
  }).slice(0, 4)

  const handleNotifySubmit = async (e) => {
    e.preventDefault()
    const emailTrimmed = emailOrPhone.trim()
    if (!emailTrimmed) return

    setNotifySuccess("Thank you! You've been added to the early access list.")
    setEmailOrPhone('')

    try {
      // Keep local log of subscriber
      const localSubscribers = JSON.parse(localStorage.getItem('mazish_early_access') || '[]')
      localSubscribers.push({ email: emailTrimmed, date: new Date().toISOString() })
      localStorage.setItem('mazish_early_access', JSON.stringify(localSubscribers))
      
      // Also try to insert into supabase newsletter table if it exists
      const { supabase } = await import('@/lib/supabase')
      await supabase.from('newsletter').insert([{ email: emailTrimmed }])
    } catch (err) {
      console.warn("Could not insert to DB, saved locally:", err)
    }

    setTimeout(() => setNotifySuccess(''), 4000)
  }

  return (
    <div className="bg-warm-bg transition-colors duration-300">
      
      {/* 1. Announcement Bar */}
      <div className="bg-charcoal text-warm-bg py-2.5 text-center text-[12px] sm:text-[13px] font-bold tracking-[0.15em] uppercase border-b border-soft-border/10">
        <span>Cash on Delivery available • Nationwide Delivery Across Bangladesh • Inspect at Delivery</span>
      </div>

      {/* 2. Hero Campaign Banner Slider Section */}
      <section className="relative w-full max-w-[1920px] mx-auto bg-warm-bg overflow-hidden group">
        <div className="relative w-full aspect-[16/9] min-h-[300px] sm:min-h-[500px]">
          {bannerSlides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
                index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              <picture>
                <source 
                  media="(max-width: 767px)" 
                  srcSet={slide.mobile} 
                  width={2560} 
                  height={1440} 
                />
                <source 
                  media="(min-width: 768px)" 
                  srcSet={slide.desktop} 
                  width={2560} 
                  height={1440} 
                />
                <img 
                  src={slide.desktop} 
                  alt={`MAZISH Campaign Banner ${index + 1}`} 
                  width={2560} 
                  height={1440} 
                  className="w-full h-auto object-contain block" 
                  fetchPriority={index === 0 ? "high" : "low"}
                />
              </picture>
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full border border-soft-border/30 bg-white/60 hover:bg-primary-yellow hover:text-charcoal text-charcoal shadow-sm transition-all focus:outline-none cursor-pointer opacity-0 group-hover:opacity-100"
          aria-label="Previous slide"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full border border-soft-border/30 bg-white/60 hover:bg-primary-yellow hover:text-charcoal text-charcoal shadow-sm transition-all focus:outline-none cursor-pointer opacity-0 group-hover:opacity-100"
          aria-label="Next slide"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Indicator Dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex space-x-2.5">
          {bannerSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'w-6 bg-primary-yellow' : 'w-1.5 bg-white/60'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            ></button>
          ))}
        </div>
      </section>


      {/* 4. Featured Products Section - White Background */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-warm-bg">
        
        {/* Section Header */}
        <div className="text-center mb-12 space-y-3">
          <span className="text-primary-yellow text-[12px] sm:text-[13px] tracking-widest font-bold uppercase">The Collection</span>
          <h2 className="font-luxury text-[28px] sm:text-[42px] text-charcoal tracking-wider uppercase leading-[1.15]">Featured Eyewear</h2>
          <p className="text-secondary-text text-[16px] max-w-md mx-auto leading-relaxed">
            Modern frames selected for comfort, confidence, and premium style.
          </p>
        </div>

        {/* Categories Tab Filters */}
        <div className="flex justify-center flex-wrap gap-2.5 mb-16">
          {['All', 'Men', 'Unisex', 'Women'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-6 py-2.5 rounded-full text-[12px] sm:text-[13px] font-bold tracking-wider uppercase border transition-all duration-300 ${
                activeFilter === cat 
                  ? 'bg-primary-yellow text-charcoal border-primary-yellow font-bold' 
                  : 'border-soft-border bg-white text-secondary-text hover:text-charcoal hover:border-charcoal'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-primary-yellow"></div>
          </div>
        ) : (
          <div className="space-y-16">
            
            {/* Products Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
              {filteredProducts.map((product) => {
                const discount = product.discount_price && product.price > product.discount_price
                return (
                  <div
                    key={product.id}
                    className="group relative flex flex-col bg-white rounded-xl overflow-hidden border border-soft-border transition-all duration-300 hover:shadow-md hover:border-charcoal/20"
                  >
                    {/* Image Area */}
                    <Link href={`/product/${product.id}`} className="block relative aspect-square overflow-hidden bg-soft-bg">
                      <img
                        src={product.images?.[0]}
                        alt={product.name}
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
                      />
                      {discount && (
                        <span className="absolute top-3 left-3 bg-primary-yellow text-charcoal font-bold text-[10px] tracking-wider uppercase px-2 py-0.5 rounded">
                          Offer
                        </span>
                      )}
                    </Link>

                    {/* Details Box */}
                    <div className="p-4 sm:p-5 flex-grow flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex justify-between items-center text-[11px] font-bold text-secondary-text uppercase tracking-wider">
                          <span>{product.category || 'Sunglasses'}</span>
                          <span className="text-charcoal font-bold bg-soft-bg px-2 py-0.5 rounded">
                            {product.gender}
                          </span>
                        </div>
                        <Link href={`/product/${product.id}`}>
                          <h3 className="text-[16px] sm:text-[18px] font-bold text-charcoal tracking-wide mt-2 group-hover:text-primary-yellow transition-colors duration-200 line-clamp-1">
                            {product.name}
                          </h3>
                        </Link>
                      </div>

                      {/* Pricing and Cart Actions */}
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex flex-col sm:flex-row sm:items-baseline gap-1">
                          <span className="text-[17px] sm:text-[19px] font-extrabold text-charcoal">
                            ৳{product.discount_price || product.price}
                          </span>
                          {discount && (
                            <span className="text-[12px] text-secondary-text line-through font-normal">
                              ৳{product.price}
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() => addToCart(product, 1)}
                          className="flex items-center justify-center p-2.5 rounded-full border border-soft-border bg-white hover:bg-primary-yellow hover:text-charcoal transition-colors focus:outline-none cursor-pointer"
                          aria-label="Add to cart"
                        >
                          <ShoppingBag size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="text-center pt-4">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center min-h-[44px] gap-2 border border-charcoal bg-white text-[14px] font-bold tracking-widest uppercase text-charcoal hover:bg-secondary-bg px-8 rounded-full transition-all duration-300"
              >
                Explore All Products
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* 5. Shop by Style Section - Soft Cream Background */}
      <section className="py-24 border-t border-soft-border bg-secondary-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center mb-12">
            <span className="text-primary-yellow text-[12px] sm:text-[13px] tracking-widest font-bold uppercase">Curated Styles</span>
            <h2 className="font-luxury text-[28px] sm:text-[42px] text-charcoal tracking-wider uppercase mt-2 leading-[1.15]">Shop By Style</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link
              href="/for-him"
              className="group relative overflow-hidden rounded-xl aspect-[4/5] bg-white border border-soft-border cursor-pointer block"
            >
              <img 
                src="https://res.cloudinary.com/kp0jicx3/image/upload/f_auto,q_auto/v1785265523/for-him_ge4azn.png" 
                alt="For Him Collection" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/40 via-charcoal/5 to-transparent flex flex-col justify-end p-6">
                <span className="font-luxury text-xl sm:text-2xl text-white font-medium uppercase tracking-wider mb-2">For Him</span>
                <span className="inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider text-white group-hover:text-primary-yellow w-fit transition-colors">
                  Explore Style <ArrowRight size={12} />
                </span>
              </div>
            </Link>

            <Link
              href="/for-her"
              className="group relative overflow-hidden rounded-xl aspect-[4/5] bg-white border border-soft-border cursor-pointer block"
            >
              <img 
                src="https://res.cloudinary.com/kp0jicx3/image/upload/f_auto,q_auto/v1785265521/for-her_niqyf0.png" 
                alt="For Her Collection" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/40 via-charcoal/5 to-transparent flex flex-col justify-end p-6">
                <span className="font-luxury text-xl sm:text-2xl text-white font-medium uppercase tracking-wider mb-2">For Her</span>
                <span className="inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider text-white group-hover:text-primary-yellow w-fit transition-colors">
                  Explore Style <ArrowRight size={12} />
                </span>
              </div>
            </Link>

            <Link
              href="/shop"
              className="group relative overflow-hidden rounded-xl aspect-[4/5] bg-white border border-soft-border cursor-pointer block"
            >
              <img 
                src="https://res.cloudinary.com/kp0jicx3/image/upload/f_auto,q_auto/v1785265539/unisex_ihbf3q.png" 
                alt="Unisex Collection" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/40 via-charcoal/5 to-transparent flex flex-col justify-end p-6">
                <span className="font-luxury text-xl sm:text-2xl text-white font-medium uppercase tracking-wider mb-2">Unisex Essentials</span>
                <span className="inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider text-white group-hover:text-primary-yellow w-fit transition-colors">
                  Explore Style <ArrowRight size={12} />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* 6. Brand Statement Section - White Background */}
      <section className="py-24 border-t border-soft-border max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-warm-bg">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 aspect-[3/2] relative rounded-xl overflow-hidden bg-white border border-soft-border">
            <img 
              src="https://res.cloudinary.com/kp0jicx3/image/upload/f_auto,q_auto/v1785265532/jewelry_collections_rlemur.png" 
              alt="MAZISH jewelry collections" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="lg:col-span-5 space-y-6 text-left">
            <h2 className="font-luxury text-[28px] sm:text-[34px] text-charcoal tracking-widest uppercase leading-[1.15]">
              MADE TO BE NOTICED.<br />DESIGNED TO FEEL LIKE YOU.
            </h2>
            <p className="text-secondary-text text-[16px] font-light leading-relaxed">
              MAZISH brings together expressive design, everyday comfort, and accessible luxury. From signature statement eyewear to future jewelry collections, every piece is curated to help you wear your individuality with complete confidence.
            </p>
            <div className="pt-2">
              <Link href="/shop" className="inline-flex items-center gap-1.5 text-[14px] font-bold uppercase tracking-wider text-charcoal hover:text-primary-yellow">
                Explore The Collection <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Earrings Coming Soon Section - Neutral Background */}
      <section id="notify-section" className="py-24 border-t border-soft-border bg-[#F8F6F1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-5 space-y-6 text-left">
            <span className="inline-block text-[12px] font-bold tracking-[0.2em] uppercase text-charcoal bg-white border border-soft-border px-4 py-1.5 rounded-full">
              The Her Edit
            </span>
            <h2 className="font-luxury text-[28px] sm:text-[34px] text-charcoal tracking-wide uppercase leading-[1.15]">
              Earrings & Jewelry<br />Coming Soon
            </h2>
            <p className="text-secondary-text text-[16px] font-light leading-relaxed">
              A refined collection of elegant earrings, modern jewelry, and curated accessories is joining the world of MAZISH. Join our first-access list to receive updates.
            </p>

            <form onSubmit={handleNotifySubmit} className="space-y-3 max-w-md">
              <div className="flex flex-col sm:flex-row gap-2.5">
                <input
                  type="email"
                  required
                  placeholder="Enter your email address"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  className="flex-grow bg-white border border-soft-border focus:border-charcoal focus:outline-none rounded-lg px-5 py-3 text-xs text-charcoal transition-colors"
                />
                <button
                  type="submit"
                  className="bg-primary-yellow hover:bg-deep-yellow text-charcoal text-[12px] font-bold uppercase tracking-widest px-6 py-3.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer min-h-[44px]"
                >
                  Notify Me
                </button>
              </div>
              <p className="text-[12px] text-secondary-text/80 font-light">
                * We value your privacy. We'll only send launch notifications.
              </p>
            </form>

            {notifySuccess && (
              <div className="p-3.5 bg-success/10 border border-success/20 text-success text-xs font-semibold rounded-xl text-center max-w-md">
                {notifySuccess}
              </div>
            )}
          </div>

          <div className="lg:col-span-7 aspect-[3/2] relative rounded-xl overflow-hidden bg-white border border-soft-border">
            <img 
              src="https://res.cloudinary.com/kp0jicx3/image/upload/f_auto,q_auto/v1785265523/earrings1_otvorg.png" 
              alt="MAZISH Premium Earrings Collection" 
              className="w-full h-full object-cover"
            />
          </div>

        </div>
      </section>

      {/* 8. Social Proof & Reviews Section - White Background */}
      <section className="py-24 border-t border-soft-border max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 bg-warm-bg">
        <div className="text-center">
          <span className="text-primary-yellow text-[12px] sm:text-[13px] tracking-widest font-bold uppercase">Testimonials</span>
          <h2 className="font-luxury text-[28px] sm:text-[42px] text-charcoal tracking-wider uppercase mt-2 leading-[1.15]">Verified Reviews</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white border border-soft-border p-8 rounded-xl space-y-4 shadow-sm">
            <div className="flex text-primary-yellow">
              {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
            </div>
            <p className="text-charcoal text-[16px] font-light italic leading-relaxed">
              "Chashmar frame-ta khubee solid ar heavy, amar mukheo khub bhalo set hoyeche. Delivery fast chilo, r glass er finish dekhte ekdom premium lage."
            </p>
            <div>
              <p className="text-charcoal font-bold text-sm">Zayan H.</p>
              <p className="text-[12px] text-secondary-text">Verified Purchase • Black Matte Frame</p>
            </div>
          </div>

          <div className="bg-white border border-soft-border p-8 rounded-xl space-y-4 shadow-sm">
            <div className="flex text-primary-yellow">
              {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
            </div>
            <p className="text-charcoal text-[16px] font-light italic leading-relaxed">
              "Argentina Special Edition order koresilam. Polarized lens er quality khub bhalo ar sky blue detailgulo oshadharon. Customer service niye ami khub satisfied."
            </p>
            <div>
              <p className="text-charcoal font-bold text-sm">Arif R.</p>
              <p className="text-[12px] text-secondary-text">Verified Purchase • Argentina Edition</p>
            </div>
          </div>

          <div className="bg-white border border-soft-border p-8 rounded-xl space-y-4 shadow-sm">
            <div className="flex text-primary-yellow">
              {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
            </div>
            <p className="text-charcoal text-[16px] font-light italic leading-relaxed">
              "Ekdom clean style, unisex fit. Packaging ta khultei monay holo kono high-end luxury brand unbox korchi. Highly recommended!"
            </p>
            <div>
              <p className="text-charcoal font-bold text-sm">Mitali Khan</p>
              <p className="text-[12px] text-secondary-text">Verified Purchase • Gold Polarized</p>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Seen in MAZISH / Social Grid - Soft Cream Background */}
      <section className="py-24 border-t border-soft-border bg-secondary-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center">
            <span className="text-primary-yellow text-[12px] sm:text-[13px] tracking-widest font-bold uppercase">Share Your Style</span>
            <h2 className="font-luxury text-[28px] sm:text-[42px] text-charcoal tracking-wider uppercase mt-2 leading-[1.15]">Seen In MAZISH</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="relative aspect-square overflow-hidden rounded-xl bg-white border border-soft-border">
              <img src="https://res.cloudinary.com/kp0jicx3/image/upload/f_auto,q_auto/v1785265521/glass1_ygfyko.jpg" alt="Seen in MAZISH 1" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="relative aspect-square overflow-hidden rounded-xl bg-white border border-soft-border">
              <img src="https://res.cloudinary.com/kp0jicx3/image/upload/f_auto,q_auto/v1785265522/glass2_hfvwyo.jpg" alt="Seen in MAZISH 2" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="relative aspect-square overflow-hidden rounded-xl bg-white border border-soft-border">
              <img src="https://res.cloudinary.com/kp0jicx3/image/upload/f_auto,q_auto/v1785265522/glass3_hc8gf6.jpg" alt="Seen in MAZISH 3" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="relative aspect-square overflow-hidden rounded-xl bg-white border border-soft-border">
              <img src="https://res.cloudinary.com/kp0jicx3/image/upload/f_auto,q_auto/v1785265522/glass4_bhatvo.jpg" alt="Seen in MAZISH 4" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
            </div>
          </div>
        </div>
      </section>
      
    </div>
  )
}
