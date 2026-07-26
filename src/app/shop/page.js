'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { ShoppingBag, Search, SlidersHorizontal } from 'lucide-react'
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
      setLoading(true)
      const prodData = await getProducts()
      const catData = await getCategories()
      if (prodData && prodData.length > 0) {
        setProducts(prodData)
      }
      if (catData && catData.length > 0) {
        setCategories(catData)
      }
      setLoading(false)
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
    <div className="bg-warm-bg min-h-screen py-16 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Title */}
        <div className="text-center space-y-3">
          <span className="text-primary-yellow text-[12px] sm:text-[13px] tracking-widest font-bold uppercase">Browse Collection</span>
          <h1 className="font-luxury text-[34px] sm:text-[42px] text-charcoal tracking-wider uppercase">THE MAZISH SHOP</h1>
          <div className="h-[1px] w-12 bg-soft-border mx-auto"></div>
        </div>

        {/* Toolbar (Search & Sort) */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-soft-bg border border-soft-border p-4 rounded-2xl">
          {/* Search */}
          <div className="relative w-full md:max-w-xs">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary-text" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-soft-border rounded-lg pl-10 pr-4 py-2.5 text-xs text-charcoal focus:border-charcoal focus:outline-none transition-colors"
            />
          </div>

          {/* Sort selection */}
          <div className="flex items-center gap-3 text-xs w-full md:w-auto justify-end">
            <span className="text-secondary-text flex items-center gap-1.5 font-semibold text-[13px]">
              <SlidersHorizontal size={12} /> Sort By:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-soft-border text-charcoal rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-charcoal"
            >
              <option value="featured">Featured First</option>
              <option value="low-to-high">Price: Low to High</option>
              <option value="high-to-low">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Filters Panel */}
        <div className="flex flex-col md:flex-row gap-6 justify-between items-center pb-6 border-b border-soft-border">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 text-[12px] sm:text-[13px] font-bold uppercase tracking-wider text-secondary-text justify-center md:justify-start">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-4 py-2 rounded-full border transition-all ${
                selectedCategory === 'All'
                  ? 'bg-primary-yellow text-charcoal border-primary-yellow font-bold'
                  : 'border-soft-border bg-white hover:border-charcoal'
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
                    ? 'bg-primary-yellow text-charcoal border-primary-yellow font-bold'
                    : 'border-soft-border bg-white hover:border-charcoal'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Gender Filter */}
          <div className="flex flex-wrap gap-2 text-[12px] sm:text-[13px] font-bold uppercase tracking-wider text-secondary-text justify-center md:justify-end">
            {['All', 'Men', 'Women', 'Unisex'].map((gender) => (
              <button
                key={gender}
                onClick={() => setSelectedGender(gender)}
                className={`px-4 py-2 rounded-full border transition-all ${
                  selectedGender === gender
                    ? 'bg-primary-yellow text-charcoal border-primary-yellow font-bold'
                    : 'border-soft-border bg-white hover:border-charcoal'
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
            <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-primary-yellow"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 text-secondary-text text-sm font-light">
            No products match your selected filters.
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            {filteredProducts.map((product) => {
              const discount = product.discount_price && product.price > product.discount_price
              return (
                <div
                  key={product.id}
                  className="group relative flex flex-col bg-white rounded-2xl overflow-hidden border border-soft-border transition-all duration-300 hover:shadow-md hover:border-charcoal/20"
                >
                  {/* Image */}
                  <Link href={`/product/${product.id}`} className="block relative aspect-square overflow-hidden bg-soft-bg">
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
                  </Link>

                  {/* Details */}
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
                      <p className="text-secondary-text text-[16px] font-light mt-1.5 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>
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

                      {product.stock <= 0 ? (
                        <span className="text-[10px] font-bold text-error bg-error/10 border border-error/20 px-2.5 py-1 rounded uppercase tracking-wider">
                          Sold Out
                        </span>
                      ) : (
                        <button
                          onClick={() => addToCart(product, 1)}
                          className="flex items-center justify-center p-2.5 rounded-full border border-soft-border bg-white hover:bg-primary-yellow hover:text-charcoal transition-colors focus:outline-none cursor-pointer"
                          aria-label="Add to cart"
                        >
                          <ShoppingBag size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
