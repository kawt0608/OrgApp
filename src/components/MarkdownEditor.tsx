'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Image as ImageIcon, Loader2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

interface MarkdownEditorProps {
    initialValue?: string
}

export default function MarkdownEditor({ initialValue = '' }: MarkdownEditorProps) {
    const [content, setContent] = useState(initialValue)
    const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write')
    const [isUploading, setIsUploading] = useState(false)

    const textareaRef = useRef<HTMLTextAreaElement>(null)

    // Handle uploading an image to Supabase Storage and inserting its markdown syntax at the cursor
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

            insertAtCursor(markdownImage)
        } catch (err) {
            console.error('Error uploading inline image:', err)
            alert('画像のアップロードに失敗しました。')
        } finally {
            setIsUploading(false)
            // Reset input so the same file can be uploaded again if needed
            e.target.value = ''
        }
    }

    // Insert text at the current cursor position in the textarea
    const insertAtCursor = (textToInsert: string) => {
        const textarea = textareaRef.current
        if (!textarea) return

        const startPos = textarea.selectionStart
        const endPos = textarea.selectionEnd

        const newContent =
            content.substring(0, startPos) +
            textToInsert +
            content.substring(endPos, content.length)

        setContent(newContent)

        // Move cursor to after the inserted text
        setTimeout(() => {
            textarea.focus()
            textarea.selectionStart = startPos + textToInsert.length
            textarea.selectionEnd = startPos + textToInsert.length
        }, 0)
    }

    return (
        <div className="border border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm flex flex-col">
            {/* Hidden input to ensure native form submission still works */}
            <input type="hidden" name="content" value={content} />

            {/* Toolbar */}
            <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-2">
                <div className="flex space-x-2">
                    <button
                        type="button"
                        onClick={() => setActiveTab('write')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'write'
                                ? 'bg-amber-100 text-amber-700'
                                : 'text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        Write
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('preview')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'preview'
                                ? 'bg-amber-100 text-amber-700'
                                : 'text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        Preview
                    </button>
                </div>

                {/* Tools */}
                {activeTab === 'write' && (
                    <div className="flex items-center space-x-2">
                        <label
                            htmlFor="inline-image-upload"
                            className={`flex cursor-pointer items-center justify-center p-1.5 rounded-md text-gray-500 hover:bg-gray-200 hover:text-gray-900 transition-colors ${isUploading ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                            title="本文に画像を挿入"
                        >
                            {isUploading ? (
                                <Loader2 className="h-5 w-5 animate-spin text-amber-600" />
                            ) : (
                                <ImageIcon className="h-5 w-5" />
                            )}
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
                )}
            </div>

            {/* Editor / Preview Area */}
            <div className="min-h-[400px] max-h-[600px] overflow-y-auto">
                {activeTab === 'write' ? (
                    <textarea
                        ref={textareaRef}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full h-[400px] resize-y p-4 border-0 focus:ring-0 text-gray-900 placeholder-gray-400 font-mono text-sm leading-relaxed"
                        placeholder="Write your content here using Markdown... You can use the image button above to upload and insert images."
                    />
                ) : (
                    <div className="p-4 bg-white prose prose-slate lg:prose-lg max-w-none markdown-body">
                        {content ? (
                            <ReactMarkdown>{content}</ReactMarkdown>
                        ) : (
                            <p className="text-gray-400 italic">No content to preview.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
