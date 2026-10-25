import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import * as XLSX from 'xlsx'

export const dynamic = 'force-dynamic'

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get('token') || req.headers.get('authorization')?.replace('Bearer ', '')
    const validToken = process.env.ADMIN_TOKEN || 'mazish-secure-admin-token'

    if (token !== validToken) {
      return NextResponse.json({ error: 'Unauthorized: Admin authentication token required' }, { status: 401 })
    }

    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const format = searchParams.get('format') || 'xlsx'

    // Format all orders
    const ordersRows = (orders || []).map((o, idx) => {
      let itemsList = ''
      let totalQty = 0
      if (Array.isArray(o.items)) {
        itemsList = o.items
          .map((item) => {
            const qty = item.quantity || 1
            totalQty += qty
            return `${item.name || 'Sunglasses'} (Qty: ${qty}, Price: ৳${item.price || item.discount_price || 0})`
          })
          .join('; ')
      } else if (typeof o.items === 'string') {
        itemsList = o.items
        totalQty = 1
      }

      return {
        'SL': idx + 1,
        'Order ID': o.id || '',
        'Date': o.created_at ? new Date(o.created_at).toLocaleString('en-GB') : 'N/A',
        'Customer Name': o.customer_name || 'Anonymous',
        'Phone Number': o.phone || '',
        'Email': o.email || '',
        'Delivery Address': o.delivery_address || '',
        'Status': o.status || 'Pending',
        'Payment Method': o.payment_method || 'COD',
        'Payment Details': o.payment_details || '',
        'Items Purchased': itemsList,
        'Total Items Qty': totalQty,
        'Total Amount (BDT)': o.total_amount ? Number(o.total_amount) : 0,
        'Shipping Cost (BDT)': o.shipping_cost ? Number(o.shipping_cost) : 0,
        'Discount (BDT)': o.discount_amount ? Number(o.discount_amount) : 0,
        'Promo Code': o.promo_code || 'None',
        'Steadfast Consignment ID': o.steadfast_consignment_id || 'N/A',
        'Steadfast Tracking Code': o.steadfast_tracking_code || 'N/A',
      }
    })

    // Group unique customers
    const customerMap = new Map()
    ;(orders || []).forEach((o) => {
      const rawPhone = (o.phone || '').trim()
      const rawName = (o.customer_name || '').trim()
      const key = rawPhone || rawName || o.id

      if (!customerMap.has(key)) {
        customerMap.set(key, {
          name: rawName,
          phone: rawPhone,
          email: (o.email || '').trim(),
          address: (o.delivery_address || '').trim(),
          totalOrders: 0,
          lifetimeSpend: 0,
          deliveredOrders: 0,
          returnedOrders: 0,
          firstOrderDate: o.created_at,
          latestOrderDate: o.created_at,
          purchasedProducts: new Set(),
        })
      }

      const c = customerMap.get(key)
      c.totalOrders += 1
      c.lifetimeSpend += Number(o.total_amount || 0)
      if (o.status === 'Delivered') c.deliveredOrders += 1
      if (o.status === 'Returned') c.returnedOrders += 1

      if (o.email && !c.email) c.email = o.email.trim()
      if (o.delivery_address && (!c.address || c.address.length < o.delivery_address.length)) {
        c.address = o.delivery_address.trim()
      }

      if (o.created_at) {
        if (!c.firstOrderDate || new Date(o.created_at) < new Date(c.firstOrderDate)) {
          c.firstOrderDate = o.created_at
        }
        if (!c.latestOrderDate || new Date(o.created_at) > new Date(c.latestOrderDate)) {
          c.latestOrderDate = o.created_at
        }
      }

      if (Array.isArray(o.items)) {
        o.items.forEach((it) => {
          if (it && it.name) c.purchasedProducts.add(it.name)
        })
      }
    })

    const customerRows = Array.from(customerMap.values())
      .sort((a, b) => b.lifetimeSpend - a.lifetimeSpend)
      .map((c, idx) => ({
        'SL': idx + 1,
        'Customer Name': c.name || 'Anonymous',
        'Phone Number': c.phone || 'N/A',
        'Email': c.email || 'N/A',
        'Delivery Address': c.address || 'N/A',
        'Total Orders Placed': c.totalOrders,
        'Lifetime Spend (BDT)': Math.round(c.lifetimeSpend),
        'Successful Deliveries': c.deliveredOrders,
        'Returns': c.returnedOrders,
        'Products Bought': Array.from(c.purchasedProducts).join(', ') || 'N/A',
        'First Order Date': c.firstOrderDate ? new Date(c.firstOrderDate).toLocaleDateString('en-GB') : 'N/A',
        'Latest Order Date': c.latestOrderDate ? new Date(c.latestOrderDate).toLocaleDateString('en-GB') : 'N/A',
      }))

    const workbook = XLSX.utils.book_new()
    const customerSheet = XLSX.utils.json_to_sheet(customerRows)

    XLSX.utils.book_append_sheet(workbook, customerSheet, 'Customer Records (89)')

    if (format === 'csv') {
      const csvData = XLSX.utils.sheet_to_csv(customerSheet)
      return new NextResponse(csvData, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="Mazish_Customers_89.csv"',
        },
      })
    }

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="Mazish_Customer_Data.xlsx"',
      },
    })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
