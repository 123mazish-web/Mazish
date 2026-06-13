'use client'

import React from 'react'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-zinc-950 border-t border-zinc-900 py-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-2">
            <span className="font-luxury text-3xl tracking-[0.25em] text-white">
              MAZISH
            </span>
            <p className="text-zinc-500 text-sm max-w-sm font-light leading-relaxed">
              The Hub of Fashion & Luxury in Bangladesh. Elevating your lifestyle with statement sunglasses and curated luxury essentials.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-zinc-300 text-xs font-semibold uppercase tracking-widest">Navigation</h4>
            <ul className="space-y-2.5 text-sm font-light text-zinc-500">
              <li>
                <Link href="/" className="hover:text-amber-500 transition-colors">Home</Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-amber-500 transition-colors">Shop Sunglasses</Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-amber-500 transition-colors">Our Story</Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-amber-500 text-xs opacity-50 transition-colors">Admin Dashboard</Link>
              </li>
            </ul>
          </div>

          {/* Socials & Info */}
          <div className="space-y-4">
            <h4 className="text-zinc-300 text-xs font-semibold uppercase tracking-widest">Connect</h4>
            <ul className="space-y-2.5 text-sm font-light text-zinc-500">
              <li>
                <a href="https://www.facebook.com/profile.php?id=61590005602732" target="_blank" rel="noopener noreferrer" className="hover:text-amber-500 transition-colors">
                  Facebook Page
                </a>
              </li>
              <li>
                <a href="https://www.instagram.com/123mazish/" target="_blank" rel="noopener noreferrer" className="hover:text-amber-500 transition-colors">
                  Instagram
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-zinc-900 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-light text-zinc-600">
          <p>© {new Date().getFullYear()} Mazish. All rights reserved.</p>
          <p className="tracking-widest uppercase">Premium Wear • sunglasses • Luxury Hub</p>
        </div>
      </div>
    </footer>
  )
}
