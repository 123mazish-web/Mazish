import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cacujmdrqugzeocqzoun.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export async function POST(request) {
  try {
    // 1. Verify Admin Authentication Token
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (token !== 'mazish-secure-admin-token') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { orderId, isDemo } = await request.json()

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
    }

    // 2. Fetch order details from Supabase
    let order = null
    if (isDemo) {
      order = {
        id: orderId,
        customer_name: 'Demo Customer',
        phone: '01700000000',
        delivery_address: 'Demo Address',
        payment_method: 'COD',
        total_amount: 1500,
        items: []
      }
    } else {
      const { data, error } = await supabaseAdmin
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single()

      if (error) throw new Error(error.message)
      order = data
    }

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Normalize phone number for Steadfast
    let cleanedPhone = (order.phone || '').replace(/\D/g, '')
    if (cleanedPhone.startsWith('880')) {
      cleanedPhone = cleanedPhone.slice(2)
    } else if (cleanedPhone.length === 10 && !cleanedPhone.startsWith('0')) {
      cleanedPhone = '0' + cleanedPhone
    }

    // 3. Prepare Steadfast payload
    const apiKey = process.env.STEADFAST_API_KEY
    const secretKey = process.env.STEADFAST_SECRET_KEY
    const isMock = !apiKey || apiKey.includes('your_') || !secretKey || secretKey.includes('your_')

    let consignmentId = `SF-${Math.floor(100000 + Math.random() * 900000)}`
    let trackingCode = `STEADFAST-${cleanedPhone.slice(-4)}-${Math.floor(1000 + Math.random() * 9000)}`

    if (!isMock && !isDemo) {
      try {
        const response = await fetch('https://portal.packzy.com/api/v1/create_order', {
          method: 'POST',
          headers: {
            'Api-Key': apiKey,
            'Secret-Key': secretKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            invoice: order.id,
            recipient_name: order.customer_name || 'Customer',
            recipient_phone: cleanedPhone,
            recipient_address: order.delivery_address || 'Address pending',
            cod_amount: order.payment_method === 'COD' ? parseFloat(order.total_amount || 0) : 0,
            note: (order.note || '').trim()
          })
        })

        const resData = await response.json()
        if (resData.status === 200 && resData.consignment) {
          consignmentId = String(resData.consignment.consignment_id || resData.consignment.id || consignmentId)
          trackingCode = String(resData.consignment.tracking_code || trackingCode)
        } else {
          console.warn('Steadfast API returned error:', resData)
          return NextResponse.json({
            error: resData.message || resData.errors?.[0] || 'Steadfast booking failed',
            details: resData
          }, { status: 400 })
        }
      } catch (err) {
        console.error('Failed to connect to Steadfast:', err)
        return NextResponse.json({ error: 'Steadfast Courier API Connection Error' }, { status: 500 })
      }
    }

    // 4. Update order in Supabase DB
    if (!isDemo) {
      const { error } = await supabaseAdmin
        .from('orders')
        .update({
          status: 'Shipped',
          steadfast_consignment_id: consignmentId,
          steadfast_tracking_code: trackingCode
        })
        .eq('id', orderId)

      if (error) throw new Error(error.message)
    }

    return NextResponse.json({
      success: true,
      consignmentId,
      trackingCode,
      message: (isMock || isDemo)
        ? 'Order mocked as shipped (Sandbox Mode)'
        : 'Order successfully dispatched via Steadfast Courier'
    })
  } catch (error) {
    console.error('API error in Steadfast dispatch:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
