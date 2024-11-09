-- DropIndex
DROP INDEX "Workspace_userId_order_key";

-- AlterTable
ALTER TABLE "Space" ADD COLUMN     "isLastActive" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Workspace_userId_order_idx" ON "Workspace"("userId", "order");
