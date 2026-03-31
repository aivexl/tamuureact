import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in search params, use it as the redirection URL
  let next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // If it's an absolute URL, redirect to it directly
      if (next.startsWith('http')) {
        return NextResponse.redirect(next)
      }

      // If it's a relative path and we're in production, 
      // redirect to the app.tamuu.id subdomain
      if (process.env.NODE_ENV === 'production') {
        const appDomain = 'https://app.tamuu.id'
        return NextResponse.redirect(`${appDomain}${next}`)
      }
      
      // Local development or fallback
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
