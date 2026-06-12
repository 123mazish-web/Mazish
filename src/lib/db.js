import { supabase } from './supabase'
import { DEFAULT_PRODUCTS } from './products'

export async function getProducts() {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.warn("Supabase query error, using static fallback products:", error.message)
      return DEFAULT_PRODUCTS
    }

    if (!data || data.length === 0) {
      console.info("Supabase products table is empty. Using static default products.")
      return DEFAULT_PRODUCTS
    }

    return data
  } catch (e) {
    console.error("Failed to connect to Supabase database, using fallback:", e)
    return DEFAULT_PRODUCTS
  }
}

export async function getProductById(id) {
  try {
    // Check if it's a fallback ID
    const fallbackProduct = DEFAULT_PRODUCTS.find(p => p.id === id)
    if (fallbackProduct) return fallbackProduct

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.warn(`Product ${id} not found in Supabase. Checking defaults.`)
      return fallbackProduct || null
    }

    return data
  } catch (e) {
    console.error(`Error fetching product ${id}, falling back:`, e)
    return DEFAULT_PRODUCTS.find(p => p.id === id) || null
  }
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
