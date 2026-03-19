import { IncentiveLevel, IncentiveStatus, UserRole } from "../generated/prisma/client"
import { prisma } from "../lib/prisma.js"
import { sendEmail } from "../lib/email.js"

function money(value: bigint | number) {
    const num = typeof value === "bigint" ? Number(value) : value
    if (Number.isNaN(num)) return String(value)
    return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(num)
}

function appUrl() {
    return process.env.APP_BASE_URL?.trim() || ""
}

export async function notifyReviewersIncentivesCreatedForSale(saleId: string) {
    // Only notify the first reviewer (L1 incentive reviewer).
    const inc = await prisma.incentive.findFirst({
        where: {
            saleId,
            level: IncentiveLevel.L1,
            status: IncentiveStatus.PENDING_REVIEW
        },
        include: {
            sale: { select: { saleCode: true, projectName: true } },
            reviewer: { select: { email: true, name: true, isActive: true } },
            beneficiaryUser: { select: { name: true } }
        }
    })

    if (!inc || !inc.reviewer?.isActive) return

    const subject = `New incentive pending review (${inc.sale.saleCode})`
    const link = appUrl() ? `${appUrl()}/incentives/${inc.id}` : ""
    const text = [
        `Hi ${inc.reviewer.name},`,
        ``,
        `A new incentive is ready for your review.`,
        ``,
        `Sale: ${inc.sale.saleCode} (${inc.sale.projectName})`,
        `Level: ${inc.level}`,
        `Beneficiary: ${inc.beneficiaryUser.name}`,
        `Base amount: ${money(inc.baseAmount)}`,
        ``,
        ...(link ? [`Open: ${link}`, ``] : []),
        `— Incentive System`
    ].join("\n")

    await sendEmail({
        to: [{ email: inc.reviewer.email, name: inc.reviewer.name }],
        subject,
        text
    })
}

function nextLevelOf(level: IncentiveLevel): IncentiveLevel | null {
    switch (level) {
        case IncentiveLevel.L1:
            return IncentiveLevel.L2
        case IncentiveLevel.L2:
            return IncentiveLevel.L3
        case IncentiveLevel.L3:
            return IncentiveLevel.L4
        case IncentiveLevel.L4:
            return null
        default:
            return null
    }
}

export async function notifyNextReviewerAfterApproval(saleId: string, approvedLevel: IncentiveLevel) {
    const nextLevel = nextLevelOf(approvedLevel)
    if (!nextLevel) return

    const inc = await prisma.incentive.findFirst({
        where: {
            saleId,
            level: nextLevel,
            status: IncentiveStatus.PENDING_REVIEW
        },
        include: {
            sale: { select: { saleCode: true, projectName: true } },
            reviewer: { select: { email: true, name: true, isActive: true } },
            beneficiaryUser: { select: { name: true } }
        }
    })

    if (!inc || !inc.reviewer?.isActive) return

    const subject = `Incentive pending review (${inc.sale.saleCode})`
    const link = appUrl() ? `${appUrl()}/incentives/${inc.id}` : ""
    const text = [
        `Hi ${inc.reviewer.name},`,
        ``,
        `An incentive is now ready for your review.`,
        ``,
        `Sale: ${inc.sale.saleCode} (${inc.sale.projectName})`,
        `Level: ${inc.level}`,
        `Beneficiary: ${inc.beneficiaryUser.name}`,
        `Base amount: ${money(inc.baseAmount)}`,
        ``,
        ...(link ? [`Open: ${link}`, ``] : []),
        `— Incentive System`
    ].join("\n")

    await sendEmail({
        to: [{ email: inc.reviewer.email, name: inc.reviewer.name }],
        subject,
        text
    })
}

export async function notifyBeneficiaryIncentiveApproved(incentiveId: string) {
    const inc = await prisma.incentive.findUnique({
        where: { id: incentiveId },
        include: {
            sale: { select: { saleCode: true, projectName: true } },
            beneficiaryUser: { select: { email: true, name: true, isActive: true } }
        }
    })
    if (!inc || !inc.beneficiaryUser.isActive) return

    const subject = `Incentive approved (${inc.sale.saleCode})`
    const link = appUrl() ? `${appUrl()}/incentives/${inc.id}` : ""
    const text = [
        `Hi ${inc.beneficiaryUser.name},`,
        ``,
        `Your incentive has been approved.`,
        ``,
        `Sale: ${inc.sale.saleCode} (${inc.sale.projectName})`,
        `Level: ${inc.level}`,
        `Final amount: ${money(inc.finalAmount)}`,
        ``,
        ...(link ? [`Open: ${link}`, ``] : []),
        `— Incentive System`
    ].join("\n")

    await sendEmail({
        to: [{ email: inc.beneficiaryUser.email, name: inc.beneficiaryUser.name }],
        subject,
        text
    })
}

