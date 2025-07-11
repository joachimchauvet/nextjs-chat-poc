'use client'

import { useState } from 'react'

import { useRouter } from 'next/navigation'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

import { createClient } from '@/lib/supabase/client'

import { SKILL_NAMES } from '@/types/dashboard'

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  age: z
    .number()
    .min(8, { message: 'Age must be between 8 and 13' })
    .max(13, { message: 'Age must be between 8 and 13' }),
  interests: z.string().optional(),
})

export function ChildOnboardingForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      age: 8,
      interests: '',
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    setError(null)
    const supabase = createClient()

    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('No authenticated user found')
      }

      // Check if child profile already exists
      const { data: existingProfile } = await supabase
        .from('child_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      let childProfile
      if (existingProfile) {
        // Update existing profile (keep existing XP)
        const { data: updatedProfile, error: updateError } = await supabase
          .from('child_profiles')
          .update({
            name: values.name,
            age: values.age,
            interests: values.interests ? values.interests.split(',').map((i) => i.trim()) : [],
          })
          .eq('user_id', user.id)
          .select()
          .single()

        if (updateError) throw updateError
        childProfile = updatedProfile
      } else {
        // Create new profile
        const { data: newProfile, error: insertError } = await supabase
          .from('child_profiles')
          .insert({
            user_id: user.id,
            name: values.name,
            age: values.age,
            interests: values.interests ? values.interests.split(',').map((i) => i.trim()) : [],
            xp: 0,
          })
          .select()
          .single()

        if (insertError) throw insertError
        childProfile = newProfile
      }

      // Initialize skills for the child (only if they don't exist)
      const { data: existingSkills } = await supabase
        .from('skills')
        .select('skill_name')
        .eq('child_id', childProfile.id)

      const existingSkillNames = existingSkills?.map((skill) => skill.skill_name) || []
      const skillsToInsert = SKILL_NAMES.filter(
        (skillName) => !existingSkillNames.includes(skillName)
      ).map((skillName) => ({
        child_id: childProfile.id,
        skill_name: skillName,
        level: 1,
        progress: 0,
      }))

      if (skillsToInsert.length > 0) {
        const { error: skillsError } = await supabase.from('skills').insert(skillsToInsert)
        if (skillsError) throw skillsError
      }

      // Redirect to chat
      router.push('/child/chat')
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome to ONE EDU!</CardTitle>
        <CardDescription>
          Let&apos;s get to know you better so Astra can personalize your learning experience
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What&apos;s your name?</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="age"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>How old are you?</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter your age"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>We support learners aged 8-13</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="interests"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What are you interested in?</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us about your hobbies, favorite subjects, or anything you're curious about..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    This helps Astra create conversations you&apos;ll enjoy
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Setting up your profile...' : 'Start Learning with Astra'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
