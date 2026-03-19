import "dotenv/config"
import { sendEmail } from "../src/lib/email"

const toArg = process.argv[2]
const to = (toArg || process.env.EMAIL_TEST_TO || "").trim()

if (!to) {
    console.error("Usage: npm run email:test -- you@example.com")
    console.error("Or set EMAIL_TEST_TO in .env")
    process.exit(1)
}

async function main() {
    const result = await sendEmail({
        to: [{ email: to }],
        subject: "Test email from incentive-calc-back",
        text: "If you received this, Brevo sending is working."
    })

    console.log(result)
}

main().catch((err) => {
    console.error(err)
    process.exit(1)
})

