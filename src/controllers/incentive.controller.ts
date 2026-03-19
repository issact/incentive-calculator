import type { Request, Response } from "express"
import * as incentiveService from "../services/incentive.service.js"
import * as financeService from "../services/finance.service.js"
import { buildPaginationMeta, parseIncentiveListQuery } from "../utils/pagination.js"

type IncentiveParams = {
    id: string
}

export async function getMyIncentives(req: Request, res: Response) {
    try {
        const query = parseIncentiveListQuery(req.query)
        const result = await incentiveService.getMyIncentives(req.user!.id, query)

        res.json({
            data: result.data,
            pagination: buildPaginationMeta(query.page, query.limit, result.total)
        })
    } catch (err: any) {
        console.error(err)
        const status = err?.message?.startsWith("Invalid") || err?.message?.includes("fromDate must be")
            ? 400
            : 500
        res.status(status).json({ message: err.message })
    }
}

export async function getReviewQueue(req: Request, res: Response) {
    try {
        const query = parseIncentiveListQuery(req.query)
        const result = await incentiveService.getReviewQueue(req.user!.id, query)

        res.json({
            data: result.data,
            pagination: buildPaginationMeta(query.page, query.limit, result.total)
        })
    } catch (err: any) {
        console.error(err)
        const status = err?.message?.startsWith("Invalid") || err?.message?.includes("fromDate must be")
            ? 400
            : 500
        res.status(status).json({ message: err.message })
    }
}

export async function approveIncentive(req: Request<IncentiveParams>, res: Response) {
    try {
        const result = await incentiveService.approveIncentive(
            req.params.id,
            req.user!.id,
            req.body
        )

        res.json(result)
    } catch (err: any) {
        console.error(err)
        res.status(500).json({ message: err.message })
    }
}

export async function holdIncentive(req: Request<IncentiveParams>, res: Response) {
    try {
        const { reason } = req.body

        const result = await incentiveService.holdIncentive(
            req.params.id,
            req.user!.id,
            reason
        )

        res.json(result)
    } catch (err: any) {
        console.error(err)
        res.status(500).json({ message: err.message })
    }
}

export async function reopenIncentive(req: Request<IncentiveParams>, res: Response) {
    try {
        const result = await incentiveService.reopenIncentive(
            req.params.id,
            req.user!.id
        )

        res.json(result)
    } catch (err: any) {
        console.error(err)
        res.status(500).json({ message: err.message })
    }
}


export async function claimIncentive(
    req: Request<IncentiveParams>,
    res: Response
) {
    try {

        const result = await incentiveService.claimIncentive(
            req.params.id,
            req.user!.id,
            req.body
        )

        res.json(result)

    } catch (err: any) {
        console.error(err)
        res.status(500).json({ message: err.message })
    }
}

export async function markPaid(
    req: Request<IncentiveParams>,
    res: Response
) {
    try {

        const result = await incentiveService.markPaid(
            req.params.id,
            req.user!.id
        )

        res.json(result)

    } catch (err: any) {
        console.error(err)
        res.status(500).json({ message: err.message })
    }
}

export async function getPaymentQueue(req: Request, res: Response) {
    try {

        const query = parseIncentiveListQuery(req.query)

        const result = await financeService.getPaymentQueue(query)

        res.json({
            data: result.data,
            pagination: buildPaginationMeta(query.page, query.limit, result.total)
        })

    } catch (err: any) {
        console.error(err)
        res.status(500).json({ message: err.message })
    }
}

export async function getPaymentDetail(req: Request<{ id: string }>, res: Response) {
    try {

        const result = await financeService.getPaymentDetail(req.params.id)

        res.json(result)

    } catch (err: any) {
        console.error(err)
        res.status(500).json({ message: err.message })
    }
}

export async function getIncentiveDetails(
    req: Request<IncentiveParams>,
    res: Response
) {
    try {

        const incentive = await incentiveService.getIncentiveDetails(
            req.params.id,
            req.user!.id
        )

        if (!incentive) {
            return res.status(404).json({
                message: "Incentive not found"
            })
        }

        res.json(incentive)

    } catch (err: any) {

        console.error(err)

        res.status(500).json({
            message: err.message || "Failed to fetch incentive"
        })

    }
}
