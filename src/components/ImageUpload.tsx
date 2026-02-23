'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Image as ImageIcon, Loader2, X } from 'lucide-react'

interface ImageUploadProps {
    initialValue?: string | null
}

export default function ImageUpload({ initialValue }: ImageUploadProps) {
    const [imageUrl, setImageUrl] = useState<string>(initialValue || '')
    const [isUploading, setIsUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploading(true)
        setError(null)

        try {
            const supabase = createClient()

            const fileExt = file.name.split('.').pop()
            const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
            const filePath = `${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('post-images')
                .upload(filePath, file, { cacheControl: '3600', upsert: false })

            if (uploadError) {
                throw uploadError
            }

            const { data } = supabase.storage
                .from('post-images')
                .getPublicUrl(filePath)

            setImageUrl(data.publicUrl)
        } catch (err: any) {
            console.error('Error uploading image:', err)
            setError(err.message || 'Error uploading image')
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <div className="space-y-4">
            <input type="hidden" name="image_url" value={imageUrl} />

            <div className="flex items-center gap-4">
                {imageUrl ? (
                    <div className="relative h-40 w-64 overflow-hidden rounded-lg border border-gray-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={imageUrl}
                            alt="Cover Image"
                            className="h-full w-full object-cover"
                        />
                        <button
                            type="button"
                            onClick={() => setImageUrl('')}
                            className="absolute right-2 top-2 rounded-full bg-white/80 p-1 text-gray-700 hover:bg-white transition-colors shadow-sm"
                            title="画像を削除"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                ) : (
                    <div className="flex h-40 w-64 items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50">
                        <div className="flex flex-col items-center justify-center text-gray-500">
                            {isUploading ? (
                                <>
                                    <Loader2 className="mb-2 h-6 w-6 animate-spin text-amber-500" />
                                    <span className="text-sm">アップロード中...</span>
                                </>
                            ) : (
                                <>
                                    <ImageIcon className="mb-2 h-6 w-6" />
                                    <span className="text-sm">画像がありません</span>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div>
                <label
                    htmlFor="image-upload"
                    className={`inline-flex cursor-pointer items-center rounded-md px-3 py-2 text-sm font-semibold shadow-sm ring-1 ring-inset transition-colors ${isUploading
                        ? 'bg-gray-100 text-gray-400 ring-gray-200 cursor-not-allowed'
                        : 'bg-white text-gray-900 ring-gray-300 hover:bg-gray-50'
                        }`}
                >
                    {imageUrl ? '画像を変更' : '画像をアップロード'}
                    <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={handleUpload}
                        disabled={isUploading}
                    />
                </label>
                {error && (
                    <p className="mt-2 text-sm text-red-600">{error}</p>
                )}
            </div>
        </div>
    )
}
