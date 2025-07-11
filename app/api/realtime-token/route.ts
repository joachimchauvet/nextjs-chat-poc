import { NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'

export async function POST() {
  try {
    // Verify user is authenticated
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 })
    }

    // Create ephemeral token using OpenAI REST API (secure approach)
    const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'realtime=v1',
      },
      body: JSON.stringify({
        model: 'gpt-4o-realtime-preview-2025-06-03',
        voice: 'shimmer',
        instructions: 'You are Astra, a helpful and engaging AI mentor for children aged 8-13.',
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenAI sessions API error:', errorText)
      return NextResponse.json({ error: 'Failed to create ephemeral session' }, { status: 500 })
    }

    const sessionData = await response.json()

    // Return only the ephemeral token, never the main API key
    return NextResponse.json({
      client_secret: sessionData.client_secret,
    })
  } catch (error) {
    console.error('Realtime token error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
