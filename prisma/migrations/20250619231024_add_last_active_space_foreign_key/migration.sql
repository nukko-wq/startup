-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_lastActiveSpaceId_fkey" FOREIGN KEY ("lastActiveSpaceId") REFERENCES "Space"("id") ON DELETE SET NULL ON UPDATE CASCADE;