export async function notifyBeneficiaryIncentiveHeld(incentiveId: string) {
    const inc = await prisma.incentive.findUnique({
        where: { id: incentiveId },
        include: {
            sale: { select: { saleCode: true, projectName: true } },
            beneficiaryUser: { select: { email: true, name: true, isActive: true } }
        }
    })
    if (!inc || !inc.beneficiaryUser.isActive) return

    const subject = `Incentive on hold (${inc.sale.saleCode})`
    const link = appUrl() ? `${appUrl()}/incentives/${inc.id}` : ""
    const text = [
        `Hi ${inc.beneficiaryUser.name},`,
        ``,
        `Your incentive has been placed on hold.`,
        ``,
        `Sale: ${inc.sale.saleCode} (${inc.sale.projectName})`,
        `Level: ${inc.level}`,
        ...(inc.holdReason ? [`Reason: ${inc.holdReason}`] : []),
        ``,
        ...(link ? [`Open: ${link}`, ``] : []),
        `— Incentive System`
    ].join("\n")

    await sendEmail({
        to: [{ email: inc.beneficiaryUser.email, name: inc.beneficiaryUser.name }],
        subject,
        text
    })
}

export async function notifyBeneficiaryIncentiveReopened(incentiveId: string) {
    const inc = await prisma.incentive.findUnique({
        where: { id: incentiveId },
        include: {
            sale: { select: { saleCode: true, projectName: true } },
            beneficiaryUser: { select: { email: true, name: true, isActive: true } }
        }
    })
    if (!inc || !inc.beneficiaryUser.isActive) return

    const subject = `Incentive reopened for review (${inc.sale.saleCode})`
    const link = appUrl() ? `${appUrl()}/incentives/${inc.id}` : ""
    const text = [
        `Hi ${inc.beneficiaryUser.name},`,
        ``,
        `Your incentive has been reopened and is back in review.`,
        ``,
        `Sale: ${inc.sale.saleCode} (${inc.sale.projectName})`,
        `Level: ${inc.level}`,
        ``,
        ...(link ? [`Open: ${link}`, ``] : []),
        `— Incentive System`
    ].join("\n")

    await sendEmail({
        to: [{ email: inc.beneficiaryUser.email, name: inc.beneficiaryUser.name }],
        subject,
        text
    })
}

export async function notifyFinanceClaimRequested(incentiveId: string) {
    const inc = await prisma.incentive.findUnique({
        where: { id: incentiveId },
        include: {
            sale: { select: { saleCode: true, projectName: true } },
            beneficiaryUser: { select: { name: true } }
        }
    })
    if (!inc) return

    const financeUsers = await prisma.user.findMany({
        where: { role: UserRole.OWNER_FINANCE, isActive: true },
        select: { email: true, name: true }
    })
    if (!financeUsers.length) return

    const subject = `Claim requested (${inc.sale.saleCode})`
    const link = appUrl() ? `${appUrl()}/incentives/${inc.id}` : ""
    const text = [
        `Hi Finance Team,`,
        ``,
        `A beneficiary requested a claim.`,
        ``,
        `Sale: ${inc.sale.saleCode} (${inc.sale.projectName})`,
        `Level: ${inc.level}`,
        `Beneficiary: ${inc.beneficiaryUser.name}`,
        `Final amount: ${money(inc.finalAmount)}`,
        ``,
        ...(link ? [`Open: ${link}`, ``] : []),
        `— Incentive System`
    ].join("\n")

    await sendEmail({
        to: financeUsers,
        subject,
        text
    })
}

export async function notifyBeneficiaryPaid(incentiveId: string) {
    const inc = await prisma.incentive.findUnique({
        where: { id: incentiveId },
        include: {
            sale: { select: { saleCode: true, projectName: true } },
            beneficiaryUser: { select: { email: true, name: true, isActive: true } }
        }
    })
    if (!inc || !inc.beneficiaryUser.isActive) return

    const subject = `Incentive paid (${inc.sale.saleCode})`
    const link = appUrl() ? `${appUrl()}/incentives/${inc.id}` : ""
    const text = [
        `Hi ${inc.beneficiaryUser.name},`,
        ``,
        `Your incentive payment is marked as completed.`,
        ``,
        `Sale: ${inc.sale.saleCode} (${inc.sale.projectName})`,
        `Level: ${inc.level}`,
        `Amount: ${money(inc.finalAmount)}`,
        ``,
        ...(link ? [`Open: ${link}`, ``] : []),
        `— Incentive System`
    ].join("\n")

    await sendEmail({
        to: [{ email: inc.beneficiaryUser.email, name: inc.beneficiaryUser.name }],
        subject,
        text
    })
}
