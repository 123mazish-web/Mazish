import { supabase } from './supabase'
import { DEFAULT_PRODUCTS } from './products'

export async function getProducts() {
  let products = [];
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (error || !data || data.length === 0) {
      products = [...DEFAULT_PRODUCTS]
    } else {
      products = data
    }
  } catch (e) {
    console.error("Failed to connect to Supabase database, using fallback:", e)
    products = [...DEFAULT_PRODUCTS]
  }

  // Merge client-side localStorage custom products / edits
  if (typeof window !== 'undefined') {
    try {
      const localProducts = JSON.parse(localStorage.getItem('mazish_custom_products') || '[]')
      if (localProducts.length > 0) {
        const merged = [...products]
        localProducts.forEach(lp => {
          const idx = merged.findIndex(p => p.id === lp.id)
          if (idx !== -1) {
            merged[idx] = { ...merged[idx], ...lp }
          } else {
            merged.unshift(lp)
          }
        })
        return merged
      }
    } catch (err) {
      console.error("Error loading local products:", err)
    }
  }

  return products
}

export async function getProductById(id) {
  let product = null

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()

    if (!error && data) {
      product = data
    }
  } catch (e) {
    console.error(`Error fetching product ${id} from Supabase:`, e)
  }

  // Fallback to default products if not found in Supabase
  if (!product) {
    product = DEFAULT_PRODUCTS.find(p => p.id === id) || null
  }

  // Merge client-side localStorage edits
  if (typeof window !== 'undefined' && product) {
    try {
      const localProducts = JSON.parse(localStorage.getItem('mazish_custom_products') || '[]')
      const localEdit = localProducts.find(p => p.id === id)
      if (localEdit) {
        product = { ...product, ...localEdit }
      }
    } catch (err) {
      console.error("Error loading local product edits:", err)
    }
  }

  return product
}

export async function createOrder(orderData) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single()

    if (error) {
      console.error("Failed to insert order into Supabase:", error)
      // For local testing/quick launch without database, return a mock order response
      return {
        success: false,
        error: error.message,
        mockOrder: { id: crypto.randomUUID(), ...orderData, created_at: new Date().toISOString() }
      }
    }

    return { success: true, data }
  } catch (e) {
    console.error("Order creation connection failure:", e)
    return {
      success: false,
      error: e.message,
      mockOrder: { id: crypto.randomUUID(), ...orderData, created_at: new Date().toISOString() }
    }
  }
}

export async function getCategories() {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true })

    if (error || !data || data.length === 0) {
      return [{ name: 'Sunglasses' }, { name: 'Apparel' }, { name: 'Accessories' }]
    }
    return data
  } catch (e) {
    return [{ name: 'Sunglasses' }, { name: 'Apparel' }, { name: 'Accessories' }]
  }
}
