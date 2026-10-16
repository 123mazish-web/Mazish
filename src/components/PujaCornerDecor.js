'use client'

import React from 'react'

/**
 * Puja Festival Corner Decorations
 * ----------------------------------------------------
 * High-end, minimal festive hanging lanterns & marigold accents.
 * 
 * TO REMOVE AFTER PUJA:
 * Simply set SHOW_PUJA_FESTIVAL to false, or delete this file.
 */
export const SHOW_PUJA_FESTIVAL = true

export default function PujaCornerDecor() {
  if (!SHOW_PUJA_FESTIVAL) return null

  return (
    <div className="pointer-events-none fixed inset-x-0 top-[100px] sm:top-[116px] z-30 select-none" aria-hidden="true">
      {/* Left Corner Hanging Lantern & Marigold garland */}
      <div className="absolute top-0 left-1 sm:left-3 md:left-5 w-20 sm:w-28 md:w-32 drop-shadow-[0_8px_16px_rgba(217,169,31,0.3)]">
        <svg viewBox="0 0 130 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
          {/* Subtle hanging garland thread */}
          <path d="M 0,0 Q 40,25 90,8" stroke="#D9A91F" strokeWidth="1.5" strokeDasharray="3 2" opacity="0.8" />
          
          {/* Small Marigold beads along the string */}
          <circle cx="18" cy="8" r="4" fill="#E88B13" />
          <circle cx="18" cy="8" r="2.5" fill="#F4C542" />
          <circle cx="45" cy="15" r="4.5" fill="#D9480F" />
          <circle cx="45" cy="15" r="2.5" fill="#F59F00" />
          <circle cx="72" cy="13" r="4" fill="#E88B13" />
          <circle cx="72" cy="13" r="2.5" fill="#F4C542" />

          {/* Hanging string for primary lantern */}
          <line x1="45" y1="18" x2="45" y2="60" stroke="#D9A91F" strokeWidth="1.2" opacity="0.9" />

          {/* Main Lantern Canopy */}
          <path d="M 33 60 L 57 60 L 52 54 L 38 54 Z" fill="#D9A91F" />
          <polygon points="45,48 48,54 42,54" fill="#F4C542" />

          {/* Lantern Body - Luxury Octagonal Brass/Glass style */}
          <polygon points="32,60 58,60 54,95 36,95" fill="#1A1A1A" stroke="#D9A91F" strokeWidth="1.4" />
          
          {/* Inner Golden Candle / Flame Glow */}
          <circle cx="45" cy="78" r="9" fill="#F4C542" opacity="0.3" />
          <ellipse cx="45" cy="78" rx="4.5" ry="7" fill="#F4C542" />
          <ellipse cx="45" cy="79" rx="2" ry="4" fill="#FFFBEB" />

          {/* Decorative lattice on lantern */}
          <line x1="45" y1="60" x2="45" y2="95" stroke="#D9A91F" strokeWidth="1" opacity="0.8" />
          <line x1="34" y1="77" x2="56" y2="77" stroke="#D9A91F" strokeWidth="1" opacity="0.8" />

          {/* Lantern Bottom Base & Tassel */}
          <polygon points="36,95 54,95 49,101 41,101" fill="#D9A91F" />
          <line x1="45" y1="101" x2="45" y2="125" stroke="#E88B13" strokeWidth="1.8" />
          <circle cx="45" cy="127" r="2.5" fill="#D9A91F" />

          {/* Secondary smaller hanging lantern */}
          <line x1="85" y1="8" x2="85" y2="38" stroke="#D9A91F" strokeWidth="1" opacity="0.8" />
          <polygon points="76,38 94,38 91,62 79,62" fill="#1A1A1A" stroke="#D9A91F" strokeWidth="1" />
          <circle cx="85" cy="50" r="6" fill="#F59F00" opacity="0.3" />
          <ellipse cx="85" cy="50" rx="3" ry="5" fill="#F59F00" />
          <ellipse cx="85" cy="50" rx="1.5" ry="2.5" fill="#FFFBEB" />
          <line x1="85" y1="62" x2="85" y2="78" stroke="#D9A91F" strokeWidth="1" opacity="0.9" />
          <circle cx="85" cy="80" r="2" fill="#D9A91F" />
        </svg>
      </div>

      {/* Right Corner Hanging Lantern & Marigold garland */}
      <div className="absolute top-0 right-1 sm:right-3 md:right-5 w-20 sm:w-28 md:w-32 drop-shadow-[0_8px_16px_rgba(217,169,31,0.3)]">
        <svg viewBox="0 0 130 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
          {/* Subtle hanging garland thread */}
          <path d="M 130,0 Q 90,25 40,8" stroke="#D9A91F" strokeWidth="1.5" strokeDasharray="3 2" opacity="0.8" />

          {/* Small Marigold beads along the string */}
          <circle cx="112" cy="8" r="4" fill="#E88B13" />
          <circle cx="112" cy="8" r="2.5" fill="#F4C542" />
          <circle cx="85" cy="15" r="4.5" fill="#D9480F" />
          <circle cx="85" cy="15" r="2.5" fill="#F59F00" />
          <circle cx="58" cy="13" r="4" fill="#E88B13" />
          <circle cx="58" cy="13" r="2.5" fill="#F4C542" />

          {/* Hanging string for primary lantern */}
          <line x1="85" y1="18" x2="85" y2="60" stroke="#D9A91F" strokeWidth="1.2" opacity="0.9" />

          {/* Main Lantern Canopy */}
          <path d="M 73 60 L 97 60 L 92 54 L 78 54 Z" fill="#D9A91F" />
          <polygon points="85,48 88,54 82,54" fill="#F4C542" />

          {/* Lantern Body */}
          <polygon points="72,60 98,60 94,95 76,95" fill="#1A1A1A" stroke="#D9A91F" strokeWidth="1.4" />

          {/* Inner Golden Flame Glow */}
          <circle cx="85" cy="78" r="9" fill="#F4C542" opacity="0.3" />
          <ellipse cx="85" cy="78" rx="4.5" ry="7" fill="#F4C542" />
          <ellipse cx="85" cy="79" rx="2" ry="4" fill="#FFFBEB" />

          {/* Decorative lattice on lantern */}
          <line x1="85" y1="60" x2="85" y2="95" stroke="#D9A91F" strokeWidth="1" opacity="0.8" />
          <line x1="74" y1="77" x2="96" y2="77" stroke="#D9A91F" strokeWidth="1" opacity="0.8" />

          {/* Lantern Bottom Base & Tassel */}
          <polygon points="76,95 94,95 89,101 81,101" fill="#D9A91F" />
          <line x1="85" y1="101" x2="85" y2="125" stroke="#E88B13" strokeWidth="1.8" />
          <circle cx="85" cy="127" r="2.5" fill="#D9A91F" />

          {/* Secondary smaller hanging lantern */}
          <line x1="45" y1="8" x2="45" y2="38" stroke="#D9A91F" strokeWidth="1" opacity="0.8" />
          <polygon points="36,38 54,38 51,62 39,62" fill="#1A1A1A" stroke="#D9A91F" strokeWidth="1" />
          <circle cx="45" cy="50" r="6" fill="#F59F00" opacity="0.3" />
          <ellipse cx="45" cy="50" rx="3" ry="5" fill="#F59F00" />
          <ellipse cx="45" cy="50" rx="1.5" ry="2.5" fill="#FFFBEB" />
          <line x1="45" y1="62" x2="45" y2="78" stroke="#D9A91F" strokeWidth="1" opacity="0.9" />
          <circle cx="45" cy="80" r="2" fill="#D9A91F" />
        </svg>
      </div>
    </div>
  )
}
