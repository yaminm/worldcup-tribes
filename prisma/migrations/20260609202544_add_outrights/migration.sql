-- CreateEnum
CREATE TYPE "OutrightType" AS ENUM ('TEAM', 'TEXT');

-- CreateTable
CREATE TABLE "Outright" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "type" "OutrightType" NOT NULL DEFAULT 'TEAM',
    "points" INTEGER NOT NULL DEFAULT 20,
    "correctAnswer" TEXT,
    "lockAt" TIMESTAMP(3) NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Outright_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OutrightPrediction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "outrightId" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "points" INTEGER,
    "scoredAt" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OutrightPrediction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Outright_key_key" ON "Outright"("key");

-- CreateIndex
CREATE INDEX "OutrightPrediction_outrightId_idx" ON "OutrightPrediction"("outrightId");

-- CreateIndex
CREATE UNIQUE INDEX "OutrightPrediction_userId_outrightId_key" ON "OutrightPrediction"("userId", "outrightId");

-- AddForeignKey
ALTER TABLE "OutrightPrediction" ADD CONSTRAINT "OutrightPrediction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutrightPrediction" ADD CONSTRAINT "OutrightPrediction_outrightId_fkey" FOREIGN KEY ("outrightId") REFERENCES "Outright"("id") ON DELETE CASCADE ON UPDATE CASCADE;
