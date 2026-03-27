import { prisma } from "../lib/prisma"
import type { Prisma } from "../generated/prisma/client"

type CreateRuleInput = Prisma.IncentiveRuleCreateInput

export async function createRule(data: CreateRuleInput) {

    const name = data.name?.trim() || `${data.level}-rule`

    if (Number(data.ratePercent) <= 0 || Number(data.ratePercent) > 100) {
        throw new Error("Rate percent must be between 0 and 100")
    }

    const effectiveFrom = new Date()
    effectiveFrom.setMilliseconds(0)


    return prisma.$transaction(async (tx) => {

        const effectiveFrom = new Date()
        effectiveFrom.setMilliseconds(0)

        const lastRule = await tx.incentiveRule.findFirst({
            where: { level: data.level },
            orderBy: { version: "desc" }
        })

        const nextVersion = (lastRule?.version ?? 0) + 1

        // deactivate previous active rule
        await tx.incentiveRule.updateMany({
            where: {
                level: data.level,
                isActive: true
            },
            data: {
                isActive: false,
                effectiveTo: new Date(effectiveFrom.getTime() - 1)
            }
        })

        const rule = await tx.incentiveRule.create({
            data: {
                name,
                level: data.level,
                ratePercent: data.ratePercent,
                ruleType: data.ruleType ?? "PERCENTAGE",
                effectiveFrom,
                version: nextVersion,
                isActive: true
            }
        })

        return rule
    })
}

export async function getRules() {
    return prisma.incentiveRule.findMany({
        orderBy: [
            { level: "asc" },
            { version: "desc" }
        ]
    })
}

export async function getActiveRules() {
    return prisma.incentiveRule.findMany({
        where: { isActive: true },
        orderBy: { level: "asc" }
    })
}