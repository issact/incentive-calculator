import PayButton from "@/features/payment/PayButton"
import { formatCurrency } from "@/lib/format"
import { getPaymentDetailServer } from "@/services/payment.server"

export default async function PaymentDetailPage({
    params
}: {
    params: Promise<{ id: string }>
}) {

    const { id } = await params
    const inc = await getPaymentDetailServer(id)

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-6">

            {/* Header */}
            <div className="flex justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">
                        Payment Details
                    </h1>
                    <p className="text-sm text-muted mt-2">
                        Sale {inc.sale.saleCode}
                    </p>
                </div>
                <div className="flex items-center gap-3">

                    {/* Status */}
                    {inc.status === "PAID" ? (
                        <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-success-soft text-success text-sm font-medium">
                            <span>●</span>
                            Payment Completed
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-warning-soft text-warning text-sm font-medium">
                            <span>●</span>
                            Pending Payment
                        </div>
                    )}

                    {/* Action */}
                    {inc.status !== "PAID" && (
                        <PayButton id={id} />
                    )}

                </div>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-3 gap-4">

                <div className="p-4 border border-border bg-surface rounded-lg">
                    <p className="text-xs text-muted">Beneficiary</p>
                    <p className="font-medium">{inc.beneficiaryUser.name}</p>
                </div>

                <div className="p-4 border border-border bg-surface rounded-lg">
                    <p className="text-xs text-muted">Amount</p>
                    <p className="font-semibold text-primary">
                        {formatCurrency(inc.finalAmount)}
                    </p>
                </div>

                <div className="p-4 border border-border bg-surface rounded-lg">
                    <p className="text-xs text-muted">Requested</p>
                    <p>
                        {inc.claimRequestedAt
                            ? new Date(inc.claimRequestedAt).toLocaleDateString()
                            : "-"
                        }
                    </p>
                </div>

            </div>

            {/* Payment Info */}
            <div className="border border-border bg-surface rounded-lg p-5 space-y-3">

                <h2 className="text-sm font-semibold text-muted">
                    Payout Details
                </h2>

                {inc.upiId ? (
                    <div>
                        <p className="text-xs text-muted">UPI ID</p>
                        <p className="font-medium">{inc.upiId}</p>
                    </div>
                ) : (
                    <>
                        <div>
                            <p className="text-xs text-muted">Account Name</p>
                            <p className="font-medium">{inc.bankAccountName}</p>
                        </div>

                        <div>
                            <p className="text-xs text-muted">Account Number</p>
                            <p className="font-medium">{inc.bankAccountNumber}</p>
                        </div>

                        <div>
                            <p className="text-xs text-muted">IFSC</p>
                            <p className="font-medium">{inc.bankIfscCode}</p>
                        </div>
                    </>
                )}

            </div>

        </div>
    )
}