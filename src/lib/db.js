import { supabase } from './supabase'
import { DEFAULT_PRODUCTS } from './products'

// Helper to prevent database queries from hanging indefinitely
async function withTimeout(promise, timeoutMs = 4000) {
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error('Database query timeout')), timeoutMs);
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
  let attempt = 0
  const maxAttempts = 5
  let lastError = null

  while (attempt < maxAttempts) {
    attempt++
    try {
      console.log(`Order creation attempt ${attempt}...`)
      // Increase timeout to 12 seconds per attempt to handle database wake-up / cold starts
      const { data, error } = await withTimeout(
        supabase
          .from('orders')
          .insert([orderData])
          .select()
          .single(),
        12000
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
      // Wait 3 seconds before retrying to give database time to spin up
      await new Promise(resolve => setTimeout(resolve, 3000))
    }
  }

  console.error("All order creation attempts failed. Fallback to mock order.", lastError)
  return {
    success: false,
    error: lastError ? lastError.message : 'Unknown connection error',
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
