'use client'

import React, { useState } from 'react'
import {
  Search,
  Truck,
  CheckCircle,
  XCircle,
  Eye,
  Trash2,
  PlusCircle,
  Calendar,
  CreditCard,
  MapPin,
  Phone,
  User,
  ShoppingBag,
  ExternalLink,
  Download,
  X,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react'

export default function OrdersManager({
  orders = [],
  products = [],
  actionLoading,
  onUpdateStatus,
  onDispatchSteadfast,
  onDeleteOrder,
  onSaveManualOrder,
  isManualView = false,
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [selectedOrderModal, setSelectedOrderModal] = useState(null)
  const [showManualModal, setShowManualModal] = useState(false)
  const [editingManualOrder, setEditingManualOrder] = useState(null)

  // Delivery Risk & Fraud Reputation State
  const [riskScores, setRiskScores] = useState({})
  const [selectedRiskModal, setSelectedRiskModal] = useState(null)

  // Fetch Steadfast Customer Delivery Reputation Score
  const fetchRiskScore = async (rawPhone) => {
    if (!rawPhone) return
    const cleanPhone = rawPhone.replace(/\D/g, '')
    if (riskScores[cleanPhone]?.loading) return

    setRiskScores((prev) => ({
      ...prev,
      [cleanPhone]: { loading: true },
    }))

    try {
      const token =
        localStorage.getItem('mazish_admin_token') ||
        sessionStorage.getItem('mazish_admin_token')

      const res = await fetch(`/api/steadfast/risk-check?phone=${encodeURIComponent(cleanPhone)}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) {
        setRiskScores((prev) => ({
          ...prev,
          [cleanPhone]: { loading: false, data },
        }))
      } else {
        setRiskScores((prev) => ({
          ...prev,
          [cleanPhone]: { loading: false, error: data.error },
        }))
      }
    } catch (e) {
      setRiskScores((prev) => ({
        ...prev,
        [cleanPhone]: { loading: false, error: e.message },
      }))
    }
  }

  // Manual Order Form State
  const [manualForm, setManualForm] = useState({
    customer_name: '',
    phone: '',
    email: '',
    delivery_address: '',
    payment_method: 'COD',
    payment_details: 'COD',
    shipping_cost: 70,
    discount_amount: 0,
    total_amount: '',
    status: 'Pending',
    created_at: new Date().toISOString().substring(0, 16),
    note: '',
  })
  const [manualSelectedItems, setManualSelectedItems] = useState([])

  const isManual = (o) => {
    const idStr = String(o.id || '')
    const pm = String(o.payment_method || '').toUpperCase()
    const pd = String(o.payment_details || '').toUpperCase()
    return (
      idStr.startsWith('manual-') ||
      idStr.startsWith('pos-') ||
      idStr.startsWith('demo-') ||
      pm === 'CASH' ||
      pm === 'COUNTER' ||
      pd.includes('MANUAL') ||
      pd.includes('POS')
    )
  }

  // Filter based on isManualView
  const scopedOrders = orders.filter((o) => (isManualView ? isManual(o) : !isManual(o)))

  const filteredOrders = scopedOrders.filter((order) => {
    const matchesSearch =
      order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.phone?.includes(searchTerm) ||
      order.id?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus =
      statusFilter === 'All' || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Open Add Manual Order Modal
  const openNewManualModal = () => {
    setEditingManualOrder(null)
    setManualForm({
      customer_name: '',
      phone: '',
      email: '',
      delivery_address: '',
      payment_method: 'COD',
      payment_details: 'COD',
      shipping_cost: 70,
      discount_amount: 0,
      total_amount: '',
      status: 'Pending',
      created_at: new Date().toISOString().substring(0, 16),
      note: '',
    })
    setManualSelectedItems([])
    setShowManualModal(true)
  }

  const handleManualSubmit = (e) => {
    e.preventDefault()
    if (!manualForm.customer_name.trim() || !manualForm.phone.trim()) {
      alert('Customer name and phone are required.')
      return
    }

    const subtotal = manualSelectedItems.reduce(
      (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
      0
    )
    const grand =
      manualForm.total_amount !== ''
        ? parseFloat(manualForm.total_amount)
        : Math.max(0, subtotal - parseFloat(manualForm.discount_amount || 0) + parseFloat(manualForm.shipping_cost || 0))

    const orderObj = {
      id: editingManualOrder ? editingManualOrder.id : `manual-${Date.now().toString(36)}`,
      customer_name: manualForm.customer_name.trim(),
      phone: manualForm.phone.trim(),
      email: manualForm.email.trim() || null,
      delivery_address: manualForm.delivery_address.trim() || 'Store Pickup',
      payment_method: manualForm.payment_method,
      payment_details: `[Manual Order] Note: ${manualForm.note || 'None'}`,
      shipping_cost: parseFloat(manualForm.shipping_cost || 0),
      discount_amount: parseFloat(manualForm.discount_amount || 0),
      total_amount: grand,
      status: manualForm.status,
      created_at: new Date(manualForm.created_at || Date.now()).toISOString(),
      items: manualSelectedItems.map((item) => ({
        product_id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity || 1,
        image: item.images?.[0] || 'https://res.cloudinary.com/kp0jicx3/image/upload/f_auto,q_auto/v1785265528/Sunglass1_zufdif.png',
      })),
    }

    if (onSaveManualOrder) {
      onSaveManualOrder(orderObj, !!editingManualOrder)
    }

    setShowManualModal(false)
  }

  return (
    <div className="space-y-7">
      
      {/* Top Header & Search/Filter Toolbar */}
      <div className="bg-white border border-soft-border/90 p-6 sm:p-8 rounded-2xl shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div>
            <h1 className="font-luxury text-3xl sm:text-4xl lg:text-[40px] font-normal text-charcoal tracking-wide">
              {isManualView ? 'MANUAL & WALK-IN COD ORDERS' : 'ONLINE STORE CUSTOMER ORDERS'}
            </h1>
            <p className="text-sm sm:text-base text-secondary-text mt-1 font-light">
              Manage fulfillment status, customer delivery addresses, and Steadfast parcel booking
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/api/admin/export-customers?token=mazish-secure-admin-token"
              download="Mazish_Customer_Data.xlsx"
              className="flex items-center gap-2 bg-[#EAF7EE] hover:bg-[#D7F3E2] text-[#0F766E] border border-[#A6E6BD] font-bold text-xs sm:text-sm uppercase tracking-wider px-5 py-3 rounded-xl transition-all shadow-xs"
              title="Export all customer records to Excel"
            >
              <Download size={16} />
              <span>Export Customers (Excel)</span>
            </a>

            {isManualView && (
              <button
                onClick={openNewManualModal}
                className="flex items-center gap-2 bg-[#F5C443] hover:bg-[#E5B537] text-charcoal font-bold text-sm uppercase tracking-wider px-6 py-3 rounded-xl transition-all shadow-xs cursor-pointer"
              >
                <PlusCircle size={17} />
                <span>+ Create Manual Order</span>
              </button>
            )}
          </div>
        </div>

        {/* Search & Status Pill Filters (Large) */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center pt-3 border-t border-soft-border/70">
          <div className="relative w-full sm:w-80">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-text" />
            <input
              type="text"
              placeholder="Search customer, phone, or order ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-soft-bg border border-soft-border rounded-xl pl-11 pr-4 py-3 text-sm text-charcoal font-medium focus:border-charcoal focus:outline-none"
            />
          </div>

          {/* Status Pills */}
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {['All', 'Pending', 'Confirmed', 'Shipped', 'Delivered', 'Returned', 'Cancelled'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer whitespace-nowrap shadow-2xs ${
                  statusFilter === st
                    ? 'bg-charcoal text-white shadow-xs'
                    : 'bg-soft-bg text-secondary-text hover:text-charcoal'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders Table (Large & Generous Spacing) */}
      <div className="bg-white border border-soft-border/90 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-soft-bg border-b border-soft-border text-secondary-text uppercase font-extrabold tracking-wider text-xs sm:text-[13px]">
                <th className="py-4.5 px-6">ORDER ID & DATE</th>
                <th className="py-4.5 px-6">CUSTOMER DETAILS</th>
                <th className="py-4.5 px-6">ITEMS & AMOUNT</th>
                <th className="py-4.5 px-6">FULFILLMENT STATUS</th>
                <th className="py-4.5 px-6">COURIER BOOKING</th>
                <th className="py-4.5 px-6 text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-soft-border/70">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-secondary-text text-base">
                    No orders found matching this filter.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const itemCount = order.items?.reduce((s, i) => s + (i.quantity || 1), 0) || 0
                  const isDispatched = !!order.steadfast_consignment_id

                  return (
                    <tr key={order.id} className="hover:bg-soft-bg/50 transition-colors">
                      {/* ID & Date */}
                      <td className="py-5 px-6 space-y-1.5">
                        <span className="font-mono font-bold text-sm sm:text-base text-charcoal block truncate max-w-[150px]" title={order.id}>
                          #{order.id.slice(0, 10).toUpperCase()}
                        </span>
                        <span className="text-xs text-secondary-text block font-medium">
                          {order.created_at ? new Date(order.created_at).toLocaleDateString() : '—'}
                        </span>
                        <span className="text-[11px] bg-soft-bg border border-soft-border px-2 py-0.5 rounded-md font-bold uppercase text-secondary-text inline-block">
                          {order.payment_method || 'COD'}
                        </span>
                      </td>

                      {/* Customer */}
                      <td className="py-5 px-6 space-y-1.5">
                        <span className="font-bold text-base sm:text-lg text-charcoal block">
                          {order.customer_name}
                        </span>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-sm text-secondary-text font-bold">
                            {order.phone}
                          </span>
                          {/* Live Delivery Risk Check Badge */}
                          {(() => {
                            const cleanPhone = (order.phone || '').replace(/\D/g, '')
                            const risk = riskScores[cleanPhone]

                            if (!risk) {
                              return (
                                <button
                                  type="button"
                                  onClick={() => fetchRiskScore(order.phone)}
                                  className="text-[10.5px] font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 px-2 py-0.5 rounded-md inline-flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                                  title="Check customer delivery reputation in Steadfast network"
                                >
                                  <ShieldAlert size={11} className="text-amber-600" />
                                  <span>Check Risk</span>
                                </button>
                              )
                            }

                            if (risk.loading) {
                              return (
                                <span className="text-[10px] font-bold text-secondary-text animate-pulse bg-zinc-100 px-2 py-0.5 rounded-md border border-zinc-200">
                                  Checking...
                                </span>
                              )
                            }

                            if (risk.data) {
                              const { riskLevel, deliveryRatio, cancellationRatio, totalReports } = risk.data
                              if (riskLevel === 'HIGH') {
                                return (
                                  <button
                                    type="button"
                                    onClick={() => setSelectedRiskModal(risk.data)}
                                    className="text-[10.5px] font-extrabold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 cursor-pointer transition-all shadow-2xs"
                                    title="Click for full fraud breakdown"
                                  >
                                    <AlertTriangle size={11} className="text-red-600" />
                                    <span>High Risk ({cancellationRatio}% Return{totalReports > 0 ? `, ${totalReports} Rep` : ''})</span>
                                  </button>
                                )
                              }
                              if (riskLevel === 'MEDIUM') {
                                return (
                                  <button
                                    type="button"
                                    onClick={() => setSelectedRiskModal(risk.data)}
                                    className="text-[10.5px] font-extrabold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 cursor-pointer transition-all shadow-2xs"
                                    title="Click for full fraud breakdown"
                                  >
                                    <AlertTriangle size={11} className="text-amber-600" />
                                    <span>Medium Risk ({cancellationRatio}% Return)</span>
                                  </button>
                                )
                              }
                              return (
                                <button
                                  type="button"
                                  onClick={() => setSelectedRiskModal(risk.data)}
                                  className="text-[10.5px] font-extrabold text-[#0F766E] bg-[#EAF7EE] hover:bg-emerald-100 border border-[#A6E6BD] px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 cursor-pointer transition-all shadow-2xs"
                                  title="Click for full breakdown"
                                >
                                  <ShieldCheck size={11} className="text-emerald-600" />
                                  <span>Trusted ({deliveryRatio > 0 ? `${deliveryRatio}% Delivered` : 'Clean'})</span>
                                </button>
                              )
                            }

                            return (
                              <button
                                type="button"
                                onClick={() => fetchRiskScore(order.phone)}
                                className="text-[10px] text-red-600 underline"
                              >
                                Retry
                              </button>
                            )
                          })()}
                        </div>
                        <span className="text-xs sm:text-sm text-secondary-text line-clamp-1 max-w-[200px] block" title={order.delivery_address}>
                          {order.delivery_address}
                        </span>
                      </td>

                      {/* Items & Amount */}
                      <td className="py-5 px-6 space-y-1">
                        <span className="font-sans font-extrabold text-base sm:text-lg text-charcoal block">
                          ৳{parseFloat(order.total_amount || 0).toLocaleString()}
                        </span>
                        <span className="text-xs text-secondary-text font-medium block">
                          {itemCount} item{itemCount !== 1 ? 's' : ''}
                        </span>
                        {order.discount_amount > 0 && (
                          <span className="text-xs text-emerald-600 font-bold block">
                            -৳{order.discount_amount} promo
                          </span>
                        )}
                      </td>

                      {/* Fulfillment Status Dropdown */}
                      <td className="py-5 px-6">
                        <select
                          value={order.status}
                          disabled={actionLoading === order.id}
                          onChange={(e) => onUpdateStatus(order.id, order.status, e.target.value)}
                          className={`text-xs sm:text-sm font-extrabold px-3.5 py-2 rounded-xl border transition-all cursor-pointer shadow-2xs ${
                            order.status === 'Delivered'
                              ? 'bg-[#EAF7EE] text-[#0F766E] border-[#A6E6BD]'
                              : order.status === 'Shipped'
                              ? 'bg-blue-50 text-blue-700 border-blue-300'
                              : order.status === 'Confirmed'
                              ? 'bg-purple-50 text-purple-700 border-purple-300'
                              : order.status === 'Cancelled' || order.status === 'Returned'
                              ? 'bg-red-50 text-red-700 border-red-300'
                              : 'bg-amber-50 text-amber-700 border-amber-300'
                          }`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Returned">Returned</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>

                      {/* Steadfast Courier Action */}
                      <td className="py-5 px-6 space-y-1.5">
                        {isDispatched ? (
                          <div>
                            <span className="text-xs bg-[#EAF7EE] text-[#0F766E] font-mono font-bold px-3 py-1 rounded-full inline-block border border-[#A6E6BD]">
                              {order.steadfast_consignment_id}
                            </span>
                            {order.steadfast_tracking_code && (
                              <a
                                href={`https://steadfast.com.bd/tracking?tracking_code=${encodeURIComponent(order.steadfast_tracking_code)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-mono font-bold mt-1 underline"
                                title="Open Steadfast live tracking"
                              >
                                <span>Track: {order.steadfast_tracking_code}</span>
                                <ExternalLink size={11} />
                              </a>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-1">
                            {(() => {
                              const cleanPhone = (order.phone || '').replace(/\D/g, '')
                              const risk = riskScores[cleanPhone]?.data
                              if (risk?.riskLevel === 'HIGH') {
                                return (
                                  <span className="text-[10px] font-bold text-red-600 block leading-tight">
                                    ⚠️ High return probability!
                                  </span>
                                )
                              }
                              return null
                            })()}
                            <button
                              onClick={() => onDispatchSteadfast(order.id)}
                              disabled={actionLoading === order.id + '-steadfast'}
                              className="flex items-center gap-2 bg-[#FFF9E8] hover:bg-[#FFF3CE] text-[#B18512] border border-[#F4C542]/50 text-xs sm:text-sm font-bold px-4 py-2 rounded-xl transition-all shadow-2xs cursor-pointer"
                            >
                              <Truck size={15} />
                              <span>
                                {actionLoading === order.id + '-steadfast'
                                  ? 'Booking...'
                                  : 'Send to Steadfast'}
                              </span>
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Actions: View Details / Delete */}
                      <td className="py-5 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setSelectedOrderModal(order)}
                            className="h-10 w-10 rounded-xl bg-soft-bg hover:bg-zinc-200 border border-soft-border/80 inline-flex items-center justify-center text-charcoal transition-all cursor-pointer shadow-2xs"
                            title="View order full details"
                          >
                            <Eye size={17} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete order #${order.id.slice(0, 8)}?`)) {
                                onDeleteOrder(order.id)
                              }
                            }}
                            className="h-10 w-10 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 inline-flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                            title="Delete order"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>

                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white max-w-2xl w-full rounded-2xl p-8 border border-soft-border shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-soft-border">
              <div>
                <h3 className="font-luxury text-2xl font-bold uppercase tracking-wider text-charcoal">
                  ORDER DETAILS
                </h3>
                <span className="font-mono text-sm text-secondary-text font-bold">
                  #{selectedOrderModal.id}
                </span>
              </div>
              <button
                onClick={() => setSelectedOrderModal(null)}
                className="text-secondary-text hover:text-charcoal p-1"
              >
                <X size={22} />
              </button>
            </div>

            {/* Customer & Shipping Info */}
            <div className="grid grid-cols-2 gap-5 text-sm bg-soft-bg p-5 rounded-2xl">
              <div>
                <span className="text-secondary-text block mb-1 font-bold uppercase text-xs">Customer</span>
                <p className="font-bold text-base text-charcoal">{selectedOrderModal.customer_name}</p>
                <p className="font-mono font-bold text-charcoal mt-0.5">{selectedOrderModal.phone}</p>
                {selectedOrderModal.email && (
                  <p className="text-secondary-text text-xs mt-0.5">{selectedOrderModal.email}</p>
                )}
              </div>
              <div>
                <span className="text-secondary-text block mb-1 font-bold uppercase text-xs">Delivery Address</span>
                <p className="font-medium text-charcoal leading-relaxed">{selectedOrderModal.delivery_address}</p>
                <p className="text-xs text-secondary-text mt-1.5 font-bold">
                  Payment: {selectedOrderModal.payment_method} ({selectedOrderModal.payment_details || 'Standard'})
                </p>
              </div>
            </div>

            {/* Items List */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-wider text-charcoal">
                Ordered Sunglasses & Accessories
              </h4>
              <div className="divide-y divide-soft-border/70 text-sm">
                {selectedOrderModal.items?.map((item, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 shrink-0 rounded-xl bg-white p-1 border border-soft-border flex items-center justify-center">
                        <img
                          src={item.image || 'https://res.cloudinary.com/kp0jicx3/image/upload/f_auto,q_auto/v1785265528/Sunglass1_zufdif.png'}
                          alt={item.name}
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <div>
                        <p className="font-bold text-base text-charcoal">{item.name}</p>
                        <p className="text-secondary-text text-xs">Quantity: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-sans font-extrabold text-base text-charcoal">
                      ৳{(item.price || item.discount_price || 0) * (item.quantity || 1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Summary */}
            <div className="pt-4 border-t border-soft-border space-y-2 text-sm">
              <div className="flex justify-between text-secondary-text">
                <span>Shipping Cost:</span>
                <span className="font-bold">৳{selectedOrderModal.shipping_cost || 0}</span>
              </div>
              {selectedOrderModal.discount_amount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Discount ({selectedOrderModal.promo_code || 'PROMO'}):</span>
                  <span>-৳{selectedOrderModal.discount_amount}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-extrabold text-charcoal pt-2.5 border-t border-soft-border/70">
                <span className="font-luxury uppercase tracking-wider text-xl">Total Amount:</span>
                <span className="font-sans text-2xl text-charcoal">৳{selectedOrderModal.total_amount}</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setSelectedOrderModal(null)}
                className="w-full bg-charcoal text-white font-bold py-3 rounded-xl uppercase text-sm tracking-wider cursor-pointer hover:bg-black transition-all"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Order Creation Modal */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white max-w-2xl w-full rounded-2xl p-8 border border-soft-border shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-soft-border">
              <h3 className="font-luxury text-2xl font-bold uppercase tracking-wider text-charcoal">
                CREATE MANUAL / WALK-IN ORDER
              </h3>
              <button
                onClick={() => setShowManualModal(false)}
                className="text-secondary-text hover:text-charcoal p-1"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleManualSubmit} className="space-y-5 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-charcoal uppercase block mb-1.5 text-xs">Customer Name *</label>
                  <input
                    type="text"
                    required
                    value={manualForm.customer_name}
                    onChange={(e) => setManualForm({ ...manualForm, customer_name: e.target.value })}
                    className="w-full bg-soft-bg border border-soft-border rounded-xl px-4 py-2.5 text-charcoal font-medium focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-charcoal uppercase block mb-1.5 text-xs">Customer Phone *</label>
                  <input
                    type="text"
                    required
                    value={manualForm.phone}
                    onChange={(e) => setManualForm({ ...manualForm, phone: e.target.value })}
                    className="w-full bg-soft-bg border border-soft-border rounded-xl px-4 py-2.5 text-charcoal font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-charcoal uppercase block mb-1.5 text-xs">Delivery Address *</label>
                <input
                  type="text"
                  required
                  placeholder="House, Road, City or Walk-in Boutique Pickup"
                  value={manualForm.delivery_address}
                  onChange={(e) => setManualForm({ ...manualForm, delivery_address: e.target.value })}
                  className="w-full bg-soft-bg border border-soft-border rounded-xl px-4 py-2.5 text-charcoal font-medium focus:outline-none"
                />
              </div>

              {/* Add Product Dropdown */}
              <div className="space-y-3 pt-2 border-t border-soft-border">
                <label className="font-bold text-charcoal uppercase block text-xs">Select Product to Add:</label>
                <div className="flex gap-3">
                  <select
                    id="manual-product-select"
                    className="flex-1 bg-soft-bg border border-soft-border rounded-xl px-4 py-2.5 text-charcoal font-medium"
                  >
                    <option value="">Choose sunglasses model...</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — ৳{p.discount_price || p.price}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      const sel = document.getElementById('manual-product-select')
                      const prodId = sel.value
                      if (!prodId) return
                      const found = products.find((p) => p.id === prodId)
                      if (!found) return
                      setManualSelectedItems((prev) => [
                        ...prev,
                        {
                          id: found.id,
                          name: found.name,
                          price: found.discount_price || found.price,
                          quantity: 1,
                          images: found.images,
                        },
                      ])
                    }}
                    className="bg-charcoal text-white font-bold px-5 py-2.5 rounded-xl hover:bg-black transition-all"
                  >
                    + Add
                  </button>
                </div>

                {/* Selected Items List */}
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {manualSelectedItems.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-soft-bg rounded-xl font-medium">
                      <span className="font-bold text-charcoal">{item.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-base">৳{item.price}</span>
                        <button
                          type="button"
                          onClick={() => setManualSelectedItems((prev) => prev.filter((_, i) => i !== idx))}
                          className="text-red-500 font-bold p-1 hover:text-red-700"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status and Payment Grid */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-soft-border">
                <div>
                  <label className="font-bold text-charcoal uppercase block mb-1 text-xs">Status</label>
                  <select
                    value={manualForm.status}
                    onChange={(e) => setManualForm({ ...manualForm, status: e.target.value })}
                    className="w-full bg-soft-bg border border-soft-border rounded-xl px-4 py-2.5 font-semibold"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-charcoal uppercase block mb-1 text-xs">Payment Method</label>
                  <select
                    value={manualForm.payment_method}
                    onChange={(e) => setManualForm({ ...manualForm, payment_method: e.target.value })}
                    className="w-full bg-soft-bg border border-soft-border rounded-xl px-4 py-2.5 font-semibold"
                  >
                    <option value="COD">Cash on Delivery</option>
                    <option value="CASH">Cash (Hand-to-Hand)</option>
                    <option value="bKash">bKash</option>
                    <option value="Card">Card</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4 pt-3">
                <button
                  type="submit"
                  className="flex-1 bg-[#F5C443] hover:bg-[#E5B537] text-charcoal font-bold py-3.5 rounded-xl uppercase tracking-wider text-sm transition-all"
                >
                  Save Manual Order
                </button>
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="flex-1 bg-soft-bg border border-soft-border py-3.5 rounded-xl font-bold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELIVERY RISK CHECK DETAILS MODAL */}
      {selectedRiskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-soft-border space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-soft-border pb-4">
              <div className="flex items-center gap-2.5">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                  selectedRiskModal.riskLevel === 'HIGH'
                    ? 'bg-red-100 text-red-600'
                    : selectedRiskModal.riskLevel === 'MEDIUM'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-emerald-100 text-[#0F766E]'
                }`}>
                  <ShieldAlert size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-charcoal">Delivery Risk Assessment</h3>
                  <p className="font-mono text-xs text-secondary-text">{selectedRiskModal.phone}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedRiskModal(null)}
                className="h-9 w-9 rounded-xl bg-soft-bg hover:bg-zinc-200 inline-flex items-center justify-center text-charcoal cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Risk Status Pill */}
            <div className={`p-4 rounded-2xl border ${
              selectedRiskModal.riskLevel === 'HIGH'
                ? 'bg-red-50 border-red-200 text-red-900'
                : selectedRiskModal.riskLevel === 'MEDIUM'
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-emerald-50 border-emerald-200 text-emerald-900'
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-sm uppercase tracking-wide">
                  {selectedRiskModal.riskLevel === 'HIGH' ? '⚠️ High Risk Customer' : selectedRiskModal.riskLevel === 'MEDIUM' ? '⚠️ Moderate Risk' : '✓ Trusted Buyer'}
                </span>
                <span className="text-xs font-mono font-bold bg-white/80 px-2.5 py-1 rounded-md">
                  {selectedRiskModal.riskLabel}
                </span>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-soft-bg border border-soft-border rounded-xl p-3">
                <span className="text-[11px] font-bold text-secondary-text uppercase block">Delivered Rate</span>
                <span className="font-sans font-extrabold text-xl text-emerald-700 block mt-1">
                  {selectedRiskModal.deliveryRatio}%
                </span>
              </div>
              <div className="bg-soft-bg border border-soft-border rounded-xl p-3">
                <span className="text-[11px] font-bold text-secondary-text uppercase block">Return Rate</span>
                <span className="font-sans font-extrabold text-xl text-red-600 block mt-1">
                  {selectedRiskModal.cancellationRatio}%
                </span>
              </div>
              <div className="bg-soft-bg border border-soft-border rounded-xl p-3">
                <span className="text-[11px] font-bold text-secondary-text uppercase block">Fraud Reports</span>
                <span className="font-sans font-extrabold text-xl text-charcoal block mt-1">
                  {selectedRiskModal.totalReports}
                </span>
              </div>
            </div>

            {/* Fraud Categories Breakdown */}
            {selectedRiskModal.fraudCategories && Object.keys(selectedRiskModal.fraudCategories).length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-charcoal uppercase tracking-wider block">
                  Reported Violations By Merchants:
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {Object.entries(selectedRiskModal.fraudCategories).map(([key, count]) => (
                    <div key={key} className="bg-red-50/70 border border-red-100 rounded-lg px-3 py-1.5 flex items-center justify-between">
                      <span className="capitalize text-red-900 font-medium">
                        {key.replace(/_/g, ' ')}
                      </span>
                      <span className="font-mono font-bold text-red-700">×{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendation Box */}
            <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3.5 text-xs text-charcoal space-y-1">
              <span className="font-bold block">💡 Dispatch Recommendation:</span>
              <p className="text-secondary-text">
                {selectedRiskModal.riskLevel === 'HIGH'
                  ? 'We strongly recommend calling this customer to verify the order and taking delivery charges (৳150) in advance via bKash before dispatching.'
                  : selectedRiskModal.riskLevel === 'MEDIUM'
                  ? 'Please confirm with the customer via phone or WhatsApp before booking.'
                  : 'Customer delivery history is reliable. Safe to proceed with Cash on Delivery (COD).'}
              </p>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setSelectedRiskModal(null)}
              className="w-full bg-charcoal hover:bg-black text-white font-bold py-3 rounded-xl transition-all cursor-pointer text-sm uppercase tracking-wider"
            >
              Close Assessment
            </button>
          </div>
        </div>
      )}

    </div>
  )
}
