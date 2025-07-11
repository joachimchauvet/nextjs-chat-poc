-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('child', 'parent')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Child profiles
CREATE TABLE IF NOT EXISTS child_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  age INTEGER CHECK (age >= 8 AND age <= 13),
  interests TEXT[],
  xp INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(user_id)
);

-- Chat conversations
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID REFERENCES child_profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Chat messages
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  role TEXT CHECK (role IN ('user', 'assistant')) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Skills tracking
CREATE TABLE IF NOT EXISTS skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID REFERENCES child_profiles(id) ON DELETE CASCADE NOT NULL,
  skill_name TEXT NOT NULL,
  level INTEGER DEFAULT 1 NOT NULL,
  progress INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(child_id, skill_name)
);

-- Badges
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID REFERENCES child_profiles(id) ON DELETE CASCADE NOT NULL,
  badge_type TEXT NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(child_id, badge_type)
);

-- Create indexes for better performance
CREATE INDEX idx_child_profiles_user_id ON child_profiles(user_id);
CREATE INDEX idx_conversations_child_id ON conversations(child_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_skills_child_id ON skills(child_id);
CREATE INDEX idx_badges_child_id ON badges(child_id);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE child_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Profiles: Users can only see and update their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Child profiles: Users can only see and update their own child profile
CREATE POLICY "Users can view own child profile" ON child_profiles
  FOR SELECT USING (user_id IN (SELECT id FROM profiles WHERE auth.uid() = id));

CREATE POLICY "Users can update own child profile" ON child_profiles
  FOR UPDATE USING (user_id IN (SELECT id FROM profiles WHERE auth.uid() = id));

CREATE POLICY "Users can insert own child profile" ON child_profiles
  FOR INSERT WITH CHECK (user_id IN (SELECT id FROM profiles WHERE auth.uid() = id));

-- Conversations: Children can only see their own conversations
CREATE POLICY "Children can view own conversations" ON conversations
  FOR SELECT USING (
    child_id IN (
      SELECT id FROM child_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Children can create conversations" ON conversations
  FOR INSERT WITH CHECK (
    child_id IN (
      SELECT id FROM child_profiles WHERE user_id = auth.uid()
    )
  );

-- Messages: Children can only see messages from their own conversations
CREATE POLICY "Children can view own messages" ON messages
  FOR SELECT USING (
    conversation_id IN (
      SELECT id FROM conversations WHERE child_id IN (
        SELECT id FROM child_profiles WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Children can create messages" ON messages
  FOR INSERT WITH CHECK (
    conversation_id IN (
      SELECT id FROM conversations WHERE child_id IN (
        SELECT id FROM child_profiles WHERE user_id = auth.uid()
      )
    )
  );

-- Skills: Children can only see their own skills
CREATE POLICY "Children can view own skills" ON skills
  FOR SELECT USING (
    child_id IN (
      SELECT id FROM child_profiles WHERE user_id = auth.uid()
    )
  );

-- Badges: Children can only see their own badges
CREATE POLICY "Children can view own badges" ON badges
  FOR SELECT USING (
    child_id IN (
      SELECT id FROM child_profiles WHERE user_id = auth.uid()
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_child_profiles_updated_at BEFORE UPDATE ON child_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_skills_updated_at BEFORE UPDATE ON skills
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();