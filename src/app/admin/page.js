'use client'

import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { getProducts } from '@/lib/db'
import { Package, ClipboardList, PlusCircle, CheckCircle, Truck, Eye, RefreshCw } from 'lucide-react'

export default function AdminPage() {
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [activeTab, setActiveTab] = useState('orders') // 'orders', 'products', 'new-product'
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const [message, setMessage] = useState('')

  // New product form state
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    discount_price: '',
    image_url: '/images/sunglasses-1.png',
    category: 'Sunglasses',
    stock: 20,
    is_featured: false
  })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    setMessage('')
    try {
      // 1. Load orders
      const { data: dbOrders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })

      // Fallback/Demo check
      const localOrders = JSON.parse(localStorage.getItem('mazish_orders') || '[]')
      if (dbOrders && !ordersError) {
        // Merge or prioritize DB orders
        setOrders([...dbOrders, ...localOrders.filter(lo => !dbOrders.find(doObj => doObj.id === lo.id))])
      } else {
        setOrders(localOrders)
      }

      // 2. Load products
      const dbProducts = await getProducts()
      setProducts(dbProducts)
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  const handleUpdateStatus = async (orderId, currentStatus, targetStatus) => {
    setActionLoading(orderId)
    setMessage('')
    try {
      // Check if order is local/demo
      const isLocal = !orderId.includes('-') || orders.find(o => o.id === orderId && !o.steadfast_consignment_id) // simple check
      const order = orders.find(o => o.id === orderId)

      if (order && !order.customer_name) {
        // Fallback update
        const localOrders = JSON.parse(localStorage.getItem('mazish_orders') || '[]')
        const updated = localOrders.map(o => o.id === orderId ? { ...o, status: targetStatus } : o)
        localStorage.setItem('mazish_orders', JSON.stringify(updated))
        loadData()
        setMessage(`Order status updated to ${targetStatus}`)
      } else {
        const { error } = await supabase
          .from('orders')
          .update({ status: targetStatus })
          .eq('id', orderId)

        if (error) {
          // fallback update in localstorage
          const localOrders = JSON.parse(localStorage.getItem('mazish_orders') || '[]')
          const updated = localOrders.map(o => o.id === orderId ? { ...o, status: targetStatus } : o)
          localStorage.setItem('mazish_orders', JSON.stringify(updated))
          loadData()
        } else {
          loadData()
        }
        setMessage(`Order status updated to ${targetStatus}`)
      }
    } catch (err) {
      console.error(err)
    }
    setActionLoading(null)
  }

  const handleDispatchSteadfast = async (orderId) => {
    setActionLoading(orderId + '-steadfast')
    setMessage('')
    try {
      const response = await fetch('/api/supabase-bypass-mock', { method: 'POST' }) // fallback test
      const isDemo = !orderId.includes('-') || orders.find(o => o.id === orderId)?.customer_name === undefined

      const dispatchResponse = await fetch('/api/steadfast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, isDemo })
      })

      const result = await dispatchResponse.json()
      if (result.success) {
        setMessage(result.message || 'Successfully dispatched to Steadfast!')
        loadData()
      } else {
        setMessage(`Steadfast Dispatch Error: ${result.error}`)
      }
    } catch (err) {
      setMessage(`Connection failed: ${err.message}`)
    }
    setActionLoading(null)
  }

  const handleAddProduct = async (e) => {
    e.preventDefault()
    setActionLoading('new-product')
    setMessage('')
    try {
      const payload = {
        name: newProduct.name,
        description: newProduct.description,
        price: parseFloat(newProduct.price),
        discount_price: newProduct.discount_price ? parseFloat(newProduct.discount_price) : null,
        images: [newProduct.image_url],
        category: newProduct.category,
        stock: parseInt(newProduct.stock),
        is_featured: newProduct.is_featured
      }

      const { data, error } = await supabase.from('products').insert([payload])
      if (error) {
        // Fallback: save inside a local storage products file for demo
        const localProducts = JSON.parse(localStorage.getItem('mazish_custom_products') || '[]')
        localProducts.push({ id: `p-${Date.now()}`, ...payload })
        localStorage.setItem('mazish_custom_products', JSON.stringify(localProducts))
        setMessage('Product added successfully to Local Storage (Sandbox Mode)')
      } else {
        setMessage('Product added successfully to Supabase!')
      }

      setNewProduct({
        name: '',
        description: '',
        price: '',
        discount_price: '',
        image_url: '/images/sunglasses-1.png',
        category: 'Sunglasses',
        stock: 20,
        is_featured: false
      })
      loadData()
      setActiveTab('products')
    } catch (err) {
      setMessage(`Error: ${err.message}`)
    }
    setActionLoading(null)
  }

  return (
    <div className="bg-zinc-950 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Admin Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-zinc-900 pb-6">
          <div>
            <h1 className="font-luxury text-3xl text-white tracking-widest uppercase">
              MAZISH CONTROL CENTER
            </h1>
            <p className="text-zinc-500 text-xs mt-1">Manage orders, products, and Steadfast courier fulfillment</p>
          </div>
          <button
            onClick={loadData}
            className="flex items-center gap-2 border border-zinc-800 hover:border-zinc-700 bg-zinc-900/40 text-xs font-semibold uppercase tracking-wider text-zinc-400 hover:text-white px-4 py-2 rounded-full transition-all"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Reload Data
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-zinc-900 gap-6 text-sm font-semibold uppercase tracking-wider text-zinc-500">
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-4 transition-colors flex items-center gap-2 ${activeTab === 'orders' ? 'text-amber-500 border-b border-amber-500' : 'hover:text-white'}`}
          >
            <ClipboardList size={16} />
            Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`pb-4 transition-colors flex items-center gap-2 ${activeTab === 'products' ? 'text-amber-500 border-b border-amber-500' : 'hover:text-white'}`}
          >
            <Package size={16} />
            Products ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('new-product')}
            className={`pb-4 transition-colors flex items-center gap-2 ${activeTab === 'new-product' ? 'text-amber-500 border-b border-amber-500' : 'hover:text-white'}`}
          >
            <PlusCircle size={16} />
            Add New Product
          </button>
        </div>

        {/* Status / Message Display */}
        {message && (
          <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs rounded-xl">
            {message}
          </div>
        )}

        {/* Active Tab View */}
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-amber-500"></div>
          </div>
        ) : activeTab === 'orders' ? (
          /* ORDERS TAB */
          <div className="space-y-6">
            {orders.length === 0 ? (
              <div className="text-center p-20 border border-dashed border-zinc-900 rounded-2xl text-zinc-500">
                No orders placed yet.
              </div>
            ) : (
              <div className="overflow-x-auto border border-zinc-900 rounded-2xl">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-zinc-900/35 border-b border-zinc-900 text-zinc-400 font-semibold tracking-wider text-xs uppercase">
                      <th className="p-4 sm:p-6">Order ID & Date</th>
                      <th className="p-4 sm:p-6">Customer & Phone</th>
                      <th className="p-4 sm:p-6">Items & Amount</th>
                      <th className="p-4 sm:p-6">Payment</th>
                      <th className="p-4 sm:p-6">Fulfillment</th>
                      <th className="p-4 sm:p-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-zinc-900/10">
                        <td className="p-4 sm:p-6 space-y-1">
                          <p className="font-semibold text-white truncate max-w-[150px]">{order.id}</p>
                          <p className="text-[10px] text-zinc-500">
                            {new Date(order.created_at).toLocaleDateString()} {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </td>
                        <td className="p-4 sm:p-6 space-y-1">
                          <p className="text-white font-medium">{order.customer_name}</p>
                          <p className="text-xs text-zinc-400">{order.phone}</p>
                          <p className="text-[10px] text-zinc-500 line-clamp-1">{order.delivery_address}</p>
                        </td>
                        <td className="p-4 sm:p-6 space-y-1">
                          <p className="text-white">৳{order.total_amount}</p>
                          <p className="text-[10px] text-zinc-500">
                            {order.items?.map(i => `${i.name} (${i.quantity})`).join(', ')}
                          </p>
                        </td>
                        <td className="p-4 sm:p-6 space-y-1">
                          <span className={`inline-block text-[10px] font-semibold tracking-wider px-2 py-0.5 rounded ${order.payment_method === 'COD' ? 'bg-zinc-800 text-zinc-300' : 'bg-pink-500/10 text-pink-400'}`}>
                            {order.payment_method}
                          </span>
                          {order.payment_details && order.payment_details !== 'N/A' && (
                            <p className="text-[9px] text-zinc-500 font-mono mt-1">TXID: {order.payment_details}</p>
                          )}
                        </td>
                        <td className="p-4 sm:p-6">
                          <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded ${
                            order.status === 'Shipped' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            order.status === 'Cancelled' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                            'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {order.status}
                          </span>
                          {order.steadfast_tracking_code && (
                            <p className="text-[9px] text-zinc-500 font-mono mt-1">Track: {order.steadfast_tracking_code}</p>
                          )}
                        </td>
                        <td className="p-4 sm:p-6 text-right space-y-2">
                          <div className="flex flex-col sm:flex-row gap-2 justify-end">
                            {/* Steadfast Dispatch Button */}
                            {order.status === 'Pending' && (
                              <button
                                onClick={() => handleDispatchSteadfast(order.id)}
                                disabled={actionLoading === order.id + '-steadfast'}
                                className="inline-flex items-center gap-1 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-[10px] tracking-wider uppercase px-3 py-1.5 rounded-full transition-colors disabled:opacity-50"
                              >
                                <Truck size={12} />
                                Steadfast Dispatch
                              </button>
                            )}

                            {/* Status controls */}
                            {order.status !== 'Cancelled' && order.status !== 'Delivered' && (
                              <button
                                onClick={() => handleUpdateStatus(order.id, order.status, 'Delivered')}
                                className="text-emerald-400 hover:text-emerald-300 font-medium text-xs border border-zinc-800 bg-zinc-950 px-2.5 py-1.5 rounded-full"
                              >
                                Mark Delivered
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : activeTab === 'products' ? (
          /* PRODUCTS TAB */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-zinc-900/40 border border-zinc-900 rounded-xl overflow-hidden p-4 space-y-4">
                <div className="aspect-square bg-zinc-950 overflow-hidden rounded-lg">
                  <img src={product.images?.[0]} alt={product.name} className="h-full w-full object-cover" />
                </div>
                <div>
                  <h3 className="text-white font-medium truncate">{product.name}</h3>
                  <p className="text-zinc-500 text-xs mt-1 truncate">{product.category}</p>
                  <div className="flex items-baseline space-x-2 mt-2">
                    <span className="text-amber-500 font-bold">৳{product.discount_price || product.price}</span>
                    {product.discount_price && <span className="text-zinc-600 line-through text-xs">৳{product.price}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* ADD NEW PRODUCT TAB */
          <div className="max-w-xl mx-auto bg-zinc-900/40 border border-zinc-900 p-8 rounded-2xl space-y-6">
            <h2 className="text-lg font-semibold tracking-wider text-white uppercase border-b border-zinc-800 pb-4">
              Create Luxury Product
            </h2>

            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-2">Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MAZISH Phoenix Rose"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-850 focus:border-amber-500 rounded-lg px-4 py-3 text-sm text-white focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-2">Description</label>
                <textarea
                  rows={3}
                  placeholder="Write a compelling, premium description..."
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-850 focus:border-amber-500 rounded-lg px-4 py-3 text-sm text-white focus:outline-none transition-colors resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-2">Price (৳) *</label>
                  <input
                    type="number"
                    required
                    placeholder="4500"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-850 focus:border-amber-500 rounded-lg px-4 py-3 text-sm text-white focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-2">Discount Price (৳)</label>
                  <input
                    type="number"
                    placeholder="3500"
                    value={newProduct.discount_price}
                    onChange={(e) => setNewProduct({ ...newProduct, discount_price: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-850 focus:border-amber-500 rounded-lg px-4 py-3 text-sm text-white focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-2">Image Template URL</label>
                <select
                  value={newProduct.image_url}
                  onChange={(e) => setNewProduct({ ...newProduct, image_url: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-850 focus:border-amber-500 rounded-lg px-4 py-3 text-sm text-white focus:outline-none transition-colors"
                >
                  <option value="/images/sunglasses-1.png">Sunglasses Preview 1</option>
                  <option value="/images/sunglasses-2.png">Sunglasses Preview 2</option>
                  <option value="/images/sunglasses-3.png">Sunglasses Preview 3</option>
                  <option value="/images/sunglasses-4.png">Sunglasses Preview 4</option>
                  <option value="/images/sunglasses-5.png">Sunglasses Preview 5</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-2">Category</label>
                  <input
                    type="text"
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-850 focus:border-amber-500 rounded-lg px-4 py-3 text-sm text-white focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-2">Stock</label>
                  <input
                    type="number"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-850 focus:border-amber-500 rounded-lg px-4 py-3 text-sm text-white focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={newProduct.is_featured}
                  onChange={(e) => setNewProduct({ ...newProduct, is_featured: e.target.checked })}
                  className="rounded bg-zinc-950 border-zinc-800 text-amber-500 focus:ring-amber-500"
                />
                <label htmlFor="featured" className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Feature this product on homepage
                </label>
              </div>

              <button
                type="submit"
                disabled={actionLoading === 'new-product'}
                className="w-full bg-amber-500 text-zinc-950 font-bold uppercase tracking-widest text-xs py-4 rounded-full hover:bg-amber-400 transition-all disabled:opacity-50"
              >
                Add Luxury Product
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
