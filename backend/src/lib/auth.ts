import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import type { AuthUser } from "../types/auth.types"

const JWT_SECRET = process.env.JWT_SECRET!

export async function hashPassword(password: string) {
    return bcrypt.hash(password, 10)
}

export async function comparePassword(password: string, hash: string) {
    return bcrypt.compare(password, hash)
}

export function generateToken(payload: object) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" })
}

export function verifyToken(token: string): AuthUser {
    return jwt.verify(token, JWT_SECRET) as AuthUser
}