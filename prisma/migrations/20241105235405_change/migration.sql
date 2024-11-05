/*
  Warnings:

  - A unique constraint covering the columns `[userId,order]` on the table `Workspace` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Workspace_userId_isDefault_key";

-- CreateIndex
CREATE UNIQUE INDEX "Workspace_userId_order_key" ON "Workspace"("userId", "order");
