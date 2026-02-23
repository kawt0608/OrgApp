'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function incrementLike(postId: string) {
    const supabase = await createClient()

    // いいね履歴にインサート（簡易的に誰でも押せる仕様）
    const { error: insertError } = await supabase
        .from('post_likes')
        .insert({ post_id: postId })

    if (insertError) {
        console.error('Failed to insert like:', insertError)
        return { success: false, error: 'Failed to like the post' }
    }

    // いいね数をインクリメント（RPCやトリガーが最適ですが、簡易的にRPC関数なしでアプローチ）
    // Supabaseでは直接のインクリメントがRPCなしでは難しいため、現在値を取得して+1します
    const { data: post } = await supabase
        .from('posts')
        .select('likes_count')
        .eq('id', postId)
        .single()

    if (post) {
        const newCount = post.likes_count + 1
        const { error: updateError } = await supabase
            .from('posts')
            .update({ likes_count: newCount })
            .eq('id', postId)

        if (updateError) {
            console.error('Failed to update likes count:', updateError)
            return { success: false, error: 'Failed to update likes count' }
        }

        // ページを再検証して新しいいいね数を反映
        revalidatePath('/')
        revalidatePath(`/posts/${postId}`)

        return { success: true, newCount }
    }

    return { success: false, error: 'Post not found' }
}
