'use client'

import React, { useState } from 'react'
import {
  Package,
  PlusCircle,
  Edit2,
  Trash2,
  Search,
  CheckCircle,
  Tag,
  ListFilter,
  Eye,
  X,
  Plus,
  ChevronDown,
  Glasses,
  Wallet,
  Check
} from 'lucide-react'
import ProductImageUploader from './ProductImageUploader'
import {
  DEFAULT_DESCRIPTION_POINTS,
  parseDescriptionTo4Points,
  format4PointsToDescription,
} from '@/lib/products'

export default function ProductsManager({
  products = [],
  categories = [],
  promoCodes = [],
  actionLoading,
  activeSubView = 'catalog',
  onToggleStock,
  onSaveProduct,
  onSaveNewProduct,
  onDeleteProduct,
  onAddCategory,
  onDeleteCategory,
  onAddTag,
  onRemoveTag,
  onAddPromo,
  onTogglePromo,
  onDeletePromo,
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [editingProduct, setEditingProduct] = useState(null)

  // Per-category tag input state for Category view: { 'Sunglasses': 'Aviator', 'Wallets': '' }
  const [tagInputs, setTagInputs] = useState({})

  // Custom tag input for Add Product
  const [customTagInput, setCustomTagInput] = useState('')

  // Custom tag input for Edit Product Modal
  const [editCustomTagInput, setEditCustomTagInput] = useState('')

  // 4-Point Description State for Add Product (Strictly 4 Points, no paragraphs)
  const [descPoints, setDescPoints] = useState([...DEFAULT_DESCRIPTION_POINTS])

  // 4-Point Description State for Edit Product Modal
  const [editDescPoints, setEditDescPoints] = useState([...DEFAULT_DESCRIPTION_POINTS])

  const handleOpenEdit = (product) => {
    setEditingProduct(product)
    setEditDescPoints(parseDescriptionTo4Points(product.description))
    setEditCustomTagInput('')
  }

  // New Product Form State
  const [newProd, setNewProd] = useState({
    name: '',
    description: '',
    price: '',
    discount_price: '',
    images: ['https://res.cloudinary.com/kp0jicx3/image/upload/f_auto,q_auto/v1785265528/Sunglass1_zufdif.png'],
    category: categories[0]?.name || 'Sunglasses',
    tags: [],
    gender: 'Unisex',
    stock: 20,
    is_featured: false,
  })

  // New Category State
  const [categoryInput, setCategoryInput] = useState('')

  // New Promo State
  const [promoForm, setPromoForm] = useState({
    code: '',
    discount_type: 'percentage',
    discount_value: '',
    is_active: true,
  })

  // Filter Catalog
  const filteredProducts = products.filter((p) =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleEditSubmit = (e) => {
    e.preventDefault()
    if (!editingProduct) return
    const finalDesc = format4PointsToDescription(editDescPoints)
    onSaveProduct({
      ...editingProduct,
      description: finalDesc,
    })
    setEditingProduct(null)
  }

  const handleCreateSubmit = (e) => {
    e.preventDefault()
    if (!newProd.name || !newProd.price) {
      alert('Product name and price are required.')
      return
    }
    const finalDesc = format4PointsToDescription(descPoints)
    onSaveNewProduct({
      ...newProd,
      description: finalDesc,
    })
    setNewProd({
      name: '',
      description: '',
      price: '',
      discount_price: '',
      images: ['https://res.cloudinary.com/kp0jicx3/image/upload/f_auto,q_auto/v1785265528/Sunglass1_zufdif.png'],
      category: categories[0]?.name || 'Sunglasses',
      tags: [],
      gender: 'Unisex',
      stock: 20,
      is_featured: false,
    })
    setDescPoints([...DEFAULT_DESCRIPTION_POINTS])
    setCustomTagInput('')
  }

  return (
    <div className="space-y-7">
      
      {/* 1. CATALOG VIEW */}
      {activeSubView === 'catalog' && (
        <div className="space-y-6">
          
          {/* Large Title Bar & Large Search Input */}
          <div className="bg-white border border-soft-border/90 p-6 sm:p-8 rounded-2xl shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
              <div>
                <h1 className="font-luxury text-3xl sm:text-4xl lg:text-[40px] font-normal text-charcoal tracking-wide">
                  INVENTORY & PRODUCTS CATALOG
                </h1>
                <p className="text-sm sm:text-base text-secondary-text mt-1 font-light">
                  Manage active stock counts, pricing, discount offers, and product metadata
                </p>
              </div>

              {/* Large Search Box */}
              <div className="relative w-full sm:w-80">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-text" />
                <input
                  type="text"
                  placeholder="Search catalog..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-soft-bg border border-soft-border rounded-2xl pl-11 pr-4 py-3 text-sm text-charcoal font-medium focus:border-charcoal focus:outline-none transition-colors shadow-2xs"
                />
              </div>
            </div>
          </div>

          {/* Large, Beautifully Spaced Products Table */}
          <div className="bg-white border border-soft-border/90 rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-soft-bg border-b border-soft-border text-secondary-text uppercase font-extrabold tracking-wider text-xs sm:text-[13px]">
                    <th className="py-4.5 px-6">PRODUCT</th>
                    <th className="py-4.5 px-6">CATEGORY & GENDER</th>
                    <th className="py-4.5 px-6">RETAIL PRICE</th>
                    <th className="py-4.5 px-6">DISCOUNT PRICE</th>
                    <th className="py-4.5 px-6">STOCK STATUS</th>
                    <th className="py-4.5 px-6 text-center">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-soft-border/70">
                  {filteredProducts.map((p) => {
                    const isOutOfStock = p.stock === 0

                    return (
                      <tr key={p.id} className="hover:bg-soft-bg/50 transition-colors">
                        
                        {/* Product Info with Standard Clean Image & Typography */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3.5">
                            <div className="h-12 w-12 sm:h-14 sm:w-14 shrink-0 rounded-xl bg-white p-1.5 border border-soft-border shadow-2xs flex items-center justify-center overflow-hidden">
                              <img
                                src={p.images?.[0] || 'https://res.cloudinary.com/kp0jicx3/image/upload/f_auto,q_auto/v1785265528/Sunglass1_zufdif.png'}
                                alt={p.name}
                                className="h-full w-full object-contain"
                              />
                            </div>
                            <div className="space-y-0.5">
                              <h3 className="font-semibold text-sm sm:text-base text-charcoal leading-snug">
                                {p.name}
                              </h3>
                              {p.is_featured && (
                                <span className="inline-block text-[10px] font-bold uppercase tracking-wider bg-[#FFF9E8] text-[#9E7308] border border-[#F4C542]/50 px-2 py-0.2 rounded-md shadow-2xs">
                                  FEATURED
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Category & Gender & Tags */}
                        <td className="py-4 px-6 space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-semibold text-sm text-charcoal">
                              {p.category}
                            </span>
                            <span className="text-[11px] text-secondary-text font-medium bg-soft-bg px-2 py-0.5 rounded">
                              {p.gender || 'Unisex'}
                            </span>
                          </div>
                          {p.tags && Array.isArray(p.tags) && p.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {p.tags.map((t) => (
                                <span
                                  key={t}
                                  className="inline-flex items-center text-[10px] font-bold bg-[#FFF9E8] text-[#9E7308] border border-[#F4C542]/40 px-1.5 py-0.5 rounded"
                                >
                                  #{t}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>

                        {/* Retail Price */}
                        <td className="py-4 px-6">
                          <span className="font-sans font-bold text-sm sm:text-base text-charcoal">
                            ৳{p.price}
                          </span>
                        </td>

                        {/* Discount Price */}
                        <td className="py-4 px-6">
                          {p.discount_price ? (
                            <span className="font-sans font-bold text-sm sm:text-base text-emerald-600">
                              ৳{p.discount_price}
                            </span>
                          ) : (
                            <span className="text-secondary-text text-xs">—</span>
                          )}
                        </td>

                        {/* Stock Status Button */}
                        <td className="py-4 px-6">
                          <button
                            onClick={() => onToggleStock(p)}
                            disabled={actionLoading === p.id + '-stock'}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-2xs ${
                              isOutOfStock
                                ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                                : 'bg-[#EAF7EE] text-[#0F766E] border border-[#A6E6BD] hover:bg-[#D7F3E2]'
                            }`}
                          >
                            {isOutOfStock ? 'OUT OF STOCK' : `IN STOCK (${p.stock ?? 10})`}
                          </button>
                        </td>

                        {/* Action Edit Button */}
                        <td className="py-4 px-6 text-center">
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="h-9 w-9 rounded-lg bg-soft-bg hover:bg-zinc-200 border border-soft-border/80 inline-flex items-center justify-center text-charcoal transition-all cursor-pointer shadow-2xs"
                            title="Edit product"
                          >
                            <Edit2 size={15} />
                          </button>
                        </td>

                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. ADD PRODUCT FORM (Large inputs) */}
      {activeSubView === 'new-product' && (
        <div className="bg-white border border-soft-border/90 p-8 sm:p-10 rounded-2xl shadow-xs space-y-7">
          <div className="pb-4 border-b border-soft-border/70">
            <h2 className="font-luxury text-3xl sm:text-4xl font-normal text-charcoal flex items-center gap-3">
              <PlusCircle size={28} className="text-[#F5C443]" />
              ADD NEW EYEWEAR PRODUCT
            </h2>
            <p className="text-sm sm:text-base text-secondary-text mt-1 font-light">
              Publish new luxury sunglasses models to the Mazish catalog
            </p>
          </div>

          <form onSubmit={handleCreateSubmit} className="space-y-5 max-w-3xl text-sm">
            <div>
              <label className="font-bold text-charcoal uppercase block mb-1.5 text-xs sm:text-sm">
                Product Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. MAZISH Solaris Gold"
                value={newProd.name}
                onChange={(e) => setNewProd({ ...newProd, name: e.target.value })}
                className="w-full bg-soft-bg border border-soft-border rounded-xl px-4 py-3 text-charcoal font-bold text-base focus:border-charcoal focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="font-bold text-charcoal uppercase block mb-1.5 text-xs sm:text-sm">
                  Retail Price (৳) *
                </label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 1950"
                  value={newProd.price}
                  onChange={(e) => setNewProd({ ...newProd, price: e.target.value })}
                  className="w-full bg-soft-bg border border-soft-border rounded-xl px-4 py-3 text-charcoal font-bold text-base focus:border-charcoal focus:outline-none"
                />
              </div>
              <div>
                <label className="font-bold text-charcoal uppercase block mb-1.5 text-xs sm:text-sm">
                  Discount Price (৳)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 1799"
                  value={newProd.discount_price}
                  onChange={(e) => setNewProd({ ...newProd, discount_price: e.target.value })}
                  className="w-full bg-soft-bg border border-soft-border rounded-xl px-4 py-3 text-charcoal font-bold text-base focus:border-charcoal focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-5">
              <div>
                <label className="font-bold text-charcoal uppercase block mb-1.5 text-xs sm:text-sm">
                  Category
                </label>
                <select
                  value={newProd.category}
                  onChange={(e) => setNewProd({ ...newProd, category: e.target.value })}
                  className="w-full bg-soft-bg border border-soft-border rounded-xl px-4 py-3 font-semibold text-sm"
                >
                  {categories.map((c) => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-charcoal uppercase block mb-1.5 text-xs sm:text-sm">
                  Gender Focus
                </label>
                <select
                  value={newProd.gender}
                  onChange={(e) => setNewProd({ ...newProd, gender: e.target.value })}
                  className="w-full bg-soft-bg border border-soft-border rounded-xl px-4 py-3 font-semibold text-sm"
                >
                  <option value="Unisex">Unisex</option>
                  <option value="Men">Men</option>
                  <option value="Women">Women</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-charcoal uppercase block mb-1.5 text-xs sm:text-sm">
                  Initial Stock Count
                </label>
                <input
                  type="number"
                  value={newProd.stock}
                  onChange={(e) => setNewProd({ ...newProd, stock: Number(e.target.value) })}
                  className="w-full bg-soft-bg border border-soft-border rounded-xl px-4 py-3 font-bold text-base"
                />
              </div>
            </div>

            {/* Tags for this Product (from selected category) */}
            <div className="bg-soft-bg/60 border border-soft-border/80 p-4 sm:p-5 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-bold text-charcoal uppercase text-xs sm:text-sm flex items-center gap-2">
                  <Tag size={15} className="text-[#F5C443]" />
                  Product Tags for &quot;{newProd.category}&quot;
                </label>
                <span className="text-xs text-secondary-text">Click tags to attach to this product</span>
              </div>

              {(() => {
                const activeCatObj = categories.find(
                  (c) => c.name.toLowerCase() === (newProd.category || '').toLowerCase()
                )
                const catTags = activeCatObj?.tags || []

                return (
                  <div className="space-y-3">
                    {catTags.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {catTags.map((tag) => {
                          const isSelected = (newProd.tags || []).includes(tag)
                          return (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => {
                                const current = newProd.tags || []
                                const updated = isSelected
                                  ? current.filter((t) => t !== tag)
                                  : [...current, tag]
                                setNewProd({ ...newProd, tags: updated })
                              }}
                              className={`text-xs px-3.5 py-1.5 rounded-full font-bold transition-all cursor-pointer border ${
                                isSelected
                                  ? 'bg-[#F5C443] text-charcoal border-[#E5B537] shadow-xs'
                                  : 'bg-white text-secondary-text border-soft-border hover:border-charcoal hover:text-charcoal'
                              }`}
                            >
                              {isSelected ? `✓ #${tag}` : `+ #${tag}`}
                            </button>
                          )
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-secondary-text italic">
                        No tags found under {newProd.category}. You can add tags in the Category tab or type custom tags below.
                      </p>
                    )}

                    {/* Custom Tag input for this product */}
                    <div className="flex gap-2 max-w-sm pt-1">
                      <input
                        type="text"
                        placeholder="Add custom tag (e.g. Vintage)..."
                        value={customTagInput}
                        onChange={(e) => setCustomTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            const val = customTagInput.trim()
                            if (val && !(newProd.tags || []).includes(val)) {
                              setNewProd({ ...newProd, tags: [...(newProd.tags || []), val] })
                              setCustomTagInput('')
                            }
                          }
                        }}
                        className="flex-1 bg-white border border-soft-border rounded-xl px-3 py-2 text-xs text-charcoal focus:outline-none focus:border-charcoal"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const val = customTagInput.trim()
                          if (val && !(newProd.tags || []).includes(val)) {
                            setNewProd({ ...newProd, tags: [...(newProd.tags || []), val] })
                            setCustomTagInput('')
                          }
                        }}
                        className="bg-charcoal text-white text-xs font-bold uppercase px-4 py-2 rounded-xl hover:bg-black transition-all cursor-pointer"
                      >
                        + Add Tag
                      </button>
                    </div>
                  </div>
                )
              })()}
            </div>

            {/* Direct Multi-Image Cloudinary Uploader */}
            <ProductImageUploader
              images={newProd.images || []}
              onChange={(updatedImages) => setNewProd({ ...newProd, images: updatedImages })}
              label="Product Images & Gallery (Direct Cloudinary Upload)"
            />

            {/* Strictly 4 Points Description (No paragraphs) */}
            <div className="bg-soft-bg/70 border border-soft-border/90 rounded-2xl p-5 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-soft-border/70 pb-3">
                <div>
                  <label className="font-bold text-charcoal uppercase block text-xs sm:text-sm tracking-wide">
                    Product Description (Strictly 4 Points)
                  </label>
                  <p className="text-xs text-secondary-text mt-0.5">
                    No paragraph writing allowed. Enter exactly 4 distinct bullet points that will show on the product page.
                  </p>
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider bg-primary-yellow/20 text-[#8C6B00] px-3 py-1 rounded-full border border-primary-yellow/30 shrink-0 self-start sm:self-auto">
                  4 Points Only
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                {descPoints.map((point, idx) => (
                  <div key={idx}>
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-secondary-text mb-1">
                      Point {idx + 1}
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3.5 h-2 w-2 rounded-full bg-charcoal"></span>
                      <input
                        type="text"
                        required
                        value={point}
                        onChange={(e) => {
                          const updated = [...descPoints]
                          updated[idx] = e.target.value
                          setDescPoints(updated)
                        }}
                        placeholder={`Point ${idx + 1}: e.g. ${DEFAULT_DESCRIPTION_POINTS[idx]}`}
                        className="w-full bg-white border border-soft-border rounded-xl pl-8 pr-4 py-2.5 text-sm text-charcoal font-medium focus:border-charcoal focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                className="bg-[#F5C443] hover:bg-[#E5B537] text-charcoal font-bold uppercase tracking-wider text-sm px-8 py-3.5 rounded-xl shadow-xs cursor-pointer transition-all"
              >
                Publish Eyewear Product
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. CATEGORIES & TAGS VIEW */}
      {activeSubView === 'categories' && (
        <div className="space-y-8">
          {/* Header Banner & Add Category */}
          <div className="bg-white border border-soft-border/90 p-6 sm:p-8 rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="flex items-center gap-3.5">
              <div className="h-12 w-12 rounded-xl bg-[#FFF9E8] border border-[#F4C542]/50 flex items-center justify-center text-[#9E7308] shrink-0">
                <ListFilter size={24} />
              </div>
              <div>
                <h2 className="font-luxury text-2xl sm:text-3xl font-bold uppercase text-charcoal">
                  STORE CATEGORIES & TAGS
                </h2>
                <p className="text-xs sm:text-sm text-secondary-text mt-0.5">
                  Manage your store categories and organize descriptive tags under each category.
                </p>
              </div>
            </div>

            {/* Quick Add Category Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (!categoryInput.trim()) return
                onAddCategory && onAddCategory(categoryInput.trim())
                setCategoryInput('')
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="New Category Name..."
                value={categoryInput}
                onChange={(e) => setCategoryInput(e.target.value)}
                className="bg-soft-bg border border-soft-border rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold text-charcoal focus:outline-none focus:border-charcoal min-w-[200px]"
              />
              <button
                type="submit"
                className="bg-[#F5C443] hover:bg-[#E5B537] text-charcoal font-bold text-xs sm:text-sm uppercase px-5 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer whitespace-nowrap"
              >
                + Add Category
              </button>
            </form>
          </div>

          {/* Active Categories Subhead */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-secondary-text">
                Active Categories ({categories.length})
              </span>
              <span className="text-[11px] font-medium text-secondary-text/80 bg-soft-bg px-2.5 py-0.5 rounded-full border border-soft-border">
                Storefront currently curated for Sunglasses &amp; Wallets
              </span>
            </div>
            <span className="text-xs text-secondary-text hidden sm:inline">
              Tags are used to badge and filter products
            </span>
          </div>

          {/* Categories Grid (Sunglasses & Wallets) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {categories.map((c) => {
              const isSunglasses = c.name.toLowerCase() === 'sunglasses'
              const isWallets = c.name.toLowerCase() === 'wallets'
              const currentTags = Array.isArray(c.tags) ? c.tags : []

              // Curated tag suggestions for quick one-click adding
              const suggestions = isSunglasses
                ? ['Polarized', 'Aviator', 'Wayfarer', 'Retro', 'UV400', 'Metal Frame', 'Rimless', 'Iridescent', 'Gradient', 'Unisex']
                : isWallets
                ? ['Genuine Leather', 'Bifold', 'Cardholder', 'Slim Fit', 'Money Clip', 'RFID Protected', 'Long Wallet', 'Coin Pocket', 'Minimalist']
                : ['Premium', 'Luxury', 'Handcrafted', 'Classic', 'Limited Edition']

              const remainingSuggestions = suggestions.filter(
                (s) => !currentTags.some((t) => t.toLowerCase() === s.toLowerCase())
              )

              return (
                <div
                  key={c.name}
                  className="bg-white border border-soft-border/90 rounded-2xl p-6 sm:p-7 shadow-xs flex flex-col justify-between space-y-6 hover:border-charcoal/20 transition-all"
                >
                  <div className="space-y-5">
                    {/* Top Row: Category Identity */}
                    <div className="flex items-start justify-between border-b border-soft-border/60 pb-4">
                      <div className="flex items-center gap-3.5">
                        <div className="h-12 w-12 rounded-xl bg-soft-bg border border-soft-border flex items-center justify-center text-charcoal">
                          {isSunglasses ? (
                            <Glasses size={24} className="text-[#9E7308]" />
                          ) : isWallets ? (
                            <Wallet size={24} className="text-[#9E7308]" />
                          ) : (
                            <Tag size={24} className="text-[#9E7308]" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-luxury text-2xl font-bold uppercase tracking-wide text-charcoal">
                              {c.name}
                            </h3>
                            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                              Active
                            </span>
                          </div>
                          <span className="text-xs text-secondary-text font-medium">
                            {currentTags.length} {currentTags.length === 1 ? 'tag' : 'tags'} configured
                          </span>
                        </div>
                      </div>

                      {/* Delete category button (with confirmation) */}
                      {categories.length > 2 && (
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete category "${c.name}"?`)) {
                              onDeleteCategory && onDeleteCategory(c.name)
                            }
                          }}
                          className="text-secondary-text hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                          title={`Delete category "${c.name}"`}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>

                    {/* Tags List */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold uppercase tracking-wider text-charcoal flex items-center gap-1.5">
                          <Tag size={13} className="text-[#F5C443]" />
                          Tags under {c.name}
                        </label>
                        <span className="text-[11px] text-secondary-text">
                          Click &apos;✕&apos; to delete a tag
                        </span>
                      </div>

                      {currentTags.length > 0 ? (
                        <div className="flex flex-wrap gap-2 min-h-[50px] p-3.5 rounded-xl bg-soft-bg/50 border border-soft-border/70 items-center">
                          {currentTags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center gap-1.5 bg-white border border-soft-border hover:border-charcoal/40 text-charcoal px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-2xs group"
                            >
                              <span>#{tag}</span>
                              <button
                                type="button"
                                onClick={() => onRemoveTag && onRemoveTag(c.name, tag)}
                                className="text-secondary-text hover:text-red-600 hover:bg-red-50 rounded-full h-4 w-4 inline-flex items-center justify-center transition-colors cursor-pointer"
                                title={`Remove tag "${tag}"`}
                              >
                                <X size={11} />
                              </button>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 rounded-xl bg-soft-bg/40 border border-dashed border-soft-border text-center text-xs text-secondary-text">
                          No tags added to {c.name} yet. Type a tag below or click suggestions.
                        </div>
                      )}
                    </div>

                    {/* Quick Tag Suggestions */}
                    {remainingSuggestions.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-secondary-text block">
                          Suggested Tags (Click to add):
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {remainingSuggestions.slice(0, 7).map((suggestion) => (
                            <button
                              key={suggestion}
                              type="button"
                              onClick={() => onAddTag && onAddTag(c.name, suggestion)}
                              className="text-[11px] font-semibold bg-white hover:bg-[#FFF9E8] hover:text-[#9E7308] text-secondary-text border border-soft-border hover:border-[#F4C542]/60 px-2.5 py-1 rounded-lg transition-all cursor-pointer"
                            >
                              + {suggestion}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Add Tag Form for this Category */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      const val = (tagInputs[c.name] || '').trim()
                      if (!val) return
                      onAddTag && onAddTag(c.name, val)
                      setTagInputs((prev) => ({ ...prev, [c.name]: '' }))
                    }}
                    className="pt-4 border-t border-soft-border/60 flex gap-2"
                  >
                    <div className="relative flex-1">
                      <Tag size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary-text" />
                      <input
                        type="text"
                        placeholder={`Add tag to ${c.name} (e.g. ${isSunglasses ? 'Polarized' : isWallets ? 'Bifold' : 'Leather'})...`}
                        value={tagInputs[c.name] || ''}
                        onChange={(e) =>
                          setTagInputs((prev) => ({ ...prev, [c.name]: e.target.value }))
                        }
                        className="w-full bg-soft-bg border border-soft-border rounded-xl pl-9 pr-3 py-2.5 text-xs sm:text-sm font-medium text-charcoal focus:outline-none focus:border-charcoal"
                      />
                    </div>
                    <button
                      type="submit"
                      className="bg-charcoal text-white hover:bg-black font-bold text-xs uppercase px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap"
                    >
                      + Add Tag
                    </button>
                  </form>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 4. PROMO CODES VIEW */}
      {activeSubView === 'promo-codes' && (
        <div className="bg-white border border-soft-border/90 p-6 sm:p-10 rounded-2xl shadow-xs space-y-7">
          <div className="pb-4 border-b border-soft-border/70">
            <h2 className="font-luxury text-3xl sm:text-4xl font-normal text-charcoal flex items-center gap-3">
              <Tag size={28} className="text-[#F5C443]" />
              PROMOTIONAL DISCOUNT COUPONS
            </h2>
            <p className="text-xs sm:text-sm text-secondary-text mt-1">
              Create discount codes, configure percentage or flat discounts, and manage coupon availability
            </p>
          </div>

          {/* Add Promo Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (!promoForm.code || !promoForm.discount_value) return
              onAddPromo(promoForm)
              setPromoForm({ code: '', discount_type: 'percentage', discount_value: '', is_active: true })
            }}
            className="bg-soft-bg/60 border border-soft-border/80 p-5 rounded-2xl max-w-3xl space-y-3"
          >
            <span className="text-xs font-bold text-charcoal uppercase tracking-wider block">
              Create New Promo Coupon
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
              <div>
                <label className="text-[11px] font-bold text-secondary-text uppercase block mb-1">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="E.G. VIP10"
                  value={promoForm.code}
                  onChange={(e) => setPromoForm({ ...promoForm, code: e.target.value.toUpperCase().trim() })}
                  className="w-full bg-white border border-soft-border rounded-xl px-3.5 py-2.5 uppercase font-mono font-bold text-sm text-charcoal focus:outline-none focus:border-amber-400 shadow-2xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-secondary-text uppercase block mb-1">
                  Discount Type
                </label>
                <div className="relative">
                  <select
                    value={promoForm.discount_type}
                    onChange={(e) => setPromoForm({ ...promoForm, discount_type: e.target.value })}
                    className="w-full appearance-none bg-white border border-soft-border rounded-xl px-3.5 py-2.5 pr-8 font-semibold text-charcoal text-xs sm:text-sm focus:outline-none focus:border-amber-400 cursor-pointer shadow-2xs"
                  >
                    <option value="percentage">% Percentage</option>
                    <option value="fixed">৳ Flat Off</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-text pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-secondary-text uppercase block mb-1">
                  Discount Value *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="e.g. 10 or 150"
                  value={promoForm.discount_value}
                  onChange={(e) => setPromoForm({ ...promoForm, discount_value: e.target.value })}
                  className="w-full bg-white border border-soft-border rounded-xl px-3.5 py-2.5 font-bold text-sm text-charcoal focus:outline-none focus:border-amber-400 shadow-2xs"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full bg-[#F5C443] hover:bg-[#E5B537] text-charcoal font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm uppercase tracking-wider transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5 h-[42px]"
                >
                  <Plus size={16} />
                  <span>Create</span>
                </button>
              </div>
            </div>
          </form>

          {/* Promos List */}
          <div className="max-w-3xl space-y-3 pt-2">
            <span className="text-xs font-bold text-secondary-text uppercase tracking-wider block">
              Active Coupons ({promoCodes.length})
            </span>

            {promoCodes.length === 0 ? (
              <div className="p-8 text-center bg-soft-bg/50 rounded-2xl border border-dashed border-soft-border text-secondary-text text-sm">
                No coupons created yet. Use the form above to add one.
              </div>
            ) : (
              <div className="divide-y divide-soft-border/70 border border-soft-border/80 rounded-2xl overflow-hidden bg-white shadow-2xs">
                {promoCodes.map((p) => (
                  <div
                    key={p.code}
                    className="p-4 sm:px-6 flex items-center justify-between gap-4 hover:bg-soft-bg/40 transition-colors"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="h-10 w-10 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-[#B18512] shrink-0">
                        <Tag size={18} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-extrabold text-base text-charcoal tracking-wide">
                            {p.code}
                          </span>
                        </div>
                        <span className="text-xs sm:text-sm text-secondary-text font-medium block">
                          {p.discount_type === 'percentage'
                            ? `${p.discount_value}% Percentage Discount`
                            : `৳${p.discount_value} Flat Off`}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Active/Disabled Toggle Button */}
                      <button
                        type="button"
                        onClick={() => onTogglePromo && onTogglePromo(p.code, !p.is_active)}
                        className={`px-3.5 py-1.5 rounded-full font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-2xs ${
                          p.is_active
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                            : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200 border border-zinc-300'
                        }`}
                        title="Click to toggle status"
                      >
                        {p.is_active ? 'Active' : 'Disabled'}
                      </button>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete coupon "${p.code}"?`)) {
                            onDeletePromo && onDeletePromo(p.code)
                          }
                        }}
                        className="h-9 w-9 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200/80 inline-flex items-center justify-center text-red-600 hover:text-red-800 transition-colors cursor-pointer shadow-2xs shrink-0"
                        title={`Delete coupon "${p.code}"`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white max-w-xl w-full rounded-2xl p-7 border border-soft-border shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-soft-border">
              <h3 className="font-luxury text-2xl font-bold uppercase tracking-wider text-charcoal">
                EDIT EYEWEAR PRODUCT
              </h3>
              <button
                onClick={() => setEditingProduct(null)}
                className="text-secondary-text hover:text-charcoal p-1"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-sm">
              <div>
                <label className="font-bold text-charcoal uppercase block mb-1 text-xs">Product Title</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full bg-soft-bg border border-soft-border rounded-xl px-4 py-2.5 font-bold text-base"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-charcoal uppercase block mb-1 text-xs">Retail Price (৳)</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    className="w-full bg-soft-bg border border-soft-border rounded-xl px-4 py-2.5 font-bold text-base"
                  />
                </div>
                <div>
                  <label className="font-bold text-charcoal uppercase block mb-1 text-xs">Discount Price (৳)</label>
                  <input
                    type="number"
                    value={editingProduct.discount_price || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, discount_price: e.target.value ? Number(e.target.value) : null })}
                    className="w-full bg-soft-bg border border-soft-border rounded-xl px-4 py-2.5 font-bold text-base"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-charcoal uppercase block mb-1 text-xs">Category</label>
                  <select
                    value={editingProduct.category || 'Sunglasses'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    className="w-full bg-soft-bg border border-soft-border rounded-xl px-3 py-2.5 font-semibold text-xs"
                  >
                    {categories.map((c) => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-charcoal uppercase block mb-1 text-xs">Stock Count</label>
                  <input
                    type="number"
                    value={editingProduct.stock ?? 10}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                    className="w-full bg-soft-bg border border-soft-border rounded-xl px-3 py-2 font-bold text-sm"
                  />
                </div>
                <div>
                  <label className="font-bold text-charcoal uppercase block mb-1 text-xs">Gender</label>
                  <select
                    value={editingProduct.gender || 'Unisex'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, gender: e.target.value })}
                    className="w-full bg-soft-bg border border-soft-border rounded-xl px-3 py-2.5 font-semibold text-xs"
                  >
                    <option value="Unisex">Unisex</option>
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                  </select>
                </div>
              </div>

              {/* Tags for this Product */}
              <div className="bg-soft-bg/60 border border-soft-border/80 p-3.5 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-charcoal uppercase text-xs flex items-center gap-1.5">
                    <Tag size={13} className="text-[#F5C443]" />
                    Product Tags ({editingProduct.category || 'Sunglasses'})
                  </label>
                  <span className="text-[11px] text-secondary-text">Click to toggle</span>
                </div>

                {(() => {
                  const activeCatObj = categories.find(
                    (c) => c.name.toLowerCase() === (editingProduct.category || '').toLowerCase()
                  )
                  const catTags = activeCatObj?.tags || []
                  const currentTags = editingProduct.tags || []

                  return (
                    <div className="space-y-2">
                      {catTags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {catTags.map((tag) => {
                            const isSelected = currentTags.includes(tag)
                            return (
                              <button
                                key={tag}
                                type="button"
                                onClick={() => {
                                  const updated = isSelected
                                    ? currentTags.filter((t) => t !== tag)
                                    : [...currentTags, tag]
                                  setEditingProduct({ ...editingProduct, tags: updated })
                                }}
                                className={`text-[11px] px-2.5 py-1 rounded-full font-bold transition-all cursor-pointer border ${
                                  isSelected
                                    ? 'bg-[#F5C443] text-charcoal border-[#E5B537] shadow-2xs'
                                    : 'bg-white text-secondary-text border-soft-border hover:border-charcoal hover:text-charcoal'
                                }`}
                              >
                                {isSelected ? `✓ #${tag}` : `+ #${tag}`}
                              </button>
                            )
                          })}
                        </div>
                      )}

                      {/* Display custom tags attached to product that are not in category */}
                      {currentTags.filter((t) => !catTags.includes(t)).length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1 border-t border-soft-border/50">
                          {currentTags
                            .filter((t) => !catTags.includes(t))
                            .map((tag) => (
                              <span
                                key={tag}
                                className="inline-flex items-center gap-1 bg-[#FFF9E8] border border-[#F4C542]/50 text-charcoal text-[11px] font-bold px-2 py-0.5 rounded-full"
                              >
                                <span>#{tag}</span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setEditingProduct({
                                      ...editingProduct,
                                      tags: currentTags.filter((t) => t !== tag),
                                    })
                                  }
                                  className="text-secondary-text hover:text-red-600 rounded-full h-3 w-3 inline-flex items-center justify-center cursor-pointer"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                        </div>
                      )}

                      {/* Add Custom Tag */}
                      <div className="flex gap-2 pt-1">
                        <input
                          type="text"
                          placeholder="Add custom tag..."
                          value={editCustomTagInput}
                          onChange={(e) => setEditCustomTagInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              const val = editCustomTagInput.trim()
                              if (val && !currentTags.includes(val)) {
                                setEditingProduct({
                                  ...editingProduct,
                                  tags: [...currentTags, val],
                                })
                                setEditCustomTagInput('')
                              }
                            }
                          }}
                          className="flex-1 bg-white border border-soft-border rounded-lg px-2.5 py-1 text-xs text-charcoal focus:outline-none focus:border-charcoal"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const val = editCustomTagInput.trim()
                            if (val && !currentTags.includes(val)) {
                              setEditingProduct({
                                ...editingProduct,
                                tags: [...currentTags, val],
                              })
                              setEditCustomTagInput('')
                            }
                          }}
                          className="bg-charcoal text-white text-[11px] font-bold uppercase px-3 py-1 rounded-lg hover:bg-black transition-all cursor-pointer"
                        >
                          + Tag
                        </button>
                      </div>
                    </div>
                  )
                })()}
              </div>

              {/* Product Photos (Direct Cloudinary Upload & Gallery) */}
              <ProductImageUploader
                images={Array.isArray(editingProduct.images) ? editingProduct.images : (editingProduct.images ? [editingProduct.images] : [])}
                onChange={(updatedImages) => setEditingProduct({ ...editingProduct, images: updatedImages })}
                label="Product Photos (Cloudinary Auto-Sync)"
              />

              {/* Strictly 4 Points Description (No paragraphs) */}
              <div className="bg-soft-bg/70 border border-soft-border/90 rounded-2xl p-4 sm:p-5 space-y-3.5">
                <div className="flex items-center justify-between border-b border-soft-border/70 pb-2.5">
                  <div>
                    <label className="font-bold text-charcoal uppercase block text-xs tracking-wide">
                      Product Description (Strictly 4 Points)
                    </label>
                    <p className="text-[11px] text-secondary-text">
                      Point-wise description format (paragraphs disabled)
                    </p>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-primary-yellow/20 text-[#8C6B00] px-2.5 py-0.5 rounded-full border border-primary-yellow/30">
                    4 Points Only
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {editDescPoints.map((point, idx) => (
                    <div key={idx}>
                      <label className="block text-[11px] font-extrabold uppercase tracking-wider text-secondary-text mb-1">
                        Point {idx + 1}
                      </label>
                      <div className="relative flex items-center">
                        <span className="absolute left-3.5 h-2 w-2 rounded-full bg-charcoal"></span>
                        <input
                          type="text"
                          required
                          value={point}
                          onChange={(e) => {
                            const updated = [...editDescPoints]
                            updated[idx] = e.target.value
                            setEditDescPoints(updated)
                          }}
                          placeholder={`Point ${idx + 1}: e.g. ${DEFAULT_DESCRIPTION_POINTS[idx]}`}
                          className="w-full bg-white border border-soft-border rounded-xl pl-8 pr-3 py-2 text-xs sm:text-sm text-charcoal font-medium focus:border-charcoal focus:outline-none transition-colors"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-3">
                <button
                  type="submit"
                  className="flex-1 bg-[#F5C443] hover:bg-[#E5B537] text-charcoal font-bold py-3 rounded-xl uppercase tracking-wider text-sm"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="flex-1 bg-soft-bg border border-soft-border py-3 rounded-xl font-bold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
