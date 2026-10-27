import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cacujmdrqugzeocqzoun.supabase.co'
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// Initialize admin Supabase client with Service Role Key to bypass RLS policies
const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false }
})

export async function POST(req) {
  try {
    // 1. Verify Admin Authentication Token
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (token !== 'mazish-secure-admin-token') {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { action, id, stock, payload } = await req.json()

    if (!action) {
      return Response.json({ success: false, error: 'Action is required' }, { status: 400 })
    }

    // A. UPDATE STOCK ONLY
    if (action === 'UPDATE_STOCK') {
      if (!id || stock === undefined || stock === null) {
        return Response.json({ success: false, error: 'Product ID and stock are required' }, { status: 400 })
      }

      const { data, error } = await supabaseAdmin
        .from('products')
        .update({ stock: Number(stock) })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Supabase update stock error:', error)
        return Response.json({ success: false, error: error.message }, { status: 500 })
      }

      return Response.json({ success: true, data })
    }

    // B. UPDATE PRODUCT FULL DETAILS (Including stock, price, etc.)
    if (action === 'UPDATE_PRODUCT') {
      if (!id || !payload) {
        return Response.json({ success: false, error: 'Product ID and payload are required' }, { status: 400 })
      }

      const updateData = {
        name: payload.name,
        price: Number(payload.price),
        discount_price: payload.discount_price ? Number(payload.discount_price) : null,
        stock: Number(payload.stock ?? 0),
        gender: payload.gender || 'Unisex'
      }

      if (payload.description) updateData.description = payload.description
      if (payload.category) updateData.category = payload.category
      if (payload.is_featured !== undefined) updateData.is_featured = payload.is_featured
      if (payload.images) updateData.images = payload.images

      const { data, error } = await supabaseAdmin
        .from('products')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Supabase update product error:', error)
        return Response.json({ success: false, error: error.message }, { status: 500 })
      }

      return Response.json({ success: true, data })
    }

    // C. CREATE PRODUCT
    if (action === 'CREATE_PRODUCT') {
      if (!payload || !payload.name) {
        return Response.json({ success: false, error: 'Payload with product name is required' }, { status: 400 })
      }

      const insertData = {
        name: payload.name,
        description: payload.description || '',
        price: Number(payload.price),
        discount_price: payload.discount_price ? Number(payload.discount_price) : null,
        images: payload.images || [],
        category: payload.category || 'Sunglasses',
        gender: payload.gender || 'Unisex',
        stock: Number(payload.stock ?? 10),
        is_featured: !!payload.is_featured,
      }

      const { data, error } = await supabaseAdmin
        .from('products')
        .insert([insertData])
        .select()
        .single()

      if (error) {
        console.error('Supabase create product error:', error)
        return Response.json({ success: false, error: error.message }, { status: 500 })
      }

      return Response.json({ success: true, data })
    }

    // D. DELETE PRODUCT
    if (action === 'DELETE_PRODUCT') {
      if (!id) {
        return Response.json({ success: false, error: 'Product ID is required for deletion' }, { status: 400 })
      }

      const { error } = await supabaseAdmin
        .from('products')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Supabase delete product error:', error)
        return Response.json({ success: false, error: error.message }, { status: 500 })
      }

      return Response.json({ success: true, message: 'Deleted successfully' })
    }

    return Response.json({ success: false, error: 'Invalid action' }, { status: 400 })
  } catch (err) {
    console.error('Manage products API exception:', err)
    return Response.json({ success: false, error: err.message }, { status: 500 })
  }
}
