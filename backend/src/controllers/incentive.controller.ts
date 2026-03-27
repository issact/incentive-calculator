import type { Request, Response } from "express"
import * as incentiveService from "../services/incentive.service.js"
import * as financeService from "../services/finance.service.js"
import { buildPaginationMeta, parseIncentiveListQuery } from "../utils/pagination.js"
import { sendError } from "../utils/errors.js"

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
        return sendError(res, err, { status: 500, message: "Failed to fetch incentives" })
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
        return sendError(res, err, { status: 500, message: "Failed to fetch review queue" })
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
        return sendError(res, err, { status: 500, message: "Failed to approve incentive" })
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
        return sendError(res, err, { status: 500, message: "Failed to hold incentive" })
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
        return sendError(res, err, { status: 500, message: "Failed to reopen incentive" })
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
        return sendError(res, err, { status: 500, message: "Failed to claim incentive" })
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
        return sendError(res, err, { status: 500, message: "Failed to mark incentive as paid" })
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
        return sendError(res, err, { status: 500, message: "Failed to fetch payment queue" })
    }
}

export async function getPaymentDetail(req: Request<{ id: string }>, res: Response) {
    try {

        const result = await financeService.getPaymentDetail(req.params.id)

        res.json(result)

    } catch (err: any) {
        return sendError(res, err, { status: 500, message: "Failed to fetch payment detail" })
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
        return sendError(res, err, { status: 500, message: "Failed to fetch incentive" })
    }
}
