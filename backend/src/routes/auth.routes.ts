import { Router } from "express"
import { prisma } from "../lib/prisma.js"
import { comparePassword, generateToken } from "../lib/auth.js"
import { requireAuth } from "../middleware/auth.middleware.js"
import { sendError } from "../utils/errors.js"
import { loginSchema } from "../validations/auth.validation.js"

const router = Router()

router.post("/login", async (req, res) => {
    try {
        const { email: rawEmail, password } = loginSchema.parse(req.body)
        const email = rawEmail.trim().toLowerCase()

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

        const isProd = process.env.NODE_ENV === "production"
        const cookieDomain = process.env.COOKIE_DOMAIN?.trim()

        res.cookie("auth_token", token, {
            httpOnly: true,
            ...(cookieDomain ? { domain: cookieDomain } : {}),
            secure: isProd,
            sameSite: isProd ? "none" : "lax",
            path: "/",
            maxAge: 1000 * 60 * 60 * 24 * 7
        })

        res.json({
            message: "Login successful",
            token,
        })
    } catch (err) {
        return sendError(res, err, { status: 500, message: "Login failed" }, { forceFallbackMessageOn5xx: true })
    }
})


router.get("/me", requireAuth, async (req, res) => {

    try {
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
    } catch (err) {
        return sendError(res, err, { status: 500, message: "Failed to fetch user" }, { forceFallbackMessageOn5xx: true })
    }
})


router.post("/logout", (req, res) => {
    const isProd = process.env.NODE_ENV === "production"
    const cookieDomain = process.env.COOKIE_DOMAIN?.trim()

    res.clearCookie("auth_token", {
        httpOnly: true,
        ...(cookieDomain ? { domain: cookieDomain } : {}),
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
        path: "/",
    })

    res.json({ message: "Logged out" })
})

export default router
