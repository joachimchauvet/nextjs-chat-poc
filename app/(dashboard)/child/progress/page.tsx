import { BadgeDisplay } from '@/components/dashboard/badge-display'
import { SkillCard } from '@/components/dashboard/skill-card'
import { StatsOverview } from '@/components/dashboard/stats-overview'
import { XPProgressBar } from '@/components/dashboard/xp-progress-bar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { createClient } from '@/lib/supabase/server'

export default async function ProgressPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get child profile
  const { data: childProfile } = await supabase
    .from('child_profiles')
    .select('*')
    .eq('user_id', user?.id)
    .single()

  // Get skills
  const { data: skills } = await supabase
    .from('skills')
    .select('*')
    .eq('child_id', childProfile?.id)
    .order('skill_name')

  // Get badges
  const { data: badges } = await supabase
    .from('badges')
    .select('*')
    .eq('child_id', childProfile?.id)
    .order('unlocked_at', { ascending: false })

  // Get conversation count
  const { count: conversationCount } = await supabase
    .from('conversations')
    .select('*', { count: 'exact', head: true })
    .eq('child_id', childProfile?.id)

  // Calculate level from XP (every 100 XP = 1 level)
  const currentXP = childProfile?.xp || 0
  const currentLevel = Math.floor(currentXP / 100) + 1
  const xpInCurrentLevel = currentXP % 100
  const xpForNextLevel = 100

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Progress</h1>
        <p className="text-muted-foreground">Track your learning journey with Astra</p>
      </div>

      <div className="space-y-8">
        {/* Stats Overview */}
        <StatsOverview
          totalXP={currentXP}
          currentLevel={currentLevel}
          totalBadges={badges?.length || 0}
          totalConversations={conversationCount || 0}
        />

        {/* XP Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Experience Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <XPProgressBar
              currentXP={xpInCurrentLevel}
              maxXP={xpForNextLevel}
              level={currentLevel}
            />
            <p className="mt-2 text-sm text-muted-foreground">
              Earn XP by chatting with Astra and completing learning activities!
            </p>
          </CardContent>
        </Card>

        {/* Skills */}
        <div>
          <h2 className="mb-4 text-2xl font-semibold">Skills Development</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {skills?.map((skill) => (
              <SkillCard key={skill.id} skill={skill} />
            ))}
          </div>
        </div>

        {/* Badges */}
        <div>
          <h2 className="mb-4 text-2xl font-semibold">Achievements</h2>
          <BadgeDisplay badges={badges || []} />
        </div>
      </div>
    </div>
  )
}
