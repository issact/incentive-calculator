import { prisma } from "../lib/prisma.js"
import type { Prisma } from "../generated/prisma/client"
import type { IncentiveListQuery, SortOrder } from "../utils/pagination"

function buildIncentiveOrderBy(sortBy: string | undefined, sortOrder: SortOrder) {
  switch (sortBy) {
    case "createdAt":
      return { createdAt: sortOrder } satisfies Prisma.IncentiveOrderByWithRelationInput
    case "updatedAt":
      return { updatedAt: sortOrder } satisfies Prisma.IncentiveOrderByWithRelationInput
    case "saleDate":
      return { sale: { saleDate: sortOrder } } satisfies Prisma.IncentiveOrderByWithRelationInput
    case "projectName":
      return { sale: { projectName: sortOrder } } satisfies Prisma.IncentiveOrderByWithRelationInput
    default:
      return { createdAt: "desc" } satisfies Prisma.IncentiveOrderByWithRelationInput
  }
}

function buildWhere(query: IncentiveListQuery) {
  const and: Prisma.IncentiveWhereInput[] = []

  if (query.status) and.push({ status: query.status })
  if (query.level) and.push({ level: query.level })

  if (query.projectName) {
    and.push({
      sale: {
        projectName: {
          contains: query.projectName,
          mode: "insensitive"
        }
      }
    })
  }

  if (query.fromDate || query.toDate) {
    and.push({
      createdAt: {
        ...(query.fromDate ? { gte: query.fromDate } : {}),
        ...(query.toDate ? { lte: query.toDate } : {})
      }
    })
  }

  if (query.search) {
    and.push({
      OR: [
        {
          sale: {
            projectName: {
              contains: query.search,
              mode: "insensitive"
            }
          }
        },
        {
          sale: {
            customerName: {
              contains: query.search,
              mode: "insensitive"
            }
          }
        }
      ]
    })
  }

  return and.length
    ? ({ AND: and } satisfies Prisma.IncentiveWhereInput)
    : ({} satisfies Prisma.IncentiveWhereInput)
}

export async function getIncentiveReport(
  user: { id: string; role: string },
  query: IncentiveListQuery
) {
  const baseWhere = buildWhere(query)

  // 🔐 Always restrict to current user (your requirement)
  const where: Prisma.IncentiveWhereInput = {
    AND: [
      baseWhere,
      { beneficiaryUserId: user.id },
      {
        status: {
          in: ["CLAIMABLE", "CLAIM_REQUESTED", "PAID"]
        }
      }
    ]
  }

  const skip = (query.page - 1) * query.limit
  const take = query.limit
  const orderBy = buildIncentiveOrderBy(query.sortBy, query.sortOrder)

  const [data, total] = await prisma.$transaction([
    prisma.incentive.findMany({
      where,
      include: {
        sale: true,
        beneficiaryUser: true,
        reviewer: true,
      },
      skip,
      take,
      orderBy
    }),
    prisma.incentive.count({ where })
  ])

  return { data, total }
}

export async function getDashboardStats(userId: string) {
  const [totalEarned, claimable, pendingReview, paid] =
    await prisma.$transaction([

      prisma.incentive.aggregate({
        where: { beneficiaryUserId: userId },
        _sum: { finalAmount: true }
      }),

      prisma.incentive.aggregate({
        where: {
          beneficiaryUserId: userId,
          status: "CLAIMABLE"
        },
        _sum: { finalAmount: true }
      }),

      prisma.incentive.aggregate({
        where: {
          beneficiaryUserId: userId,
          status: "PENDING_REVIEW"
        },
        _sum: { finalAmount: true }
      }),

      prisma.incentive.aggregate({
        where: {
          beneficiaryUserId: userId,
          status: "PAID"
        },
        _sum: { finalAmount: true }
      })

    ])

  return {
    totalEarned: Number(totalEarned._sum.finalAmount ?? 0),
    claimable: Number(claimable._sum.finalAmount ?? 0),
    pendingReview: Number(pendingReview._sum.finalAmount ?? 0),
    paid: Number(paid._sum.finalAmount ?? 0)
  }
}