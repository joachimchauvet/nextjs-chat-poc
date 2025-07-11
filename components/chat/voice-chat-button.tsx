'use client'

import { useCallback, useState } from 'react'

import { Mic, MicOff, Phone, PhoneOff } from 'lucide-react'

import { Button } from '@/components/ui/button'

import { cn } from '@/lib/utils'

import { useRealtime } from '@/hooks/use-realtime'

interface VoiceChatButtonProps {
  childName: string
  className?: string
}

export function VoiceChatButton({ childName, className }: VoiceChatButtonProps) {
  const [isVoiceMode, setIsVoiceMode] = useState(false)

  const {
    isConnected,
    isRecording,
    error,
    transcript,
    connect,
    disconnect,
    startRecording,
    stopRecording,
  } = useRealtime({
    voice: 'shimmer', // Child-friendly voice
    instructions: `You are Astra, a helpful and engaging AI mentor for children aged 8-13. 
      You're speaking with ${childName}. Keep your responses:
      - Age-appropriate and encouraging
      - Educational but fun
      - Conversational and warm
      - Brief (1-2 sentences when possible)
      - Enthusiastic about learning
      Always end conversations by encouraging ${childName} to keep exploring and learning!`,
  })

  const toggleVoiceMode = useCallback(async () => {
    if (!isVoiceMode) {
      // Start voice mode
      setIsVoiceMode(true)
      await connect()
    } else {
      // End voice mode
      if (isRecording) {
        stopRecording()
      }
      disconnect()
      setIsVoiceMode(false)
    }
  }, [isVoiceMode, isRecording, connect, disconnect, stopRecording])

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }, [isRecording, startRecording, stopRecording])

  if (!isVoiceMode) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={toggleVoiceMode}
        className={cn('gap-2', className)}
      >
        <Phone className="h-4 w-4" />
        Talk to Astra
      </Button>
    )
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Connection status */}
      <div className="flex items-center gap-2">
        <div className={cn('h-2 w-2 rounded-full', isConnected ? 'bg-green-500' : 'bg-red-500')} />
        <span className="text-xs text-muted-foreground">
          {isConnected ? 'Connected' : 'Connecting...'}
        </span>
      </div>

      {/* Recording button */}
      <Button
        variant={isRecording ? 'destructive' : 'default'}
        size="sm"
        onClick={toggleRecording}
        disabled={!isConnected}
        className="gap-2"
      >
        {isRecording ? (
          <>
            <MicOff className="h-4 w-4" />
            Stop
          </>
        ) : (
          <>
            <Mic className="h-4 w-4" />
            Talk
          </>
        )}
      </Button>

      {/* End call button */}
      <Button variant="outline" size="sm" onClick={toggleVoiceMode} className="gap-2">
        <PhoneOff className="h-4 w-4" />
        End Call
      </Button>

      {/* Error display */}
      {error && <span className="text-xs text-red-500 max-w-[200px] truncate">{error}</span>}

      {/* Transcript display */}
      {transcript && (
        <span className="text-xs text-muted-foreground max-w-[200px] truncate">
          You said: &ldquo;{transcript}&rdquo;
        </span>
      )}
    </div>
  )
}
