import { PrismaClient } from "../prisma/generated/prisma"

const prisma = new PrismaClient()

async function main() {
  const existing = await prisma.user.findMany({ where: { role: "user" } })
  console.log(`Existing users with role "user": ${existing.length}`)

  const dummyUsers = [
    { name: "Alice Johnson", email: "alice@example.com" },
    { name: "Bob Smith", email: "bob@example.com" },
  ]

  for (const u of dummyUsers) {
    const exists = await prisma.user.findUnique({ where: { email: u.email } })
    if (exists) {
      console.log(`  Skipped ${u.email} — already exists (id=${exists.id})`)
    } else {
      const created = await prisma.user.create({
        data: {
          name: u.name,
          email: u.email,
          role: "user",
        },
      })
      console.log(`  Created ${created.email} (id=${created.id})`)
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
