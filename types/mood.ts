export const MOODS = {
  POSITIVE: [
    { emoji: "😊", label: "Ecstatic" },
    { emoji: "😄", label: "Happy" },
    { emoji: "😌", label: "Content" },
    { emoji: "🔆", label: "Hopeful" },
    { emoji: "🙏", label: "Grateful" },
    { emoji: "🎉", label: "Excited" },
    { emoji: "💕", label: "Loved" },
  ],
  NEUTRAL: [
    { emoji: "🧘", label: "Calm" },
    { emoji: "⚖️", label: "Balanced" },
    { emoji: "😐", label: "Indifferent" },
    { emoji: "🤔", label: "Thoughtful" },
    { emoji: "👀", label: "Curious" },
    { emoji: "😴", label: "Tired" },
  ],
  NEGATIVE: [
    { emoji: "😢", label: "Sad" },
    { emoji: "😰", label: "Anxious" },
    { emoji: "😠", label: "Angry" },
    { emoji: "😤", label: "Frustrated" },
    { emoji: "🥺", label: "Lonely" },
    { emoji: "😩", label: "Stressed" },
  ],
} as const

export type MoodCategory = keyof typeof MOODS

export interface MoodEntry {
  id: string
  userId: string
  category: MoodCategory
  moodIndex: number
  intensity: number
  date: string
  activities: string[]
  weather: string | null
  sleepHours: number | null
  sleepQuality: string | null
  energyLevel: number | null
  stressLevel: number | null
  reflection1: string | null
  reflection2: string | null
  reflection3: string | null
  reflection4: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateMoodEntryInput {
  category: MoodCategory
  moodIndex: number
  intensity: number
  date: string
  activities?: string[]
  weather?: string
  sleepHours?: number
  sleepQuality?: string
  energyLevel?: number
  stressLevel?: number
  reflection1?: string
  reflection2?: string
  reflection3?: string
  reflection4?: string
}

export type UpdateMoodEntryInput = Partial<CreateMoodEntryInput>

export const ACTIVITIES = [
  "Work",
  "Exercise",
  "Social",
  "Hobbies",
  "Relaxation",
  "Health",
  "Family",
  "Food",
  "Travel",
  "Reading",
  "Gaming",
  "Music",
  "Nature",
  "Shopping",
  "Learning",
] as const

export const WEATHERS = [
  "Sunny",
  "Cloudy",
  "Rainy",
  "Stormy",
  "Snowy",
  "Windy",
  "Foggy",
] as const

export const SLEEP_QUALITIES = ["Poor", "Fair", "Good", "Great"] as const
