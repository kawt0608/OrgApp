'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

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

export async function savePost(formData: FormData) {
    const id = formData.get('id') as string | null
    const title = formData.get('title') as string
    const content = formData.get('content') as string
    const image_url = formData.get('image_url') as string | null
    const is_published = formData.get('is_published') === 'true'

    console.log('Raw FormData:', Object.fromEntries(formData.entries()))

    if (!title || !content) {
        console.error('Validation failed: Missing title or content')
        throw new Error('Title and Content are required')
    }

    const supabase = await createClient()

    const { data: userData } = await supabase.auth.getUser()
    const user = userData.user

    if (!user) {
        throw new Error('Unauthorized')
    }

    if (id) {
        // Update existing
        const { error } = await supabase
            .from('posts')
            .update({ title, content, image_url, is_published, updated_at: new Date().toISOString() })
            .eq('id', id)
            .eq('author_id', user.id)

        if (error) {
            console.error('Failed to update post:', error)
            throw new Error(`Failed to update post: ${error.message}`)
        }
    } else {
        // Create new
        const { error } = await supabase
            .from('posts')
            .insert({ title, content, image_url, is_published, author_id: user.id })

        if (error) {
            console.error('Failed to create post:', error)
            throw new Error(`Failed to create post: ${error.message}`)
        }
    }

    revalidatePath('/admin')
    revalidatePath('/')

    redirect('/admin')
}
