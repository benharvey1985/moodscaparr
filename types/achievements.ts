export type BadgeCategory = "milestone" | "streak" | "exploration" | "special"

export interface AchievementDefinition {
  id: string
  category: string
  icon: string
  title: string
  description: string
  condition: string
  maxProgress: number
}

export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  {
    id: "first-entry",
    category: "milestone",
    icon: "🌟",
    title: "First Step",
    description: "Log your very first mood entry",
    condition: "Log 1 entry",
    maxProgress: 1,
  },
  {
    id: "double-digits",
    category: "milestone",
    icon: "🔟",
    title: "Double Digits",
    description: "Reach 10 mood entries",
    condition: "Log 10 entries",
    maxProgress: 10,
  },
  {
    id: "half-century",
    category: "milestone",
    icon: "🎯",
    title: "Half Century",
    description: "Reach 50 mood entries",
    condition: "Log 50 entries",
    maxProgress: 50,
  },
  {
    id: "century",
    category: "milestone",
    icon: "💎",
    title: "Century Club",
    description: "Reach 100 mood entries",
    condition: "Log 100 entries",
    maxProgress: 100,
  },
  {
    id: "week-warrior",
    category: "streak",
    icon: "🔥",
    title: "Week Warrior",
    description: "Log moods 7 days in a row",
    condition: "7-day streak",
    maxProgress: 7,
  },
  {
    id: "month-master",
    category: "streak",
    icon: "📅",
    title: "Month Master",
    description: "Log moods 30 days in a row",
    condition: "30-day streak",
    maxProgress: 30,
  },
  {
    id: "bimonthly",
    category: "streak",
    icon: "⏰",
    title: "Bimonthly Badge",
    description: "Log moods 60 days in a row",
    condition: "60-day streak",
    maxProgress: 60,
  },
  {
    id: "endurance",
    category: "streak",
    icon: "⚡",
    title: "Endurance",
    description: "Achieve a 30-day longest streak",
    condition: "30-day longest streak",
    maxProgress: 30,
  },
  {
    id: "mood-explorer",
    category: "exploration",
    icon: "🎨",
    title: "Mood Explorer",
    description: "Use all 19 distinct moods",
    condition: "19 distinct moods",
    maxProgress: 19,
  },
  {
    id: "weather-watcher",
    category: "exploration",
    icon: "🌤️",
    title: "Weather Watcher",
    description: "Log entries with 7 different weathers",
    condition: "7 weather types",
    maxProgress: 7,
  },
  {
    id: "activity-diver",
    category: "exploration",
    icon: "🏃",
    title: "Activity Diver",
    description: "Log 5+ activities in a single entry",
    condition: "5 activities in one entry",
    maxProgress: 1,
  },
  {
    id: "reflection-king",
    category: "exploration",
    icon: "📝",
    title: "Reflection King",
    description: "Write 50 reflections across entries",
    condition: "50 total reflections",
    maxProgress: 50,
  },
  {
    id: "early-bird",
    category: "special",
    icon: "🌅",
    title: "Early Bird",
    description: "Log a mood before 9am",
    condition: "Log before 9am",
    maxProgress: 1,
  },
  {
    id: "night-owl",
    category: "special",
    icon: "🦉",
    title: "Night Owl",
    description: "Log a mood after 10pm",
    condition: "Log after 10pm",
    maxProgress: 1,
  },
]

export interface UserAchievement {
  id: string
  badgeId: string
  unlockedAt: string
  progress: number
  maxProgress: number
  definition: AchievementDefinition
  isUnlocked: boolean
}

export function getDefinition(badgeId: string): AchievementDefinition | undefined {
  return ACHIEVEMENT_DEFINITIONS.find((d) => d.id === badgeId)
}
