'use client'

import React, { use, useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, ShoppingBag, Truck, Shield, CheckCircle } from 'lucide-react'
import { getProductById } from '@/lib/db'
import { useCart } from '@/context/CartContext'
import { DEFAULT_PRODUCTS } from '@/lib/products'

export default function ProductPage({ params }) {
  const { id } = use(params)
  
  // Optimistically load from static fallback to make the page open instantly
  const initialProduct = DEFAULT_PRODUCTS.find(p => p.id === id) || null

  const [product, setProduct] = useState(initialProduct)
  const [loading, setLoading] = useState(initialProduct ? false : true)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const { addToCart } = useCart()

  useEffect(() => {
    async function loadProduct() {
      if (id) {
        const data = await getProductById(id)
        if (data) {
          setProduct(data)
        }
      }
      setLoading(false)
    }
    loadProduct()
  }, [id])

  useEffect(() => {
    if (product && typeof window !== 'undefined') {
      window.dataLayer = window.dataLayer || []
      window.dataLayer.push({ ecommerce: null })
      window.dataLayer.push({
        event: 'view_item',
        ecommerce: {
          currency: 'BDT',
          value: product.discount_price || product.price,
          items: [{
            item_id: product.id,
            item_name: product.name,
            price: product.discount_price || product.price,
            item_category: product.category,
            item_gender: product.gender,
            quantity: 1
          }]
        }
      })
    }
  }, [product])

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-zinc-950">
        <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-amber-500"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-[70vh] bg-zinc-950 px-4 py-20 text-center flex flex-col items-center justify-center">
        <h2 className="font-luxury text-3xl text-white mb-4">Product Not Found</h2>
        <p className="text-zinc-500 mb-8 max-w-sm font-light">The luxury piece you are looking for does not exist or has been sold out.</p>
        <Link href="/" className="text-amber-500 border border-amber-500/30 px-6 py-2.5 rounded-full hover:bg-amber-500 hover:text-zinc-950 transition-all font-semibold uppercase text-xs tracking-wider">
          Return Home
        </Link>
      </div>
    )
  }

  const handleAddToCart = () => {
    addToCart(product, quantity)
    setAdded(true)
    setTimeout(() => setAdded(false), 3000)
  }

  const price = product.discount_price || product.price

  return (
    <div className="bg-zinc-950 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Back Link */}
        <Link href="/" className="inline-flex items-center text-xs tracking-widest uppercase text-zinc-500 hover:text-white transition-colors mb-12">
          <ArrowLeft size={16} className="mr-2" />
          Back to collection
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Left Column - Product Image & Gallery */}
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-2xl border border-zinc-900 bg-zinc-900/20 aspect-square flex items-center justify-center">
              <Image
                src={product.images?.[activeImageIndex] || product.images?.[0]}
                alt={product.name}
                fill
                className="object-cover"
              />
              {product.discount_price && (
                <span className="absolute top-6 left-6 bg-amber-500 text-zinc-950 font-bold text-xs tracking-wider uppercase px-3.5 py-1.5 rounded shadow-lg">
                  Special Pricing
                </span>
              )}
            </div>
            
            {/* Gallery Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border bg-zinc-950/40 transition-all relative ${
                      idx === activeImageIndex ? 'border-amber-500' : 'border-zinc-900 hover:border-zinc-800'
                    }`}
                  >
                    <Image src={img} alt={`${product.name} View ${idx + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Product Info */}
          <div className="flex flex-col justify-center space-y-8">
            <div className="space-y-4">
              <span className="text-xs font-semibold text-amber-500 tracking-[0.2em] uppercase">
                {product.category}
              </span>
              <h1 className="font-luxury text-3xl sm:text-4xl lg:text-5xl text-white tracking-wide leading-tight">
                {product.name}
              </h1>
              <div className="flex items-baseline space-x-4">
                <span className="text-2xl sm:text-3xl font-bold text-amber-500">
                  ৳{price}
                </span>
                {product.discount_price && (
                  <span className="text-base text-zinc-600 line-through">
                    ৳{product.price}
                  </span>
                )}
              </div>
            </div>

            <div className="h-[1px] w-full bg-zinc-900"></div>

            <div className="space-y-3">
              <h3 className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Description</h3>
              <p className="text-zinc-500 text-sm font-light leading-relaxed">
                {product.description}
              </p>
            </div>

            <div className="space-y-6 pt-4">
              {/* Quantity Selector */}
              <div className="flex items-center space-x-4">
                <span className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Quantity:</span>
                <div className="flex items-center border border-zinc-800 rounded-lg bg-zinc-900/40">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 text-zinc-400 hover:text-white"
                  >
                    -
                  </button>
                  <span className="px-4 text-sm font-medium text-white">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 text-zinc-400 hover:text-white"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Add To Cart Trigger */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 flex items-center justify-center gap-3 bg-amber-500 text-zinc-950 font-bold uppercase tracking-widest text-xs py-4 rounded-full hover:bg-amber-400 transition-all duration-300 shadow-[0_0_20px_rgba(245,158,11,0.15)]"
                >
                  <ShoppingBag size={16} className="stroke-[2.5]" />
                  {added ? 'Added to Selection' : 'Add to Selection'}
                </button>

                <Link
                  href="/checkout"
                  onClick={() => addToCart(product, quantity)}
                  className="flex-1 flex items-center justify-center border border-zinc-800 text-white font-bold uppercase tracking-widest text-xs py-4 rounded-full hover:bg-white hover:text-zinc-950 transition-all duration-300"
                >
                  Instant Buy Now
                </Link>
              </div>
            </div>

            <div className="h-[1px] w-full bg-zinc-900"></div>

            {/* Guarantees */}
            <div className="grid grid-cols-2 gap-4 text-xs font-light text-zinc-500">
              <div className="flex items-center space-x-2.5">
                <Shield size={16} className="text-amber-500" />
                <span>100% Genuine Luxury product</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <Truck size={16} className="text-amber-500" />
                <span>Steadfast Delivery Partner</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
