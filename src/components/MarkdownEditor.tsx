'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { createClient } from '@/utils/supabase/client'
import { Image as ImageIcon, Loader2 } from 'lucide-react'
import '@uiw/react-md-editor/markdown-editor.css'
import '@uiw/react-markdown-preview/markdown.css'

const MDEditor = dynamic(
    () => import('@uiw/react-md-editor').then((mod) => mod.default),
    { ssr: false }
)

interface MarkdownEditorProps {
    initialValue?: string
}

export default function MarkdownEditor({ initialValue = '' }: MarkdownEditorProps) {
    const [content, setContent] = useState<string>(initialValue)
    const [isUploading, setIsUploading] = useState(false)

    // Handle uploading an image to Supabase Storage and inserting its markdown syntax
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploading(true)

        try {
            const supabase = createClient()

            const fileExt = file.name.split('.').pop()
            const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
            const filePath = `inline/${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('post-images')
                .upload(filePath, file, { cacheControl: '3600', upsert: false })

            if (uploadError) throw uploadError

            const { data } = supabase.storage
                .from('post-images')
                .getPublicUrl(filePath)

            const imageUrl = data.publicUrl
            const markdownImage = `\n![${file.name}](${imageUrl})\n`

            // Append the image at the end of the content for simplicity since we don't 
            // have direct access to the MDEditor textarea cursor easily.
            setContent((prev) => prev + markdownImage)
        } catch (err) {
            console.error('Error uploading inline image:', err)
            alert('画像のアップロードに失敗しました。')
        } finally {
            setIsUploading(false)
            e.target.value = ''
        }
    }

    return (
        <div className="flex flex-col space-y-2" data-color-mode="light">
            <textarea readOnly name="content" value={content} className="sr-only" tabIndex={-1} />

            <div className="flex justify-end">
                <label
                    htmlFor="inline-image-upload"
                    className={`flex cursor-pointer items-center justify-center gap-2 px-3 py-1.5 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm ${isUploading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    title="本文に画像を挿入"
                >
                    {isUploading ? (
                        <Loader2 className="h-4 w-4 animate-spin text-amber-600" />
                    ) : (
                        <ImageIcon className="h-4 w-4" />
                    )}
                    <span>{isUploading ? '画像をアップロードして挿入' : 'エディタに画像を挿入'}</span>
                    <input
                        id="inline-image-upload"
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={handleImageUpload}
                        disabled={isUploading}
                    />
                </label>
            </div>

            <div className="overflow-hidden rounded-lg border border-gray-300 shadow-sm">
                <MDEditor
                    value={content}
                    onChange={(val) => setContent(val || '')}
                    height={500}
                    preview="live"
                    className="w-full"
                />
            </div>
        </div>
    )
}
