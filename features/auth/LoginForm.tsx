"use client"

import { useState } from "react"
import { login } from "@/services/auth.api"
import { useRouter } from "next/navigation"

export default function LoginForm() {

    const router = useRouter()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    async function handleSubmit(e: React.SubmitEvent) {
        e.preventDefault()

        setLoading(true)
        setError("")

        try {

            await login(email, password)

            router.push("/dashboard")
            router.refresh()

        } catch (err: unknown) {
            console.error(err)
            setError("Invalid credentials")

        } finally {
            setLoading(false)
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="w-85 space-y-4 rounded-lg border border-border bg-card p-6"
        >

            <h1 className="text-xl font-semibold">Login</h1>

            <input
                className="w-full"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />

            <input
                type="password"
                className="w-full"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />

            {error && (
                <p className="text-sm text-red-500">{error}</p>
            )}

            <button
                disabled={loading}
                className="w-full border border-border bg-foreground p-2 text-background hover:opacity-95"
            >
                {loading ? "Logging in..." : "Login"}
            </button>

        </form>
    )
}
