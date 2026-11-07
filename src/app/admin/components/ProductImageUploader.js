'use client'

import React, { useState, useRef } from 'react'
import { UploadCloud, X, Star, Link as LinkIcon, Image as ImageIcon, AlertCircle } from 'lucide-react'

export default function ProductImageUploader({
  images = [],
  onChange,
  label = 'Product Photography & Gallery',
}) {
  const fileInputRef = useRef(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [manualUrl, setManualUrl] = useState('')
  const [showManualUrl, setShowManualUrl] = useState(false)

  const handleUploadFiles = async (fileList) => {
    if (!fileList || fileList.length === 0) return
    setUploadError('')
    setIsUploading(true)

    try {
      const token =
        localStorage.getItem('mazish_admin_token') ||
        sessionStorage.getItem('mazish_admin_token')

      const formData = new FormData()
      for (let i = 0; i < fileList.length; i++) {
        formData.append('files', fileList[i])
      }

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      const data = await res.json()
      if (data.success && Array.isArray(data.urls)) {
        onChange([...images, ...data.urls])
      } else {
        setUploadError(data.error || 'Failed to upload images to Cloudinary')
      }
    } catch (err) {
      setUploadError(err.message || 'Connection error during upload')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleSetMain = (indexToMove) => {
    if (indexToMove === 0) return
    const target = images[indexToMove]
    const filtered = images.filter((_, idx) => idx !== indexToMove)
    onChange([target, ...filtered])
  }

  const handleRemove = (indexToRemove) => {
    const filtered = images.filter((_, idx) => idx !== indexToRemove)
    onChange(filtered)
  }

  const handleAddManualUrl = (e) => {
    e.preventDefault()
    const trimmed = manualUrl.trim()
    if (!trimmed) return
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      setUploadError('Please enter a valid image URL starting with http:// or https://')
      return
    }
    onChange([...images, trimmed])
    setManualUrl('')
    setUploadError('')
  }

  return (
    <div className="space-y-4 bg-soft-bg/50 border border-soft-border/80 p-5 rounded-2xl">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-soft-border/70 pb-3">
        <div>
          <label className="font-bold text-charcoal uppercase text-xs sm:text-sm flex items-center gap-2">
            <ImageIcon size={16} className="text-[#9E7308]" />
            {label}
          </label>
          <p className="text-[11px] text-secondary-text mt-0.5">
            Add multiple product angles. First image serves as the main storefront cover.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowManualUrl(!showManualUrl)}
          className="text-[11px] font-bold text-secondary-text hover:text-charcoal flex items-center gap-1 cursor-pointer transition-colors"
        >
          <LinkIcon size={12} />
          {showManualUrl ? 'Hide URL Input' : '+ Add by URL'}
        </button>
      </div>

      {/* Upload Error Banner */}
      {uploadError && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl">
          <AlertCircle size={16} className="shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Optional Manual URL Input */}
      {showManualUrl && (
        <div className="flex gap-2">
          <input
            type="url"
            placeholder="https://res.cloudinary.com/..."
            value={manualUrl}
            onChange={(e) => setManualUrl(e.target.value)}
            className="flex-1 bg-white border border-soft-border rounded-xl px-3 py-2 text-xs font-mono text-charcoal focus:outline-none focus:border-charcoal"
          />
          <button
            type="button"
            onClick={handleAddManualUrl}
            className="bg-charcoal text-white text-xs font-bold uppercase px-4 py-2 rounded-xl hover:bg-black transition-all cursor-pointer whitespace-nowrap"
          >
            + Add Link
          </button>
        </div>
      )}

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setIsDragging(false)
          handleUploadFiles(e.dataTransfer.files)
        }}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-[#F5C443] bg-[#FFF9E8]'
            : 'border-soft-border/90 hover:border-charcoal/40 bg-white hover:bg-[#FFFDF7]'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => handleUploadFiles(e.target.files)}
        />

        {isUploading ? (
          <div className="flex flex-col items-center justify-center py-3 space-y-2.5">
            <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-primary-yellow"></div>
            <span className="text-xs font-bold text-charcoal">
              Uploading photos directly to Cloudinary CDN...
            </span>
            <span className="text-[11px] text-secondary-text">
              Please wait while your images are optimized and secured.
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-2 space-y-2">
            <div className="h-12 w-12 rounded-full bg-[#FFF9E8] border border-[#F4C542]/50 flex items-center justify-center text-charcoal shadow-2xs">
              <UploadCloud size={24} className="text-[#9E7308]" />
            </div>
            <div>
              <span className="font-bold text-sm text-charcoal block">
                Click to upload photos, or drag &amp; drop
              </span>
              <span className="text-xs text-secondary-text">
                Select one or multiple photos (PNG, JPG, WEBP). Automatically uploads to Cloudinary.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Uploaded Images Gallery Grid */}
      {images.length > 0 && (
        <div className="space-y-2.5 pt-2">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-secondary-text">
            <span>Attached Product Photos ({images.length})</span>
            <span className="text-[11px] font-semibold text-[#9E7308] bg-[#FFF9E8] px-2.5 py-0.5 rounded-full border border-[#F4C542]/40">
              Hover to reorder or delete
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {images.map((url, idx) => (
              <div
                key={url + idx}
                className={`group relative aspect-square rounded-xl overflow-hidden border bg-white shadow-2xs transition-all ${
                  idx === 0
                    ? 'border-[#F5C443] ring-2 ring-[#F5C443]/40'
                    : 'border-soft-border hover:border-charcoal/40'
                }`}
              >
                <img
                  src={url}
                  alt={`Product View ${idx + 1}`}
                  className="w-full h-full object-cover"
                />

                {/* Primary / Cover Image Badge */}
                {idx === 0 && (
                  <span className="absolute top-1.5 left-1.5 bg-[#F5C443] text-charcoal text-[9px] font-extrabold uppercase px-2 py-0.5 rounded shadow-xs z-10 flex items-center gap-1">
                    <Star size={10} fill="currentColor" /> MAIN
                  </span>
                )}

                {/* Hover Actions Overlay */}
                <div className="absolute inset-0 bg-charcoal/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2 z-20">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemove(idx)
                      }}
                      className="h-6 w-6 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-colors cursor-pointer shadow-xs"
                      title="Delete this photo"
                    >
                      <X size={13} />
                    </button>
                  </div>

                  {idx !== 0 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSetMain(idx)
                      }}
                      className="w-full bg-white hover:bg-[#FFF9E8] text-charcoal text-[10px] font-bold uppercase py-1.5 rounded-lg transition-colors cursor-pointer shadow-xs"
                    >
                      Set as Main
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

