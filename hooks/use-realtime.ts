'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

interface RealtimeConfig {
  model?: string
  voice?: 'alloy' | 'ash' | 'ballad' | 'coral' | 'echo' | 'sage' | 'shimmer' | 'verse'
  instructions?: string
}

interface RealtimeMessage {
  type: string
  delta?: string
  transcript?: string
  error?: {
    message: string
  }
  [key: string]: unknown
}

interface MediaRecorderData {
  source: MediaStreamAudioSourceNode
  processor: ScriptProcessorNode
  stream: MediaStream
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext
  }
}

export function useRealtime(config: RealtimeConfig = {}) {
  const [isConnected, setIsConnected] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [transcript, setTranscript] = useState('')

  const wsRef = useRef<WebSocket | null>(null)
  const mediaRecorderRef = useRef<MediaRecorderData | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const audioQueueRef = useRef<AudioBuffer[]>([])
  const isPlayingRef = useRef(false)

  const {
    model = 'gpt-4o-realtime-preview-2025-06-03',
    voice = 'shimmer',
    instructions = 'You are Astra, a helpful AI mentor for children aged 8-13. Keep responses engaging, educational, and age-appropriate.',
  } = config

  // Initialize audio context
  const initAudioContext = useCallback(async () => {
    if (!audioContextRef.current) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext
      audioContextRef.current = new AudioContextClass()
    }

    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume()
    }
  }, [])

  // Play audio buffer
  const playAudioBuffer = useCallback(async (audioBuffer: AudioBuffer) => {
    if (!audioContextRef.current) return

    const source = audioContextRef.current.createBufferSource()
    source.buffer = audioBuffer
    source.connect(audioContextRef.current.destination)

    return new Promise<void>((resolve) => {
      source.onended = () => resolve()
      source.start()
    })
  }, [])

  // Process audio queue
  const processAudioQueue = useCallback(async () => {
    if (isPlayingRef.current || audioQueueRef.current.length === 0) return

    isPlayingRef.current = true

    while (audioQueueRef.current.length > 0) {
      const audioBuffer = audioQueueRef.current.shift()
      if (audioBuffer) {
        await playAudioBuffer(audioBuffer)
      }
    }

    isPlayingRef.current = false
  }, [playAudioBuffer])

  // Connect to OpenAI Realtime API
  const connect = useCallback(async () => {
    try {
      setError(null)
      await initAudioContext()

      // Get ephemeral token from our API route
      const response = await fetch('/api/realtime-token', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to get ephemeral token')
      }

      const { client_secret } = await response.json()

      // Connect to OpenAI Realtime API using ephemeral token (secure)
      const ws = new WebSocket(`wss://api.openai.com/v1/realtime?model=${model}`, [
        'realtime',
        `openai-insecure-api-key.${client_secret.value}`,
        'openai-beta.realtime-v1',
      ])

      ws.onopen = () => {
        setIsConnected(true)

        // Send session configuration
        ws.send(
          JSON.stringify({
            type: 'session.update',
            session: {
              modalities: ['text', 'audio'],
              instructions,
              voice,
              input_audio_format: 'pcm16',
              output_audio_format: 'pcm16',
              input_audio_transcription: {
                model: 'whisper-1',
              },
            },
          })
        )
      }

      ws.onmessage = async (event) => {
        const message: RealtimeMessage = JSON.parse(event.data)

        switch (message.type) {
          case 'response.audio.delta':
            if (message.delta && audioContextRef.current) {
              try {
                // Decode base64 audio to PCM16
                const audioData = atob(message.delta)
                const pcmData = new Int16Array(audioData.length / 2)

                for (let i = 0; i < pcmData.length; i++) {
                  const low = audioData.charCodeAt(i * 2)
                  const high = audioData.charCodeAt(i * 2 + 1)
                  pcmData[i] = (high << 8) | low
                }

                // Convert PCM16 to Float32 for Web Audio API
                const sampleRate = 24000 // OpenAI Realtime uses 24kHz
                const audioBuffer = audioContextRef.current.createBuffer(
                  1,
                  pcmData.length,
                  sampleRate
                )
                const channelData = audioBuffer.getChannelData(0)

                for (let i = 0; i < pcmData.length; i++) {
                  channelData[i] = pcmData[i] / 32768.0 // Convert to float
                }

                audioQueueRef.current.push(audioBuffer)
                processAudioQueue()
              } catch (audioError) {
                console.error('Audio decode error:', audioError)
              }
            }
            break

          case 'conversation.item.input_audio_transcription.completed':
            if (message.transcript) {
              setTranscript(message.transcript)
            }
            break

          case 'error':
            setError(message.error?.message || 'Unknown error')
            break
        }
      }

      ws.onclose = () => {
        setIsConnected(false)
        setIsRecording(false)
      }

      ws.onerror = () => {
        setError('WebSocket connection error')
        setIsConnected(false)
      }

      wsRef.current = ws
    } catch (connectionError) {
      setError(connectionError instanceof Error ? connectionError.message : 'Connection failed')
    }
  }, [model, voice, instructions, initAudioContext, processAudioQueue])

  // Stop recording and commit audio
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      const { source, processor, stream } = mediaRecorderRef.current

      // Disconnect audio nodes
      if (source) source.disconnect()
      if (processor) processor.disconnect()

      // Stop media stream
      if (stream) {
        stream.getTracks().forEach((track: MediaStreamTrack) => track.stop())
      }

      mediaRecorderRef.current = null
      setIsRecording(false)

      // Commit the audio buffer and trigger response
      if (wsRef.current) {
        wsRef.current.send(
          JSON.stringify({
            type: 'input_audio_buffer.commit',
          })
        )

        wsRef.current.send(
          JSON.stringify({
            type: 'response.create',
          })
        )
      }
    }
  }, [isRecording])

  // Disconnect from API
  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }

    if (mediaRecorderRef.current && isRecording) {
      stopRecording()
    }

    setIsConnected(false)
    setIsRecording(false)
    setTranscript('')
  }, [isRecording, stopRecording])

  // Start recording
  const startRecording = useCallback(async () => {
    if (!isConnected || !wsRef.current || !audioContextRef.current) return

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const source = audioContextRef.current.createMediaStreamSource(stream)

      // Create a ScriptProcessorNode for audio processing
      const processor = audioContextRef.current.createScriptProcessor(4096, 1, 1)

      processor.onaudioprocess = (event) => {
        if (!wsRef.current) return

        const inputBuffer = event.inputBuffer
        const inputData = inputBuffer.getChannelData(0)

        // Convert Float32 to PCM16
        const pcm16 = new Int16Array(inputData.length)
        for (let i = 0; i < inputData.length; i++) {
          pcm16[i] = Math.max(-32768, Math.min(32767, inputData[i] * 32768))
        }

        // Convert to base64
        const uint8Array = new Uint8Array(pcm16.buffer)
        const base64 = btoa(String.fromCharCode(...uint8Array))

        // Send audio to OpenAI
        wsRef.current.send(
          JSON.stringify({
            type: 'input_audio_buffer.append',
            audio: base64,
          })
        )
      }

      source.connect(processor)
      processor.connect(audioContextRef.current.destination)

      // Store references for cleanup
      mediaRecorderRef.current = { source, processor, stream }
      setIsRecording(true)
    } catch (micError) {
      console.error('Microphone access error:', micError)
      setError('Microphone access denied')
    }
  }, [isConnected])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect()
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [disconnect])

  return {
    isConnected,
    isRecording,
    error,
    transcript,
    connect,
    disconnect,
    startRecording,
    stopRecording,
  }
}
