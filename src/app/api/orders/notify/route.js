export async function POST(req) {
  try {
    const orderData = await req.json()
    if (!orderData || !orderData.customer_name || !orderData.phone) {
      return Response.json({ success: false, error: 'Invalid order data' }, { status: 400 })
    }

    const isDatabaseSaved = orderData.id && !orderData.id.startsWith('demo-') && !orderData.id.startsWith('backup-')
    const dbStatusText = isDatabaseSaved 
      ? '✅ SUCCESSFULLY SAVED TO DATABASE' 
      : '⚠️ DATABASE CONNECTION TIMEOUT (OFFLINE FALLBACK)'

    const itemsText = (orderData.items || [])
      .map(item => `- ${item.name} (${item.quantity}x) - ৳${(item.discount_price || item.price) * item.quantity}`)
      .join('\n')

    const message = `
🔔 **NEW ORDER PLACED!**
----------------------------------
**Status**: ${dbStatusText}
**Order ID**: ${orderData.id}
**Customer Name**: ${orderData.customer_name}
**Phone**: ${orderData.phone}
**Email**: ${orderData.email || 'N/A'}
**Delivery Address**: ${orderData.delivery_address}
**Shipping Cost**: ৳${orderData.shipping_cost}
**Discount Amount**: ৳${orderData.discount_amount || 0}
**Total Amount**: ৳${orderData.total_amount}
**Payment Method**: ${orderData.payment_method} (${orderData.payment_details || 'N/A'})

**Items ordered**:
${itemsText || '- No items list found'}
----------------------------------
    `.trim()

    // 1. Send to Discord if webhook URL is set
    const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL
    if (discordWebhookUrl) {
      try {
        await fetch(discordWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: message
          })
        })
      } catch (err) {
        console.error("Failed sending Discord notification:", err)
      }
    }

    // 2. Send to Telegram if Token & Chat ID are set
    const tgToken = process.env.TELEGRAM_BOT_TOKEN
    const tgChatId = process.env.TELEGRAM_CHAT_ID
    if (tgToken && tgChatId) {
      try {
        const tgUrl = `https://api.telegram.org/bot${tgToken}/sendMessage`
        await fetch(tgUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: tgChatId,
            text: message,
            parse_mode: 'Markdown'
          })
        })
      } catch (err) {
        console.error("Failed sending Telegram notification:", err)
      }
    }

    return Response.json({ success: true, message: 'Notification sent successfully' })
  } catch (err) {
    console.error("Notification API error:", err)
    return Response.json({ success: false, error: err.message }, { status: 500 })
  }
}
