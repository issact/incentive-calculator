import { calculateScoreMultiplier } from "../../../utils/helpers"


export function calculateFinalAmount(base: number, input?: {
    performanceScores?: Record<string, number>
    manualOverrideAmount?: number
}) {
    const multiplier = calculateScoreMultiplier(input?.performanceScores)

    const adjusted = Math.floor(base * multiplier)

    const finalAmount =
        input?.manualOverrideAmount ?? adjusted

    return {
        multiplier,
        adjusted,
        finalAmount
    }
}