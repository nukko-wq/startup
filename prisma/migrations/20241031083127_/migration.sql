-- AlterTable
ALTER TABLE "Resource" ADD COLUMN     "driveFileId" TEXT,
ADD COLUMN     "isGoogleDrive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "mimeType" TEXT;
