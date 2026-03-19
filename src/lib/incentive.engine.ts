import type {
    Prisma,
    IncentiveRule,
    IncentiveLevel
} from "../generated/prisma/client"

import { IncentiveLevel as IncentiveLevelEnum } from "../generated/prisma/client"

const LEVELS = Object.values(IncentiveLevelEnum) as IncentiveLevel[]

type ChainUser = {
    id: string
    managerId: string | null
}

async function getManagerChain(
    tx: Prisma.TransactionClient,
    userId: string
): Promise<ChainUser[]> {

    const chain: ChainUser[] = []

    let current: ChainUser | null = await tx.user.findUnique({
        where: { id: userId },
        select: { id: true, managerId: true }
    })

    if (!current) {
        throw new Error("Salesperson not found")
    }

    chain.push(current)

    while (current && current.managerId) {

        const manager: ChainUser | null = await tx.user.findUnique({
            where: { id: current.managerId },
            select: { id: true, managerId: true }
        })

        if (!manager) break

        chain.push(manager)

        current = manager
    }

    return chain
}

export async function generateIncentivesForSale(
    tx: Prisma.TransactionClient,
    saleId: string
) {

    const sale = await tx.sale.findUnique({
        where: { id: saleId },
        include: { createdBy: true }
    })

    if (!sale) {
        throw new Error("Sale not found")
    }

    const salesperson = sale.createdBy

    const chain = await getManagerChain(tx, salesperson.id)

    const existing = await tx.incentive.count({
        where: { saleId }
    })

    if (existing > 0) return

    const rules = await tx.incentiveRule.findMany({
        where: {
            isActive: true
        },
        orderBy: { level: "asc" }
    })

    const ruleMap = new Map<IncentiveLevel, IncentiveRule>()

    for (const rule of rules) {
        ruleMap.set(rule.level, rule)
    }

    const ruleLevels = new Set(rules.map(r => r.level))

    for (const level of LEVELS) {
        if (!ruleLevels.has(level)) {
            throw new Error(`Missing active ${level} rule`)
        }
    }

    const saleValue = Number(sale.saleValue.toString())

    const incentivesToCreate: Prisma.IncentiveCreateManyInput[] = []

    chain.slice(0, LEVELS.length).forEach((beneficiary, i) => {

        const level = LEVELS[i]
        if (!level) return

        let reviewer = chain[i + 1]

        // L4 self-review fallback
        if (!reviewer && level === "L4") {
            reviewer = beneficiary
        }

        if (!reviewer) return

        const rule = ruleMap.get(level)

        if (!rule) {
            console.warn(`Missing rule for level ${level}`)
            return
        }

        const percent = Number(rule.ratePercent)

        const baseAmount = saleValue * (percent / 100)

        incentivesToCreate.push({
            saleId: sale.id,

            level,

            beneficiaryUserId: beneficiary.id,
            submittedById: salesperson.id,
            reviewerUserId: reviewer.id,

            ruleId: rule.id,

            saleValue: sale.saleValue,
            rulePercent: rule.ratePercent,

            baseAmount: BigInt(Math.round(baseAmount)),
            finalAmount: BigInt(Math.round(baseAmount)),

            status: "PENDING_REVIEW"
        })

    })

    if (!incentivesToCreate.length) return

    for (const incentiveData of incentivesToCreate) {

        const created = await tx.incentive.create({
            data: incentiveData
        })

        await tx.incentiveEvent.create({
            data: {
                incentiveId: created.id,
                actorUserId: salesperson.id,
                toStatus: "PENDING_REVIEW",
                metadata: {
                    type: "INCENTIVE_CREATED"
                },
                reason: "Incentive created from sale"
            }
        })

    }

}