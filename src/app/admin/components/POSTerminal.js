'use client'

import React, { useState, useMemo } from 'react'
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CheckCircle,
  Printer,
  DollarSign,
  User,
  Phone,
  MapPin,
  Tag,
  CreditCard,
  X
} from 'lucide-react'

export default function POSTerminal({ products = [], onOrderCreated }) {
  // POS Search & Filter
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGender, setSelectedGender] = useState('All') // 'All' | 'Men' | 'Women' | 'Unisex'

  // POS Cart State: [ { ...product, posQty: 1 } ]
  const [cart, setCart] = useState([])

  // Customer & Billing Info
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [deliveryAddress, setDeliveryAddress] = useState('Walk-in Boutique Pickup')
  const [salesChannel, setSalesChannel] = useState('Walk-in') // 'Walk-in', 'Facebook', 'Instagram', 'WhatsApp'
  const [paymentMethod, setPaymentMethod] = useState('CASH') // 'CASH', 'BKASH', 'COD', 'CARD'
  const [shippingCost, setShippingCost] = useState(0)
  const [discountAmount, setDiscountAmount] = useState(0)
  const [notes, setNotes] = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [completedOrder, setCompletedOrder] = useState(null)

  // Filter Catalog
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesGender =
        selectedGender === 'All' ||
        (p.gender && p.gender.toLowerCase() === selectedGender.toLowerCase())
      return matchesSearch && matchesGender
    })
  }, [products, searchTerm, selectedGender])

  // Cart Management
  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, posQty: item.posQty + 1 }
            : item
        )
      }
      return [...prev, { ...product, posQty: 1 }]
    })
  }

  const updateQty = (id, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.posQty + delta
            return newQty > 0 ? { ...item, posQty: newQty } : null
          }
          return item
        })
        .filter(Boolean)
    )
  }

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id))
  }

  const clearCart = () => {
    setCart([])
    setCustomerName('')
    setCustomerPhone('')
    setDeliveryAddress('Walk-in Boutique Pickup')
    setDiscountAmount(0)
    setShippingCost(0)
    setNotes('')
  }

  // Calculations
  const subtotal = cart.reduce(
    (sum, item) => sum + (item.discount_price || item.price) * item.posQty,
    0
  )
  const grandTotal = Math.max(0, subtotal - parseFloat(discountAmount || 0) + parseFloat(shippingCost || 0))

  // Checkout Handler
  const handleCompleteOrder = async () => {
    if (cart.length === 0) {
      alert('Please add at least one product to the POS bill.')
      return
    }

    if (!customerPhone.trim()) {
      alert('Please enter customer phone number.')
      return
    }

    setIsSubmitting(true)

    const orderPayload = {
      id: `pos-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      customer_name: customerName.trim() || 'Walk-in Boutique Customer',
      phone: customerPhone.trim(),
      delivery_address: deliveryAddress.trim() || 'Counter Pickup (Shop)',
      payment_method: paymentMethod,
      payment_details: `[POS Counter Sale - ${salesChannel}] Notes: ${notes || 'None'}`,
      shipping_cost: parseFloat(shippingCost || 0),
      discount_amount: parseFloat(discountAmount || 0),
      total_amount: grandTotal,
      status: paymentMethod === 'COD' ? 'Pending' : 'Delivered',
      created_at: new Date().toISOString(),
      items: cart.map((item) => ({
        product_id: item.id,
        name: item.name,
        price: item.discount_price || item.price,
        quantity: item.posQty,
        image: item.images?.[0] || 'https://res.cloudinary.com/kp0jicx3/image/upload/f_auto,q_auto/v1785265528/Sunglass1_zufdif.png',
      })),
    }

    try {
      if (onOrderCreated) {
        await onOrderCreated(orderPayload)
      }
      setCompletedOrder(orderPayload)
      clearCart()
    } catch (err) {
      alert('Error saving POS order: ' + err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      
      {/* POS Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-soft-border/80 shadow-xs">
        <div>
          <h2 className="font-luxury text-2xl font-bold uppercase tracking-wider text-charcoal flex items-center gap-2">
            <ShoppingCart size={22} className="text-primary-yellow" />
            POS Counter Sale Terminal
          </h2>
          <p className="text-xs text-secondary-text mt-0.5">
            Instant point-of-sale checkout for walk-in boutique customers and direct social chat orders
          </p>
        </div>

        {/* Sales Channel Selector */}
        <div className="flex items-center gap-2 text-xs">
          <span className="font-bold text-secondary-text uppercase">Channel:</span>
          {['Walk-in', 'Facebook', 'Instagram', 'WhatsApp'].map((ch) => (
            <button
              key={ch}
              onClick={() => setSalesChannel(ch)}
              className={`px-3 py-1 rounded-full font-bold transition-all cursor-pointer ${
                salesChannel === ch
                  ? 'bg-charcoal text-white'
                  : 'bg-soft-bg text-secondary-text hover:text-charcoal'
              }`}
            >
              {ch}
            </button>
          ))}
        </div>
      </div>

      {/* Main Split Grid: Left Catalog (60%), Right Cart (40%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Product Catalog & Quick Filters (Col 7) */}
        <div className="lg:col-span-7 bg-white border border-soft-border p-5 rounded-2xl shadow-xs space-y-4">
          
          {/* Search & Gender Filters */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:max-w-xs">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary-text" />
              <input
                type="text"
                placeholder="Search sunglasses catalog..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-soft-bg border border-soft-border rounded-xl pl-9 pr-3 py-2 text-xs text-charcoal focus:border-charcoal focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              {['All', 'Men', 'Women', 'Unisex'].map((g) => (
                <button
                  key={g}
                  onClick={() => setSelectedGender(g)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedGender === g
                      ? 'bg-primary-yellow text-charcoal shadow-xs'
                      : 'bg-soft-bg text-secondary-text hover:text-charcoal'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 max-h-[620px] overflow-y-auto pr-1">
            {filteredProducts.map((p) => {
              const inCart = cart.find((item) => item.id === p.id)
              const price = p.discount_price || p.price

              return (
                <div
                  key={p.id}
                  onClick={() => addToCart(p)}
                  className={`border rounded-xl p-3 flex flex-col justify-between transition-all cursor-pointer hover:border-primary-yellow hover:shadow-xs ${
                    inCart
                      ? 'border-primary-yellow bg-[#FFF9E8]/40 ring-1 ring-primary-yellow'
                      : 'border-soft-border bg-white'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="aspect-square w-full rounded-lg bg-soft-bg p-2 flex items-center justify-center overflow-hidden">
                      <img
                        src={
                          p.images?.[0] ||
                          'https://res.cloudinary.com/kp0jicx3/image/upload/f_auto,q_auto/v1785265528/Sunglass1_zufdif.png'
                        }
                        alt={p.name}
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-charcoal line-clamp-1">
                        {p.name}
                      </h4>
                      <span className="text-[10px] text-secondary-text block">
                        Stock: {p.stock ?? 10} units
                      </span>
                    </div>
                  </div>

                  <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-soft-border/60">
                    <span className="font-luxury font-extrabold text-sm text-charcoal">
                      ৳{price}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        addToCart(p)
                      }}
                      className="h-6 w-6 rounded-md bg-charcoal text-white hover:bg-primary-yellow hover:text-charcoal flex items-center justify-center transition-colors cursor-pointer"
                      title="Add to Bill"
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

        </div>

        {/* Right Column: Active Bill & Checkout Drawer (Col 5) */}
        <div className="lg:col-span-5 bg-white border border-soft-border p-5 rounded-2xl shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-soft-border/70">
            <div>
              <h3 className="font-luxury text-lg font-bold uppercase tracking-wider text-charcoal">
                Active POS Bill
              </h3>
              <span className="text-xs text-secondary-text font-medium">
                {cart.reduce((s, i) => s + i.posQty, 0)} items in bill
              </span>
            </div>
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-[11px] font-bold text-red-600 hover:text-red-700 hover:underline cursor-pointer"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Cart Items List */}
          <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
            {cart.length === 0 ? (
              <div className="text-center py-8 text-xs text-secondary-text">
                <ShoppingCart size={28} className="mx-auto mb-2 text-soft-border" />
                Select sunglasses from catalog to add to bill
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-soft-bg border border-soft-border/60"
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={
                        item.images?.[0] ||
                        'https://res.cloudinary.com/kp0jicx3/image/upload/f_auto,q_auto/v1785265528/Sunglass1_zufdif.png'
                      }
                      alt={item.name}
                      className="h-10 w-10 object-contain rounded bg-white p-1 border border-soft-border/60"
                    />
                    <div>
                      <h5 className="font-bold text-xs text-charcoal line-clamp-1">
                        {item.name}
                      </h5>
                      <span className="font-luxury text-xs font-extrabold text-charcoal">
                        ৳{item.discount_price || item.price}
                      </span>
                    </div>
                  </div>

                  {/* Quantity Actions */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center border border-soft-border bg-white rounded-lg">
                      <button
                        onClick={() => updateQty(item.id, -1)}
                        className="p-1 hover:bg-soft-bg text-charcoal"
                      >
                        <Minus size={11} />
                      </button>
                      <span className="px-2 text-xs font-bold">{item.posQty}</span>
                      <button
                        onClick={() => updateQty(item.id, 1)}
                        className="p-1 hover:bg-soft-bg text-charcoal"
                      >
                        <Plus size={11} />
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-secondary-text hover:text-red-600 p-1"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Customer Form */}
          <div className="space-y-3 pt-3 border-t border-soft-border/70">
            <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal">
              Customer Information
            </h4>
            
            <div className="grid grid-cols-2 gap-2.5">
              <input
                type="text"
                placeholder="Customer Name (Optional)"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-soft-bg border border-soft-border rounded-xl px-3 py-2 text-xs text-charcoal focus:outline-none"
              />
              <input
                type="text"
                placeholder="Phone (e.g. 017...)"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full bg-soft-bg border border-soft-border rounded-xl px-3 py-2 text-xs text-charcoal focus:outline-none font-medium"
              />
            </div>

            <input
              type="text"
              placeholder="Delivery Address / Counter Pickup Note"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              className="w-full bg-soft-bg border border-soft-border rounded-xl px-3 py-2 text-xs text-charcoal focus:outline-none"
            />
          </div>

          {/* Payment Method & Adjustments */}
          <div className="space-y-3 pt-3 border-t border-soft-border/70">
            <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal">
              Payment Method
            </h4>
            
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'CASH', label: 'Cash' },
                { id: 'BKASH', label: 'bKash' },
                { id: 'COD', label: 'COD' },
                { id: 'CARD', label: 'Card' },
              ].map((pm) => (
                <button
                  key={pm.id}
                  type="button"
                  onClick={() => setPaymentMethod(pm.id)}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                    paymentMethod === pm.id
                      ? 'bg-charcoal text-white border-charcoal shadow-xs'
                      : 'bg-soft-bg text-secondary-text border-soft-border hover:text-charcoal'
                  }`}
                >
                  {pm.label}
                </button>
              ))}
            </div>

            {/* Discount & Delivery fee adjustments */}
            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <div>
                <label className="text-[10px] font-bold text-secondary-text uppercase block mb-1">
                  Discount (৳)
                </label>
                <input
                  type="number"
                  min="0"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(e.target.value)}
                  className="w-full bg-soft-bg border border-soft-border rounded-xl px-3 py-1.5 text-xs text-charcoal focus:outline-none font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-secondary-text uppercase block mb-1">
                  Delivery / Shipping (৳)
                </label>
                <input
                  type="number"
                  min="0"
                  value={shippingCost}
                  onChange={(e) => setShippingCost(e.target.value)}
                  className="w-full bg-soft-bg border border-soft-border rounded-xl px-3 py-1.5 text-xs text-charcoal focus:outline-none font-bold"
                />
              </div>
            </div>
          </div>

          {/* Total & Checkout Button */}
          <div className="pt-3 border-t border-soft-border/80 space-y-3">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-secondary-text">
                <span>Subtotal:</span>
                <span className="font-bold text-charcoal">৳{subtotal.toLocaleString()}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Discount:</span>
                  <span>-৳{discountAmount}</span>
                </div>
              )}
              {shippingCost > 0 && (
                <div className="flex justify-between text-secondary-text">
                  <span>Shipping:</span>
                  <span>+৳{shippingCost}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-extrabold text-charcoal pt-1.5 border-t border-soft-border/60">
                <span className="font-luxury text-lg uppercase tracking-wider">Total Payable:</span>
                <span className="font-luxury text-2xl text-charcoal">৳{grandTotal.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={handleCompleteOrder}
              disabled={isSubmitting || cart.length === 0}
              className="w-full bg-primary-yellow hover:bg-deep-yellow disabled:opacity-50 text-charcoal font-bold uppercase text-xs tracking-widest py-3.5 rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
            >
              <CheckCircle size={16} />
              <span>{isSubmitting ? 'Recording POS Sale...' : '1-Click Complete Order & Save'}</span>
            </button>
          </div>

        </div>

      </div>

      {/* Printable Receipt Modal */}
      {completedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white max-w-md w-full rounded-2xl p-6 border border-soft-border shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-soft-border">
              <div className="flex items-center gap-2 text-emerald-600">
                <CheckCircle size={20} />
                <h3 className="font-bold text-sm uppercase tracking-wider">Sale Recorded Successfully!</h3>
              </div>
              <button
                onClick={() => setCompletedOrder(null)}
                className="text-secondary-text hover:text-charcoal p-1"
              >
                <X size={18} />
              </button>
            </div>

            {/* Receipt Summary View */}
            <div className="bg-soft-bg p-4 rounded-xl space-y-2 text-xs font-mono">
              <div className="text-center pb-2 border-b border-soft-border">
                <p className="font-bold text-sm">MAZISH ENTERPRISE</p>
                <p className="text-[10px] text-secondary-text">Curated Luxury Eyewear</p>
                <p className="text-[10px]">Order: #{completedOrder.id.slice(0, 10).toUpperCase()}</p>
                <p className="text-[10px] text-secondary-text">{new Date(completedOrder.created_at).toLocaleString()}</p>
              </div>

              <div className="space-y-1 py-1">
                <p><strong>Customer:</strong> {completedOrder.customer_name}</p>
                <p><strong>Phone:</strong> {completedOrder.phone}</p>
                <p><strong>Address:</strong> {completedOrder.delivery_address}</p>
                <p><strong>Payment:</strong> {completedOrder.payment_method}</p>
              </div>

              <div className="py-2 border-t border-b border-soft-border space-y-1">
                {completedOrder.items?.map((item, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>{item.name} x{item.quantity}</span>
                    <span>৳{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-1 pt-1">
                <div className="flex justify-between font-bold">
                  <span>Grand Total:</span>
                  <span>৳{completedOrder.total_amount}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 flex items-center justify-center gap-1.5 bg-charcoal text-white hover:bg-black text-xs font-bold py-2.5 rounded-xl cursor-pointer"
              >
                <Printer size={14} />
                <span>Print Invoice</span>
              </button>
              <button
                onClick={() => setCompletedOrder(null)}
                className="flex-1 bg-soft-bg hover:bg-white border border-soft-border text-charcoal text-xs font-bold py-2.5 rounded-xl cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
