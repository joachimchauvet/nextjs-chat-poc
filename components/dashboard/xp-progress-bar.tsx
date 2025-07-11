import { Progress } from '@/components/ui/progress'

interface XPProgressBarProps {
  currentXP: number
  maxXP: number
  level: number
}

export function XPProgressBar({ currentXP, maxXP, level }: XPProgressBarProps) {
  const percentage = (currentXP / maxXP) * 100

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">Level {level}</span>
        <span className="text-muted-foreground">
          {currentXP} / {maxXP} XP
        </span>
      </div>
      <Progress value={percentage} className="h-3" />
    </div>
  )
}
