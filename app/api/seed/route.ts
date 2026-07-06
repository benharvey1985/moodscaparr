import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { prisma } from "@/lib/prisma"

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
]

function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function pickRandomN<T>(arr: readonly T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, n)
}

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const count = await prisma.moodEntry.count({
    where: { userId: session.user.id },
  })

  return NextResponse.json({ seeded: count > 0, count })
}

export async function POST() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if ((session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const existingCount = await prisma.moodEntry.count({
    where: { userId: session.user.id },
  })
  if (existingCount > 0) {
    return NextResponse.json({ message: `Already seeded ${existingCount} entries`, count: existingCount })
  }

  const entries = []

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
      userId: session.user.id,
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

  await prisma.moodEntry.createMany({ data: entries })

  return NextResponse.json(
    { message: `Seeded ${entries.length} entries`, count: entries.length },
    { status: 201 }
  )
}

export async function DELETE() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if ((session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const result = await prisma.moodEntry.deleteMany({
    where: { userId: session.user.id },
  })

  return NextResponse.json({ message: `Cleared ${result.count} entries`, count: result.count })
}
