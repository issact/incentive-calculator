type EmailRecipient = {
    email: string
    name?: string
}

type SendEmailInput = {
    to: EmailRecipient[]
    subject: string
    text: string
}

function env(key: string) {
    return process.env[key]?.trim() || ""
}

function isValidEmail(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export async function sendEmail(input: SendEmailInput): Promise<{ sent: boolean; skipped: boolean }> {
    const apiKey = env("BREVO_API_KEY")
    const fromEmail = env("EMAIL_FROM")
    const fromName = env("EMAIL_FROM_NAME") || "Incentive System"
    const sandbox = ["1", "true", "yes", "on"].includes(env("BREVO_SANDBOX").toLowerCase())

    const to = input.to.filter(r => isValidEmail(r.email))
    if (!to.length) return { sent: false, skipped: true }

    // No provider config => no-op (do not break business logic).
    if (!apiKey || !fromEmail || !isValidEmail(fromEmail)) {
        console.warn("[email] Skipping send (missing/invalid BREVO_API_KEY or EMAIL_FROM)")
        return { sent: false, skipped: true }
    }

    const payload: any = {
        sender: { email: fromEmail, name: fromName },
        to: to.map(r => ({ email: r.email, ...(r.name ? { name: r.name } : {}) })),
        subject: input.subject,
        textContent: input.text
    }

    try {
        const res = await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
                "accept": "application/json",
                "content-type": "application/json",
                "api-key": apiKey,
                ...(sandbox ? { "X-Sib-Sandbox": "drop" } : {})
            },
            body: JSON.stringify(payload)
        })

        if (!res.ok) {
            const body = await res.text().catch(() => "")
            console.error("[email] Brevo send failed", res.status, body)
            return { sent: false, skipped: false }
        }

        return { sent: true, skipped: false }
    } catch (err) {
        console.error("[email] Send error", err)
        return { sent: false, skipped: false }
    }
}
