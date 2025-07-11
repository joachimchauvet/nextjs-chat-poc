import { ChatInterface } from '@/components/chat/chat-interface'

import { createClient } from '@/lib/supabase/server'

export default async function ChatPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: childProfile } = await supabase
    .from('child_profiles')
    .select('*')
    .eq('user_id', user?.id)
    .single()

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-6 text-3xl font-bold">Chat with Astra</h1>
      <ChatInterface childName={childProfile?.name || 'Friend'} />
    </div>
  )
}
