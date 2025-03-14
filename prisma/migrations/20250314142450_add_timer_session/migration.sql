-- CreateTable
CREATE TABLE "TimerSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "focusTime" INTEGER NOT NULL,
    "restTime" INTEGER NOT NULL,
    "timeLeft" INTEGER NOT NULL,
    "isRunning" BOOLEAN NOT NULL DEFAULT false,
    "isFocusMode" BOOLEAN NOT NULL DEFAULT true,
    "startTime" TIMESTAMP(3),

    CONSTRAINT "TimerSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TimerSession_userId_key" ON "TimerSession"("userId");

-- AddForeignKey
ALTER TABLE "TimerSession" ADD CONSTRAINT "TimerSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
