import React from 'react'
import Link from 'next/link'

const FacebookIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
)

const InstagramIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
)

export default function Footer() {
  return (
    <footer className="bg-secondary-bg border-t border-soft-border transition-colors duration-300 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-2">
            <Link href="/" className="inline-flex items-center gap-5">
              <img
                src="https://res.cloudinary.com/kp0jicx3/image/upload/v1785265523/main_logo_ffrk6k.png"
                alt="MAZISH"
                className="h-10 w-auto object-contain mix-blend-multiply"
              />
              <span className="font-luxury text-2xl tracking-[0.35em] text-charcoal uppercase">
                MAZISH
              </span>
            </Link>
            <p className="text-sm text-secondary-text max-w-sm leading-relaxed">
              Premium fashion and curated statements for individuals who define luxury on their own terms.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-charcoal text-[12px] font-bold uppercase tracking-widest">Explore</h4>
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
                <a href="https://www.facebook.com/profile.php?id=61590005602732" target="_blank" rel="noopener noreferrer" className="hover:text-primary-yellow transition-colors inline-flex items-center gap-2">
                  <FacebookIcon className="stroke-[1.7]" />
                  <span>Facebook Page</span>
                </a>
              </li>
              <li>
                <a href="https://www.instagram.com/123mazish/" target="_blank" rel="noopener noreferrer" className="hover:text-primary-yellow transition-colors inline-flex items-center gap-2">
                  <InstagramIcon className="stroke-[1.7]" />
                  <span>Instagram</span>
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
