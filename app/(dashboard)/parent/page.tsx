import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function ParentDashboardPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Parent Dashboard Coming Soon</CardTitle>
          <CardDescription className="text-lg">
            We&apos;re working hard to bring you amazing features to monitor and support your
            child&apos;s learning journey.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground">
            In the meantime, your child can start their learning adventure with Astra!
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
