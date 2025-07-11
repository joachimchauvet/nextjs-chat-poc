'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

import type { User } from '@supabase/supabase-js'
import { LogOut, MessageSquare, Trophy } from 'lucide-react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
} from '@/components/ui/sidebar'

import { createClient } from '@/lib/supabase/client'

import { ChildProfile } from '@/types/auth'

interface AppSidebarProps {
  user: User
  childProfile: ChildProfile | null
}

export function AppSidebar({ user, childProfile }: AppSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const navigation = [
    {
      title: 'Chat with Astra',
      href: '/child/chat',
      icon: MessageSquare,
    },
    {
      title: 'My Progress',
      href: '/child/progress',
      icon: Trophy,
    },
  ]

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center justify-between px-2 py-4">
          <div className="text-2xl font-bold">ONE EDU</div>
          <SidebarTrigger className="ml-auto" />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname === item.href}>
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center gap-3 p-4">
          <Avatar>
            <AvatarFallback>
              {childProfile?.name
                ? childProfile.name[0].toUpperCase()
                : user.email?.[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{childProfile?.name || 'Student'}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
          <Button size="icon" variant="ghost" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
