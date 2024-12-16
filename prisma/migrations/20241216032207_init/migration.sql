/*
  Warnings:

  - You are about to drop the column `isGoogleDrive` on the `Resource` table. All the data in the column will be lost.
  - You are about to drop the column `mimeType` on the `Resource` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Workspace_userId_name_key";

-- AlterTable
ALTER TABLE "Resource" DROP COLUMN "isGoogleDrive",
DROP COLUMN "mimeType";
