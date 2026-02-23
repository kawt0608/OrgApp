'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
        return
    }

    const supabase = await createClient()

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return
    }

    // Redirect to admin dashboard on success
    redirect('/admin')
}

export async function signup(formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const displayName = formData.get('displayName') as string // Profiles table use

    if (!email || !password || !displayName) {
        return { error: 'All fields are required' }
    }

    const supabase = await createClient()

    // 1. Auth signup
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
    })

    if (authError || !authData.user) {
        return { error: authError?.message || 'Error occurred during sign up' }
    }

    // 2. Insert into profiles (Assuming no email confirmation needed for smooth UX locally)
    const { error: profileError } = await supabase
        .from('profiles')
        .insert({
            id: authData.user.id,
            display_name: displayName,
        })

    if (profileError) {
        console.error('Failed to create profile:', profileError)
        return { error: 'Failed to create user profile' }
    }

    redirect('/admin')
}

export async function logout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/')
}
