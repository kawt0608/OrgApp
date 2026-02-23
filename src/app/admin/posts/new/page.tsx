import { savePost } from '@/app/admin/actions'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import ImageUpload from '@/components/ImageUpload'
import MarkdownEditor from '@/components/MarkdownEditor'

export default function NewPost() {
    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8 flex items-center gap-4">
                <Link
                    href="/admin"
                    className="p-2 rounded-full hover:bg-gray-200 transition-colors text-gray-500 hover:text-gray-900"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Create New Post</h1>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
                <form action={savePost} className="space-y-6">
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
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-amber-600 sm:text-sm sm:leading-6 px-3"
                                placeholder="Enter article title"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium leading-6 text-gray-900 mb-2">
                            Content (Markdown)
                        </label>
                        <MarkdownEditor />
                    </div>

                    <div>
                        <label className="block text-sm font-medium leading-6 text-gray-900 mb-2">
                            Cover Image
                        </label>
                        <ImageUpload />
                    </div>

                    <div className="flex items-center">
                        <input
                            id="is_published"
                            name="is_published"
                            type="checkbox"
                            value="true"
                            className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-600"
                        />
                        <label htmlFor="is_published" className="ml-3 block text-sm font-medium leading-6 text-gray-900">
                            Publish immediately
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
                            className="rounded-md bg-amber-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-amber-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
                        >
                            Save Post
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
