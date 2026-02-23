import { savePost } from '@/app/admin/actions'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import PostForm from '@/components/PostForm'

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
                <PostForm />
            </div>
        </div>
    )
}
