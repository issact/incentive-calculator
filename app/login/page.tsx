import { redirect } from "next/navigation"
import { getSession } from "@/lib/getSession"
import LoginForm from "@/features/auth/LoginForm"

export default async function LoginPage() {

    const session = await getSession()

    if (session) {
        redirect("/dashboard")
    }

    return (
        <div className="flex h-screen items-center justify-center">
            <LoginForm />
        </div>
    )
}