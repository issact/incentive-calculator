import type { Request, Response } from "express"
import * as reportService from "../services/report.service.js"
import { buildPaginationMeta, parseIncentiveListQuery } from "../utils/pagination.js"
import { sendError } from "../utils/errors.js"

export async function getIncentiveReport(req: Request, res: Response) {
    try {
        const query = parseIncentiveListQuery(req.query)
        const report = await reportService.getIncentiveReport(req.user!, query)

        res.json({
            data: report.data,
            pagination: buildPaginationMeta(query.page, query.limit, report.total)
        })
    } catch (err: any) {
        return sendError(res, err, { status: 500, message: "Failed to fetch report" })
    }
}

export async function getDashboardStats(req: Request, res: Response) {

    try {

        const stats = await reportService.getDashboardStats(req.user!.id)

        res.json(stats)

    } catch (err: any) {
        return sendError(
            res,
            err,
            { status: 500, message: "Failed to fetch dashboard stats" },
            { forceFallbackMessageOn5xx: true }
        )
    }

}
