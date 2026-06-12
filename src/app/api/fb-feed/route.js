import { NextResponse } from 'next/server'
import { getProducts } from '@/lib/db'

export async function GET(request) {
  try {
    const products = await getProducts()
    const host = request.headers.get('host') || 'mazish.com'
    const protocol = request.headers.get('x-forwarded-proto') || 'https'
    const baseUrl = `${protocol}://${host}`

    // Format products according to Facebook Catalog requirements
    const fbCatalogFeed = products.map(product => {
      const imageUrl = product.images?.[0]?.startsWith('http')
        ? product.images[0]
        : `${baseUrl}${product.images?.[0] || '/images/sunglasses-1.png'}`

      return {
        id: product.id,
        title: product.name,
        description: product.description || 'Premium luxury product by Mazish',
        link: `${baseUrl}/product/${product.id}`,
        image_link: imageUrl,
        brand: 'Mazish',
        condition: 'new',
        availability: product.stock > 0 ? 'in stock' : 'out of stock',
        price: `${product.discount_price || product.price} BDT`,
        google_product_category: 'Apparel & Accessories > Clothing Accessories > Sunglasses',
        custom_label_0: product.category,
        inventory: product.stock
      }
    })

    return NextResponse.json(fbCatalogFeed, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600'
      }
    })
  } catch (error) {
    console.error("Failed to generate Facebook Feed:", error)
    return NextResponse.json({ error: 'Failed to generate catalog feed' }, { status: 500 })
  }
}
