import { NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(req) {
  try {
    // 1. Verify Admin Authentication Token
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (token !== 'mazish-secure-admin-token') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json(
        { error: 'Cloudinary credentials are not configured in environment' },
        { status: 500 }
      )
    }

    const formData = await req.formData()
    let files = formData.getAll('files')
    if (files.length === 0) {
      const singleFile = formData.get('file')
      if (singleFile) files = [singleFile]
    }

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    }

    const uploadedUrls = []

    for (const file of files) {
      // If it's already an existing URL, keep it
      if (typeof file === 'string' && file.startsWith('http')) {
        uploadedUrls.push(file)
        continue
      }

      const timestamp = Math.round(Date.now() / 1000)
      const folder = 'mazish_products'
      const stringToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`
      const signature = crypto.createHash('sha1').update(stringToSign).digest('hex')

      const cFormData = new FormData()
      cFormData.append('file', file)
      cFormData.append('api_key', apiKey)
      cFormData.append('timestamp', String(timestamp))
      cFormData.append('folder', folder)
      cFormData.append('signature', signature)

      const cRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: cFormData,
      })

      const cData = await cRes.json()

      if (cRes.ok && cData.secure_url) {
        uploadedUrls.push(cData.secure_url)
      } else {
        console.error('Cloudinary upload failure:', cData)
        return NextResponse.json(
          { error: cData.error?.message || 'Failed to upload to Cloudinary' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      urls: uploadedUrls,
      count: uploadedUrls.length,
    })
  } catch (error) {
    console.error('Upload API error:', error)
    return NextResponse.json(
      { error: error.message || 'Server error uploading image' },
      { status: 500 }
    )
  }
}

