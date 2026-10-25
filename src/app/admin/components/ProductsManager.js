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
  Plus
} from 'lucide-react'

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
  onAddPromo,
  onTogglePromo,
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [editingProduct, setEditingProduct] = useState(null)

  // New Product Form State
  const [newProd, setNewProd] = useState({
    name: '',
    description: '',
    price: '',
    discount_price: '',
    image_url: 'https://res.cloudinary.com/kp0jicx3/image/upload/f_auto,q_auto/v1785265528/Sunglass1_zufdif.png',
    category: categories[0]?.name || 'Sunglasses',
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
    onSaveProduct(editingProduct)
    setEditingProduct(null)
  }

  const handleCreateSubmit = (e) => {
    e.preventDefault()
    if (!newProd.name || !newProd.price) {
      alert('Product name and price are required.')
      return
    }
    onSaveNewProduct(newProd)
    setNewProd({
      name: '',
      description: '',
      price: '',
      discount_price: '',
      image_url: 'https://res.cloudinary.com/kp0jicx3/image/upload/f_auto,q_auto/v1785265528/Sunglass1_zufdif.png',
      category: categories[0]?.name || 'Sunglasses',
      gender: 'Unisex',
      stock: 20,
      is_featured: false,
    })
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

                        {/* Category & Gender */}
                        <td className="py-4 px-6 space-y-0.5">
                          <span className="font-medium text-sm text-charcoal block">
                            {p.category}
                          </span>
                          <span className="text-xs text-secondary-text font-normal block">
                            {p.gender || 'Unisex'}
                          </span>
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
                            onClick={() => setEditingProduct(p)}
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

            <div>
              <label className="font-bold text-charcoal uppercase block mb-1.5 text-xs sm:text-sm">
                Image CDN URL
              </label>
              <input
                type="url"
                value={newProd.image_url}
                onChange={(e) => setNewProd({ ...newProd, image_url: e.target.value })}
                className="w-full bg-soft-bg border border-soft-border rounded-xl px-4 py-3 font-mono text-xs"
              />
            </div>

            <div>
              <label className="font-bold text-charcoal uppercase block mb-1.5 text-xs sm:text-sm">
                Product Description
              </label>
              <textarea
                rows={3}
                placeholder="Product design notes, frame material, UV polarized details..."
                value={newProd.description}
                onChange={(e) => setNewProd({ ...newProd, description: e.target.value })}
                className="w-full bg-soft-bg border border-soft-border rounded-xl px-4 py-3 text-sm"
              />
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

      {/* 3. CATEGORIES VIEW */}
      {activeSubView === 'categories' && (
        <div className="bg-white border border-soft-border/90 p-8 sm:p-10 rounded-2xl shadow-xs space-y-7">
          <div className="pb-4 border-b border-soft-border/70">
            <h2 className="font-luxury text-3xl sm:text-4xl font-normal text-charcoal flex items-center gap-3">
              <ListFilter size={28} className="text-[#F5C443]" />
              STORE PRODUCT CATEGORIES
            </h2>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (!categoryInput.trim()) return
              onAddCategory(categoryInput.trim())
              setCategoryInput('')
            }}
            className="flex gap-4 max-w-lg"
          >
            <input
              type="text"
              required
              placeholder="e.g. Aviator Specials"
              value={categoryInput}
              onChange={(e) => setCategoryInput(e.target.value)}
              className="flex-1 bg-soft-bg border border-soft-border rounded-xl px-4 py-3 text-sm font-medium"
            />
            <button
              type="submit"
              className="bg-charcoal text-white font-bold text-sm uppercase px-6 py-3 rounded-xl hover:bg-black transition-all"
            >
              + Add Category
            </button>
          </form>

          <div className="divide-y divide-soft-border/60 max-w-lg text-sm pt-2">
            {categories.map((c) => (
              <div key={c.name} className="py-3.5 flex justify-between items-center font-bold text-base">
                <span>{c.name}</span>
                <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 text-xs px-3 py-1 rounded-full font-bold">
                  Active
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. PROMO CODES VIEW */}
      {activeSubView === 'promo-codes' && (
        <div className="bg-white border border-soft-border/90 p-8 sm:p-10 rounded-2xl shadow-xs space-y-7">
          <div className="pb-4 border-b border-soft-border/70">
            <h2 className="font-luxury text-3xl sm:text-4xl font-normal text-charcoal flex items-center gap-3">
              <Tag size={28} className="text-[#F5C443]" />
              PROMOTIONAL DISCOUNT COUPONS
            </h2>
          </div>

          {/* Add Promo Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (!promoForm.code || !promoForm.discount_value) return
              onAddPromo(promoForm)
              setPromoForm({ code: '', discount_type: 'percentage', discount_value: '', is_active: true })
            }}
            className="grid grid-cols-4 gap-4 max-w-2xl text-sm"
          >
            <input
              type="text"
              required
              placeholder="CODE (e.g. VIP10)"
              value={promoForm.code}
              onChange={(e) => setPromoForm({ ...promoForm, code: e.target.value.toUpperCase() })}
              className="bg-soft-bg border border-soft-border rounded-xl px-4 py-3 uppercase font-bold text-base"
            />
            <select
              value={promoForm.discount_type}
              onChange={(e) => setPromoForm({ ...promoForm, discount_type: e.target.value })}
              className="bg-soft-bg border border-soft-border rounded-xl px-4 py-3 font-semibold"
            >
              <option value="percentage">% Percentage</option>
              <option value="fixed">৳ Fixed Amount</option>
            </select>
            <input
              type="number"
              required
              placeholder="Value"
              value={promoForm.discount_value}
              onChange={(e) => setPromoForm({ ...promoForm, discount_value: e.target.value })}
              className="bg-soft-bg border border-soft-border rounded-xl px-4 py-3 font-bold text-base"
            />
            <button
              type="submit"
              className="bg-[#F5C443] hover:bg-[#E5B537] text-charcoal font-bold rounded-xl text-sm uppercase tracking-wider"
            >
              + Create
            </button>
          </form>

          {/* Promos Table */}
          <div className="divide-y divide-soft-border/70 max-w-2xl text-sm pt-4">
            {promoCodes.map((p) => (
              <div key={p.code} className="py-4 flex justify-between items-center">
                <div>
                  <span className="font-mono font-bold text-base block">{p.code}</span>
                  <span className="text-xs sm:text-sm text-secondary-text">
                    {p.discount_type === 'percentage' ? `${p.discount_value}% Percentage Discount` : `৳${p.discount_value} Flat Off`}
                  </span>
                </div>
                <button
                  onClick={() => onTogglePromo(p.code, !p.is_active)}
                  className={`px-4 py-1.5 rounded-full font-bold text-xs uppercase tracking-wider ${
                    p.is_active
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-red-50 text-red-600 border border-red-200'
                  }`}
                >
                  {p.is_active ? 'Active' : 'Disabled'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white max-w-xl w-full rounded-2xl p-7 border border-soft-border shadow-2xl space-y-5">
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-charcoal uppercase block mb-1 text-xs">Stock Count</label>
                  <input
                    type="number"
                    value={editingProduct.stock ?? 10}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                    className="w-full bg-soft-bg border border-soft-border rounded-xl px-4 py-2.5 font-bold text-base"
                  />
                </div>
                <div>
                  <label className="font-bold text-charcoal uppercase block mb-1 text-xs">Gender</label>
                  <select
                    value={editingProduct.gender || 'Unisex'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, gender: e.target.value })}
                    className="w-full bg-soft-bg border border-soft-border rounded-xl px-4 py-2.5 font-semibold"
                  >
                    <option value="Unisex">Unisex</option>
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                  </select>
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
