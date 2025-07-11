import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

export default async function HomePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    // Check if user has a profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile) {
      // No profile yet, redirect to role selection
      redirect('/auth/role-selection')
    } else if (profile.role === 'child') {
      // Check if child has completed onboarding
      const { data: childProfile } = await supabase
        .from('child_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!childProfile) {
        redirect('/child/onboarding')
      } else {
        redirect('/child/chat')
      }
    } else if (profile.role === 'parent') {
      redirect('/parent')
    }
  }

  // Not logged in, redirect to login
  redirect('/auth/login')
}
