-- CreateTable
CREATE TABLE "public"."faucet_requests" (
    "id" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "amount" BIGINT NOT NULL,
    "txHash" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "errorMessage" TEXT,

    CONSTRAINT "faucet_requests_pkey" PRIMARY KEY ("id")
);
