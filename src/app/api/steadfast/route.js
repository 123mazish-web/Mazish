import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request) {
  try {
    const { orderId, isDemo } = await request.json()

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
    }

    // 1. Fetch order details
    let order = null
    if (isDemo) {
      // Mock order data for client-side demo orders to avoid referencing localStorage on the server
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
      const { data, error } = await supabase
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

    // 2. Prepare Steadfast payload
    const apiKey = process.env.STEADFAST_API_KEY
    const secretKey = process.env.STEADFAST_SECRET_KEY

    // If API keys are missing/placeholder, do a sandbox mock dispatch
    const isMock = !apiKey || apiKey.includes('your_') || !secretKey || secretKey.includes('your_')

    let consignmentId = `SF-${Math.floor(100000 + Math.random() * 900000)}`
    let trackingCode = `STEADFAST-${order.phone.slice(-4)}-${Math.floor(1000 + Math.random() * 9000)}`

    if (!isMock && !isDemo) {
      try {
        const response = await fetch('https://portal.steadfast.com.bd/api/v1/create_order', {
          method: 'POST',
          headers: {
            'API-KEY': apiKey,
            'SECRET-KEY': secretKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            invoice: order.id,
            recipient_name: order.customer_name,
            recipient_phone: order.phone,
            recipient_address: order.delivery_address,
            cod_amount: order.payment_method === 'COD' ? order.total_amount : 0,
            note: `Mazish Order Items: ${order.items?.map(i => `${i.name} x${i.quantity}`).join(', ')}`
          })
        })

        const resData = await response.json()
        if (resData.status === 200) {
          consignmentId = resData.consignment?.id || consignmentId
          trackingCode = resData.consignment?.tracking_code || trackingCode
        } else {
          console.warn("Steadfast API returned non-200:", resData)
          return NextResponse.json({
            error: resData.message || 'Steadfast integration failed',
            details: resData
          }, { status: 400 })
        }
      } catch (err) {
        console.error("Failed to connect to Steadfast:", err)
        return NextResponse.json({ error: 'Steadfast Courier API Connection Error' }, { status: 500 })
      }
    }

    // 3. Update order in DB if it is a live DB order
    if (!isDemo) {
      const { error } = await supabase
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
      message: (isMock || isDemo) ? 'Order mocked as shipped (Sandbox Mode)' : 'Order successfully dispatched via Steadfast Courier'
    })
  } catch (error) {
    console.error("API error in Steadfast dispatch:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
