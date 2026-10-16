'use client'

import React from 'react'

/**
 * Puja Festival Corner Decorations
 * ----------------------------------------------------
 * Hanging Marigold (Genda Phool) Garlands & Traditional Golden Lanterns.
 * 
 * TO REMOVE AFTER PUJA:
 * Simply set SHOW_PUJA_FESTIVAL to false, or delete this file.
 */
export const SHOW_PUJA_FESTIVAL = true

export default function PujaCornerDecor() {
  if (!SHOW_PUJA_FESTIVAL) return null

  return (
    <div className="pointer-events-none absolute top-full inset-x-0 z-50 overflow-visible select-none" aria-hidden="true">
      {/* LEFT CORNER - Hanging Marigold Garland & Golden Brass Lantern */}
      <div className="absolute top-0 left-1 sm:left-3 md:left-6 w-20 sm:w-28 md:w-36 drop-shadow-[0_8px_20px_rgba(217,169,31,0.35)]">
        <svg viewBox="0 0 140 210" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
          {/* Hanging Garland String */}
          <path d="M 0,0 Q 45,22 100,5" stroke="#D9A91F" strokeWidth="1.6" strokeDasharray="3 2" opacity="0.85" />
          
          {/* Mango Leaves (Traditional Toran) */}
          <path d="M 12,4 Q 18,16 14,24 Q 8,18 12,4 Z" fill="#2B8A3E" />
          <path d="M 40,11 Q 48,24 43,32 Q 36,25 40,11 Z" fill="#2B8A3E" />
          <path d="M 75,9 Q 82,21 78,28 Q 71,22 75,9 Z" fill="#2B8A3E" />

          {/* Marigold Blooms on top garland */}
          {/* Flower 1 */}
          <circle cx="16" cy="7" r="6.5" fill="#E8590C" />
          <circle cx="16" cy="7" r="5" fill="#F76707" />
          <circle cx="16" cy="7" r="3.2" fill="#FAB005" />
          <circle cx="16" cy="7" r="1.5" fill="#FFE066" />

          {/* Flower 2 */}
          <circle cx="45" cy="14" r="7.5" fill="#D9480F" />
          <circle cx="45" cy="14" r="5.8" fill="#F76707" />
          <circle cx="45" cy="14" r="3.8" fill="#FAB005" />
          <circle cx="45" cy="14" r="1.8" fill="#FFF3BF" />

          {/* Flower 3 */}
          <circle cx="78" cy="11" r="6.5" fill="#E8590C" />
          <circle cx="78" cy="11" r="5" fill="#F76707" />
          <circle cx="78" cy="11" r="3.2" fill="#FAB005" />

          {/* Vertical hanging Marigold strand for main lantern */}
          <line x1="45" y1="20" x2="45" y2="72" stroke="#D9A91F" strokeWidth="1.2" />
          
          {/* Strung Marigold Flowers down the chain */}
          <circle cx="45" cy="30" r="5.5" fill="#F76707" />
          <circle cx="45" cy="30" r="3.5" fill="#FAB005" />
          <circle cx="45" cy="30" r="1.5" fill="#FFE066" />

          <circle cx="45" cy="45" r="5.5" fill="#E8590C" />
          <circle cx="45" cy="45" r="3.5" fill="#F59F00" />
          <circle cx="45" cy="45" r="1.5" fill="#FFF3BF" />

          <circle cx="45" cy="60" r="6" fill="#D9480F" />
          <circle cx="45" cy="60" r="4" fill="#FAB005" />

          {/* Brass Ring connector */}
          <circle cx="45" cy="70" r="2.5" stroke="#D9A91F" strokeWidth="1.2" fill="#FFE066" />

          {/* Main Lantern Canopy */}
          <path d="M 31 76 L 59 76 L 53 69 L 37 69 Z" fill="#D9A91F" stroke="#B18512" strokeWidth="0.8" />
          <polygon points="45,63 49,69 41,69" fill="#FAB005" />

          {/* Lantern Body - Luxury Octagonal Lattice */}
          <polygon points="30,76 60,76 55,116 35,116" fill="#1A1A1A" stroke="#D9A91F" strokeWidth="1.5" />
          
          {/* Warm Candlelight Glow */}
          <circle cx="45" cy="96" r="12" fill="#F59F00" opacity="0.35" />
          <ellipse cx="45" cy="96" rx="5.5" ry="9" fill="#FAB005" />
          <ellipse cx="45" cy="97" rx="2.5" ry="5" fill="#FFFBEB" />

          {/* Decorative brass grid lines */}
          <line x1="45" y1="76" x2="45" y2="116" stroke="#D9A91F" strokeWidth="1" opacity="0.8" />
          <line x1="33" y1="96" x2="57" y2="96" stroke="#D9A91F" strokeWidth="1" opacity="0.8" />
          <line x1="32" y1="86" x2="58" y2="86" stroke="#D9A91F" strokeWidth="0.7" opacity="0.6" />
          <line x1="34" y1="106" x2="56" y2="106" stroke="#D9A91F" strokeWidth="0.7" opacity="0.6" />

          {/* Lantern Bottom Base */}
          <polygon points="35,116 55,116 50,123 40,123" fill="#D9A91F" stroke="#B18512" strokeWidth="0.8" />
          
          {/* Hanging Marigold & Bell below Lantern */}
          <line x1="45" y1="123" x2="45" y2="140" stroke="#E8590C" strokeWidth="1.5" />
          <circle cx="45" cy="144" r="5" fill="#F76707" />
          <circle cx="45" cy="144" r="3" fill="#FAB005" />
          <line x1="45" y1="149" x2="45" y2="162" stroke="#D9A91F" strokeWidth="1.2" />
          {/* Brass Bell / Diya pendant */}
          <path d="M 41 162 L 49 162 L 51 170 L 39 170 Z" fill="#D9A91F" />
          <circle cx="45" cy="172" r="1.8" fill="#FAB005" />

          {/* Secondary hanging Marigold strand on the right */}
          <line x1="88" y1="11" x2="88" y2="48" stroke="#D9A91F" strokeWidth="1" opacity="0.8" />
          <circle cx="88" cy="22" r="5" fill="#E8590C" />
          <circle cx="88" cy="22" r="3" fill="#FAB005" />
          <circle cx="88" cy="36" r="5.5" fill="#F76707" />
          <circle cx="88" cy="36" r="3.5" fill="#FFE066" />
          
          {/* Small lantern on secondary strand */}
          <polygon points="80,48 96,48 93,72 83,72" fill="#1A1A1A" stroke="#D9A91F" strokeWidth="1.2" />
          <circle cx="88" cy="60" r="7" fill="#FAB005" opacity="0.3" />
          <ellipse cx="88" cy="60" rx="3.5" ry="5.5" fill="#F59F00" />
          <ellipse cx="88" cy="60" rx="1.5" ry="2.8" fill="#FFFBEB" />
          <line x1="88" y1="72" x2="88" y2="88" stroke="#D9A91F" strokeWidth="1.2" />
          <circle cx="88" cy="90" r="2.5" fill="#FAB005" />
        </svg>
      </div>

      {/* RIGHT CORNER - Hanging Marigold Garland & Golden Brass Lantern */}
      <div className="absolute top-0 right-1 sm:right-3 md:right-6 w-20 sm:w-28 md:w-36 drop-shadow-[0_8px_20px_rgba(217,169,31,0.35)]">
        <svg viewBox="0 0 140 210" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
          {/* Hanging Garland String */}
          <path d="M 140,0 Q 95,22 40,5" stroke="#D9A91F" strokeWidth="1.6" strokeDasharray="3 2" opacity="0.85" />
          
          {/* Mango Leaves */}
          <path d="M 128,4 Q 122,16 126,24 Q 132,18 128,4 Z" fill="#2B8A3E" />
          <path d="M 100,11 Q 92,24 97,32 Q 104,25 100,11 Z" fill="#2B8A3E" />
          <path d="M 65,9 Q 58,21 62,28 Q 69,22 65,9 Z" fill="#2B8A3E" />

          {/* Marigold Blooms on top garland */}
          {/* Flower 1 */}
          <circle cx="124" cy="7" r="6.5" fill="#E8590C" />
          <circle cx="124" cy="7" r="5" fill="#F76707" />
          <circle cx="124" cy="7" r="3.2" fill="#FAB005" />
          <circle cx="124" cy="7" r="1.5" fill="#FFE066" />

          {/* Flower 2 */}
          <circle cx="95" cy="14" r="7.5" fill="#D9480F" />
          <circle cx="95" cy="14" r="5.8" fill="#F76707" />
          <circle cx="95" cy="14" r="3.8" fill="#FAB005" />
          <circle cx="95" cy="14" r="1.8" fill="#FFF3BF" />

          {/* Flower 3 */}
          <circle cx="62" cy="11" r="6.5" fill="#E8590C" />
          <circle cx="62" cy="11" r="5" fill="#F76707" />
          <circle cx="62" cy="11" r="3.2" fill="#FAB005" />

          {/* Vertical hanging Marigold strand for main lantern */}
          <line x1="95" y1="20" x2="95" y2="72" stroke="#D9A91F" strokeWidth="1.2" />

          {/* Strung Marigold Flowers down the chain */}
          <circle cx="95" cy="30" r="5.5" fill="#F76707" />
          <circle cx="95" cy="30" r="3.5" fill="#FAB005" />
          <circle cx="95" cy="30" r="1.5" fill="#FFE066" />

          <circle cx="95" cy="45" r="5.5" fill="#E8590C" />
          <circle cx="95" cy="45" r="3.5" fill="#F59F00" />
          <circle cx="95" cy="45" r="1.5" fill="#FFF3BF" />

          <circle cx="95" cy="60" r="6" fill="#D9480F" />
          <circle cx="95" cy="60" r="4" fill="#FAB005" />

          {/* Brass Ring connector */}
          <circle cx="95" cy="70" r="2.5" stroke="#D9A91F" strokeWidth="1.2" fill="#FFE066" />

          {/* Main Lantern Canopy */}
          <path d="M 81 76 L 109 76 L 103 69 L 87 69 Z" fill="#D9A91F" stroke="#B18512" strokeWidth="0.8" />
          <polygon points="95,63 99,69 91,69" fill="#FAB005" />

          {/* Lantern Body */}
          <polygon points="80,76 110,76 105,116 85,116" fill="#1A1A1A" stroke="#D9A91F" strokeWidth="1.5" />

          {/* Warm Candlelight Glow */}
          <circle cx="95" cy="96" r="12" fill="#F59F00" opacity="0.35" />
          <ellipse cx="95" cy="96" rx="5.5" ry="9" fill="#FAB005" />
          <ellipse cx="95" cy="97" rx="2.5" ry="5" fill="#FFFBEB" />

          {/* Decorative brass grid lines */}
          <line x1="95" y1="76" x2="95" y2="116" stroke="#D9A91F" strokeWidth="1" opacity="0.8" />
          <line x1="83" y1="96" x2="107" y2="96" stroke="#D9A91F" strokeWidth="1" opacity="0.8" />
          <line x1="82" y1="86" x2="108" y2="86" stroke="#D9A91F" strokeWidth="0.7" opacity="0.6" />
          <line x1="84" y1="106" x2="106" y2="106" stroke="#D9A91F" strokeWidth="0.7" opacity="0.6" />

          {/* Lantern Bottom Base */}
          <polygon points="85,116 105,116 100,123 90,123" fill="#D9A91F" stroke="#B18512" strokeWidth="0.8" />

          {/* Hanging Marigold & Bell below Lantern */}
          <line x1="95" y1="123" x2="95" y2="140" stroke="#E8590C" strokeWidth="1.5" />
          <circle cx="95" cy="144" r="5" fill="#F76707" />
          <circle cx="95" cy="144" r="3" fill="#FAB005" />
          <line x1="95" y1="149" x2="95" y2="162" stroke="#D9A91F" strokeWidth="1.2" />
          <path d="M 91 162 L 99 162 L 101 170 L 89 170 Z" fill="#D9A91F" />
          <circle cx="95" cy="172" r="1.8" fill="#FAB005" />

          {/* Secondary hanging Marigold strand on the left */}
          <line x1="52" y1="11" x2="52" y2="48" stroke="#D9A91F" strokeWidth="1" opacity="0.8" />
          <circle cx="52" cy="22" r="5" fill="#E8590C" />
          <circle cx="52" cy="22" r="3" fill="#FAB005" />
          <circle cx="52" cy="36" r="5.5" fill="#F76707" />
          <circle cx="52" cy="36" r="3.5" fill="#FFE066" />
          
          {/* Small lantern */}
          <polygon points="44,48 60,48 57,72 47,72" fill="#1A1A1A" stroke="#D9A91F" strokeWidth="1.2" />
          <circle cx="52" cy="60" r="7" fill="#FAB005" opacity="0.3" />
          <ellipse cx="52" cy="60" rx="3.5" ry="5.5" fill="#F59F00" />
          <ellipse cx="52" cy="60" rx="1.5" ry="2.8" fill="#FFFBEB" />
          <line x1="52" y1="72" x2="52" y2="88" stroke="#D9A91F" strokeWidth="1.2" />
          <circle cx="52" cy="90" r="2.5" fill="#FAB005" />
        </svg>
      </div>
    </div>
  )
}
