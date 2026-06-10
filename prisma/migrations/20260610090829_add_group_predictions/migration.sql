-- CreateTable
CREATE TABLE "GroupPrediction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "groupName" TEXT NOT NULL,
    "order" TEXT[],
    "points" INTEGER,
    "scoredAt" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GroupPrediction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GroupPrediction_userId_groupName_key" ON "GroupPrediction"("userId", "groupName");

-- AddForeignKey
ALTER TABLE "GroupPrediction" ADD CONSTRAINT "GroupPrediction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
