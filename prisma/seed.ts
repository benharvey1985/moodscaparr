import { PrismaClient, $Enums } from "./generated/prisma"
import { PrismaPg } from "@prisma/adapter-pg"

const MOODS = {
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

type MoodCategory = keyof typeof MOODS

const ACTIVITIES = [
  "Work", "Exercise", "Social", "Hobbies", "Relaxation",
  "Health", "Family", "Food", "Travel", "Reading",
  "Gaming", "Music", "Nature", "Shopping", "Learning",
]

const WEATHERS = ["Sunny", "Cloudy", "Rainy", "Stormy", "Snowy", "Windy", "Foggy"]

const SLEEP_QUALITIES = ["Poor", "Fair", "Good", "Great"]

const REFLECTIONS = [
  "Had a productive day overall.",
  "Felt really connected with friends today.",
  "Need to focus more on self-care.",
  "Work was challenging but rewarding.",
  "Enjoyed some quiet time in the evening.",
  "Looking forward to the weekend.",
  "Got some good news today!",
  "Felt a bit overwhelmed but managed.",
  "Great workout session this morning.",
  "Had a lovely dinner with family.",
  "Spent time on my hobby, felt refreshed.",
  "Ate something new and delicious.",
  "Finished a book I've been reading.",
  "Had a meaningful conversation.",
  "Enjoyed the weather today.",
]

function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function pickRandomN<T>(arr: readonly T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, n)
}

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
  const prismaClient = new PrismaClient({ adapter })

  try {
    const existingCount = await prismaClient.moodEntry.count()
    if (existingCount > 0) {
      console.log(`Database already has ${existingCount} entries. Skipping seed.`)
      return
    }

    const adminUser = await prismaClient.user.findFirst({
      where: { role: "admin" },
    })

    if (!adminUser) {
      console.log("No admin user found. Skipping seed.")
      return
    }

    const entries: {
      userId: string
      category: $Enums.MoodCategory
      moodIndex: number
      intensity: number
      date: Date
      activities: string[]
      weather: string
      sleepHours: number
      sleepQuality: string
      energyLevel: number
      stressLevel: number
      reflection1: string | null
      reflection2: null
      reflection3: null
      reflection4: null
    }[] = []

    for (let i = 0; i < 60; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      date.setHours(12, 0, 0, 0)

      const rand = Math.random()
      let category: MoodCategory
      if (rand < 0.5) category = "POSITIVE"
      else if (rand < 0.8) category = "NEUTRAL"
      else category = "NEGATIVE"

      const moods = MOODS[category]
      const moodIndex = Math.floor(Math.random() * moods.length)

      let intensity: number
      if (Math.random() < 0.6) {
        intensity = Math.floor(Math.random() * 3) + 5
      } else {
        intensity = Math.floor(Math.random() * 10) + 1
      }

      const numActivities = Math.floor(Math.random() * 3) + 1
      const activities = pickRandomN(ACTIVITIES, numActivities)

      const weather = pickRandom(WEATHERS)
      const sleepHours = Math.floor(Math.random() * 5) + 5
      const energyLevel = Math.floor(Math.random() * 7) + 3
      const stressLevel = Math.floor(Math.random() * 7) + 2

      let reflection1: string | null = null
      if (Math.random() < 0.4) {
        reflection1 = pickRandom(REFLECTIONS)
      }

      entries.push({
        userId: adminUser.id,
        category,
        moodIndex,
        intensity,
        date,
        activities,
        weather,
        sleepHours,
        sleepQuality: pickRandom(SLEEP_QUALITIES),
        energyLevel,
        stressLevel,
        reflection1,
        reflection2: null,
        reflection3: null,
        reflection4: null,
      })
    }

    await prismaClient.moodEntry.createMany({ data: entries })
    console.log(`Seeded ${entries.length} mood entries for user ${adminUser.email}.`)
  } finally {
    await prismaClient.$disconnect()
  }
}

main()
