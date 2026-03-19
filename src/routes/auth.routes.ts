import { Router } from "express"
import { prisma } from "../lib/prisma.js"
import { comparePassword, generateToken } from "../lib/auth.js"
import { requireAuth } from "../middleware/auth.middleware.js"

const router = Router()

router.post("/login", async (req, res) => {
    const { email, password } = req.body

    const user = await prisma.user.findUnique({
        where: { email }
    })

    if (!user) {
        return res.status(401).json({ message: "Invalid credentials" })
    }

    if (!user.isActive) {
        return res.status(403).json({ message: "Account disabled" })
    }

    const valid = await comparePassword(password, user.password)

    if (!valid) {
        return res.status(401).json({ message: "Invalid credentials" })
    }

    const token = generateToken({
        id: user.id,
        role: user.role
    })

    res.cookie("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 1000 * 60 * 60 * 24 * 7
    })

    res.json({
        message: "Login successful"
    })
})


router.get("/me", requireAuth, async (req, res) => {

    const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            avatarUrl: true,
            manager: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            },
            isActive: true,
            createdAt: true
        }
    })

    if (!user) {
        return res.status(404).json({ message: "User not found" })
    }

    if (!user.isActive) {
        return res.status(403).json({ message: "Account disabled" })
    }

    res.json(user)
})


router.post("/logout", (req, res) => {
    res.clearCookie("auth_token", {
        path: "/"
    })
    res.json({ message: "Logged out" })
})

export default router