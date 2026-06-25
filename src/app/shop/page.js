'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingBag, Search, Tag, SlidersHorizontal } from 'lucide-react'
import { getProducts, getCategories } from '@/lib/db'
import { useCart } from '@/context/CartContext'
import { DEFAULT_PRODUCTS } from '@/lib/products'

export default function ShopPage() {
  const [products, setProducts] = useState(DEFAULT_PRODUCTS)
  const [categories, setCategories] = useState([
    { name: 'Sunglasses' },
    { name: 'Apparel' },
    { name: 'Accessories' },
    { name: 'FIFA Special Edition' }
  ])
  const [loading, setLoading] = useState(false)
  const { addToCart } = useCart()

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedGender, setSelectedGender] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('featured') // 'featured', 'low-to-high', 'high-to-low'

  useEffect(() => {
    async function loadData() {
      const prodData = await getProducts()
      const catData = await getCategories()
      if (prodData && prodData.length > 0) {
        setProducts(prodData)
      }
      if (catData && catData.length > 0) {
        setCategories(catData)
      }
    }
    loadData()
  }, [])

  // Filter & Sort Logic
  const filteredProducts = products
    .filter((p) => {
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory
      const matchesGender = selectedGender === 'All' || p.gender === selectedGender || p.gender === 'Unisex'
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            p.description.toLowerCase().includes(searchTerm.toLowerCase())

      return matchesCategory && matchesGender && matchesSearch
    })
    .sort((a, b) => {
      const priceA = a.discount_price || a.price
      const priceB = b.discount_price || b.price

      if (sortBy === 'low-to-high') return priceA - priceB
      if (sortBy === 'high-to-low') return priceB - priceA
      return b.is_featured - a.is_featured // Default: featured first
    })

  return (
    <div className="bg-zinc-950 min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Title */}
        <div className="text-center space-y-3">
          <span className="text-amber-500 text-xs tracking-widest font-semibold uppercase">Browse Collection</span>
          <h1 className="font-luxury text-4xl sm:text-5xl text-white tracking-wider">THE MAZISH SHOP</h1>
          <div className="h-[1px] w-16 bg-zinc-800 mx-auto"></div>
        </div>

        {/* Toolbar (Search & Sort) */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-zinc-900/20 border border-zinc-900 p-4 rounded-2xl">
          {/* Search */}
          <div className="relative w-full md:max-w-xs">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-850 rounded-lg pl-10 pr-4 py-2.5 text-xs text-white focus:border-amber-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Sort selection */}
          <div className="flex items-center gap-3 text-xs w-full md:w-auto justify-end">
            <span className="text-zinc-500 flex items-center gap-1.5 font-medium">
              <SlidersHorizontal size={14} /> Sort By:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-zinc-950 border border-zinc-850 text-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-500"
            >
              <option value="featured">Featured First</option>
              <option value="low-to-high">Price: Low to High</option>
              <option value="high-to-low">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Filters Panel */}
        <div className="flex flex-col md:flex-row gap-6 justify-between items-center pb-6 border-b border-zinc-900">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-zinc-400 justify-center md:justify-start">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-4 py-2 rounded-full border transition-all ${
                selectedCategory === 'All'
                  ? 'bg-amber-500 text-zinc-950 border-amber-500'
                  : 'border-zinc-850 bg-zinc-950/40 hover:border-zinc-750'
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-4 py-2 rounded-full border transition-all ${
                  selectedCategory === cat.name
                    ? 'bg-amber-500 text-zinc-950 border-amber-500'
                    : 'border-zinc-850 bg-zinc-950/40 hover:border-zinc-750'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Gender Filter */}
          <div className="flex flex-wrap gap-2 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-zinc-400 justify-center md:justify-end">
            {['All', 'Men', 'Women', 'Unisex'].map((gender) => (
              <button
                key={gender}
                onClick={() => setSelectedGender(gender)}
                className={`px-4 py-2 rounded-full border transition-all ${
                  selectedGender === gender
                    ? 'bg-amber-500 text-zinc-950 border-amber-500'
                    : 'border-zinc-850 bg-zinc-950/40 hover:border-zinc-750'
                }`}
              >
                {gender === 'All' ? 'All Genders' : gender}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-amber-500"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 text-zinc-500 text-sm font-light">
            No products match your selected filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="group relative flex flex-col bg-zinc-900/40 rounded-xl overflow-hidden border border-zinc-900 hover:border-zinc-800 transition-all duration-300"
              >
                {/* Image */}
                <Link href={`/product/${product.id}`} className="block relative aspect-square overflow-hidden bg-zinc-950">
                  <Image
                    src={product.images?.[0]}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                   {product.stock <= 0 ? (
                    <span className="absolute top-4 left-4 bg-red-600 text-white font-bold text-[10px] tracking-wider uppercase px-2.5 py-1 rounded">
                      Sold Out
                    </span>
                  ) : product.discount_price ? (
                    <span className="absolute top-4 left-4 bg-amber-500 text-zinc-950 font-bold text-[10px] tracking-wider uppercase px-2.5 py-1 rounded">
                      Special Offer
                    </span>
                  ) : null}
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

                    {product.stock <= 0 ? (
                      <span className="text-[9px] font-bold text-red-400 bg-red-950/30 border border-red-500/10 px-2.5 py-1 rounded uppercase tracking-wider">
                        Sold Out
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          addToCart(product, 1)
                        }}
                        className="flex items-center justify-center p-2 rounded-full border border-zinc-800 bg-zinc-950 hover:bg-amber-500 hover:text-zinc-950 transition-colors"
                        aria-label="Add to cart"
                      >
                        <ShoppingBag size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
