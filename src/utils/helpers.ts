// 3 = 1x baseline
// 5 = 1.4x max boost
// 1 = 0.6x max penalty

export function calculateScoreMultiplier(scores?: Record<string, number>) {

    if (!scores) return 1

    const values = Object.values(scores)
    if (values.length === 0) return 1

    const safeValues = values.map(v => Math.min(5, Math.max(1, v)))

    const sum = safeValues.reduce((a, b) => a + b, 0)
    const avg = sum / safeValues.length

    const multiplier = 1 + ((avg - 3) * 0.2)

    return Math.max(0.5, Math.min(1.5, multiplier))
}