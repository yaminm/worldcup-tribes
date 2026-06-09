-- CreateTable
CREATE TABLE "AdvancementPick" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "pickedSide" "Side" NOT NULL,
    "points" INTEGER,
    "scoredAt" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdvancementPick_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AdvancementPick_matchId_idx" ON "AdvancementPick"("matchId");

-- CreateIndex
CREATE UNIQUE INDEX "AdvancementPick_userId_matchId_key" ON "AdvancementPick"("userId", "matchId");

-- AddForeignKey
ALTER TABLE "AdvancementPick" ADD CONSTRAINT "AdvancementPick_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdvancementPick" ADD CONSTRAINT "AdvancementPick_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;
