"use client"

import { login } from "@/services/auth.api"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { loginSchema, type LoginFormInput, type LoginFormValues } from "./login.schema"
import { useMutation } from "@tanstack/react-query"
import { getErrorMessage } from "@/lib/getErrorMessage"
import { useToast } from "@/providers/ToastProvider"

export default function LoginForm() {

    const router = useRouter()
    const { toast } = useToast()

    const form = useForm<LoginFormInput, unknown, LoginFormValues>({
        resolver: zodResolver(loginSchema),
        mode: "onChange",
        defaultValues: {
            email: "",
            password: ""
        }
    })

    const mutation = useMutation({
        mutationFn: (values: LoginFormValues) => login(values.email, values.password),
        onSuccess: () => {
            toast({ title: "Welcome back", variant: "success" })
            router.push("/dashboard")
            router.refresh()
        },
        onError: (err) => {
            toast({
                title: "Login failed",
                description: getErrorMessage(err, "Invalid credentials"),
                variant: "error"
            })
        },
    })

    function onSubmit(values: LoginFormValues) {
        mutation.mutate(values)
    }

    return (
        <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-85 space-y-4 rounded-lg border border-border bg-surface p-6"
        >

            <h1 className="text-xl font-semibold">Login</h1>

            <div className="space-y-1">
                <input
                    className="w-full"
                    placeholder="Email"
                    autoComplete="email"
                    {...form.register("email")}
                />
                {form.formState.errors.email && (
                    <p className="text-xs text-danger">
                        {form.formState.errors.email.message}
                    </p>
                )}
            </div>

            <div className="space-y-1">
                <input
                    type="password"
                    className="w-full"
                    placeholder="Password"
                    autoComplete="current-password"
                    {...form.register("password")}
                />
                {form.formState.errors.password && (
                    <p className="text-xs text-danger">
                        {form.formState.errors.password.message}
                    </p>
                )}
            </div>

            {/* {mutation.isError && (
                <p className="text-sm text-danger">
                    {getErrorMessage(mutation.error, "Invalid credentials")}
                </p>
            )} */}

            <button
                type="submit"
                disabled={mutation.isPending || !form.formState.isValid}
                className="w-full border border-border bg-foreground p-2 text-background hover:opacity-95"
            >
                {mutation.isPending ? "Logging in..." : "Login"}
            </button>

        </form>
    )
}
