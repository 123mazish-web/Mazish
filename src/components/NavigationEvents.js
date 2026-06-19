'use client'

import { useEffect, Suspense } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

function TrackRouteChanges() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
      window.dataLayer = window.dataLayer || []
      window.dataLayer.push({
        event: 'page_view',
        page_path: url
      })
    }
  }, [pathname, searchParams])

  return null
}

export default function NavigationEvents() {
  return (
    <Suspense fallback={null}>
      <TrackRouteChanges />
    </Suspense>
  )
}
