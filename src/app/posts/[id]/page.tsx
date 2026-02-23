import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { ArrowLeft, Calendar, User } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import LikeButton from '@/components/LikeButton'

// URL params in App Router are available via params prop
interface PageProps {
    params: Promise<{
        id: string
    }>
}

export default async function PostDetail(props: PageProps) {
    const params = await props.params;
    const supabase = await createClient()

    const { data: post } = await supabase
        .from('posts')
        .select(`
            *,
            profiles ( display_name )
        `)
        .eq('id', params.id)
        .single()

    // 記事が存在しない、または非公開（かつ未認証）の場合は404
    if (!post) {
        notFound()
    }

    return (
        <div className="container mx-auto max-w-3xl px-4 py-8">
            <div className="mb-8">
                <Link
                    href="/"
                    className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    トップページへ戻る
                </Link>
            </div>

            <article className="prose prose-slate lg:prose-lg max-w-none">
                <header className="mb-10 not-prose">
                    <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 mb-4 whitespace-pre-wrap">
                        {post.title}
                    </h1>
                    <div className="flex items-center gap-6 text-sm text-gray-500 mb-8 pb-8 border-b">
                        <time dateTime={post.created_at} className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {format(new Date(post.created_at), 'yyyy年MM月dd日 HH:mm')}
                        </time>
                        <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            <span>{(post.profiles as any)?.display_name || 'Unknown'}</span>
                        </div>
                    </div>

                    {post.image_url && (
                        <div className="mb-8 w-full overflow-hidden rounded-2xl bg-gray-100 shadow-sm">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={post.image_url}
                                alt={post.title}
                                className="w-full h-auto max-h-[500px] object-cover"
                            />
                        </div>
                    )}
                </header>

                <div className="markdown-body">
                    <ReactMarkdown>{post.content}</ReactMarkdown>
                </div>
            </article>

            <div className="mt-16 pt-8 border-t flex flex-col items-center gap-4">
                <p className="text-sm text-gray-500">この記事が気に入ったらいいね！</p>
                <LikeButton postId={post.id} initialLikes={post.likes_count} />
            </div>
        </div>
    )
}
