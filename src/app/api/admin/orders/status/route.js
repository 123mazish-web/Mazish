import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
// Use service_role secret key on server-side to bypass RLS policies and update orders successfully
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
})

export async function POST(req) {
  try {
    const { orderId, status } = await req.json()

    if (!orderId || !status) {
      return Response.json({ success: false, error: 'OrderId and Status are required' }, { status: 400 })
    }

    // 1. Update order status in Supabase
    const { data: updatedData, error: updateError } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)
      .select()
      .single()

    if (updateError) {
      return Response.json({ success: false, error: updateError.message }, { status: 550 })
    }

    const order = updatedData

    // 2. If status is updated to 'Confirmed', send order confirmation email via Resend
    if (status === 'Confirmed' && order && order.email) {
      const resendKey = process.env.RESEND_API_KEY
      
      if (!resendKey) {
        console.warn("Skipping email dispatch: RESEND_API_KEY is not defined in environment variables.")
      } else {
        try {
          const emailResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${resendKey}`
            },
            body: JSON.stringify({
              from: 'Mazish <orders@mazish.shop>',
              to: [order.email],
              subject: `Order Confirmed! - Mazish Order #${order.id.slice(0, 8).toUpperCase()}`,
              html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px; background-color: #ffffff; color: #333333;">
                  <div style="text-align: center; padding: 10px 0;">
                    <h1 style="color: #111111; font-family: serif; letter-spacing: 4px; margin: 0; font-size: 28px;">MAZISH</h1>
                    <p style="font-size: 9px; letter-spacing: 2px; text-transform: uppercase; color: #888888; margin-top: 5px;">Premium Wear • Sunglasses • Luxury Hub</p>
                  </div>
                  <hr style="border: 0; border-top: 1px solid #eaeaea; margin: 20px 0;" />
                  
                  <div style="text-align: center; margin: 30px 0;">
                    <div style="display: inline-block; padding: 10px 20px; background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 20px; color: #047857; font-weight: bold; font-size: 14px; text-transform: uppercase;">
                      Order Confirmed
                    </div>
                    <h2 style="color: #111111; margin-top: 15px; font-weight: 500;">Thank you for your purchase!</h2>
                    <p style="color: #666666; font-size: 14px; max-width: 400px; margin: 0 auto; line-height: 1.5;">
                      We have confirmed your order on call and our team is preparing it for dispatch.
                    </p>
                  </div>
                  
                  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 30px 0; font-size: 13px; line-height: 1.6;">
                    <h4 style="margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 1px; color: #444444; border-bottom: 1px solid #eaeaea; padding-bottom: 8px;">Order Details</h4>
                    <p style="margin: 5px 0;"><strong>Order ID:</strong> <span style="font-family: monospace;">${order.id}</span></p>
                    <p style="margin: 5px 0;"><strong>Customer Name:</strong> ${order.customer_name}</p>
                    <p style="margin: 5px 0;"><strong>Phone:</strong> ${order.phone}</p>
                    <p style="margin: 5px 0;"><strong>Email:</strong> ${order.email}</p>
                    <p style="margin: 5px 0;"><strong>Shipping Destination:</strong> ${order.delivery_address}</p>
                    <p style="margin: 5px 0;"><strong>Payment Method:</strong> ${order.payment_method === 'COD' ? 'Cash on Delivery' : 'bKash (Prepaid)'}</p>
                  </div>
                  
                  <h4 style="text-transform: uppercase; letter-spacing: 1px; color: #444444; margin-bottom: 15px;">Items Ordered</h4>
                  <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                    <thead>
                      <tr style="border-bottom: 1px solid #eaeaea; text-align: left; color: #888888; font-size: 12px; text-transform: uppercase;">
                        <th style="padding: 8px 0;">Item Name</th>
                        <th style="padding: 8px 0; text-align: center;">Qty</th>
                        <th style="padding: 8px 0; text-align: right;">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${order.items?.map(item => `
                        <tr style="border-bottom: 1px solid #f5f5f5;">
                          <td style="padding: 12px 0; color: #222222; font-weight: 500;">${item.name}</td>
                          <td style="padding: 12px 0; text-align: center; color: #666666;">${item.quantity}</td>
                          <td style="padding: 12px 0; text-align: right; font-weight: bold; color: #111111;">৳${item.price * item.quantity}</td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                  
                  <div style="margin-top: 30px; text-align: right; font-size: 14px; line-height: 1.6;">
                    ${order.discount_amount > 0 ? `
                      <p style="margin: 5px 0; color: #ef4444;">Discount: -৳${order.discount_amount}</p>
                    ` : ''}
                    ${order.shipping_cost > 0 ? `
                      <p style="margin: 5px 0; color: #666666;">Shipping Cost: ৳${order.shipping_cost}</p>
                    ` : ''}
                    <p style="margin: 10px 0 0 0; font-size: 18px; font-weight: bold; color: #111111; border-top: 1px solid #eaeaea; padding-top: 10px; display: inline-block; min-width: 200px;">
                      Total Amount: ৳${order.total_amount}
                    </p>
                  </div>
                  
                  <hr style="border: 0; border-top: 1px solid #eaeaea; margin: 40px 0 20px 0;" />
                  <p style="font-size: 11px; color: #999999; text-align: center; line-height: 1.5; margin: 0;">
                    If you have any questions, please reply to this email or message us on our Facebook page. <br />
                    Thank you for choosing Mazish!
                  </p>
                </div>
              `
            })
          })
          
          if (!emailResponse.ok) {
            const errText = await emailResponse.text()
            console.error("Resend API email error:", errText)
          } else {
            console.log("Confirmation email dispatched successfully via Resend API.")
          }
        } catch (mailErr) {
          console.error("Failed to transmit email through Resend:", mailErr)
        }
      }
    }

    return Response.json({ success: true, order })
  } catch (err) {
    console.error('Update status API error:', err)
    return Response.json({ success: false, error: err.message }, { status: 500 })
  }
}
