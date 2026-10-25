import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { username, password } = await request.json()

    const expectedUser = process.env.ADMIN_USER || 'admin'
    const expectedPass = process.env.ADMIN_PASS

    if (!expectedPass) {
      return NextResponse.json({ success: false, error: 'Server authentication configuration missing' }, { status: 500 })
    }

    if (username === expectedUser && password === expectedPass) {
      return NextResponse.json({ success: true, token: 'mazish-secure-admin-token' })
    }

    return NextResponse.json({ success: false, error: 'Invalid username or password' }, { status: 401 })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
