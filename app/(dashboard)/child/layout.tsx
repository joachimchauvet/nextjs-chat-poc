import { redirect } from 'next/navigation'

import { AppSidebar } from '@/components/app-sidebar'
import { SidebarInset } from '@/components/ui/sidebar'

import { createClient } from '@/lib/supabase/server'

export default async function ChildLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/auth/login')
  }

  // Check if user has child role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'child') {
    return redirect('/auth/login')
  }

  // Get child profile data
  const { data: childProfile } = await supabase
    .from('child_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return (
    <>
      <AppSidebar user={user} childProfile={childProfile} />
      <SidebarInset>
        <main className="flex-1 p-4">{children}</main>
      </SidebarInset>
    </>
  )
}
