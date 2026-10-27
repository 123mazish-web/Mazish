'use client'

import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { getProducts } from '@/lib/db'
import { DEFAULT_PRODUCTS } from '@/lib/products'
import { Lock, ShieldCheck } from 'lucide-react'

// Modular Admin Components
import AdminHeader from './components/AdminHeader'
import AdminSidebar from './components/AdminSidebar'
import DashboardAnalytics from './components/DashboardAnalytics'
import POSTerminal from './components/POSTerminal'
import OrdersManager from './components/OrdersManager'
import ProductsManager from './components/ProductsManager'
import ProfitLossReport from './components/ProfitLossReport'
import ExpensesLedger from './components/ExpensesLedger'
import FraudSecurityManager from './components/FraudSecurityManager'
import SettingsManager from './components/SettingsManager'

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loginForm, setLoginForm] = useState({ username: '', password: '' })
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  // Core Data States
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState(DEFAULT_PRODUCTS)
  const [promoCodes, setPromoCodes] = useState([])
  const [categories, setCategories] = useState([])
  const [activeTab, setActiveTab] = useState('dashboard') // default to rich executive dashboard
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const [message, setMessage] = useState('')

  // Expenses State (Cleared to empty for clean slate)
  const [expenses, setExpenses] = useState([])

  // Steadfast Live Courier Balance
  const [steadfastBalance, setSteadfastBalance] = useState(null)
  const [balanceLoading, setBalanceLoading] = useState(false)

  // Security Blacklists State (Persisted in localStorage)
  const [blockedPhones, setBlockedPhones] = useState(() => {
    if (typeof window === 'undefined') return []
    try {
      const saved = localStorage.getItem('mazish_blocked_phones')
      if (saved) return JSON.parse(saved)
    } catch (e) {}
    return [
      {
        id: 'bp-1',
        phone: '01712000000',
        reason: 'Refused COD delivery at doorstep twice',
        date: new Date().toISOString(),
      },
    ]
  })

  const [blockedIps, setBlockedIps] = useState(() => {
    if (typeof window === 'undefined') return []
    try {
      const saved = localStorage.getItem('mazish_blocked_ips')
      if (saved) return JSON.parse(saved)
    } catch (e) {}
    return [
      {
        id: 'bip-1',
        ip: '103.145.2.14',
        reason: 'Automated checkout spam bot',
        date: new Date().toISOString(),
      },
    ]
  })

  const [auditLogs, setAuditLogs] = useState(() => {
    if (typeof window === 'undefined') return []
    try {
      const saved = localStorage.getItem('mazish_block_audit')
      if (saved) return JSON.parse(saved)
    } catch (e) {}
    return [
      {
        type: 'UNBLOCK',
        action: 'Unblocked Mobile Number',
        target: '01911000000',
        reason: 'Customer verified identity & prepaid via bKash',
        timestamp: new Date().toISOString(),
      },
    ]
  })

  // Auth Initialization
  useEffect(() => {
    const token =
      localStorage.getItem('mazish_admin_token') ||
      sessionStorage.getItem('mazish_admin_token')
    if (token === 'mazish-secure-admin-token') {
      setIsAuthenticated(true)
      loadData(true)
    } else {
      setLoading(false)
    }
  }, [])

  // Persist Expenses Changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('mazish_expenses', JSON.stringify(expenses))
    }
  }, [expenses])

  // Persist Blacklists Changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('mazish_blocked_phones', JSON.stringify(blockedPhones))
      localStorage.setItem('mazish_blocked_ips', JSON.stringify(blockedIps))
      localStorage.setItem('mazish_block_audit', JSON.stringify(auditLogs))
    }
  }, [blockedPhones, blockedIps, auditLogs])

  // Load Data from Supabase & Local Cache
  async function loadData(isInitial = false) {
    if (isInitial) setLoading(true)
    setMessage('')

    const queryTimeout = (promise, ms = 3500) => {
      let timeoutId
      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error('Timeout')), ms)
      })
      return Promise.race([promise, timeoutPromise]).finally(() =>
        clearTimeout(timeoutId)
      )
    }

    try {
      const [ordersRes, productsRes, promosRes, catsRes] =
        await Promise.allSettled([
          queryTimeout(
            supabase.from('orders').select('*').order('created_at', { ascending: false })
          ),
          queryTimeout(getProducts()),
          queryTimeout(fetch('/api/admin/promos/manage').then((res) => res.json())),
          queryTimeout(
            supabase.from('categories').select('*').order('name', { ascending: true })
          ),
        ])

      // 1. Process Orders
      if (
        ordersRes.status === 'fulfilled' &&
        ordersRes.value &&
        ordersRes.value.data &&
        !ordersRes.value.error
      ) {
        setOrders(ordersRes.value.data || [])
      } else {
        const localOrders = JSON.parse(localStorage.getItem('mazish_orders') || '[]')
        setOrders(localOrders)
      }

      // 2. Process Products
      if (productsRes.status === 'fulfilled' && productsRes.value) {
        setProducts(productsRes.value)
      }

      // 3. Process Promos
      if (promosRes.status === 'fulfilled' && promosRes.value?.success) {
        setPromoCodes(promosRes.value.data)
      } else {
        const localPromos = JSON.parse(localStorage.getItem('mazish_promos') || '[]')
        setPromoCodes(
          localPromos.length > 0
            ? localPromos
            : [
                { code: 'MAZISH10', discount_type: 'percentage', discount_value: 10, is_active: true },
                { code: 'LAUNCH950', discount_type: 'fixed', discount_value: 150, is_active: true },
                { code: 'SUMMER', discount_type: 'percentage', discount_value: 5, is_active: true },
              ]
        )
      }

      // 4. Process Categories
      if (
        catsRes.status === 'fulfilled' &&
        catsRes.value &&
        catsRes.value.data &&
        !catsRes.value.error
      ) {
        setCategories(catsRes.value.data)
      } else {
        const localCats = JSON.parse(localStorage.getItem('mazish_categories') || '[]')
        setCategories(
          localCats.length > 0
            ? localCats
            : [
                { name: 'Sunglasses' },
                { name: 'Apparel' },
                { name: 'Accessories' },
                { name: 'FIFA Special Edition' },
              ]
        )
      }

      // 5. Fetch Live Steadfast Balance
      fetchSteadfastBalance()
    } catch (e) {
      console.warn('Network timeout, using cached state:', e)
    } finally {
      setLoading(false)
    }
  }

  // Fetch Live Steadfast Courier Balance
  async function fetchSteadfastBalance() {
    setBalanceLoading(true)
    try {
      const token =
        localStorage.getItem('mazish_admin_token') ||
        sessionStorage.getItem('mazish_admin_token')
      const res = await fetch('/api/steadfast/balance', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success && typeof data.balance === 'number') {
        setSteadfastBalance(data.balance)
      }
    } catch (e) {
      console.warn('Could not fetch Steadfast balance:', e)
    } finally {
      setBalanceLoading(false)
    }
  }

  // Login Handler
  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    setLoginError('')
    setLoginLoading(true)

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm),
      })

      const result = await res.json()
      if (result.success) {
        if (rememberMe) {
          localStorage.setItem('mazish_admin_token', result.token)
        } else {
          sessionStorage.setItem('mazish_admin_token', result.token)
        }
        setIsAuthenticated(true)
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

  // Logout Handler
  const handleLogout = () => {
    sessionStorage.removeItem('mazish_admin_token')
    localStorage.removeItem('mazish_admin_token')
    setIsAuthenticated(false)
    setLoginForm({ username: '', password: '' })
  }

  // Order Status Update Handler
  const handleUpdateStatus = async (orderId, currentStatus, targetStatus) => {
    setActionLoading(orderId)
    setMessage('')
    try {
      const order = orders.find((o) => o.id === orderId)
      const isLocal =
        order &&
        (!order.customer_name ||
          (typeof order.id === 'string' &&
            (order.id.startsWith('demo-') || order.id.startsWith('pos-') || order.id.startsWith('manual-'))))

      if (isLocal) {
        const localOrders = JSON.parse(localStorage.getItem('mazish_orders') || '[]')
        const updated = localOrders.map((o) =>
          o.id === orderId ? { ...o, status: targetStatus } : o
        )
        localStorage.setItem('mazish_orders', JSON.stringify(updated))
        loadData()
        setMessage(`Order #${orderId.slice(0, 8)} status set to ${targetStatus}`)
      } else {
        const res = await fetch('/api/admin/orders/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId, status: targetStatus }),
        })
        const result = await res.json()
        if (result.success) {
          loadData()
          setMessage(`Order status updated to ${targetStatus}`)
        } else {
          const localOrders = JSON.parse(localStorage.getItem('mazish_orders') || '[]')
          const updated = localOrders.map((o) =>
            o.id === orderId ? { ...o, status: targetStatus } : o
          )
          localStorage.setItem('mazish_orders', JSON.stringify(updated))
          loadData()
          setMessage(`Status updated: ${targetStatus}`)
        }
      }
    } catch (err) {
      setMessage(`Connection failed: ${err.message}`)
    }
    setActionLoading(null)
  }

  // Steadfast Courier Dispatch Handler
  const handleDispatchSteadfast = async (orderId) => {
    setActionLoading(orderId + '-steadfast')
    setMessage('')
    try {
      const isDemo =
        !orderId.includes('-') ||
        orders.find((o) => o.id === orderId)?.customer_name === undefined ||
        orderId.startsWith('pos-') ||
        orderId.startsWith('manual-')

      const token =
        localStorage.getItem('mazish_admin_token') ||
        sessionStorage.getItem('mazish_admin_token')

      const dispatchResponse = await fetch('/api/steadfast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ orderId, isDemo }),
      })

      const result = await dispatchResponse.json()
      if (result.success) {
        setMessage(result.message || 'Successfully dispatched to Steadfast!')
        const localOrders = JSON.parse(localStorage.getItem('mazish_orders') || '[]')
        const updated = localOrders.map((o) =>
          o.id === orderId
            ? {
                ...o,
                status: 'Shipped',
                steadfast_consignment_id: result.consignmentId,
                steadfast_tracking_code: result.trackingCode,
              }
            : o
        )
        localStorage.setItem('mazish_orders', JSON.stringify(updated))
        loadData()
      } else {
        setMessage(`Steadfast Dispatch Error: ${result.error}`)
      }
    } catch (err) {
      setMessage(`Connection failed: ${err.message}`)
    }
    setActionLoading(null)
  }

  // Delete Order Handler
  const handleDeleteOrder = async (orderId) => {
    setActionLoading(orderId + '-delete')
    try {
      await fetch('/api/admin/orders/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'DELETE', orderId }),
      })
      const localOrders = JSON.parse(localStorage.getItem('mazish_orders') || '[]')
      const updated = localOrders.filter((o) => o.id !== orderId)
      localStorage.setItem('mazish_orders', JSON.stringify(updated))
      loadData()
      setMessage('Order deleted successfully')
    } catch (err) {
      setMessage(`Error: ${err.message}`)
    }
    setActionLoading(null)
  }

  // POS Order Created Handler
  const handlePOSOrderCreated = async (orderPayload) => {
    setOrders((prev) => [orderPayload, ...prev])
    const localOrders = JSON.parse(localStorage.getItem('mazish_orders') || '[]')
    localStorage.setItem('mazish_orders', JSON.stringify([orderPayload, ...localOrders]))

    // Try background insert to Supabase
    try {
      await supabase.from('orders').insert([orderPayload])
    } catch (e) {}

    // Notify Telegram if configured
    try {
      await fetch('/api/orders/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      })
    } catch (e) {}

    setMessage('POS Walk-in Sale recorded!')
    setTimeout(() => setMessage(''), 3000)
  }

  // Save Manual Order Handler
  const handleSaveManualOrder = async (orderObj, isEdit) => {
    const localOrders = JSON.parse(localStorage.getItem('mazish_orders') || '[]')
    let updated
    if (isEdit) {
      updated = localOrders.map((o) => (o.id === orderObj.id ? orderObj : o))
    } else {
      updated = [orderObj, ...localOrders]
    }
    localStorage.setItem('mazish_orders', JSON.stringify(updated))
    setOrders((prev) => (isEdit ? prev.map((o) => (o.id === orderObj.id ? orderObj : o)) : [orderObj, ...prev]))

    try {
      await supabase.from('orders').insert([orderObj])
    } catch (e) {}

    setMessage(isEdit ? 'Manual order updated!' : 'Manual order created!')
    setTimeout(() => setMessage(''), 3000)
  }

  // Product Stock Toggle Handler
  const handleToggleStock = async (product) => {
    setActionLoading(product.id + '-stock')
    const newStock = product.stock === 0 ? 15 : 0
    try {
      const token =
        localStorage.getItem('mazish_admin_token') ||
        sessionStorage.getItem('mazish_admin_token')
      const res = await fetch('/api/admin/products/manage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'UPDATE_STOCK',
          id: product.id,
          stock: newStock,
        }),
      })
      const result = await res.json()
      if (result.success) {
        setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, stock: newStock } : p)))
        setMessage(`${product.name} stock set to ${newStock}`)
      } else {
        setMessage(`Stock update error: ${result.error}`)
      }
    } catch (err) {
      setMessage(`Stock update error: ${err.message}`)
    }
    setActionLoading(null)
  }

  // Product Edit Save Handler
  const handleSaveProduct = async (product) => {
    try {
      const token =
        localStorage.getItem('mazish_admin_token') ||
        sessionStorage.getItem('mazish_admin_token')
      const res = await fetch('/api/admin/products/manage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'UPDATE_PRODUCT',
          id: product.id,
          payload: {
            name: product.name,
            price: product.price,
            discount_price: product.discount_price,
            stock: product.stock,
            gender: product.gender,
            category: product.category,
            description: product.description,
            is_featured: product.is_featured,
          },
        }),
      })
      const result = await res.json()
      if (result.success) {
        setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, ...result.data } : p)))
        setMessage(`Product "${product.name}" updated successfully!`)
      } else {
        setMessage(`Failed to update product: ${result.error}`)
      }
    } catch (e) {
      setMessage(`Update error: ${e.message}`)
    }
  }

  // Product Create Handler
  const handleSaveNewProduct = async (newProd) => {
    const payload = {
      name: newProd.name,
      description: newProd.description,
      price: parseFloat(newProd.price),
      discount_price: newProd.discount_price ? parseFloat(newProd.discount_price) : null,
      images: [newProd.image_url],
      category: newProd.category,
      gender: newProd.gender,
      stock: Number(newProd.stock),
      is_featured: newProd.is_featured,
    }

    try {
      const token =
        localStorage.getItem('mazish_admin_token') ||
        sessionStorage.getItem('mazish_admin_token')
      const res = await fetch('/api/admin/products/manage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'CREATE_PRODUCT',
          payload,
        }),
      })
      const result = await res.json()
      if (result.success && result.data) {
        setProducts((prev) => [result.data, ...prev])
        setMessage('New product published successfully!')
        setActiveTab('products')
      } else {
        setMessage(`Failed to create product: ${result.error}`)
      }
    } catch (e) {
      setMessage(`Create error: ${e.message}`)
    }
  }

  // Product Delete Handler
  const handleDeleteProduct = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    try {
      const token =
        localStorage.getItem('mazish_admin_token') ||
        sessionStorage.getItem('mazish_admin_token')
      const res = await fetch('/api/admin/products/manage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'DELETE_PRODUCT',
          id: productId,
        }),
      })
      const result = await res.json()
      if (result.success) {
        setProducts((prev) => prev.filter((p) => p.id !== productId))
        setMessage('Product deleted successfully!')
      } else {
        setMessage(`Delete error: ${result.error}`)
      }
    } catch (e) {
      setMessage(`Delete error: ${e.message}`)
    }
  }

  // Category Add Handler
  const handleAddCategory = async (catName) => {
    try {
      await supabase.from('categories').insert([{ name: catName }])
      setCategories((prev) => [...prev, { name: catName }])
      setMessage(`Category "${catName}" added!`)
    } catch (e) {
      setCategories((prev) => [...prev, { name: catName }])
    }
  }

  // Promo Add Handler
  const handleAddPromo = async (promoObj) => {
    try {
      await fetch('/api/admin/promos/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'CREATE', payload: promoObj }),
      })
      setPromoCodes((prev) => [promoObj, ...prev])
      setMessage(`Promo coupon "${promoObj.code}" created!`)
    } catch (e) {
      setPromoCodes((prev) => [promoObj, ...prev])
    }
  }

  // Promo Toggle Handler
  const handleTogglePromo = async (code, isActive) => {
    try {
      await fetch('/api/admin/promos/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'TOGGLE', code, payload: { is_active: isActive } }),
      })
      setPromoCodes((prev) => prev.map((p) => (p.code === code ? { ...p, is_active: isActive } : p)))
    } catch (e) {
      setPromoCodes((prev) => prev.map((p) => (p.code === code ? { ...p, is_active: isActive } : p)))
    }
  }

  // Promo Delete Handler
  const handleDeletePromo = async (code) => {
    try {
      await fetch('/api/admin/promos/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'DELETE', code }),
      })
      setPromoCodes((prev) => prev.filter((p) => p.code !== code))
      setMessage(`Coupon "${code}" deleted successfully!`)
      setTimeout(() => setMessage(''), 3000)
    } catch (e) {
      setPromoCodes((prev) => prev.filter((p) => p.code !== code))
    }
  }

  // Expenses Handlers
  const handleAddExpense = (exp) => {
    setExpenses((prev) => [exp, ...prev])
    setMessage('Expense recorded successfully!')
    setTimeout(() => setMessage(''), 3000)
  }

  const handleDeleteExpense = (id) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id))
    setMessage('Expense removed')
    setTimeout(() => setMessage(''), 3000)
  }

  // Blacklist Handlers
  const handleAddBlockedPhone = (phoneObj) => {
    setBlockedPhones((prev) => [phoneObj, ...prev])
    setMessage(`Phone ${phoneObj.phone} blacklisted.`)
  }

  const handleRemoveBlockedPhone = (id) => {
    const found = blockedPhones.find((b) => b.id === id)
    if (found) {
      setAuditLogs((prev) => [
        {
          type: 'UNBLOCK',
          action: 'Unblocked Mobile Number',
          target: found.phone,
          reason: 'Manual Admin Removal',
          timestamp: new Date().toISOString(),
        },
        ...prev,
      ])
    }
    setBlockedPhones((prev) => prev.filter((b) => b.id !== id))
    setMessage('Phone unblocked.')
  }

  const handleAddBlockedIp = (ipObj) => {
    setBlockedIps((prev) => [ipObj, ...prev])
    setMessage(`IP ${ipObj.ip} banned.`)
  }

  const handleRemoveBlockedIp = (id) => {
    const found = blockedIps.find((b) => b.id === id)
    if (found) {
      setAuditLogs((prev) => [
        {
          type: 'UNBLOCK',
          action: 'Lifted IP Address Ban',
          target: found.ip,
          reason: 'Manual Admin Removal',
          timestamp: new Date().toISOString(),
        },
        ...prev,
      ])
    }
    setBlockedIps((prev) => prev.filter((b) => b.id !== id))
    setMessage('IP ban lifted.')
  }

  // Clear Sandbox Handler
  const handleClearSandbox = () => {
    if (
      confirm(
        'Clear all browser sandbox cached test data? This will not affect live database records.'
      )
    ) {
      localStorage.removeItem('mazish_orders')
      localStorage.removeItem('mazish_custom_products')
      localStorage.removeItem('mazish_promos')
      localStorage.removeItem('mazish_categories')
      localStorage.removeItem('mazish_expenses')
      localStorage.removeItem('mazish_blocked_phones')
      localStorage.removeItem('mazish_blocked_ips')
      loadData()
      setMessage('Sandbox cached data cleared!')
      setTimeout(() => setMessage(''), 3000)
    }
  }

  // AUTH GUARD LOGIN SCREEN (Matching Website Luxury Light Theme)
  if (!isAuthenticated) {
    return (
      <div className="bg-warm-bg min-h-screen flex items-center justify-center px-4 py-12 transition-colors duration-300">
        <div className="max-w-md w-full bg-white border border-soft-border p-8 sm:p-10 rounded-2xl shadow-xl space-y-6">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-[#FFF9E8] border border-primary-yellow/40 text-charcoal shadow-xs">
              <Lock size={22} className="text-[#9E7308]" />
            </div>
            <div>
              <span className="font-luxury text-3xl font-bold tracking-[0.25em] text-charcoal uppercase block">
                MAZISH
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-primary-yellow block mt-0.5">
                Executive Control Center
              </span>
            </div>
            <p className="text-secondary-text text-xs font-light">
              Enter your administrative credentials to access operations
            </p>
          </div>

          {loginError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl text-center">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-charcoal font-bold uppercase tracking-wider mb-1.5">
                Admin Username
              </label>
              <input
                type="text"
                required
                placeholder="admin"
                value={loginForm.username}
                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                className="w-full bg-soft-bg border border-soft-border rounded-xl px-4 py-2.5 text-charcoal focus:border-charcoal focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-charcoal font-bold uppercase tracking-wider mb-1.5">
                Secret Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                className="w-full bg-soft-bg border border-soft-border rounded-xl px-4 py-2.5 text-charcoal focus:border-charcoal focus:outline-none transition-colors"
              />
            </div>

            <div className="flex items-center justify-between text-secondary-text pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-soft-border text-charcoal accent-charcoal"
                />
                <span>Remember this terminal</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full bg-primary-yellow hover:bg-deep-yellow text-charcoal font-bold uppercase tracking-widest py-3 rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-50 mt-2"
            >
              {loginLoading ? 'Authenticating...' : 'Enter Control Center'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  // MAIN ADMIN CONTROL CENTER
  return (
    <div className="w-full min-h-screen bg-[#F8F7F4] text-charcoal flex transition-colors duration-300">
      
      {/* Sleek Matte Black Left Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        counts={{
          orders: orders.length,
          products: products.length,
        }}
      />

      {/* Main Full-Width Content Area */}
      <main className="flex-1 min-w-0 p-6 sm:p-8 lg:p-10 space-y-6 overflow-x-hidden">
        
        {/* Status Toast Message */}
        {message && (
          <div className="bg-[#FFF9E8] border border-primary-yellow/50 text-[#9E7308] text-xs font-semibold px-4 py-3 rounded-xl shadow-xs">
            {message}
          </div>
        )}

        {/* TAB: DASHBOARD ANALYTICS & KPIS */}
        {activeTab === 'dashboard' && (
          <DashboardAnalytics
            orders={orders}
            products={products}
            expenses={expenses}
            steadfastBalance={steadfastBalance}
            balanceLoading={balanceLoading}
            onRefreshBalance={fetchSteadfastBalance}
            onReload={loadData}
          />
        )}

            {/* TAB: POS COUNTER SALE TERMINAL */}
            {activeTab === 'pos' && (
              <POSTerminal
                products={products}
                onOrderCreated={handlePOSOrderCreated}
              />
            )}

            {/* TAB: ALL STORE ORDERS */}
            {activeTab === 'orders' && (
              <OrdersManager
                orders={orders}
                products={products}
                actionLoading={actionLoading}
                onUpdateStatus={handleUpdateStatus}
                onDispatchSteadfast={handleDispatchSteadfast}
                onDeleteOrder={handleDeleteOrder}
                onSaveManualOrder={handleSaveManualOrder}
                isManualView={false}
              />
            )}

            {/* TAB: MANUAL / WALK-IN ORDERS */}
            {activeTab === 'manual-orders' && (
              <OrdersManager
                orders={orders}
                products={products}
                actionLoading={actionLoading}
                onUpdateStatus={handleUpdateStatus}
                onDispatchSteadfast={handleDispatchSteadfast}
                onDeleteOrder={handleDeleteOrder}
                onSaveManualOrder={handleSaveManualOrder}
                isManualView={true}
              />
            )}

            {/* TAB: PRODUCTS CATALOG */}
            {activeTab === 'products' && (
              <ProductsManager
                products={products}
                categories={categories}
                promoCodes={promoCodes}
                actionLoading={actionLoading}
                activeSubView="catalog"
                onToggleStock={handleToggleStock}
                onSaveProduct={handleSaveProduct}
                onSaveNewProduct={handleSaveNewProduct}
                onDeleteProduct={handleDeleteProduct}
                onAddCategory={handleAddCategory}
                onAddPromo={handleAddPromo}
                onTogglePromo={handleTogglePromo}
                onDeletePromo={handleDeletePromo}
              />
            )}

            {/* TAB: ADD NEW PRODUCT */}
            {activeTab === 'new-product' && (
              <ProductsManager
                products={products}
                categories={categories}
                promoCodes={promoCodes}
                actionLoading={actionLoading}
                activeSubView="new-product"
                onToggleStock={handleToggleStock}
                onSaveProduct={handleSaveProduct}
                onSaveNewProduct={handleSaveNewProduct}
                onDeleteProduct={handleDeleteProduct}
                onAddCategory={handleAddCategory}
                onAddPromo={handleAddPromo}
                onTogglePromo={handleTogglePromo}
                onDeletePromo={handleDeletePromo}
              />
            )}

            {/* TAB: CATEGORIES */}
            {activeTab === 'categories' && (
              <ProductsManager
                products={products}
                categories={categories}
                promoCodes={promoCodes}
                actionLoading={actionLoading}
                activeSubView="categories"
                onToggleStock={handleToggleStock}
                onSaveProduct={handleSaveProduct}
                onSaveNewProduct={handleSaveNewProduct}
                onDeleteProduct={handleDeleteProduct}
                onAddCategory={handleAddCategory}
                onAddPromo={handleAddPromo}
                onTogglePromo={handleTogglePromo}
                onDeletePromo={handleDeletePromo}
              />
            )}

            {/* TAB: PROMO COUPONS */}
            {activeTab === 'promo-codes' && (
              <ProductsManager
                products={products}
                categories={categories}
                promoCodes={promoCodes}
                actionLoading={actionLoading}
                activeSubView="promo-codes"
                onToggleStock={handleToggleStock}
                onSaveProduct={handleSaveProduct}
                onSaveNewProduct={handleSaveNewProduct}
                onDeleteProduct={handleDeleteProduct}
                onAddCategory={handleAddCategory}
                onAddPromo={handleAddPromo}
                onTogglePromo={handleTogglePromo}
                onDeletePromo={handleDeletePromo}
              />
            )}

            {/* TAB: PROFIT & LOSS (P&L) REPORT */}
            {activeTab === 'profit-loss' && (
              <ProfitLossReport
                orders={orders}
                expenses={expenses}
              />
            )}

            {/* TAB: EXPENSES LEDGER */}
            {(activeTab === 'expenses-ledger' || activeTab === 'add-expense') && (
              <ExpensesLedger
                expenses={expenses}
                onAddExpense={handleAddExpense}
                onDeleteExpense={handleDeleteExpense}
              />
            )}

            {/* TAB: FRAUD CONTROL & BLOCKING */}
            {activeTab === 'fraud-blocking' && (
              <FraudSecurityManager
                blockedPhones={blockedPhones}
                blockedIps={blockedIps}
                auditLogs={auditLogs}
                onAddBlockedPhone={handleAddBlockedPhone}
                onRemoveBlockedPhone={handleRemoveBlockedPhone}
                onAddBlockedIp={handleAddBlockedIp}
                onRemoveBlockedIp={handleRemoveBlockedIp}
              />
            )}

            {/* TAB: SETTINGS (PROFILE & COURIER) */}
            {(activeTab === 'settings-profile' || activeTab === 'settings-courier') && (
              <SettingsManager />
            )}

      </main>
    </div>
  )
}
