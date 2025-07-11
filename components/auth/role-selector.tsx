'use client'

import { useState } from 'react'

import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import { createClient } from '@/lib/supabase/client'

import { UserRole } from '@/types/auth'

export function RoleSelector() {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleRoleSelection = async () => {
    if (!selectedRole) return

    setIsLoading(true)
    setError(null)
    const supabase = createClient()

    try {
      // Get current user with retry logic
      let user = null
      let attempts = 0
      const maxAttempts = 3

      while (!user && attempts < maxAttempts) {
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser()

        if (currentUser) {
          user = currentUser
          break
        }

        attempts++
        if (attempts < maxAttempts) {
          // Wait a bit before retrying
          await new Promise((resolve) => setTimeout(resolve, 1000))
        }
      }

      if (!user) {
        throw new Error('No authenticated user found. Please try logging in again.')
      }

      // Create profile with selected role
      const { error: profileError } = await supabase.from('profiles').insert({
        id: user.id,
        role: selectedRole,
      })

      if (profileError) throw profileError

      // Redirect based on role
      if (selectedRole === 'child') {
        router.push('/child/onboarding')
      } else {
        router.push('/parent')
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Choose Your Role</CardTitle>
        <CardDescription>
          Select whether you&apos;re signing up as a child or parent
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          <Card
            className={`cursor-pointer border-2 transition-colors hover:border-primary ${
              selectedRole === 'child' ? 'border-primary bg-primary/5' : ''
            }`}
            onClick={() => setSelectedRole('child')}
          >
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold">I&apos;m a Child</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                I want to learn and chat with Astra, my AI mentor
              </p>
            </CardContent>
          </Card>

          <Card
            className={`cursor-pointer border-2 transition-colors hover:border-primary ${
              selectedRole === 'parent' ? 'border-primary bg-primary/5' : ''
            }`}
            onClick={() => setSelectedRole('parent')}
          >
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold">I&apos;m a Parent</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                I want to manage my child&apos;s learning experience
              </p>
            </CardContent>
          </Card>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button
          className="w-full"
          disabled={!selectedRole || isLoading}
          onClick={handleRoleSelection}
        >
          {isLoading ? 'Setting up your account...' : 'Continue'}
        </Button>
      </CardContent>
    </Card>
  )
}
