import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { format } from 'date-fns'
import { Calendar, Heart, User } from 'lucide-react'

export const revalidate = 0

export default async function Home() {
    const supabase = await createClient()

    // is_published = true の記事を取得
    const { data: posts } = await supabase
        .from('posts')
        .select(`
            id, 
            title, 
            created_at, 
            likes_count,
            image_url,
            profiles ( display_name ),
            tags:post_tags ( tags ( name ) )
        `)
        .eq('is_published', true)
        .order('created_at', { ascending: false })

    return (
        <div className="container mx-auto max-w-4xl px-4 py-8">
            <header className="mb-12 flex items-center justify-between border-b pb-4">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Tech Blog</h1>
                <Link
                    href="/login"
                    className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
                >
                    User Login
                </Link>
            </header>

            <main>
                {posts && posts.length > 0 ? (
                    <div className="grid gap-6">
                        {posts.map((post) => (
                            <article
                                key={post.id}
                                className="group relative flex flex-col items-start justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md"
                            >
                                <div className="flex items-center gap-x-4 text-xs text-gray-500 mb-2">
                                    <time dateTime={post.created_at} className="flex items-center gap-1">
                                        <Calendar className="h-4 w-4" />
                                        {format(new Date(post.created_at), 'yyyy/MM/dd')}
                                    </time>
                                    <div className="flex items-center gap-1">
                                        <User className="h-4 w-4" />
                                        <span>{(post.profiles as any)?.display_name || 'Unknown'}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Heart className="h-4 w-4" />
                                        <span>{post.likes_count}</span>
                                    </div>
                                </div>

                                {post.image_url && (
                                    <div className="mt-4 w-full h-48 overflow-hidden rounded-xl bg-gray-100">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={post.image_url}
                                            alt={post.title}
                                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                        />
                                    </div>
                                )}

                                <div className="group relative mt-4">
                                    <h3 className="mt-3 text-xl font-semibold leading-6 text-gray-900 group-hover:text-amber-600 transition-colors">
                                        <Link href={`/posts/${post.id}`}>
                                            <span className="absolute inset-0" />
                                            {post.title}
                                        </Link>
                                    </h3>
                                    {post.tags && post.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-3 relative z-10">
                                            {post.tags.map((t: any) => (
                                                <span key={t.tags.name} className="inline-flex items-center rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
                                                    {t.tags.name}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </article>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 text-gray-500">
                        <p>記事がありません。</p>
                    </div>
                )}
            </main >
        </div >
    )
}
