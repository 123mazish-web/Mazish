import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    // 1. Verify Admin Authentication Token
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '') || request.nextUrl.searchParams.get('token')

    if (token !== 'mazish-secure-admin-token') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const apiKey = process.env.STEADFAST_API_KEY
    const secretKey = process.env.STEADFAST_SECRET_KEY

    if (!apiKey || !secretKey) {
      return NextResponse.json({
        error: 'Steadfast API credentials not configured',
        balance: 0
      }, { status: 400 })
    }

    const response = await fetch('https://portal.packzy.com/api/v1/get_balance', {
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
        error: `Steadfast API error: ${response.status}`,
        details: errText
      }, { status: response.status })
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      balance: data.current_balance ?? 0,
      status: data.status
    })
  } catch (error) {
    console.error('Error fetching Steadfast balance:', error)
    return NextResponse.json({
      error: error.message || 'Failed to fetch Steadfast balance'
    }, { status: 500 })
  }
}
