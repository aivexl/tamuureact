'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(data: { email: string; password: string; return_to?: string | null; tier?: string | null }) {
  const supabase = await createClient()

  const { email, password, return_to, tier } = data

  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  // Sync with D1
  try {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.tamuu.id'
    await fetch(`${API_BASE}/api/auth/me?email=${encodeURIComponent(email)}&uid=${authData.user.id}&name=${encodeURIComponent(authData.user.user_metadata?.full_name || '')}`, {
      headers: {
        'Authorization': `Bearer ${authData.session.access_token}`
      }
    })
  } catch (err) {
    console.error('[Auth Sync] D1 Sync failed:', err)
  }

  revalidatePath('/', 'layout')

  // PRIORITY 1: Redirect to Upgrade with Tier if provided
  if (tier) {
    const isProd = process.env.NODE_ENV === 'production';
    const baseUrl = isProd ? 'https://app.tamuu.id' : '';
    redirect(`${baseUrl}/upgrade?tier=${tier}`);
  }

  // PRIORITY 2: Redirect to specific return URL
  if (return_to) {
    redirect(return_to)
  }

  if (process.env.NODE_ENV === 'production') {
    redirect('https://app.tamuu.id/dashboard')
  }

  redirect('/dashboard')
}

export async function signup(data: {
  email: string;
  password: string;
  name: string;
  gender: string;
  birthDate: string;
}) {
  const supabase = await createClient()

  const { email, password, name, gender, birthDate } = data

  const { data: authData, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
        gender,
        birth_date: birthDate,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  // Sync with D1 if session exists (auto-confirm enabled)
  if (authData.session) {
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.tamuu.id'
      await fetch(
        `${API_BASE}/api/auth/me?email=${encodeURIComponent(email)}&uid=${authData.user?.id}&name=${encodeURIComponent(name)}&gender=${gender}&birthDate=${birthDate}`,
        {
          headers: {
            'Authorization': `Bearer ${authData.session.access_token}`
          }
        }
      )
    } catch (err) {
      console.error('[Auth Sync] D1 Sync failed:', err)
    }
    
    revalidatePath('/', 'layout')
    
    if (process.env.NODE_ENV === 'production') {
      redirect('https://app.tamuu.id/dashboard')
    }
    redirect('/dashboard')
  }

  revalidatePath('/', 'layout')
  return { success: true, needsConfirmation: true }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}
