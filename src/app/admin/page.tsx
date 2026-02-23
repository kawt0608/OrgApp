import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { format } from 'date-fns'
import { Pencil, Eye, EyeOff, Plus } from 'lucide-react'
import { togglePublish } from '@/app/admin/actions'
import DeletePostButton from '@/components/DeletePostButton'

export const revalidate = 0

export default async function AdminDashboard() {
    const supabase = await createClient()

    const { data: userData } = await supabase.auth.getUser()
    const user = userData.user

    if (!user) {
        return <div>Not authenticated</div>
    }

    // DB Schema is updated so RLS *might* handle this, but it's safe to filter explicitly
    const { data: posts } = await supabase
        .from('posts')
        .select(`
            *,
            tags ( tags ( name ) )
        `)
        .eq('author_id', user.id)
        .order('created_at', { ascending: false })

    const { data: profile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', user.id)
        .single()


    return (
        <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold text-gray-900">
                    {profile?.display_name ? `${profile.display_name}'s ` : ''}Posts Dashboard
                </h1>
                <Link
                    href="/admin/posts/new"
                    className="inline-flex items-center gap-2 rounded-md bg-amber-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-amber-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
                >
                    <Plus className="h-4 w-4" />
                    Create New Post
                </Link>
            </div>

            <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                                Title
                            </th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                Status
                            </th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                Created
                            </th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                Likes
                            </th>
                            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                <span className="sr-only">Actions</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {posts && posts.length > 0 ? (
                            posts.map((post) => (
                                <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                        {post.title}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${post.is_published
                                            ? 'bg-green-50 text-green-700 ring-green-600/20'
                                            : 'bg-yellow-50 text-yellow-800 ring-yellow-600/20'
                                            }`}>
                                            {post.is_published ? 'Published' : 'Draft'}
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                        {format(new Date(post.created_at), 'yyyy/MM/dd')}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-center">
                                        {post.likes_count}
                                    </td>
                                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                        <div className="flex items-center justify-end gap-2">
                                            <form action={togglePublish.bind(null, post.id, post.is_published)}>
                                                <button
                                                    type="submit"
                                                    className="text-gray-500 hover:text-gray-900 p-1 rounded-md hover:bg-gray-100 transition-colors"
                                                    title={post.is_published ? "Unpublish" : "Publish"}
                                                >
                                                    {post.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </form>
                                            <Link
                                                href={`/admin/posts/${post.id}/edit`}
                                                className="text-amber-600 hover:text-amber-900 p-1 rounded-md hover:bg-amber-50 transition-colors"
                                                title="Edit"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Link>
                                            <DeletePostButton postId={post.id} />
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="py-8 text-center text-sm text-gray-500">
                                    記事がありません。新しい記事を作成してください。
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
