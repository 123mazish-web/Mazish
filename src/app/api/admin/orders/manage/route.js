import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
})

export async function POST(req) {
  try {
    const { action, orderId, payload } = await req.json()

    if (!orderId || !action) {
      return Response.json({ success: false, error: 'OrderId and action are required' }, { status: 400 })
    }

    if (action === 'DELETE') {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId)

      if (error) {
        return Response.json({ success: false, error: error.message }, { status: 500 })
      }
      return Response.json({ success: true, message: 'Deleted successfully' })
    } 
    
    if (action === 'UPDATE') {
      if (!payload) {
        return Response.json({ success: false, error: 'Payload is required for update' }, { status: 400 })
      }
      const { data, error } = await supabase
        .from('orders')
        .update(payload)
        .eq('id', orderId)
        .select()
        .single()

      if (error) {
        return Response.json({ success: false, error: error.message }, { status: 500 })
      }
      return Response.json({ success: true, data })
    }

    return Response.json({ success: false, error: 'Invalid action' }, { status: 400 })
  } catch (err) {
    console.error('Manage orders API error:', err)
    return Response.json({ success: false, error: err.message }, { status: 500 })
  }
}
