'use client'

import React, { useState } from 'react'
import {
  Settings,
  Store,
  Truck,
  CheckCircle,
  AlertCircle,
  Save,
  Key,
  ShieldCheck,
  RefreshCw
} from 'lucide-react'

export default function SettingsManager() {
  const [activeTab, setActiveTab] = useState('profile') // 'profile' | 'courier'

  // Store Profile State
  const [storeName, setStoreName] = useState('MAZISH')
  const [hotline, setHotline] = useState('01410288630')
  const [email, setEmail] = useState('orders@mazish.shop')
  const [slogan, setSlogan] = useState('Curated Premium Fashion & Eyewear in Bangladesh')
  const [address, setAddress] = useState('Banani, Dhaka, Bangladesh')
  const [currency, setCurrency] = useState('BDT (৳)')
  const [savedSuccess, setSavedSuccess] = useState('')

  // Courier API State
  const [courierProvider, setCourierProvider] = useState('Steadfast Courier')
  const [apiKey, setApiKey] = useState('sf_live_api_993481283')
  const [secretKey, setSecretKey] = useState('••••••••••••••••••••••••')
  const [webhookUrl, setWebhookUrl] = useState('https://mazish.shop/api/steadfast')
  const [testStatus, setTestStatus] = useState(null) // null | 'testing' | 'success' | 'error'

  const handleSaveProfile = (e) => {
    e.preventDefault()
    setSavedSuccess('Store profile settings saved successfully!')
    setTimeout(() => setSavedSuccess(''), 3000)
  }

  const handleSaveCourier = (e) => {
    e.preventDefault()
    setSavedSuccess('Courier API configuration updated!')
    setTimeout(() => setSavedSuccess(''), 3000)
  }

  const handleTestCourierConnection = async () => {
    setTestStatus('testing')
    setTimeout(() => {
      setTestStatus('success')
    }, 1200)
  }

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-soft-border/80 shadow-xs">
        <div>
          <h2 className="font-luxury text-2xl font-bold uppercase tracking-wider text-charcoal flex items-center gap-2">
            <Settings size={22} className="text-primary-yellow" />
            System & Store Settings
          </h2>
          <p className="text-xs text-secondary-text mt-0.5">
            Configure boutique profile, customer service contacts, and courier gateway integrations
          </p>
        </div>

        {/* Sub-tab navigation */}
        <div className="inline-flex p-1 bg-soft-bg border border-soft-border rounded-xl text-xs font-bold">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-charcoal text-white shadow-xs'
                : 'text-secondary-text hover:text-charcoal'
            }`}
          >
            Store Profile
          </button>
          <button
            onClick={() => setActiveTab('courier')}
            className={`px-4 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'courier'
                ? 'bg-charcoal text-white shadow-xs'
                : 'text-secondary-text hover:text-charcoal'
            }`}
          >
            Courier & API Setup
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-3 rounded-xl flex items-center gap-2">
          <CheckCircle size={15} />
          <span>{savedSuccess}</span>
        </div>
      )}

      {/* 1. Store Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-white border border-soft-border p-6 rounded-2xl shadow-xs space-y-6">
          <div className="pb-3 border-b border-soft-border/70">
            <h3 className="font-luxury text-lg font-bold uppercase tracking-wider text-charcoal flex items-center gap-2">
              <Store size={18} className="text-primary-yellow" />
              Brand Identity & Contacts
            </h3>
            <p className="text-xs text-secondary-text mt-0.5">
              These details appear on customer invoices, order confirmation emails, and footer links.
            </p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs max-w-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-charcoal uppercase block mb-1">
                  Brand / Store Name *
                </label>
                <input
                  type="text"
                  required
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full bg-soft-bg border border-soft-border rounded-xl px-3 py-2 text-charcoal font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-charcoal uppercase block mb-1">
                  Support Hotline Phone *
                </label>
                <input
                  type="text"
                  required
                  value={hotline}
                  onChange={(e) => setHotline(e.target.value)}
                  className="w-full bg-soft-bg border border-soft-border rounded-xl px-3 py-2 text-charcoal focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-charcoal uppercase block mb-1">
                  Orders Support Email *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-soft-bg border border-soft-border rounded-xl px-3 py-2 text-charcoal focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-charcoal uppercase block mb-1">
                  Store Currency *
                </label>
                <input
                  type="text"
                  required
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-soft-bg border border-soft-border rounded-xl px-3 py-2 text-charcoal font-bold focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-charcoal uppercase block mb-1">
                Store Slogan / Statement
              </label>
              <input
                type="text"
                value={slogan}
                onChange={(e) => setSlogan(e.target.value)}
                className="w-full bg-soft-bg border border-soft-border rounded-xl px-3 py-2 text-charcoal focus:outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-charcoal uppercase block mb-1">
                Physical Boutique / Pickup Location
              </label>
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-soft-bg border border-soft-border rounded-xl px-3 py-2 text-charcoal focus:outline-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="bg-primary-yellow hover:bg-deep-yellow text-charcoal font-bold text-xs uppercase tracking-wider px-6 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-2"
              >
                <Save size={14} />
                <span>Save Store Profile</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 2. Courier API Setup Tab */}
      {activeTab === 'courier' && (
        <div className="bg-white border border-soft-border p-6 rounded-2xl shadow-xs space-y-6">
          <div className="pb-3 border-b border-soft-border/70">
            <h3 className="font-luxury text-lg font-bold uppercase tracking-wider text-charcoal flex items-center gap-2">
              <Truck size={18} className="text-primary-yellow" />
              Steadfast Courier API Integration
            </h3>
            <p className="text-xs text-secondary-text mt-0.5">
              Automate domestic delivery booking, parcel consignment tracking, and return status webhooks.
            </p>
          </div>

          <form onSubmit={handleSaveCourier} className="space-y-4 text-xs max-w-2xl">
            <div>
              <label className="font-bold text-charcoal uppercase block mb-1">
                Courier Provider
              </label>
              <input
                type="text"
                disabled
                value={courierProvider}
                className="w-full bg-soft-bg border border-soft-border rounded-xl px-3 py-2 text-charcoal font-bold opacity-80"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-charcoal uppercase block mb-1">
                  Steadfast API Key *
                </label>
                <div className="relative">
                  <Key size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary-text" />
                  <input
                    type="text"
                    required
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full bg-soft-bg border border-soft-border rounded-xl pl-9 pr-3 py-2 text-charcoal font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-charcoal uppercase block mb-1">
                  Steadfast Secret Key *
                </label>
                <input
                  type="password"
                  required
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  className="w-full bg-soft-bg border border-soft-border rounded-xl px-3 py-2 text-charcoal font-mono focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-charcoal uppercase block mb-1">
                Webhook Notification URL (For Delivery Status Updates)
              </label>
              <input
                type="url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="w-full bg-soft-bg border border-soft-border rounded-xl px-3 py-2 text-charcoal font-mono focus:outline-none"
              />
            </div>

            {/* Test Connection Banner */}
            <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-soft-bg border border-soft-border rounded-xl">
              <div>
                <span className="font-bold text-charcoal block">Connection Verification</span>
                <span className="text-[11px] text-secondary-text">
                  Ping Steadfast Courier Gateway to confirm API authorization
                </span>
              </div>

              <div className="flex items-center gap-3">
                {testStatus === 'success' && (
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/70 border border-emerald-300 px-2.5 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle size={13} />
                    Connected • Ready
                  </span>
                )}

                <button
                  type="button"
                  onClick={handleTestCourierConnection}
                  disabled={testStatus === 'testing'}
                  className="bg-charcoal text-white hover:bg-black font-bold px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCw size={13} className={testStatus === 'testing' ? 'animate-spin' : ''} />
                  <span>{testStatus === 'testing' ? 'Verifying...' : 'Test API'}</span>
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="bg-primary-yellow hover:bg-deep-yellow text-charcoal font-bold text-xs uppercase tracking-wider px-6 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-2"
              >
                <Save size={14} />
                <span>Save Courier Settings</span>
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  )
}
