import { cn } from '@/lib/utils'

interface MessageBubbleProps {
  message: {
    id: string
    role: string
    content: string
  }
  isUser: boolean
  isLoading?: boolean
}

export function MessageBubble({ message, isUser, isLoading }: MessageBubbleProps) {
  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-2',
          isUser ? 'bg-primary text-primary-foreground' : 'bg-muted',
          isLoading && 'animate-pulse'
        )}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  )
}
