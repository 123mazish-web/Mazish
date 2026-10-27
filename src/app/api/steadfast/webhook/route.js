import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase admin client with service role key for webhook updates
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cacujmdrqugzeocqzoun.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export async function POST(request) {
  try {
    // 1. Optional Bearer Token Verification if configured in Steadfast webhook settings
    const authHeader = request.headers.get('authorization')
    const webhookSecret = process.env.STEADFAST_WEBHOOK_SECRET

    if (webhookSecret && authHeader) {
      const token = authHeader.replace('Bearer ', '').trim()
      if (token !== webhookSecret) {
        console.warn('Unauthorized Steadfast webhook attempt:', token)
        return NextResponse.json({ error: 'Unauthorized webhook request' }, { status: 401 })
      }
    }

    const payload = await request.json()
    console.log('Steadfast Webhook Received:', JSON.stringify(payload))

    const {
      consignment_id,
      invoice,
      status: courierStatus,
      tracking_message,
      delivery_charge,
      cod_amount
    } = payload

    if (!invoice && !consignment_id) {
      return NextResponse.json({ error: 'Missing invoice or consignment_id' }, { status: 400 })
    }

    // 2. Map Steadfast status to Mazish Order status
    let mappedStatus = null
    const lowerStatus = (courierStatus || '').toLowerCase().trim()

    if (lowerStatus === 'delivered' || lowerStatus === 'partial_delivered') {
      mappedStatus = 'Delivered'
    } else if (lowerStatus === 'cancelled' || lowerStatus === 'cancelled_approval_pending') {
      mappedStatus = 'Cancelled'
    } else if (lowerStatus === 'returned' || lowerStatus === 'return_approval_pending') {
      mappedStatus = 'Returned'
    } else if (lowerStatus === 'in_transit' || lowerStatus === 'picked_up' || lowerStatus === 'hold' || lowerStatus === 'in_review') {
      mappedStatus = 'Shipped'
    }

    // 3. Update Order in Supabase
    const updatePayload = {}
    if (consignment_id) {
      updatePayload.steadfast_consignment_id = String(consignment_id)
    }
    if (mappedStatus) {
      updatePayload.status = mappedStatus
    }

    // Search by invoice (order id) first, fallback to consignment_id
    let query = supabaseAdmin.from('orders').update(updatePayload)
    if (invoice) {
      query = query.eq('id', invoice)
    } else {
      query = query.eq('steadfast_consignment_id', String(consignment_id))
    }

    const { data, error } = await query.select()

    if (error) {
      console.error('Failed to update order via Steadfast webhook:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      status: 'success',
      message: 'Order updated from Steadfast courier webhook',
      updatedOrder: data?.[0]?.id || invoice
    })
  } catch (error) {
    console.error('Error handling Steadfast webhook:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
