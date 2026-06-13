import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { username, password } = await request.json()

    const expectedUser = process.env.ADMIN_USER || 'admin'
    const expectedPass = process.env.ADMIN_PASS || 'mazish2026'

    if (username === expectedUser && password === expectedPass) {
      // In a real application, you might set a secure HTTP-only cookie here.
      // For our fast launch, we will return a success state and token.
      return NextResponse.json({ success: true, token: 'mazish-secure-admin-token' })
    }

    return NextResponse.json({ success: false, error: 'Invalid username or password' }, { status: 401 })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
