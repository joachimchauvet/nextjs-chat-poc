import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface StatsOverviewProps {
  totalXP: number
  currentLevel: number
  totalBadges: number
  totalConversations: number
}

export function StatsOverview({
  totalXP,
  currentLevel,
  totalBadges,
  totalConversations,
}: StatsOverviewProps) {
  const stats = [
    {
      title: 'Total XP',
      value: totalXP.toLocaleString(),
      icon: '✨',
    },
    {
      title: 'Current Level',
      value: currentLevel,
      icon: '📈',
    },
    {
      title: 'Badges Earned',
      value: totalBadges,
      icon: '🏆',
    },
    {
      title: 'Conversations',
      value: totalConversations,
      icon: '💬',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <span className="text-2xl">{stat.icon}</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
