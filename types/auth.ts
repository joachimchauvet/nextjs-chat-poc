export type UserRole = 'child' | 'parent'

export interface Profile {
  id: string
  role: UserRole
  created_at: string
  updated_at: string
}

export interface ChildProfile {
  id: string
  user_id: string
  name: string
  age: number
  interests: string[]
  xp: number
  created_at: string
  updated_at: string
}
