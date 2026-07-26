'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'
import { getProducts } from '@/lib/db'
import { useCart } from '@/context/CartContext'
import { DEFAULT_PRODUCTS } from '@/lib/products'

export default function ForHerPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const { addToCart } = useCart()

  useEffect(() => {
    async function loadData() {
      const data = await getProducts()
      if (data && data.length > 0) {
        setProducts(data)
      } else {
        setProducts(DEFAULT_PRODUCTS)
      }
      setLoading(false)
    }
    loadData()
  }, [])

  // Explicit Her Selection by Name (Robust against DB vs Fallback IDs)
  const herNames = [
    "MAZISH Stealth Sport",
    "MAZISH Retro Browline",
    "MAZISH Cyber Edge"
  ]
  const womenProducts = products.filter(p => herNames.includes(p.name))

  return (
    <div className="bg-warm-bg min-h-screen py-16 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Title Block */}
        <div className="text-center space-y-3">
          <span className="text-primary-yellow text-[12px] sm:text-[13px] tracking-widest font-bold uppercase">Curated Style</span>
          <h1 className="font-luxury text-[34px] sm:text-[42px] text-charcoal tracking-wider uppercase">FOR HER</h1>
          <p className="text-secondary-text text-[16px] max-w-md mx-auto leading-relaxed">
            Elegant designs, detailed accents, and timeless statement wear for the modern woman.
          </p>
          <div className="h-[1px] w-12 bg-soft-border mx-auto pt-2"></div>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-primary-yellow"></div>
          </div>
        ) : womenProducts.length === 0 ? (
          <div className="text-center py-20 text-secondary-text text-sm font-light">
            No products found in this category.
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            {womenProducts.map((product) => {
              const discount = product.discount_price && product.price > product.discount_price
              return (
                <Link
                  key={product.id}
                  href={`/product/${product.id}`}
                  className="group relative flex flex-col bg-white rounded-2xl overflow-hidden border border-soft-border transition-all duration-300 hover:shadow-md hover:border-charcoal/20 cursor-pointer"
                >
                  {/* Image */}
                  <div className="relative aspect-square overflow-hidden bg-soft-bg">
                    <img
                      src={product.images?.[0]}
                      alt={product.name}
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
                    />
                    {product.stock <= 0 ? (
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
                        <span>{product.category || 'Sunglasses'}</span>
                        <span className="text-charcoal font-bold bg-soft-bg px-2 py-0.5 rounded">
                          {product.gender}
                        </span>
                      </div>
                      <h3 className="text-[16px] sm:text-[18px] font-bold text-charcoal tracking-wide mt-2 group-hover:text-primary-yellow transition-colors duration-200 line-clamp-1">
                        {product.name}
                      </h3>
                    </div>

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

                      {product.stock > 0 && (
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            addToCart(product, 1)
                          }}
                          className="flex items-center justify-center p-2.5 rounded-full border border-soft-border bg-white hover:bg-primary-yellow hover:text-charcoal transition-colors focus:outline-none cursor-pointer relative z-20"
                          aria-label="Add to cart"
                        >
                          <ShoppingBag size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
