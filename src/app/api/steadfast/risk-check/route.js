import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    // 1. Verify Admin Authentication Token
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '') || request.nextUrl.searchParams.get('token')

    if (token !== 'mazish-secure-admin-token') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const rawPhone = searchParams.get('phone')

    if (!rawPhone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 })
    }

    // Normalize Bangladeshi phone number (e.g. "+8801712345678" -> "01712345678")
    let phone = rawPhone.replace(/\D/g, '') // remove all non-digits
    if (phone.startsWith('880')) {
      phone = phone.slice(2) // remove 88, keep leading 0
    } else if (phone.length === 10 && !phone.startsWith('0')) {
      phone = '0' + phone
    }

    const apiKey = process.env.STEADFAST_API_KEY
    const secretKey = process.env.STEADFAST_SECRET_KEY

    if (!apiKey || !secretKey) {
      return NextResponse.json({
        error: 'Steadfast API credentials not configured'
      }, { status: 400 })
    }

    const response = await fetch(`https://portal.packzy.com/api/v1/fraud_check/score/${phone}`, {
      method: 'GET',
      headers: {
        'Api-Key': apiKey,
        'Secret-Key': secretKey,
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    })

    if (!response.ok) {
      const errText = await response.text()
      return NextResponse.json({
        error: `Steadfast Risk API error: ${response.status}`,
        details: errText
      }, { status: response.status })
    }

    const data = await response.json()

    const deliveryRatio = data.delivery_ratio ?? 0
    const cancellationRatio = data.cancellation_ratio ?? data.return_ratio ?? 0
    const totalReports = data.total_reports ?? 0
    const fraudCategories = data.fraud_categories || {}
    const volumeRange = data.volume_range || data.volume_band || 'Unknown'

    // Compute Risk Assessment
    let riskLevel = 'LOW' // 'LOW' | 'MEDIUM' | 'HIGH'
    let riskLabel = 'Low Risk'
    let riskColor = 'green'

    if (totalReports >= 2 || cancellationRatio >= 50 || (deliveryRatio > 0 && deliveryRatio < 50)) {
      riskLevel = 'HIGH'
      riskLabel = `High Risk (${cancellationRatio}% Returns, ${totalReports} Reports)`
      riskColor = 'red'
    } else if (totalReports === 1 || cancellationRatio >= 30 || (deliveryRatio > 0 && deliveryRatio < 70)) {
      riskLevel = 'MEDIUM'
      riskLabel = `Medium Risk (${cancellationRatio}% Returns)`
      riskColor = 'amber'
    } else {
      riskLevel = 'LOW'
      riskLabel = deliveryRatio > 0 ? `Trusted (${deliveryRatio}% Delivered)` : 'New Customer (No negative reports)'
      riskColor = 'emerald'
    }

    return NextResponse.json({
      success: true,
      phone,
      deliveryRatio,
      cancellationRatio,
      totalReports,
      volumeRange,
      fraudCategories,
      riskLevel,
      riskLabel,
      riskColor,
      raw: data
    })
  } catch (error) {
    console.error('Error checking delivery risk:', error)
    return NextResponse.json({
      error: error.message || 'Failed to check customer delivery reputation'
    }, { status: 500 })
  }
}
