import { openai } from '@ai-sdk/openai'
import { streamText } from 'ai'

import { getPersonalizedPrompt } from '@/lib/openai/prompts'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return new Response('Unauthorized', { status: 401 })
    }

    // Get child profile
    const { data: childProfile } = await supabase
      .from('child_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!childProfile) {
      return new Response('Child profile not found', { status: 404 })
    }

    const { messages, conversationId } = await request.json()

    // Create or get conversation
    let conversation
    if (conversationId) {
      const { data } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .eq('child_id', childProfile.id)
        .single()
      conversation = data
    }

    if (!conversation) {
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          child_id: childProfile.id,
          title: 'Chat with Astra',
        })
        .select()
        .single()

      if (error) throw error
      conversation = data
    }

    // Save user message
    const userMessage = messages[messages.length - 1]
    await supabase.from('messages').insert({
      conversation_id: conversation.id,
      role: 'user',
      content: userMessage.content,
    })

    // Get personalized system prompt
    const systemPrompt = getPersonalizedPrompt(childProfile.name, childProfile.interests || [])

    // Stream the response using Vercel AI SDK
    const result = streamText({
      model: openai('gpt-4o'),
      system: systemPrompt,
      messages,
      temperature: 0.7,
      maxTokens: 500,
      onFinish: async ({ text }) => {
        // Save assistant message
        await supabase.from('messages').insert({
          conversation_id: conversation.id,
          role: 'assistant',
          content: text,
        })

        // Award XP for engagement (5 XP per message exchange)
        await supabase
          .from('child_profiles')
          .update({ xp: childProfile.xp + 5 })
          .eq('id', childProfile.id)

        // Check for first chat badge
        const { data: badges } = await supabase
          .from('badges')
          .select('*')
          .eq('child_id', childProfile.id)
          .eq('badge_type', 'first_chat')

        if (!badges || badges.length === 0) {
          await supabase.from('badges').insert({
            child_id: childProfile.id,
            badge_type: 'first_chat',
          })
        }
      },
    })

    // Add conversation ID to response headers
    const response = result.toDataStreamResponse()
    response.headers.set('X-Conversation-Id', conversation.id)
    response.headers.set('X-XP-Earned', '5')

    return response
  } catch (error) {
    console.error('Chat API error:', error)
    return new Response('Failed to process chat message', { status: 500 })
  }
}
