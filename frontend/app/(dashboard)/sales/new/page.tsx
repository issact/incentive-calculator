import SaleForm from "@/features/sales/SaleForm"

export default function CreateSalePage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto p-2">
      <div>
        <h1 className="text-xl font-semibold">Create Sale</h1>
        <p className="text-sm text-muted mt-1">
          Register a sale to generate incentives
        </p>
      </div>

      <div className="bg-surface border border-border rounded-xl p-6">
        <SaleForm />
      </div>

    </div>
  )
}