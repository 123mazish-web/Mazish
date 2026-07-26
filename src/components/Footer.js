'use client'

import React from 'react'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-secondary-bg border-t border-soft-border transition-colors duration-300 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-2">
            <Link href="/" className="inline-flex items-center gap-5">
              <img
                src="/images/main_logo.png"
                alt="MAZISH"
                className="h-10 w-auto object-contain mix-blend-multiply"
              />
              <span className="font-luxury text-2xl tracking-[0.35em] text-charcoal uppercase">
                MAZISH
              </span>
            </Link>
            <p className="text-secondary-text text-sm max-w-sm font-light leading-relaxed">
              The Hub of Fashion & Luxury in Bangladesh. Elevating identity with premium handcrafted sunglasses and curated fashion essentials for men and women.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-charcoal text-[12px] font-bold uppercase tracking-widest">Shop & Discover</h4>
            <ul className="space-y-2.5 text-sm font-medium text-secondary-text">
              <li>
                <Link href="/" className="hover:text-primary-yellow transition-colors">Home</Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-primary-yellow transition-colors">Shop Sunglasses</Link>
              </li>
              <li>
                <Link href="/track" className="hover:text-primary-yellow transition-colors">Track Order</Link>
              </li>
            </ul>
          </div>

          {/* Connect & Legal */}
          <div className="space-y-4">
            <h4 className="text-charcoal text-[12px] font-bold uppercase tracking-widest">Connect</h4>
            <ul className="space-y-2.5 text-sm font-medium text-secondary-text">
              <li>
                <a href="https://www.facebook.com/profile.php?id=61590005602732" target="_blank" rel="noopener noreferrer" className="hover:text-primary-yellow transition-colors">
                  Facebook Page
                </a>
              </li>
              <li>
                <a href="https://www.instagram.com/123mazish/" target="_blank" rel="noopener noreferrer" className="hover:text-primary-yellow transition-colors">
                  Instagram
                </a>
              </li>
              <li className="pt-2 border-t border-soft-border/50">
                <span className="text-[11px] uppercase font-semibold text-secondary-text tracking-wide block mb-1">Customer Service</span>
                <a href="tel:01410288630" className="hover:text-primary-yellow font-bold text-charcoal">01410288630</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-soft-border/80 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-light text-secondary-text">
          <p>© {new Date().getFullYear()} Mazish. All rights reserved.</p>
          <div className="flex gap-4 flex-wrap justify-center font-medium">
            <Link href="/shop" className="hover:underline">Privacy Policy</Link>
            <Link href="/shop" className="hover:underline">Terms of Service</Link>
            <Link href="/shop" className="hover:underline">Returns & Exchange</Link>
          </div>
          <p className="tracking-widest uppercase font-semibold text-[10px] text-charcoal">Premium Wear • Sunglasses • Luxury Hub</p>
        </div>
      </div>
    </footer>
  )
}
