import { Card, CardContent } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

import { Badge } from '@/types/dashboard'

interface BadgeDisplayProps {
  badges: Badge[]
}

const badgeInfo: Record<string, { icon: string; name: string; description: string }> = {
  first_chat: {
    icon: '💬',
    name: 'First Chat',
    description: 'Started your learning journey with Astra!',
  },
  streak_3_days: {
    icon: '🔥',
    name: '3-Day Streak',
    description: 'Chatted with Astra for 3 days in a row!',
  },
  streak_7_days: {
    icon: '⭐',
    name: 'Week Warrior',
    description: 'Maintained a 7-day learning streak!',
  },
  level_up: {
    icon: '🎯',
    name: 'Level Up',
    description: 'Reached a new level in any skill!',
  },
  explorer: {
    icon: '🔍',
    name: 'Explorer',
    description: 'Asked thoughtful questions and explored new topics!',
  },
  helper: {
    icon: '🤝',
    name: 'Helper',
    description: 'Showed kindness and helpful thinking!',
  },
}

export function BadgeDisplay({ badges }: BadgeDisplayProps) {
  if (badges.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <p>No badges yet. Keep chatting with Astra to earn your first badge!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <TooltipProvider>
      <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6">
        {badges.map((badge) => {
          const info = badgeInfo[badge.badge_type] || {
            icon: '🏆',
            name: 'Achievement',
            description: 'You earned this badge!',
          }

          return (
            <Tooltip key={badge.id}>
              <TooltipTrigger asChild>
                <Card className="cursor-pointer transition-transform hover:scale-105">
                  <CardContent className="flex aspect-square items-center justify-center p-4">
                    <span className="text-4xl">{info.icon}</span>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent>
                <div className="space-y-1">
                  <p className="font-semibold">{info.name}</p>
                  <p className="text-sm">{info.description}</p>
                  <p className="text-xs text-muted-foreground">
                    Earned: {new Date(badge.unlocked_at).toLocaleDateString()}
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          )
        })}
      </div>
    </TooltipProvider>
  )
}
