import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { prisma } from "./prisma"
import { admin } from "better-auth/plugins/admin"

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  user: {
    deleteUser: {
      enabled: true,
    },
  },
  plugins: [
    admin(),
  ],
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const adminCount = await prisma.user.count({
            where: { role: "admin" },
          })
          if (adminCount === 0) {
            return { data: { ...user, role: "admin" } }
          }

          const setting = await prisma.appSetting.findUnique({
            where: { key: "invite_only" },
          })

          if (setting?.value === "true" && user.email) {
            const consumption = await prisma.inviteConsumption.findUnique({
              where: { email: user.email },
            })
            if (!consumption) {
              return false
            }
            await prisma.inviteConsumption.delete({
              where: { id: consumption.id },
            })
          }

          return { data: user }
        },
      },
    },
  },
  advanced: {
    defaultCookieAttributes: {
      sameSite: "lax" as const,
      httpOnly: true,
    },
  },
  trustedOrigins: (request) => {
    if (!request) return []
    const origins: string[] = []

    const origin = request.headers.get("origin")
    if (origin) origins.push(origin)

    const host = request.headers.get("host")
    if (host) {
      origins.push(`http://${host}`)
      origins.push(`https://${host}`)
    }

    return origins
  },
})
