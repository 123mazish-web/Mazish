import { supabase } from './supabase'
import { DEFAULT_PRODUCTS } from './products'

// Helper to prevent database queries from hanging indefinitely
async function withTimeout(promise, timeoutMs = 4000) {
  let timeoutId;
  const timeoutPromise = new Promise((resolve) => {
    timeoutId = setTimeout(() => resolve({ data: null, error: new Error('Database query timeout') }), timeoutMs);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutId));
}

export async function getProducts() {
  let products = [];
  try {
    const { data, error } = await withTimeout(
      supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
    )

    if (error || !data || data.length === 0) {
      products = [...DEFAULT_PRODUCTS]
    } else {
      products = data
    }
  } catch (e) {
    console.error("Failed to connect to Supabase database, using fallback:", e)
    products = [...DEFAULT_PRODUCTS]
  }

  return products
}

export async function getProductById(id) {
  let product = null

  try {
    const { data, error } = await withTimeout(
      supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()
    )

    if (!error && data) {
      product = data
    }
  } catch (e) {
    console.error(`Error fetching product ${id} from Supabase:`, e)
  }

  // Fallback to default products if not found in Supabase
  if (!product) {
    product = DEFAULT_PRODUCTS.find(p => p.id === id || p.legacy_id === id) || null
  }

  return product
}

export async function createOrder(orderData) {
  let attempt = 0
  const maxAttempts = 2
  let lastError = null

  while (attempt < maxAttempts) {
    attempt++
    try {
      console.log(`Order creation attempt ${attempt}...`)
      const { data, error } = await withTimeout(
        supabase
          .from('orders')
          .insert([orderData])
          .select()
          .single(),
        6000
      )

      if (!error && data) {
        console.log("Order successfully created in Supabase on attempt", attempt)
        return { success: true, data }
      }

      lastError = error || new Error('Query returned empty response')
      console.warn(`Attempt ${attempt} database insert returned error:`, error)
    } catch (e) {
      lastError = e
      console.error(`Attempt ${attempt} connection failed:`, e)
    }

    if (attempt < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  console.error("Order creation failed in Supabase:", lastError)
  return {
    success: false,
    error: lastError ? lastError.message : 'Connection error',
    mockOrder: { id: crypto.randomUUID(), ...orderData, created_at: new Date().toISOString() }
  }
}

export async function getCategories() {
  try {
    const { data, error } = await withTimeout(
      supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true })
    )

    if (error || !data || data.length === 0) {
      return [{ name: 'Sunglasses' }, { name: 'Apparel' }, { name: 'Accessories' }]
    }
    return data
  } catch (e) {
    return [{ name: 'Sunglasses' }, { name: 'Apparel' }, { name: 'Accessories' }]
  }
}
