'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import * as fs from 'fs'

export async function togglePublish(postId: string, currentStatus: boolean, formData: FormData) {
    const supabase = await createClient()

    const { data: userData } = await supabase.auth.getUser()
    const user = userData.user

    if (!user) {
        throw new Error('Unauthorized')
    }

    const { error } = await supabase
        .from('posts')
        .update({ is_published: !currentStatus })
        .eq('id', postId)
        .eq('author_id', user.id)

    if (error) {
        console.error('Failed to update publish status:', error)
        return
    }

    revalidatePath('/admin')
    revalidatePath('/')
}

export async function deletePost(postId: string, formData: FormData) {
    const supabase = await createClient()

    const { data: userData } = await supabase.auth.getUser()
    const user = userData.user

    if (!user) {
        throw new Error('Unauthorized')
    }

    const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)
        .eq('author_id', user.id)

    if (error) {
        console.error('Failed to delete post:', error)
        return
    }

    revalidatePath('/admin')
    revalidatePath('/')
}

export async function savePost(prevState: any, formData: FormData) {
    const id = formData.get('id') as string | null
    const title = formData.get('title') as string
    const content = formData.get('content') as string
    const image_url = formData.get('image_url') as string | null
    const is_published = formData.get('is_published') === 'true'
    const tagsString = formData.get('tags') as string | null

    console.log('Raw FormData keys:', Array.from(formData.keys()))

    if (!title || !content) {
        return { error: 'タイトル(Title)と本文(Content)の入力が必要です。' }
    }

    const supabase = await createClient()

    const { data: userData } = await supabase.auth.getUser()
    const user = userData.user

    if (!user) {
        throw new Error('Unauthorized')
    }

    let actualPostId = id

    if (id) {
        // Update existing
        const { error } = await supabase
            .from('posts')
            .update({ title, content, image_url, is_published, updated_at: new Date().toISOString() })
            .eq('id', id)
            .eq('author_id', user.id)

        if (error) {
            console.error('Failed to update post:', error)
            return { error: `記事の更新に失敗しました: ${error.message}` }
        }
    } else {
        // Create new
        const { data, error } = await supabase
            .from('posts')
            .insert({ title, content, image_url, is_published, author_id: user.id })
            .select('id')
            .single()

        if (error) {
            console.error('Failed to create post:', error)
            return { error: `記事の作成に失敗しました: ${error.message}` }
        }
        actualPostId = data.id
    }

    // Handle tags
    if (actualPostId) {
        // 1. Process tag string into an array of names
        const tagNames = tagsString
            ? tagsString.split(',').map(t => t.trim()).filter(t => t.length > 0)
            : []

        // 2. Insert any new tags that don't exist yet, ignoring conflicts
        if (tagNames.length > 0) {
            const tagsToInsert = tagNames.map(name => ({ name }))
            await supabase.from('tags').insert(tagsToInsert).select() // no 'onConflict' needed if catching error or using single insert in loop if unsupported
        }

        // 3. Get the UUIDs for all the tag names
        let tagIds: string[] = []
        if (tagNames.length > 0) {
            const { data: existingTags } = await supabase
                .from('tags')
                .select('id')
                .in('name', tagNames)
            if (existingTags) {
                tagIds = existingTags.map(t => t.id)
            }
        }

        // 4. Delete existing post_tags relations for this post
        await supabase.from('post_tags').delete().eq('post_id', actualPostId)

        // 5. Insert new relations
        if (tagIds.length > 0) {
            const postTagsToInsert = tagIds.map(tag_id => ({
                post_id: actualPostId,
                tag_id
            }))
            await supabase.from('post_tags').insert(postTagsToInsert)
        }
    }

    revalidatePath('/admin')
    revalidatePath('/')

    redirect('/admin')
}
