'use client'

import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import { createClient } from '@/lib/supabase/client'

export default function ParentDashboardPage() {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">Parent Dashboard Coming Soon</CardTitle>
            <CardDescription className="text-lg">
              We&apos;re working hard to bring you amazing features to monitor and support your
              child&apos;s learning journey.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <p className="text-muted-foreground">
              In the meantime, your child can start their learning adventure with Astra!
            </p>
            <Button variant="outline" onClick={handleLogout} className="w-full">
              Logout
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
