/*
  Warnings:

  - Added the required column `position` to the `Resource` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Resource" ADD COLUMN     "position" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "Resource_position_idx" ON "Resource"("position");
