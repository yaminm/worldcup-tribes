-- AlterTable
ALTER TABLE "User" ADD COLUMN     "botStrategy" TEXT,
ADD COLUMN     "isBot" BOOLEAN NOT NULL DEFAULT false;
