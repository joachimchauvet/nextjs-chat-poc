import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

import { Skill } from '@/types/dashboard'

interface SkillCardProps {
  skill: Skill
}

const skillIcons: Record<string, string> = {
  Communication: '💬',
  'Problem Solving': '🧩',
  Leadership: '👑',
}

export function SkillCard({ skill }: SkillCardProps) {
  const percentage = (skill.progress / 100) * 100
  const icon = skillIcons[skill.skill_name] || '⭐'

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <span className="text-2xl">{icon}</span>
          {skill.skill_name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Level {skill.level}</span>
            <span className="text-muted-foreground">{skill.progress}%</span>
          </div>
          <Progress value={percentage} className="h-2" />
        </div>
      </CardContent>
    </Card>
  )
}
