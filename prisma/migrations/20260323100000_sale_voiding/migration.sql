-- Add soft-voiding to Sale (archive semantics)

ALTER TABLE "Sale"
ADD COLUMN     "voidedAt" TIMESTAMP(3),
ADD COLUMN     "voidedById" TEXT,
ADD COLUMN     "voidReason" TEXT;

CREATE INDEX "Sale_voidedAt_idx" ON "Sale"("voidedAt");

ALTER TABLE "Sale"
ADD CONSTRAINT "Sale_voidedById_fkey"
FOREIGN KEY ("voidedById") REFERENCES "User"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

