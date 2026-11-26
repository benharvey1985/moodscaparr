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
    description: "Log on 7 days with up to 2 rest days between entries",
    condition: "7 logged days (2 rest days allowed)",
    maxProgress: 7,
  },
  {
    id: "month-master",
    category: "streak",
    icon: "📅",
    title: "Month Master",
    description: "Log on 30 days with up to 2 rest days between entries",
    condition: "30 logged days (2 rest days allowed)",
    maxProgress: 30,
  },
  {
    id: "bimonthly",
    category: "streak",
    icon: "⏰",
    title: "Bimonthly Badge",
    description: "Log on 60 days with up to 2 rest days between entries",
    condition: "60 logged days (2 rest days allowed)",
    maxProgress: 60,
  },
  {
    id: "endurance",
    category: "streak",
    icon: "⚡",
    title: "Endurance",
    description: "Reach 30 logged days in your longest streak, with 2 rest days allowed",
    condition: "30-day longest streak (2 rest days allowed)",
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
    description: "Log a mood before 9am in your profile timezone",
    condition: "Log before 9am local time",
    maxProgress: 1,
  },
  {
    id: "night-owl",
    category: "special",
    icon: "🦉",
    title: "Night Owl",
    description: "Log a mood at or after 10pm in your profile timezone",
    condition: "Log at or after 10pm local time",
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
