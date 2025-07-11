export interface Skill {
  id: string
  child_id: string
  skill_name: string
  level: number
  progress: number
  created_at: string
  updated_at: string
}

export interface Badge {
  id: string
  child_id: string
  badge_type: string
  unlocked_at: string
}

export const SKILL_NAMES = ['Communication', 'Problem Solving', 'Leadership'] as const
export type SkillName = (typeof SKILL_NAMES)[number]

export const BADGE_TYPES = [
  'first_chat',
  'streak_3_days',
  'streak_7_days',
  'level_up',
  'explorer',
  'helper',
] as const
export type BadgeType = (typeof BADGE_TYPES)[number]
