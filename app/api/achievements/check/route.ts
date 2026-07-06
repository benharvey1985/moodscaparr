import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { checkAndUnlockAchievements } from "@/lib/achievements"

export async function POST() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const newlyUnlocked = await checkAndUnlockAchievements(session.user.id)
  return NextResponse.json({ newlyUnlocked })
}
