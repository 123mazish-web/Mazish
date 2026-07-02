import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
})

export async function GET(req) {
  try {
    const { data, error } = await supabase
      .from('promo_codes')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return Response.json({ success: false, error: error.message }, { status: 500 })
    }
    return Response.json({ success: true, data })
  } catch (err) {
    console.error('List promos API error:', err)
    return Response.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const { action, code, payload } = await req.json()

    if (!action) {
      return Response.json({ success: false, error: 'Action is required' }, { status: 400 })
    }

    if (action === 'CREATE') {
      if (!payload) {
        return Response.json({ success: false, error: 'Payload is required for creation' }, { status: 400 })
      }
      const { data, error } = await supabase
        .from('promo_codes')
        .insert([payload])
        .select()

      if (error) {
        return Response.json({ success: false, error: error.message }, { status: 500 })
      }
      return Response.json({ success: true, data })
    }

    if (action === 'TOGGLE') {
      if (!code || payload === undefined) {
        return Response.json({ success: false, error: 'Code and isActive payload are required' }, { status: 400 })
      }
      const { data, error } = await supabase
        .from('promo_codes')
        .update({ is_active: payload.is_active })
        .eq('code', code)
        .select()

      if (error) {
        return Response.json({ success: false, error: error.message }, { status: 500 })
      }
      return Response.json({ success: true, data })
    }

    if (action === 'DELETE') {
      if (!code) {
        return Response.json({ success: false, error: 'Code is required for deletion' }, { status: 400 })
      }
      const { error } = await supabase
        .from('promo_codes')
        .delete()
        .eq('code', code)

      if (error) {
        return Response.json({ success: false, error: error.message }, { status: 500 })
      }
      return Response.json({ success: true, message: 'Deleted successfully' })
    }

    return Response.json({ success: false, error: 'Invalid action' }, { status: 400 })
  } catch (err) {
    console.error('Manage promos API error:', err)
    return Response.json({ success: false, error: err.message }, { status: 500 })
  }
}
