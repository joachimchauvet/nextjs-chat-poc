import { redirect } from 'next/navigation'

import { SidebarProvider } from '@/components/ui/sidebar'

import { createClient } from '@/lib/supabase/server'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/auth/login')
  }

  return <SidebarProvider defaultOpen={true}>{children}</SidebarProvider>
}
