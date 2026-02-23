'use client'

import { Trash2 } from 'lucide-react'
import { deletePost } from '@/app/admin/actions'

export default function DeletePostButton({ postId }: { postId: string }) {
    const handleDelete = async (e: React.FormEvent) => {
        e.preventDefault()
        if (confirm('本当に削除しますか？')) {
            const formData = new FormData()
            await deletePost(postId, formData)
        }
    }

    return (
        <form onSubmit={handleDelete}>
            <button
                type="submit"
                className="text-red-500 hover:text-red-900 p-1 rounded-md hover:bg-red-50 transition-colors"
                title="Delete"
            >
                <Trash2 className="h-4 w-4" />
            </button>
        </form>
    )
}
