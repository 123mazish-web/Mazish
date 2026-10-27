'use client'

import React, { useState } from 'react'
import {
  ShieldAlert,
  PhoneCall,
  Globe,
  Trash2,
  Plus,
  AlertTriangle,
  RotateCcw,
  History,
  CheckCircle,
  XCircle
} from 'lucide-react'

export default function FraudSecurityManager({
  blockedPhones = [],
  blockedIps = [],
  auditLogs = [],
  onAddBlockedPhone,
  onRemoveBlockedPhone,
  onAddBlockedIp,
  onRemoveBlockedIp,
}) {
  const [activeSubTab, setActiveSubTab] = useState('risk-check') // 'risk-check' | 'phones' | 'ips' | 'audit'

  // Phone Form
  const [phoneInput, setPhoneInput] = useState('')
  const [phoneReason, setPhoneReason] = useState('Refused COD delivery at doorstep')

  // IP Form
  const [ipInput, setIpInput] = useState('')
  const [ipReason, setIpReason] = useState('Spam checkout bot traffic / automated attacks')

  // Live Steadfast Reputation Inspector State
  const [inspectorPhone, setInspectorPhone] = useState('')
  const [inspectorLoading, setInspectorLoading] = useState(false)
  const [inspectorResult, setInspectorResult] = useState(null)
  const [inspectorError, setInspectorError] = useState('')

  const handleInspectPhone = async (e) => {
    e.preventDefault()
    const clean = inspectorPhone.trim()
    if (!clean) return

    setInspectorLoading(true)
    setInspectorResult(null)
    setInspectorError('')

    try {
      const token =
        localStorage.getItem('mazish_admin_token') ||
        sessionStorage.getItem('mazish_admin_token')
      const res = await fetch(`/api/steadfast/risk-check?phone=${encodeURIComponent(clean)}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) {
        setInspectorResult(data)
      } else {
        setInspectorError(data.error || 'Failed to inspect phone')
      }
    } catch (err) {
      setInspectorError(err.message || 'Connection error')
    } finally {
      setInspectorLoading(false)
    }
  }

  // Handlers
  const handleBlockPhone = (e) => {
    e.preventDefault()
    const cleanPhone = phoneInput.trim()
    if (!cleanPhone) return

    onAddBlockedPhone({
      id: `bp-${Date.now()}`,
      phone: cleanPhone,
      reason: phoneReason,
      date: new Date().toISOString(),
    })

    setPhoneInput('')
  }

  const handleBlockIp = (e) => {
    e.preventDefault()
    const cleanIp = ipInput.trim()
    if (!cleanIp) return

    // Simple IP address regex validator (IPv4)
    const ipv4Regex = /^(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/
    if (!ipv4Regex.test(cleanIp) && !cleanIp.includes(':')) {
      alert('Please enter a valid IPv4 or IPv6 address.')
      return
    }

    onAddBlockedIp({
      id: `bip-${Date.now()}`,
      ip: cleanIp,
      reason: ipReason,
      date: new Date().toISOString(),
    })

    setIpInput('')
  }

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-soft-border/80 shadow-xs">
        <div>
          <h2 className="font-luxury text-2xl font-bold uppercase tracking-wider text-charcoal flex items-center gap-2">
            <ShieldAlert size={22} className="text-red-600" />
            Fraud Prevention & Blacklist Control
          </h2>
          <p className="text-xs text-secondary-text mt-0.5">
            Blacklist repeat COD delivery refusals, fraudulent numbers, and hostile IP bots
          </p>
        </div>

        {/* Sub-tab navigation */}
        <div className="inline-flex p-1 bg-soft-bg border border-soft-border rounded-xl text-xs font-bold flex-wrap gap-1">
          <button
            onClick={() => setActiveSubTab('risk-check')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeSubTab === 'risk-check'
                ? 'bg-[#0F766E] text-white shadow-xs'
                : 'text-secondary-text hover:text-charcoal'
            }`}
          >
            🛡️ Steadfast Risk Check
          </button>
          <button
            onClick={() => setActiveSubTab('phones')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeSubTab === 'phones'
                ? 'bg-charcoal text-white shadow-xs'
                : 'text-secondary-text hover:text-charcoal'
            }`}
          >
            Blocked Numbers ({blockedPhones.length})
          </button>
          <button
            onClick={() => setActiveSubTab('ips')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeSubTab === 'ips'
                ? 'bg-charcoal text-white shadow-xs'
                : 'text-secondary-text hover:text-charcoal'
            }`}
          >
            IP Bans ({blockedIps.length})
          </button>
          <button
            onClick={() => setActiveSubTab('audit')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeSubTab === 'audit'
                ? 'bg-charcoal text-white shadow-xs'
                : 'text-secondary-text hover:text-charcoal'
            }`}
          >
            Audit History ({auditLogs.length})
          </button>
        </div>
      </div>

      {/* 0. Live Steadfast Reputation Inspector View */}
      {activeSubTab === 'risk-check' && (
        <div className="space-y-6">
          <div className="bg-white border border-soft-border p-6 rounded-2xl shadow-xs space-y-5">
            <div>
              <h3 className="font-luxury text-xl font-bold uppercase tracking-wider text-charcoal flex items-center gap-2">
                <ShieldAlert size={20} className="text-[#0F766E]" />
                Steadfast Customer Delivery Risk Inspector
              </h3>
              <p className="text-xs text-secondary-text mt-1">
                Query customer delivery success vs return history across Bangladesh before dispatching high-value orders
              </p>
            </div>

            <form onSubmit={handleInspectPhone} className="flex flex-col sm:flex-row gap-3 max-w-xl">
              <input
                type="text"
                required
                placeholder="Enter customer mobile number (e.g. 017XXXXXXXX)"
                value={inspectorPhone}
                onChange={(e) => setInspectorPhone(e.target.value)}
                className="flex-1 bg-soft-bg border border-soft-border rounded-xl px-4 py-3 text-sm font-bold text-charcoal focus:outline-none"
              />
              <button
                type="submit"
                disabled={inspectorLoading}
                className="bg-[#0F766E] hover:bg-[#0D625C] text-white text-xs sm:text-sm font-bold px-6 py-3 rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-50 uppercase tracking-wider shrink-0"
              >
                {inspectorLoading ? 'Checking...' : 'Inspect Reputation'}
              </button>
            </form>

            {inspectorError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-bold p-4 rounded-xl">
                {inspectorError}
              </div>
            )}

            {/* Inspector Result Card */}
            {inspectorResult && (
              <div className="bg-zinc-50 border border-zinc-200/90 rounded-2xl p-6 space-y-5 animate-in fade-in">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-zinc-200 pb-4">
                  <div>
                    <span className="font-mono text-base font-extrabold text-charcoal block">
                      Phone: {inspectorResult.phone}
                    </span>
                    <span className="text-xs text-secondary-text">
                      Order Volume: <strong>{inspectorResult.volumeRange}</strong>
                    </span>
                  </div>
                  <span className={`text-xs font-extrabold px-3 py-1.5 rounded-full border ${
                    inspectorResult.riskLevel === 'HIGH'
                      ? 'bg-red-100 text-red-800 border-red-300'
                      : inspectorResult.riskLevel === 'MEDIUM'
                      ? 'bg-amber-100 text-amber-800 border-amber-300'
                      : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  }`}>
                    {inspectorResult.riskLabel}
                  </span>
                </div>

                {/* KPI Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                  <div className="bg-white border border-soft-border rounded-xl p-4 shadow-2xs">
                    <span className="text-xs font-bold text-secondary-text uppercase block">Delivered Rate</span>
                    <span className="font-sans font-extrabold text-2xl text-emerald-700 block mt-1">
                      {inspectorResult.deliveryRatio}%
                    </span>
                  </div>
                  <div className="bg-white border border-soft-border rounded-xl p-4 shadow-2xs">
                    <span className="text-xs font-bold text-secondary-text uppercase block">Return / Cancel Rate</span>
                    <span className="font-sans font-extrabold text-2xl text-red-600 block mt-1">
                      {inspectorResult.cancellationRatio}%
                    </span>
                  </div>
                  <div className="bg-white border border-soft-border rounded-xl p-4 shadow-2xs">
                    <span className="text-xs font-bold text-secondary-text uppercase block">Fraud Reports</span>
                    <span className="font-sans font-extrabold text-2xl text-charcoal block mt-1">
                      {inspectorResult.totalReports}
                    </span>
                  </div>
                </div>

                {/* Fraud categories */}
                {inspectorResult.fraudCategories && Object.keys(inspectorResult.fraudCategories).length > 0 && (
                  <div className="bg-white border border-soft-border rounded-xl p-4 shadow-2xs space-y-2">
                    <span className="text-xs font-bold text-charcoal uppercase tracking-wider block">
                      Specific Merchant Reports:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                      {Object.entries(inspectorResult.fraudCategories).map(([cat, count]) => (
                        <div key={cat} className="bg-red-50 border border-red-200/70 rounded-lg px-3 py-1.5 flex justify-between">
                          <span className="capitalize text-red-900 font-medium">{cat.replace(/_/g, ' ')}</span>
                          <span className="font-mono font-bold text-red-700">×{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action guidance */}
                <div className="bg-[#FFF9E8] border border-[#F4C542]/60 rounded-xl p-4 text-xs space-y-1">
                  <span className="font-bold text-[#9E7308] block">Recommendation:</span>
                  <p className="text-[#9E7308]/90">
                    {inspectorResult.riskLevel === 'HIGH'
                      ? 'High risk buyer with frequent return history. Recommend requiring delivery fee in advance via bKash.'
                      : inspectorResult.riskLevel === 'MEDIUM'
                      ? 'Moderate risk. Confirm customer availability via phone before booking.'
                      : 'Low risk. Clean delivery track record. Safe to dispatch via COD.'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 1. Phone Blacklist View */}
      {activeSubTab === 'phones' && (
        <div className="space-y-6">
          {/* Add Phone Form */}
          <div className="bg-white border border-soft-border p-5 rounded-2xl shadow-xs space-y-4">
            <h3 className="font-luxury text-lg font-bold uppercase tracking-wider text-charcoal flex items-center gap-2">
              <PhoneCall size={18} className="text-red-500" />
              Blacklist Chronic Refusal Mobile Number
            </h3>
            
            <form onSubmit={handleBlockPhone} className="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs">
              <div className="md:col-span-4">
                <label className="font-bold text-charcoal uppercase block mb-1">
                  Mobile Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 01711000000"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  className="w-full bg-soft-bg border border-soft-border rounded-xl px-3 py-2 text-charcoal font-bold focus:outline-none"
                />
              </div>

              <div className="md:col-span-5">
                <label className="font-bold text-charcoal uppercase block mb-1">
                  Reason for Blacklist *
                </label>
                <select
                  value={phoneReason}
                  onChange={(e) => setPhoneReason(e.target.value)}
                  className="w-full bg-soft-bg border border-soft-border rounded-xl px-3 py-2 text-charcoal focus:outline-none"
                >
                  <option value="Refused COD delivery at doorstep">Refused COD delivery at doorstep</option>
                  <option value="Phone switched off / Unreachable during Steadfast delivery">Phone switched off during courier delivery</option>
                  <option value="Repeated prank / fake address order">Repeated prank / fake address order</option>
                  <option value="Hostile / abusive customer behavior">Hostile / abusive customer behavior</option>
                </select>
              </div>

              <div className="md:col-span-3 flex items-end">
                <button
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-xl uppercase tracking-wider transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <ShieldAlert size={14} />
                  <span>Block Number</span>
                </button>
              </div>
            </form>
          </div>

          {/* Blocked Phone List Table */}
          <div className="bg-white border border-soft-border rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-soft-bg border-b border-soft-border text-secondary-text uppercase font-bold tracking-wider text-[11px]">
                    <th className="py-3 px-4">Blacklisted Phone</th>
                    <th className="py-3 px-4">Blacklist Reason</th>
                    <th className="py-3 px-4">Date Banned</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-soft-border/60">
                  {blockedPhones.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-10 text-center text-secondary-text">
                        No phone numbers currently blacklisted. Your store is clean!
                      </td>
                    </tr>
                  ) : (
                    blockedPhones.map((b) => (
                      <tr key={b.id} className="hover:bg-red-50/20 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-red-600">
                          {b.phone}
                        </td>
                        <td className="py-3 px-4 text-charcoal font-medium">
                          {b.reason}
                        </td>
                        <td className="py-3 px-4 text-secondary-text font-mono">
                          {new Date(b.date).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => {
                              if (confirm(`Unblock phone number ${b.phone}?`)) {
                                onRemoveBlockedPhone(b.id)
                              }
                            }}
                            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                          >
                            Unblock
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. IP Ban Rules View */}
      {activeSubTab === 'ips' && (
        <div className="space-y-6">
          <div className="bg-white border border-soft-border p-5 rounded-2xl shadow-xs space-y-4">
            <h3 className="font-luxury text-lg font-bold uppercase tracking-wider text-charcoal flex items-center gap-2">
              <Globe size={18} className="text-red-500" />
              IP Address Firewall Rule
            </h3>

            {/* Red-accent Reason Warning Box */}
            <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-r-xl text-xs text-red-800 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <AlertTriangle size={14} />
                Strict IP Ban Enforcement
              </p>
              <p className="text-[11px] text-red-700 leading-relaxed font-light">
                Blocking an IP address prevents that network origin from completing the checkout process or triggering automated webhook calls. Ensure the IP is not a shared public telecom gateway.
              </p>
            </div>

            <form onSubmit={handleBlockIp} className="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs">
              <div className="md:col-span-4">
                <label className="font-bold text-charcoal uppercase block mb-1">
                  IP Address (IPv4 / IPv6) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 103.145.2.14"
                  value={ipInput}
                  onChange={(e) => setIpInput(e.target.value)}
                  className="w-full bg-soft-bg border border-soft-border rounded-xl px-3 py-2 text-charcoal font-mono font-bold focus:outline-none"
                />
              </div>

              <div className="md:col-span-5">
                <label className="font-bold text-charcoal uppercase block mb-1">
                  Ban Reason *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Automated checkout attack bot"
                  value={ipReason}
                  onChange={(e) => setIpReason(e.target.value)}
                  className="w-full bg-soft-bg border border-soft-border rounded-xl px-3 py-2 text-charcoal focus:outline-none"
                />
              </div>

              <div className="md:col-span-3 flex items-end">
                <button
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-xl uppercase tracking-wider transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Globe size={14} />
                  <span>Ban IP</span>
                </button>
              </div>
            </form>
          </div>

          {/* Blocked IP Table */}
          <div className="bg-white border border-soft-border rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-soft-bg border-b border-soft-border text-secondary-text uppercase font-bold tracking-wider text-[11px]">
                    <th className="py-3 px-4">Banned IP Address</th>
                    <th className="py-3 px-4">Reason</th>
                    <th className="py-3 px-4">Date Banned</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-soft-border/60">
                  {blockedIps.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-10 text-center text-secondary-text">
                        No IP addresses currently banned.
                      </td>
                    </tr>
                  ) : (
                    blockedIps.map((b) => (
                      <tr key={b.id} className="hover:bg-red-50/20 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-red-600">
                          {b.ip}
                        </td>
                        <td className="py-3 px-4 text-charcoal font-medium">
                          {b.reason}
                        </td>
                        <td className="py-3 px-4 text-secondary-text font-mono">
                          {new Date(b.date).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => {
                              if (confirm(`Remove ban for IP ${b.ip}?`)) {
                                onRemoveBlockedIp(b.id)
                              }
                            }}
                            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                          >
                            Lift Ban
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. Audit History Archive */}
      {activeSubTab === 'audit' && (
        <div className="bg-white border border-soft-border rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-soft-border">
            <h3 className="font-luxury text-lg font-bold uppercase tracking-wider text-charcoal flex items-center gap-2">
              <History size={18} className="text-primary-yellow" />
              Security & Unblock Audit History
            </h3>
            <span className="text-xs text-secondary-text font-medium">
              Historical record of all blocked/unblocked actions
            </span>
          </div>

          <div className="divide-y divide-soft-border/60 text-xs">
            {auditLogs.length === 0 ? (
              <p className="py-8 text-center text-secondary-text">
                No audit entries recorded yet.
              </p>
            ) : (
              auditLogs.map((log, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    {log.type === 'UNBLOCK' ? (
                      <CheckCircle size={16} className="text-emerald-600" />
                    ) : (
                      <XCircle size={16} className="text-red-500" />
                    )}
                    <div>
                      <span className="font-bold text-charcoal block">
                        {log.action}
                      </span>
                      <span className="text-[11px] text-secondary-text">
                        Target: {log.target} ({log.reason || 'Manual Admin Action'})
                      </span>
                    </div>
                  </div>
                  <span className="font-mono text-secondary-text text-[11px]">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

    </div>
  )
}
