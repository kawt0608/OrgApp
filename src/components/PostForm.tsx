'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import ImageUpload from '@/components/ImageUpload'
import MarkdownEditor from '@/components/MarkdownEditor'
import { savePost } from '@/app/admin/actions'

interface PostFormProps {
    post?: {
        id: string
        title: string
        content: string
        image_url: string | null
        is_published: boolean
    }
}

export default function PostForm({ post }: PostFormProps) {
    const [state, formAction, isPending] = useActionState(savePost, null)

    return (
        <form action={formAction} className="space-y-6">
            {post && <input type="hidden" name="id" value={post.id} />}

            {state?.error && (
                <div className="rounded-md bg-red-50 p-4 mb-4">
                    <div className="flex">
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">Error</h3>
                            <div className="mt-2 text-sm text-red-700">
                                <p>{state.error}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div>
                <label htmlFor="title" className="block text-sm font-medium leading-6 text-gray-900">
                    Title
                </label>
                <div className="mt-2">
                    <input
                        type="text"
                        name="title"
                        id="title"
                        required
                        defaultValue={post?.title || ''}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-amber-600 sm:text-sm sm:leading-6 px-3"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium leading-6 text-gray-900 mb-2">
                    Content (Markdown)
                </label>
                <MarkdownEditor initialValue={post?.content || ''} />
            </div>

            <div>
                <label className="block text-sm font-medium leading-6 text-gray-900 mb-2">
                    Cover Image
                </label>
                <ImageUpload initialValue={post?.image_url || null} />
            </div>

            <div className="flex items-center">
                <input
                    id="is_published"
                    name="is_published"
                    type="checkbox"
                    value="true"
                    defaultChecked={post?.is_published || false}
                    className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-600"
                />
                <label htmlFor="is_published" className="ml-3 block text-sm font-medium leading-6 text-gray-900">
                    Publish status
                </label>
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-gray-200">
                <Link
                    href="/admin"
                    className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                >
                    Cancel
                </Link>
                <button
                    type="submit"
                    disabled={isPending}
                    className="rounded-md bg-amber-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-amber-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 disabled:opacity-50"
                >
                    {isPending ? 'Saving...' : (post ? 'Update Post' : 'Save Post')}
                </button>
            </div>
        </form>
    )
}
