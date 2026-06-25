'use client'

import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { getProducts } from '@/lib/db'
import { DEFAULT_PRODUCTS } from '@/lib/products'
import { Package, ClipboardList, PlusCircle, CheckCircle, Truck, Eye, RefreshCw, Tag, Trash2, Search, DollarSign, ShoppingCart, Percent, Lock, ListFilter, X } from 'lucide-react'

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loginForm, setLoginForm] = useState({ username: '', password: '' })
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState(DEFAULT_PRODUCTS)
  const [promoCodes, setPromoCodes] = useState([])
  const [categories, setCategories] = useState([])
  const [activeTab, setActiveTab] = useState('orders') // 'orders', 'products', 'new-product', 'promo-codes', 'categories'
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const [message, setMessage] = useState('')
  const [selectedOrderForModal, setSelectedOrderForModal] = useState(null)

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  // Product Edit State
  const [editingProduct, setEditingProduct] = useState(null)

  // New product form state
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    discount_price: '',
    image_url: '/images/Sunglass1.png',
    category: 'Sunglasses',
    gender: 'Unisex',
    stock: 20,
    is_featured: false
  })

  // New promo code form state
  const [newPromo, setNewPromo] = useState({
    code: '',
    discount_type: 'percentage', // 'percentage' or 'fixed'
    discount_value: '',
    is_active: true
  })

  // New category form state
  const [newCategoryName, setNewCategoryName] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('mazish_admin_token') || sessionStorage.getItem('mazish_admin_token')
    if (token === 'mazish-secure-admin-token') {
      setIsAuthenticated(true)
      // Optimistically load cached local orders
      const localOrders = JSON.parse(localStorage.getItem('mazish_orders') || '[]')
      setOrders(localOrders)
      loadData(true)
    } else {
      setLoading(false)
    }
  }, [])

  async function loadData(isInitial = false) {
    if (isInitial) setLoading(true)
    setMessage('')
    
    const queryTimeout = (promise, ms = 3500) => {
      let timeoutId;
      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error('Timeout')), ms);
      });
      return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutId));
    };

    try {
      // Execute all database fetches in parallel to prevent sequential timeout lag
      const [ordersRes, productsRes, promosRes, catsRes] = await Promise.allSettled([
        queryTimeout(supabase.from('orders').select('*').order('created_at', { ascending: false })),
        queryTimeout(getProducts()),
        queryTimeout(supabase.from('promo_codes').select('*').order('created_at', { ascending: false })),
        queryTimeout(supabase.from('categories').select('*').order('name', { ascending: true }))
      ])

      // 1. Process orders
      const localOrders = JSON.parse(localStorage.getItem('mazish_orders') || '[]')
      if (ordersRes.status === 'fulfilled' && ordersRes.value && ordersRes.value.data && !ordersRes.value.error) {
        const dbOrders = ordersRes.value.data
        setOrders([...dbOrders, ...localOrders.filter(lo => !dbOrders.find(doObj => doObj.id === lo.id))])
      } else {
        setOrders(localOrders)
      }

      // 2. Process products
      if (productsRes.status === 'fulfilled' && productsRes.value) {
        setProducts(productsRes.value)
      }

      // 3. Process Promo Codes
      const localPromos = JSON.parse(localStorage.getItem('mazish_promos') || '[]')
      if (promosRes.status === 'fulfilled' && promosRes.value && promosRes.value.data && !promosRes.value.error) {
        const dbPromos = promosRes.value.data
        setPromoCodes([...dbPromos, ...localPromos.filter(lp => !dbPromos.find(dp => dp.code === lp.code))])
      } else {
        setPromoCodes(localPromos)
      }

      // 4. Process Categories
      const localCats = JSON.parse(localStorage.getItem('mazish_categories') || '[]')
      const defaultCats = [{ name: 'Sunglasses' }, { name: 'Apparel' }, { name: 'Accessories' }, { name: 'FIFA Special Edition' }]
      
      if (catsRes.status === 'fulfilled' && catsRes.value && catsRes.value.data && !catsRes.value.error) {
        const dbCats = catsRes.value.data
        const merged = [...dbCats]
        localCats.concat(defaultCats).forEach(c => {
          if (!merged.find(item => item.name === c.name)) {
            merged.push(c)
          }
        })
        setCategories(merged)
      } else {
        const merged = [...localCats]
        defaultCats.forEach(c => {
          if (!merged.find(item => item.name === c.name)) {
            merged.push(c)
          }
        })
        setCategories(merged)
      }

    } catch (e) {
      console.error("Dashboard loading error:", e)
    }
    setLoading(false)
  }

  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    setLoginError('')
    setLoginLoading(true)

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      })

      const result = await res.json()
      if (result.success) {
        if (rememberMe) {
          localStorage.setItem('mazish_admin_token', result.token)
        } else {
          sessionStorage.setItem('mazish_admin_token', result.token)
        }
        setIsAuthenticated(true)
        // Optimistically load local orders before trigger
        const localOrders = JSON.parse(localStorage.getItem('mazish_orders') || '[]')
        setOrders(localOrders)
        loadData(true)
      } else {
        setLoginError(result.error || 'Authentication failed')
      }
    } catch (err) {
      setLoginError('Connection failure. Try again.')
    } finally {
      setLoginLoading(false)
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem('mazish_admin_token')
    localStorage.removeItem('mazish_admin_token')
    setIsAuthenticated(false)
    setLoginForm({ username: '', password: '' })
  }

  const handleUpdateStatus = async (orderId, currentStatus, targetStatus) => {
    setActionLoading(orderId)
    setMessage('')
    try {
      const order = orders.find(o => o.id === orderId)
      const isLocal = order && (!order.customer_name || typeof order.id === 'string' && order.id.startsWith('demo-') || !orderId.includes('-'))

      if (isLocal) {
        const localOrders = JSON.parse(localStorage.getItem('mazish_orders') || '[]')
        const updated = localOrders.map(o => o.id === orderId ? { ...o, status: targetStatus } : o)
        localStorage.setItem('mazish_orders', JSON.stringify(updated))
        loadData()
        setMessage(`Order status updated to ${targetStatus} (Local Sandbox Mode)`)
      } else {
        const res = await fetch('/api/admin/orders/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId, status: targetStatus })
        })
        const result = await res.json()
        if (result.success) {
          loadData()
          setMessage(`Order status updated to ${targetStatus}`)
        } else {
          console.warn("DB update failed, updating locally:", result.error)
          const localOrders = JSON.parse(localStorage.getItem('mazish_orders') || '[]')
          const updated = localOrders.map(o => o.id === orderId ? { ...o, status: targetStatus } : o)
          localStorage.setItem('mazish_orders', JSON.stringify(updated))
          loadData()
          setMessage(`Order status updated locally: ${targetStatus}`)
        }
      }
    } catch (err) {
      console.error(err)
      setMessage(`Connection failed: ${err.message}`)
    }
    setActionLoading(null)
  }

  const handleDispatchSteadfast = async (orderId) => {
    setActionLoading(orderId + '-steadfast')
    setMessage('')
    try {
      const isDemo = !orderId.includes('-') || orders.find(o => o.id === orderId)?.customer_name === undefined

      const dispatchResponse = await fetch('/api/steadfast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, isDemo })
      })

      const result = await dispatchResponse.json()
      if (result.success) {
        setMessage(result.message || 'Successfully dispatched to Steadfast!')
        if (isDemo) {
          const localOrders = JSON.parse(localStorage.getItem('mazish_orders') || '[]')
          const updated = localOrders.map(o => 
            o.id === orderId 
              ? { ...o, status: 'Shipped', steadfast_consignment_id: result.consignmentId, steadfast_tracking_code: result.trackingCode } 
              : o
          )
          localStorage.setItem('mazish_orders', JSON.stringify(updated))
        }
        loadData()
      } else {
        setMessage(`Steadfast Dispatch Error: ${result.error}`)
      }
    } catch (err) {
      setMessage(`Connection failed: ${err.message}`)
    }
    setActionLoading(null)
  }

  const handleToggleStock = async (product) => {
    setActionLoading(product.id + '-stock')
    setMessage('')
    try {
      const targetStock = product.stock > 0 ? 0 : 20
      const isLocal = typeof product.id === 'string' && (product.id.startsWith('p-') || product.id.startsWith('sunglasses-') || product.id.startsWith('fifa-'))

      if (isLocal) {
        const localProducts = JSON.parse(localStorage.getItem('mazish_custom_products') || '[]')
        const updated = localProducts.map(p => p.id === product.id ? { ...p, stock: targetStock } : p)
        localStorage.setItem('mazish_custom_products', JSON.stringify(updated))
        setMessage(`Stock status toggled locally for ${product.name}!`)
      } else {
        const { error } = await supabase
          .from('products')
          .update({ stock: targetStock })
          .eq('id', product.id)

        if (error) {
          const localProducts = JSON.parse(localStorage.getItem('mazish_custom_products') || '[]')
          const updated = localProducts.map(p => p.id === product.id ? { ...p, stock: targetStock } : p)
          localStorage.setItem('mazish_custom_products', JSON.stringify(updated))
          setMessage(`Stock status toggled locally (Sandbox Mode): ${product.name}`)
        } else {
          setMessage(`Stock status successfully updated in Supabase for ${product.name}!`)
        }
      }
      loadData()
    } catch (err) {
      setMessage(`Error: ${err.message}`)
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
        gender: newProduct.gender,
        stock: parseInt(newProduct.stock),
        is_featured: newProduct.is_featured
      }

      const { data, error } = await supabase.from('products').insert([payload])
      if (error) {
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
        image_url: '/images/Sunglass1.png',
        category: 'Sunglasses',
        gender: 'Unisex',
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

  const handleUpdateProduct = async (e) => {
    e.preventDefault()
    if (!editingProduct) return
    setActionLoading('edit-product')
    setMessage('')
    try {
      const payload = {
        name: newProduct.name,
        description: newProduct.description,
        price: parseFloat(newProduct.price),
        discount_price: newProduct.discount_price ? parseFloat(newProduct.discount_price) : null,
        images: [newProduct.image_url],
        category: newProduct.category,
        gender: newProduct.gender,
        stock: parseInt(newProduct.stock),
        is_featured: newProduct.is_featured
      }

      const isLocal = typeof editingProduct.id === 'string' && (editingProduct.id.startsWith('p-') || editingProduct.id.startsWith('sunglasses-') || editingProduct.id.startsWith('fifa-'))

      if (isLocal) {
        const localProducts = JSON.parse(localStorage.getItem('mazish_custom_products') || '[]')
        const exists = localProducts.find(p => p.id === editingProduct.id)
        if (exists) {
          const updated = localProducts.map(p => p.id === editingProduct.id ? { ...p, ...payload } : p)
          localStorage.setItem('mazish_custom_products', JSON.stringify(updated))
        } else {
          localProducts.push({ id: editingProduct.id, ...payload })
          localStorage.setItem('mazish_custom_products', JSON.stringify(localProducts))
        }
        setMessage('Product updated successfully in Local Storage (Sandbox Mode)')
      } else {
        const { error } = await supabase
          .from('products')
          .update(payload)
          .eq('id', editingProduct.id)

        if (error) {
          const localProducts = JSON.parse(localStorage.getItem('mazish_custom_products') || '[]')
          const updated = localProducts.map(p => p.id === editingProduct.id ? { ...p, ...payload } : p)
          localStorage.setItem('mazish_custom_products', JSON.stringify(updated))
          setMessage('Product updated successfully in Local Storage (Sandbox Mode)')
        } else {
          setMessage('Product updated successfully in Supabase!')
        }
      }

      setNewProduct({
        name: '',
        description: '',
        price: '',
        discount_price: '',
        image_url: '/images/Sunglass1.png',
        category: categories[0]?.name || 'Sunglasses',
        gender: 'Unisex',
        stock: 20,
        is_featured: false
      })
      setEditingProduct(null)
      loadData()
      setActiveTab('products')
    } catch (err) {
      setMessage(`Error: ${err.message}`)
    }
    setActionLoading(null)
  }

  const handleAddPromo = async (e) => {
    e.preventDefault()
    setActionLoading('new-promo')
    setMessage('')
    try {
      const payload = {
        code: newPromo.code.toUpperCase().trim(),
        discount_type: newPromo.discount_type,
        discount_value: parseFloat(newPromo.discount_value),
        is_active: newPromo.is_active
      }

      const { data, error } = await supabase.from('promo_codes').insert([payload])
      if (error) {
        const localPromos = JSON.parse(localStorage.getItem('mazish_promos') || '[]')
        localPromos.push({ ...payload, created_at: new Date().toISOString() })
        localStorage.setItem('mazish_promos', JSON.stringify(localPromos))
        setMessage('Promo code added to Local Storage (Sandbox Mode)')
      } else {
        setMessage('Promo code created successfully in Supabase!')
      }

      setNewPromo({
        code: '',
        discount_type: 'percentage',
        discount_value: '',
        is_active: true
      })
      loadData()
    } catch (err) {
      setMessage(`Error: ${err.message}`)
    }
    setActionLoading(null)
  }

  const handleTogglePromo = async (code, currentActive) => {
    setActionLoading(code)
    try {
      const { error } = await supabase
        .from('promo_codes')
        .update({ is_active: !currentActive })
        .eq('code', code)

      if (error) {
        const localPromos = JSON.parse(localStorage.getItem('mazish_promos') || '[]')
        const updated = localPromos.map(p => p.code === code ? { ...p, is_active: !currentActive } : p)
        localStorage.setItem('mazish_promos', JSON.stringify(updated))
      }
      setMessage(`Promo code ${code} status changed!`)
      loadData()
    } catch (err) {
      setMessage(`Error: ${err.message}`)
    }
    setActionLoading(null)
  }

  const handleAddCategory = async (e) => {
    e.preventDefault()
    const name = newCategoryName.trim()
    if (!name) return

    setActionLoading('new-category')
    setMessage('')

    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([{ name }])
        .select()

      if (error) {
        const localCats = JSON.parse(localStorage.getItem('mazish_categories') || '[]')
        localCats.push({ name, created_at: new Date().toISOString() })
        localStorage.setItem('mazish_categories', JSON.stringify(localCats))
        setMessage('Category created in Local Storage (Sandbox Mode)')
      } else {
        setMessage(`Category "${name}" created successfully!`)
      }

      setNewCategoryName('')
      loadData()
    } catch (err) {
      setMessage(`Error: ${err.message}`)
    } finally {
      setActionLoading(null)
    }
  }

  // E-commerce Dashboard Metrics Calculation
  const totalRevenue = orders
    .filter(o => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0)

  const activePromoCount = promoCodes.filter(p => p.is_active).length
  const totalItemsSold = orders
    .filter(o => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + (o.items?.reduce((s, item) => s + (item.quantity || 0), 0) || 0), 0)

  // Search & Filter Logic
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.phone?.includes(searchTerm) ||
      order.id?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'All' || order.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Auth Guard Screen
  if (!isAuthenticated) {
    return (
      <div className="bg-zinc-950 min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-zinc-900/40 border border-zinc-900 p-8 sm:p-10 rounded-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500">
              <Lock size={20} />
            </div>
            <h1 className="font-luxury text-2xl text-white tracking-widest uppercase">MAZISH SECURITY</h1>
            <p className="text-zinc-500 text-xs font-light">Admin credentials required to access the dashboard</p>
          </div>

          {loginError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg text-center">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-2">Username</label>
              <input
                type="text"
                required
                placeholder="e.g. admin"
                value={loginForm.username}
                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-850 focus:border-amber-500 rounded-lg px-4 py-3 text-sm text-white focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-2">Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-850 focus:border-amber-500 rounded-lg px-4 py-3 text-sm text-white focus:outline-none transition-colors"
              />
            </div>
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-zinc-800 bg-zinc-950 text-amber-500 focus:ring-amber-500 focus:ring-offset-zinc-950 transition-colors cursor-pointer"
              />
              <label htmlFor="remember-me" className="ml-2 block text-xs text-zinc-400 font-light cursor-pointer select-none">
                Remember me on this device
              </label>
            </div>
            <button
              type="submit"
              disabled={loginLoading}
              className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold uppercase tracking-widest text-xs py-3.5 rounded-full transition-all disabled:opacity-50"
            >
              {loginLoading ? 'AUTHENTICATING...' : 'LOGIN TO CONTROL CENTER'}
            </button>
          </form>
        </div>
      </div>
    )
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
            <p className="text-zinc-500 text-xs mt-1">Manage orders, products, promo codes, and categories</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              className="flex items-center gap-2 border border-zinc-800 hover:border-zinc-700 bg-zinc-900/40 text-xs font-semibold uppercase tracking-wider text-zinc-400 hover:text-white px-4 py-2 rounded-full transition-all"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              Reload
            </button>
            <button
              onClick={() => {
                if (confirm("Are you sure you want to delete all sandbox orders and data from this browser? This will not affect live database records.")) {
                  localStorage.removeItem('mazish_orders');
                  localStorage.removeItem('mazish_custom_products');
                  localStorage.removeItem('mazish_promos');
                  localStorage.removeItem('mazish_categories');
                  loadData();
                  setMessage("Local sandbox test data cleared!");
                  setTimeout(() => setMessage(''), 3000);
                }
              }}
              className="border border-red-500/20 bg-red-500/5 hover:bg-red-500 hover:text-zinc-950 text-xs font-semibold uppercase tracking-wider text-red-400 px-4 py-2 rounded-full transition-all"
            >
              Clear Sandbox Data
            </button>
            <button
              onClick={handleLogout}
              className="border border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500 hover:text-zinc-950 text-xs font-semibold uppercase tracking-wider px-4 py-2 rounded-full transition-all"
            >
              Logout
            </button>
          </div>
        </div>

        {/* E-COMMERCE SUMMARY STATS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Revenue */}
          <div className="bg-zinc-900/30 border border-zinc-900/40 p-6 rounded-2xl flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Total Revenue</span>
              <p className="text-2xl font-bold text-amber-500">৳{totalRevenue}</p>
            </div>
            <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full">
              <DollarSign size={20} />
            </div>
          </div>

          {/* Orders */}
          <div className="bg-zinc-900/30 border border-zinc-900/40 p-6 rounded-2xl flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Total Orders</span>
              <p className="text-2xl font-bold text-white">{orders.length}</p>
            </div>
            <div className="p-3.5 bg-zinc-950 border border-zinc-850 text-zinc-400 rounded-full">
              <ShoppingCart size={20} />
            </div>
          </div>

          {/* Items Sold */}
          <div className="bg-zinc-900/30 border border-zinc-900/40 p-6 rounded-2xl flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Items Sold</span>
              <p className="text-2xl font-bold text-white">{totalItemsSold}</p>
            </div>
            <div className="p-3.5 bg-zinc-950 border border-zinc-850 text-zinc-400 rounded-full">
              <Package size={20} />
            </div>
          </div>

          {/* Active Promo Codes */}
          <div className="bg-zinc-900/30 border border-zinc-900/40 p-6 rounded-2xl flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Active Promos</span>
              <p className="text-2xl font-bold text-emerald-400">{activePromoCount}</p>
            </div>
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full">
              <Tag size={20} />
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-zinc-900 gap-6 text-sm font-semibold uppercase tracking-wider text-zinc-500 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-4 transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'orders' ? 'text-amber-500 border-b border-amber-500' : 'hover:text-white'}`}
          >
            <ClipboardList size={16} />
            Orders ({filteredOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`pb-4 transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'products' ? 'text-amber-500 border-b border-amber-500' : 'hover:text-white'}`}
          >
            <Package size={16} />
            Products ({products.length})
          </button>
          <button
            onClick={() => {
              setEditingProduct(null)
              setNewProduct({
                name: '',
                description: '',
                price: '',
                discount_price: '',
                image_url: '/images/Sunglass1.png',
                category: categories[0]?.name || 'Sunglasses',
                gender: 'Unisex',
                stock: 20,
                is_featured: false
              })
              setActiveTab('new-product')
            }}
            className={`pb-4 transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'new-product' && !editingProduct ? 'text-amber-500 border-b border-amber-500' : 'hover:text-white'}`}
          >
            <PlusCircle size={16} />
            Add Product
          </button>
          <button
            onClick={() => setActiveTab('promo-codes')}
            className={`pb-4 transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'promo-codes' ? 'text-amber-500 border-b border-amber-500' : 'hover:text-white'}`}
          >
            <Tag size={16} />
            Promo Codes ({promoCodes.length})
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`pb-4 transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'categories' ? 'text-amber-500 border-b border-amber-500' : 'hover:text-white'}`}
          >
            <ListFilter size={16} />
            Categories ({categories.length})
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
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-zinc-900/20 border border-zinc-900 p-4 rounded-xl">
              <div className="relative w-full sm:max-w-xs">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search name, phone, order ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 rounded-lg pl-10 pr-4 py-2 text-xs text-white focus:border-amber-500 focus:outline-none transition-colors"
                />
              </div>

              <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                {['All', 'Pending', 'Confirmed', 'Shipped', 'Delivered', 'Returned', 'Cancelled'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-3.5 py-1.5 rounded-full border transition-all ${
                      statusFilter === status 
                        ? 'bg-amber-500 text-zinc-950 border-amber-500' 
                        : 'border-zinc-850 bg-zinc-950/40 hover:border-zinc-750'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {filteredOrders.length === 0 ? (
              <div className="text-center p-20 border border-dashed border-zinc-900 rounded-2xl text-zinc-500">
                No orders match this selection.
              </div>
            ) : (
              <div className="overflow-x-auto border border-zinc-900 rounded-2xl">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-zinc-900/35 border-b border-zinc-900 text-zinc-400 font-semibold tracking-wider text-xs uppercase">
                      <th className="p-4 sm:p-6">Order Details</th>
                      <th className="p-4 sm:p-6">Customer</th>
                      <th className="p-4 sm:p-6">Items & Amount</th>
                      <th className="p-4 sm:p-6">Promo & Discount</th>
                      <th className="p-4 sm:p-6">Fulfillment</th>
                      <th className="p-4 sm:p-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900">
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-zinc-900/10">
                        <td className="p-4 sm:p-6 space-y-1">
                          <p className="font-semibold text-white truncate max-w-[150px]">{order.id}</p>
                          <p className="text-[10px] text-zinc-500">
                            {new Date(order.created_at).toLocaleDateString()} {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          <div className="pt-1">
                            <span className={`inline-block text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                              order.payment_method === 'COD' ? 'bg-zinc-800 text-zinc-300' : 'bg-pink-500/10 text-pink-400 border border-pink-500/20'
                            }`}>
                              {order.payment_method}
                            </span>
                            {order.payment_details && order.payment_details !== 'COD' && order.payment_details !== 'N/A' && (
                              <p className="text-[9px] text-zinc-400 mt-1 font-mono leading-tight">{order.payment_details}</p>
                            )}
                          </div>
                        </td>
                        <td className="p-4 sm:p-6 space-y-1">
                          <p className="text-white font-medium">{order.customer_name}</p>
                          <p className="text-xs text-zinc-400">{order.phone}</p>
                          {order.email && <p className="text-[10px] text-zinc-400 truncate max-w-[180px]">{order.email}</p>}
                          <p className="text-[10px] text-zinc-500 line-clamp-1">{order.delivery_address}</p>
                        </td>
                        <td className="p-4 sm:p-6 space-y-1">
                          <p className="text-white">৳{order.total_amount}</p>
                          {order.shipping_cost !== undefined && order.shipping_cost !== null && (
                            <p className="text-[9px] text-zinc-500">Shipping: ৳{order.shipping_cost}</p>
                          )}
                          <p className="text-[10px] text-zinc-500">
                            {order.items?.map(i => `${i.name} (${i.quantity})`).join(', ')}
                          </p>
                        </td>
                        <td className="p-4 sm:p-6 space-y-1">
                          {order.promo_code ? (
                            <>
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                                <Tag size={10} />
                                {order.promo_code}
                              </span>
                              <p className="text-[10px] text-red-400 mt-1">-৳{order.discount_amount}</p>
                            </>
                          ) : (
                            <span className="text-zinc-650 text-xs">-</span>
                          )}
                        </td>
                        <td className="p-4 sm:p-6">
                          <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded ${
                            order.status === 'Shipped' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            order.status === 'Confirmed' ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' :
                            order.status === 'Cancelled' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                            order.status === 'Returned' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                            order.status === 'Delivered' ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' :
                            'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {order.status}
                          </span>
                          {order.steadfast_tracking_code && (
                            <p className="text-[9px] text-zinc-500 font-mono mt-1 font-semibold">Track: {order.steadfast_tracking_code}</p>
                          )}
                        </td>
                        <td className="p-4 sm:p-6 text-right space-y-2">
                          <div className="flex flex-col sm:flex-row gap-2 justify-end">
                            {order.status === 'Pending' && (
                              <button
                                onClick={() => handleUpdateStatus(order.id, order.status, 'Confirmed')}
                                disabled={actionLoading === order.id}
                                className="text-emerald-400 hover:text-emerald-300 font-bold text-[10px] tracking-wider uppercase border border-zinc-800 bg-zinc-950 px-3 py-1.5 rounded-full transition-colors disabled:opacity-50"
                              >
                                Confirm Order
                              </button>
                            )}

                            {order.status === 'Confirmed' && (
                              <>
                                <button
                                  onClick={() => handleDispatchSteadfast(order.id)}
                                  disabled={actionLoading === order.id + '-steadfast'}
                                  className="inline-flex items-center gap-1 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-[10px] tracking-wider uppercase px-3 py-1.5 rounded-full transition-colors disabled:opacity-50"
                                >
                                  <Truck size={12} />
                                  Steadfast Dispatch
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(order.id, order.status, 'Shipped')}
                                  disabled={actionLoading === order.id}
                                  className="text-zinc-300 hover:text-white font-bold text-[10px] tracking-wider uppercase border border-zinc-800 bg-zinc-950 px-3 py-1.5 rounded-full transition-colors disabled:opacity-50"
                                >
                                  Mark Shipped
                                </button>
                              </>
                            )}

                            {order.status !== 'Cancelled' && order.status !== 'Delivered' && order.status !== 'Returned' && (
                              <button
                                onClick={() => handleUpdateStatus(order.id, order.status, 'Delivered')}
                                className="text-emerald-400 hover:text-emerald-300 font-medium text-xs border border-zinc-800 bg-zinc-950 px-2.5 py-1.5 rounded-full"
                              >
                                Mark Delivered
                              </button>
                            )}

                            {order.status !== 'Cancelled' && order.status !== 'Returned' && (
                              <button
                                onClick={() => handleUpdateStatus(order.id, order.status, 'Returned')}
                                className="text-orange-400 hover:text-orange-300 font-medium text-xs border border-zinc-800 bg-zinc-950 px-2.5 py-1.5 rounded-full"
                              >
                                Mark Returned
                              </button>
                            )}

                            <button
                              onClick={() => setSelectedOrderForModal(order)}
                              className="inline-flex items-center gap-1.5 text-amber-500 hover:text-amber-400 font-medium text-xs border border-amber-500/25 hover:border-amber-500/40 bg-zinc-950 px-3 py-1.5 rounded-full transition-colors"
                            >
                              <Eye size={12} />
                              View Details
                            </button>
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
              <div key={product.id} className="bg-zinc-900/40 border border-zinc-900 rounded-xl overflow-hidden p-4 space-y-4 flex flex-col justify-between">
                <div>
                  <div className="aspect-square bg-zinc-950 overflow-hidden rounded-lg">
                    <img src={product.images?.[0]} alt={product.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between items-center text-[10px] uppercase font-semibold text-zinc-500">
                      <span>{product.category}</span>
                      <span className="text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 rounded-full">{product.gender}</span>
                    </div>
                    <h3 className="text-white font-medium truncate mt-2">{product.name}</h3>
                    <p className="text-zinc-500 text-xs mt-1 truncate">{product.description}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4 pt-2 border-t border-zinc-900">
                  <div className="flex items-baseline space-x-2">
                    <span className="text-amber-500 font-bold">৳{product.discount_price || product.price}</span>
                    {product.discount_price && <span className="text-zinc-600 line-through text-xs">৳{product.price}</span>}
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleStock(product)}
                      disabled={actionLoading === product.id + '-stock'}
                      className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border transition-all ${
                        (product.stock !== undefined ? product.stock : 20) > 0 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500 hover:text-zinc-950' 
                          : 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500 hover:text-white'
                      }`}
                    >
                      {(product.stock !== undefined ? product.stock : 20) > 0 ? 'In Stock' : 'Sold Out'}
                    </button>
                    <button
                      onClick={() => {
                        setEditingProduct(product)
                        setNewProduct({
                          name: product.name,
                          description: product.description || '',
                          price: product.price.toString(),
                          discount_price: product.discount_price ? product.discount_price.toString() : '',
                          image_url: product.images?.[0] || '/images/Sunglass1.png',
                          category: product.category,
                          gender: product.gender || 'Unisex',
                          stock: product.stock !== undefined ? product.stock : 20,
                          is_featured: product.is_featured || false
                        })
                        setActiveTab('new-product')
                      }}
                      className="text-[10px] font-semibold uppercase tracking-wider text-amber-500 hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : activeTab === 'new-product' ? (
          /* ADD / EDIT PRODUCT TAB */
          <div className="max-w-xl mx-auto bg-zinc-900/40 border border-zinc-900 p-8 rounded-2xl space-y-6">
            <h2 className="text-lg font-semibold tracking-wider text-white uppercase border-b border-zinc-800 pb-4">
              {editingProduct ? `Edit Product: ${editingProduct.name}` : 'Create Luxury Product'}
            </h2>

            <form onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct} className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-2">Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MAZISH Classic Aviator"
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
                    placeholder="1400"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-850 focus:border-amber-500 rounded-lg px-4 py-3 text-sm text-white focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-2">Discount Price (৳)</label>
                  <input
                    type="number"
                    placeholder="950"
                    value={newProduct.discount_price}
                    onChange={(e) => setNewProduct({ ...newProduct, discount_price: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-850 focus:border-amber-500 rounded-lg px-4 py-3 text-sm text-white focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-2">Category *</label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-850 focus:border-amber-500 rounded-lg px-3 py-3 text-sm text-white focus:outline-none transition-colors"
                  >
                    {categories.map(c => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-2">Gender *</label>
                  <select
                    value={newProduct.gender}
                    onChange={(e) => setNewProduct({ ...newProduct, gender: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-850 focus:border-amber-500 rounded-lg px-3 py-3 text-sm text-white focus:outline-none transition-colors"
                  >
                    <option value="Unisex">Unisex</option>
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-2">Image Template URL</label>
                <select
                  value={newProduct.image_url}
                  onChange={(e) => setNewProduct({ ...newProduct, image_url: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-850 focus:border-amber-500 rounded-lg px-4 py-3 text-sm text-white focus:outline-none transition-colors"
                >
                  <option value="/images/Sunglass1.png">Sunglasses Preview 1</option>
                  <option value="/images/Sunglass2.png">Sunglasses Preview 2</option>
                  <option value="/images/Sunglass3.png">Sunglasses Preview 3</option>
                  <option value="/images/Sunglass4.png">Sunglasses Preview 4</option>
                  <option value="/images/Sunglass5.png">Sunglasses Preview 5</option>
                  <option value="/images/Sunglass6.png">Sunglasses Preview 6</option>
                  <option value="/images/Sunglass7.png">Sunglasses Preview 7</option>
                  <option value="/images/Sunglass8.png">Sunglasses Preview 8</option>
                  <option value="/images/BrazilGlass.jpg">Brazil Special Glass (Draft Card)</option>
                  <option value="/images/ArgentinaGlass.jpg">Argentina Special Glass (Draft Card)</option>
                  <option value="/images/Brazil1.jpg">Brazil Glass View 1</option>
                  <option value="/images/Brazil2.jpg">Brazil Glass View 2</option>
                  <option value="/images/Brazil3.jpg">Brazil Glass View 3</option>
                  <option value="/images/Argentina1.jpg">Argentina Glass View 1</option>
                  <option value="/images/Argentina2.jpg">Argentina Glass View 2</option>
                  <option value="/images/Argentina3.jpg">Argentina Glass View 3</option>
                </select>
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

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={actionLoading === 'new-product' || actionLoading === 'edit-product'}
                  className="flex-1 bg-amber-500 text-zinc-950 font-bold uppercase tracking-widest text-xs py-4 rounded-full hover:bg-amber-400 transition-all disabled:opacity-50"
                >
                  {editingProduct ? 'UPDATE PRODUCT' : 'ADD LUXURY PRODUCT'}
                </button>
                {editingProduct && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingProduct(null)
                      setNewProduct({
                        name: '',
                        description: '',
                        price: '',
                        discount_price: '',
                        image_url: '/images/Sunglass1.png',
                        category: categories[0]?.name || 'Sunglasses',
                        gender: 'Unisex',
                        stock: 20,
                        is_featured: false
                      })
                      setActiveTab('products')
                    }}
                    className="border border-zinc-800 hover:border-zinc-700 text-white font-bold uppercase tracking-widest text-xs px-6 py-4 rounded-full transition-all"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        ) : activeTab === 'promo-codes' ? (
          /* PROMO CODES TAB */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Create Promo Code form */}
            <div className="lg:col-span-4 bg-zinc-900/40 border border-zinc-900 p-6 rounded-2xl space-y-4">
              <h3 className="text-sm font-semibold tracking-wider text-white uppercase border-b border-zinc-850 pb-3">Create Voucher</h3>
              <form onSubmit={handleAddPromo} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">Promo Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MAZISH10"
                    value={newPromo.code}
                    onChange={(e) => setNewPromo({ ...newPromo, code: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-850 focus:border-amber-500 rounded-lg px-4 py-2.5 text-xs text-white uppercase focus:outline-none transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">Type</label>
                    <select
                      value={newPromo.discount_type}
                      onChange={(e) => setNewPromo({ ...newPromo, discount_type: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-850 focus:border-amber-500 rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none transition-colors"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed BDT (৳)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">Value *</label>
                    <input
                      type="number"
                      required
                      placeholder="10"
                      value={newPromo.discount_value}
                      onChange={(e) => setNewPromo({ ...newPromo, discount_value: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-850 focus:border-amber-500 rounded-lg px-4 py-2.5 text-xs text-white focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={actionLoading === 'new-promo'}
                  className="w-full bg-amber-500 text-zinc-950 font-bold uppercase tracking-widest text-[10px] py-3 rounded-full hover:bg-amber-400 transition-all disabled:opacity-50"
                >
                  Create Code
                </button>
              </form>
            </div>

            {/* List Promo Codes */}
            <div className="lg:col-span-8 bg-zinc-900/40 border border-zinc-900 rounded-2xl overflow-hidden">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-zinc-900/35 border-b border-zinc-900 text-zinc-400 font-semibold tracking-wider text-xs uppercase">
                    <th className="p-4">Voucher Code</th>
                    <th className="p-4">Discount Value</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {promoCodes.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-zinc-500 text-xs font-light">No promo codes created yet.</td>
                    </tr>
                  ) : (
                    promoCodes.map((promo) => (
                      <tr key={promo.code} className="hover:bg-zinc-900/10">
                        <td className="p-4 flex items-center gap-2">
                          <Tag size={14} className="text-amber-500" />
                          <span className="font-bold text-white uppercase">{promo.code}</span>
                        </td>
                        <td className="p-4 text-xs font-medium text-zinc-300">
                          {promo.discount_type === 'percentage' ? `${promo.discount_value}% Off` : `৳${promo.discount_value} Off`}
                        </td>
                        <td className="p-4">
                          <span className={`inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${promo.is_active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                            {promo.is_active ? 'Active' : 'Disabled'}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleTogglePromo(promo.code, promo.is_active)}
                            disabled={actionLoading === promo.code}
                            className="text-[10px] font-semibold uppercase tracking-wider border border-zinc-800 bg-zinc-950 px-3 py-1.5 rounded hover:border-zinc-700 text-zinc-400 hover:text-white transition-all disabled:opacity-50"
                          >
                            Toggle Status
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* CATEGORIES TAB */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Create Category form */}
            <div className="lg:col-span-4 bg-zinc-900/40 border border-zinc-900 p-6 rounded-2xl space-y-4">
              <h3 className="text-sm font-semibold tracking-wider text-white uppercase border-b border-zinc-850 pb-3">Create Category</h3>
              <form onSubmit={handleAddCategory} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">Category Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apparel"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 focus:border-amber-500 rounded-lg px-4 py-2.5 text-xs text-white focus:outline-none transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={actionLoading === 'new-category'}
                  className="w-full bg-amber-500 text-zinc-950 font-bold uppercase tracking-widest text-[10px] py-3 rounded-full hover:bg-amber-400 transition-all disabled:opacity-50"
                >
                  Create Category
                </button>
              </form>
            </div>

            {/* List Categories */}
            <div className="lg:col-span-8 bg-zinc-900/40 border border-zinc-900 rounded-2xl overflow-hidden">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-zinc-900/35 border-b border-zinc-900 text-zinc-400 font-semibold tracking-wider text-xs uppercase">
                    <th className="p-4">Category Name</th>
                    <th className="p-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {categories.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="p-8 text-center text-zinc-500 text-xs font-light">No categories created yet.</td>
                    </tr>
                  ) : (
                    categories.map((cat) => (
                      <tr key={cat.name} className="hover:bg-zinc-900/10">
                        <td className="p-4 font-semibold text-white uppercase tracking-wider text-xs">{cat.name}</td>
                        <td className="p-4 text-right">
                          <span className="inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Active</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {/* Order Details Modal */}
        {selectedOrderForModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
              {/* Header */}
              <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
                <div>
                  <h3 className="font-luxury text-lg text-white">Order Details</h3>
                  <p className="text-[10px] font-mono text-zinc-500 mt-1 uppercase tracking-wider">ID: {selectedOrderForModal.id}</p>
                </div>
                <button
                  onClick={() => setSelectedOrderForModal(null)}
                  className="p-1.5 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm font-sans">
                {/* Status and Method Banner */}
                <div className="grid grid-cols-2 gap-4 bg-zinc-950/50 p-4 rounded-xl border border-zinc-850">
                  <div>
                    <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">Status</span>
                    <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded mt-1.5 ${
                      selectedOrderForModal.status === 'Shipped' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      selectedOrderForModal.status === 'Confirmed' ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' :
                      selectedOrderForModal.status === 'Cancelled' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                      selectedOrderForModal.status === 'Returned' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                      selectedOrderForModal.status === 'Delivered' ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' :
                      'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {selectedOrderForModal.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">Payment</span>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-zinc-800 text-zinc-300">
                        {selectedOrderForModal.payment_method}
                      </span>
                      {selectedOrderForModal.payment_details && selectedOrderForModal.payment_details !== 'COD' && selectedOrderForModal.payment_details !== 'N/A' && (
                        <span className="text-[10px] text-zinc-400 font-mono bg-zinc-950/80 px-2 py-0.5 rounded border border-zinc-850">
                          {selectedOrderForModal.payment_details}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Customer Details */}
                <div className="space-y-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-500 border-b border-zinc-800 pb-2">Customer Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">Name</span>
                      <p className="text-white font-medium mt-0.5">{selectedOrderForModal.customer_name}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">Phone</span>
                      <p className="text-white font-medium mt-0.5 select-all">{selectedOrderForModal.phone}</p>
                    </div>
                    {selectedOrderForModal.email && (
                      <div className="md:col-span-2">
                        <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">Email</span>
                        <p className="text-white mt-0.5 select-all">{selectedOrderForModal.email}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Address Section */}
                <div className="space-y-3 bg-zinc-950/40 p-4 rounded-xl border border-zinc-850/80">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Full Delivery Address</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(selectedOrderForModal.delivery_address);
                        setMessage("Address copied to clipboard!");
                        setTimeout(() => setMessage(''), 3000);
                      }}
                      className="text-[10px] text-amber-500 hover:text-amber-400 uppercase tracking-wider font-semibold underline transition-colors"
                    >
                      Copy Address
                    </button>
                  </div>
                  <p className="text-white font-light bg-zinc-950/80 p-3 rounded-lg border border-zinc-900 leading-relaxed select-all">
                    {selectedOrderForModal.delivery_address}
                  </p>
                </div>

                {/* Ordered Items */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-500 border-b border-zinc-800 pb-2">Items Ordered</h4>
                  <div className="bg-zinc-950/30 rounded-xl border border-zinc-900 divide-y divide-zinc-900">
                    {selectedOrderForModal.items?.map((item, idx) => (
                      <div key={idx} className="p-3.5 flex justify-between items-center text-xs">
                        <div>
                          <p className="text-white font-medium">{item.name}</p>
                          <p className="text-[10px] text-zinc-500 mt-0.5">Category: {item.category || 'Sunglasses'} | Quantity: {item.quantity}</p>
                        </div>
                        <p className="text-white font-semibold">৳{(item.discount_price || item.price) * item.quantity}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pricing Summary */}
                <div className="bg-zinc-950/50 p-4 rounded-xl border border-zinc-850 space-y-2.5 text-xs text-zinc-400">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="text-white">৳{selectedOrderForModal.items?.reduce((sum, item) => sum + ((item.discount_price || item.price) * item.quantity), 0) || 0}</span>
                  </div>
                  {selectedOrderForModal.discount_amount > 0 && (
                    <div className="flex justify-between text-red-400">
                      <span>Discount {selectedOrderForModal.promo_code ? `(${selectedOrderForModal.promo_code})` : ''}</span>
                      <span>-৳{selectedOrderForModal.discount_amount}</span>
                    </div>
                  )}
                  {selectedOrderForModal.shipping_cost !== undefined && (
                    <div className="flex justify-between">
                      <span>Shipping Cost</span>
                      <span className="text-white">৳{selectedOrderForModal.shipping_cost}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-bold text-white border-t border-zinc-850 pt-2.5">
                    <span className="text-amber-500">Grand Total</span>
                    <span className="text-amber-500">৳{selectedOrderForModal.total_amount}</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-zinc-800 bg-zinc-950/50 flex justify-end gap-3">
                <button
                  onClick={() => {
                    const fullText = `Order ID: ${selectedOrderForModal.id}\nCustomer Name: ${selectedOrderForModal.customer_name}\nPhone: ${selectedOrderForModal.phone}\nAddress: ${selectedOrderForModal.delivery_address}\nItems: ${selectedOrderForModal.items?.map(i => `${i.name} (${i.quantity})`).join(', ')}\nTotal: ৳${selectedOrderForModal.total_amount}`;
                    navigator.clipboard.writeText(fullText);
                    setMessage("All order details copied to clipboard!");
                    setTimeout(() => setMessage(''), 3000);
                  }}
                  className="border border-zinc-800 hover:border-zinc-700 bg-zinc-900 text-zinc-300 font-semibold uppercase tracking-wider text-[10px] px-5 py-2.5 rounded-full transition-all"
                >
                  Copy All Details
                </button>
                <button
                  onClick={() => setSelectedOrderForModal(null)}
                  className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold uppercase tracking-wider text-[10px] px-6 py-2.5 rounded-full transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
