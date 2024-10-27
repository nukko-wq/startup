/*
  Warnings:

  - You are about to drop the column `created_at` on the `Resource` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `Resource` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `Resource` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Resource` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Resource` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Resource" DROP CONSTRAINT "Resource_user_id_fkey";

-- AlterTable
ALTER TABLE "Resource" DROP COLUMN "created_at",
DROP COLUMN "updated_at",
DROP COLUMN "user_id",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Resource" ADD CONSTRAINT "Resource_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
