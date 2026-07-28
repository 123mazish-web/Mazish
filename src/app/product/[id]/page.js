'use client'

import React, { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ShoppingBag, Truck, Shield } from 'lucide-react'
import { getProductById, getProducts } from '@/lib/db'
import { useCart } from '@/context/CartContext'
import { DEFAULT_PRODUCTS } from '@/lib/products'

export default function ProductPage({ params }) {
  const unwrappedParams = params && typeof params.then === 'function' ? use(params) : params
  const id = unwrappedParams?.id
  
  // Optimistically load from static fallback to make the page open instantly
  const initialProduct = DEFAULT_PRODUCTS.find(p => p.id === id) || null

  const [product, setProduct] = useState(initialProduct)
  const [loading, setLoading] = useState(initialProduct ? false : true)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [allProducts, setAllProducts] = useState([])
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
    async function loadCatalog() {
      const data = await getProducts()
      if (data && data.length > 0) {
        setAllProducts(data)
      } else {
        setAllProducts(DEFAULT_PRODUCTS)
      }
    }
    loadCatalog()
  }, [])

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
      <div className="flex min-h-[70vh] items-center justify-center bg-warm-bg transition-colors duration-300">
        <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-primary-yellow"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-[70vh] bg-warm-bg px-4 py-20 text-center flex flex-col items-center justify-center transition-colors duration-300">
        <h2 className="font-luxury text-[34px] text-charcoal mb-4">Product Not Found</h2>
        <p className="text-secondary-text mb-8 max-w-sm font-light text-[16px]">The luxury piece you are looking for does not exist or has been sold out.</p>
        <Link href="/" className="text-charcoal border border-soft-border px-6 py-2.5 rounded-full hover:bg-secondary-bg transition-all font-semibold uppercase text-xs tracking-wider">
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
  const isSoldOut = (product.stock !== undefined ? product.stock : 20) <= 0

  let relatedProducts = allProducts.filter(p => p.id !== id && (p.category === product.category || p.gender === product.gender))
  if (relatedProducts.length === 0) {
    relatedProducts = allProducts.filter(p => p.id !== id)
  }
  relatedProducts = relatedProducts.slice(0, 4)

  return (
    <div className="bg-warm-bg min-h-screen py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300 pb-28 md:pb-12">
      <div className="max-w-7xl mx-auto">
        
        {/* Back Link */}
        <Link href="/" className="inline-flex items-center text-xs tracking-widest uppercase text-secondary-text hover:text-charcoal transition-colors mb-12">
          <ArrowLeft size={14} className="mr-2" />
          Back to collection
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          
          {/* Left Column - Product Image & Gallery */}
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-xl border border-soft-border bg-[#FFFDF7] aspect-square flex items-center justify-center">
              <img
                src={product.images?.[activeImageIndex] || product.images?.[0] || 'https://res.cloudinary.com/kp0jicx3/image/upload/f_auto,q_auto/v1785265528/Sunglass1_zufdif.png'}
                alt={product.name}
                className="object-cover w-full h-full"
              />
              {product.discount_price && (
                <span className="absolute top-6 left-6 bg-primary-yellow text-charcoal font-bold text-xs tracking-wider uppercase px-3.5 py-1.5 rounded shadow-sm">
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
                    className={`h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border bg-white transition-all relative ${
                      idx === activeImageIndex ? 'border-primary-yellow ring-2 ring-primary-yellow/20' : 'border-soft-border hover:border-charcoal/30'
                    }`}
                  >
                    <img src={img} alt={`${product.name} View ${idx + 1}`} className="object-cover w-full h-full" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Product Info */}
          <div className="flex flex-col justify-center space-y-8">
            <div className="space-y-4">
              <span className="text-[12px] font-bold text-primary-yellow tracking-[0.2em] uppercase">
                {product.category || 'Sunglasses'}
              </span>
              <h1 className="font-luxury text-[34px] sm:text-[42px] text-charcoal tracking-wide leading-[1.15]">
                {product.name}
              </h1>
              <div className="flex items-baseline space-x-4">
                <span className="text-[22px] sm:text-[26px] font-extrabold text-charcoal">
                  ৳{price}
                </span>
                {product.discount_price && (
                  <span className="text-sm sm:text-base text-secondary-text line-through font-normal">
                    ৳{product.price}
                  </span>
                )}
              </div>
            </div>

            <div className="h-[1px] w-full bg-soft-border"></div>

            <div className="space-y-3">
              <h3 className="text-charcoal text-[13px] font-bold uppercase tracking-wider">Description</h3>
              <p className="text-secondary-text text-[16px] font-light leading-relaxed">
                {product.description}
              </p>
            </div>

            <div className="space-y-6 pt-2">
              {/* Quantity Selector */}
              <div className="flex items-center space-x-4">
                <span className="text-secondary-text text-[13px] font-bold uppercase tracking-wider">Quantity:</span>
                <div className="flex items-center border border-soft-border rounded-lg bg-[#F8F6F1]">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 text-secondary-text hover:text-charcoal focus:outline-none"
                  >
                    -
                  </button>
                  <span className="px-4 text-[16px] font-bold text-charcoal">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 text-secondary-text hover:text-charcoal focus:outline-none"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Add To Cart Actions */}
              <div className="flex flex-col sm:flex-row gap-4">
                {isSoldOut ? (
                  <button
                    disabled
                    className="flex-1 flex items-center justify-center gap-3 bg-soft-bg border border-soft-border text-secondary-text font-bold uppercase tracking-widest text-[13px] py-4 rounded-lg cursor-not-allowed min-h-[44px]"
                  >
                    Sold Out
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleAddToCart}
                      className="flex-1 flex items-center justify-center gap-3 bg-primary-yellow text-charcoal font-bold uppercase tracking-widest text-[13px] py-4 rounded-lg hover:bg-deep-yellow transition-all duration-300 shadow-sm cursor-pointer min-h-[44px]"
                    >
                      <ShoppingBag size={15} />
                      {added ? 'Added to Selection' : 'Add to Selection'}
                    </button>

                    <Link
                      href="/checkout"
                      onClick={() => addToCart(product, quantity)}
                      className="flex-1 flex items-center justify-center border border-charcoal text-charcoal font-bold uppercase tracking-widest text-[13px] py-4 rounded-lg bg-white hover:bg-secondary-bg transition-all duration-300 text-center min-h-[44px]"
                    >
                      Instant Buy Now
                    </Link>
                  </>
                )}
              </div>
            </div>

            <div className="h-[1px] w-full bg-soft-border"></div>

            {/* Guarantees */}
            <div className="grid grid-cols-2 gap-4 text-xs font-light text-secondary-text">
              <div className="flex items-center space-x-2.5 font-medium text-[13px]">
                <Shield size={16} className="text-primary-yellow" />
                <span>100% Genuine Luxury Brand</span>
              </div>
              <div className="flex items-center space-x-2.5 font-medium text-[13px]">
                <Truck size={16} className="text-primary-yellow" />
                <span>Steadfast Delivery Network</span>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="border-t border-soft-border pt-16 mt-20 space-y-10">
            <div className="text-center space-y-2">
              <span className="text-primary-yellow text-[12px] sm:text-[13px] tracking-widest font-bold uppercase">Discover More</span>
              <h2 className="font-luxury text-[26px] sm:text-[32px] text-charcoal tracking-wider uppercase">Related Products</h2>
              <div className="h-[1px] w-12 bg-soft-border mx-auto pt-2"></div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
              {relatedProducts.map((p) => {
                const discount = p.discount_price && p.price > p.discount_price
                return (
                  <Link
                    key={p.id}
                    href={`/product/${p.id}`}
                    className="group relative flex flex-col bg-white rounded-2xl overflow-hidden border border-soft-border transition-all duration-300 hover:shadow-md hover:border-charcoal/20 cursor-pointer"
                  >
                    {/* Image */}
                    <div className="relative aspect-square overflow-hidden bg-soft-bg">
                      <img
                        src={p.images?.[0]}
                        alt={p.name}
                        className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
                      />
                      {p.stock <= 0 ? (
                        <span className="absolute top-3 left-3 bg-error text-white font-bold text-[10px] tracking-wider uppercase px-2 py-0.5 rounded">
                          Sold Out
                        </span>
                      ) : discount ? (
                        <span className="absolute top-3 left-3 bg-primary-yellow text-charcoal font-bold text-[10px] tracking-wider uppercase px-2 py-0.5 rounded">
                          Offer
                        </span>
                      ) : null}
                    </div>

                    {/* Details */}
                    <div className="p-4 sm:p-5 flex-grow flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex justify-between items-center text-[11px] font-bold text-secondary-text uppercase tracking-wider">
                          <span>{p.category || 'Sunglasses'}</span>
                          <span className="text-charcoal font-bold bg-soft-bg px-2 py-0.5 rounded text-[10px]">
                            {p.gender}
                          </span>
                        </div>
                        <h3 className="text-[15px] sm:text-[17px] font-bold text-charcoal tracking-wide mt-2 group-hover:text-primary-yellow transition-colors duration-200 line-clamp-1">
                          {p.name}
                        </h3>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <div className="flex flex-col sm:flex-row sm:items-baseline gap-1">
                          <span className="text-[16px] sm:text-[18px] font-extrabold text-charcoal">
                            ৳{p.discount_price || p.price}
                          </span>
                          {discount && (
                            <span className="text-[11px] text-secondary-text line-through font-normal">
                              ৳{p.price}
                            </span>
                          )}
                        </div>

                        {p.stock > 0 && (
                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              addToCart(p, 1)
                            }}
                            className="flex items-center justify-center p-2 rounded-full border border-soft-border bg-white hover:bg-primary-yellow hover:text-charcoal transition-colors focus:outline-none cursor-pointer relative z-20"
                          >
                            <ShoppingBag size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Sticky Mobile Add to Cart Bar */}
      {!isSoldOut && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-soft-border px-6 py-4 flex items-center justify-between gap-4 md:hidden shadow-lg">
          <div className="flex flex-col">
            <span className="text-[12px] text-secondary-text font-bold uppercase tracking-wider truncate max-w-[150px]">
              {product.name}
            </span>
            <span className="text-[17px] font-extrabold text-charcoal">
              ৳{price}
            </span>
          </div>
          <button
            onClick={handleAddToCart}
            className="bg-primary-yellow hover:bg-deep-yellow text-charcoal text-[12px] font-bold uppercase tracking-widest px-6 py-3.5 rounded-lg transition-colors flex items-center gap-2 cursor-pointer min-h-[44px]"
          >
            <ShoppingBag size={12} />
            {added ? 'Added' : 'Add Bag'}
          </button>
        </div>
      )}
    </div>
  )
}
