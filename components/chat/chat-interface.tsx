'use client'

import { useEffect, useRef, useState } from 'react'

import { useChat } from 'ai/react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'

import { ChatInput } from './chat-input'
import { MessageBubble } from './message-bubble'

interface ChatInterfaceProps {
  childName: string
}

export function ChatInterface({ childName }: ChatInterfaceProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [conversationId, setConversationId] = useState<string | null>(null)

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    body: {
      conversationId,
    },
    onResponse: (response) => {
      const id = response.headers.get('X-Conversation-Id')
      if (id) setConversationId(id)
    },
  })

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col gap-4">
      <Card className="flex flex-1 flex-col overflow-hidden">
        <div className="border-b p-4">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback className="bg-primary text-primary-foreground">A</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-lg font-semibold">Astra</h2>
              <p className="text-sm text-muted-foreground">Your AI Mentor</p>
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground">
                <p className="text-lg">Hi {childName}! 👋</p>
                <p className="mt-2">I&apos;m Astra, your AI mentor. Ask me anything!</p>
              </div>
            )}

            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} isUser={message.role === 'user'} />
            ))}

            {isLoading && (
              <MessageBubble
                message={{ id: 'loading', role: 'assistant', content: 'Thinking...' }}
                isUser={false}
                isLoading
              />
            )}

            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        <div className="border-t p-4">
          <ChatInput
            input={input}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </div>
      </Card>
    </div>
  )
}
