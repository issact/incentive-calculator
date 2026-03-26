import "dotenv/config"
import bcrypt from "bcrypt"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../src/generated/prisma/client"

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) throw new Error("DATABASE_URL is required")

const adminEmail = process.env.ADMIN_EMAIL ?? "admin@email.com"
const adminPassword = process.env.ADMIN_PASSWORD ?? "admin123"
const adminName = process.env.ADMIN_NAME ?? "Admin"

if (!adminEmail) throw new Error("ADMIN_EMAIL is required")
if (!adminPassword) throw new Error("ADMIN_PASSWORD is required")

const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: databaseUrl }),
})

async function main() {
    const email = adminEmail.trim().toLowerCase()
    const passwordHash = await bcrypt.hash(adminPassword, 10)

    const existingAdmin = await prisma.user.findFirst({
        where: { role: "ADMIN" }
    })

    if (existingAdmin) {
        console.log("Admin already exists, skipping seed")
        return
    }

    await prisma.user.upsert({
        where: { email },
        update: {
            name: adminName,
            password: passwordHash,
            role: "ADMIN",
            isActive: true,
        },
        create: {
            name: adminName,
            email,
            password: passwordHash,
            role: "ADMIN",
            isActive: true,
        },
    })

    console.log(`Seeded admin: ${email}`)
}

main()
    .then(() => prisma.$disconnect())
    .catch(async (err) => {
        console.error(err)
        await prisma.$disconnect()
        process.exit(1)
    })
