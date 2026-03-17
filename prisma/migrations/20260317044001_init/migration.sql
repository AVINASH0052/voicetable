-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "items" TEXT NOT NULL,
    "deliveryAddress" TEXT NOT NULL,
    "paymentMethod" TEXT NOT NULL DEFAULT 'COD',
    "estimatedDelivery" TEXT NOT NULL DEFAULT '',
    "totalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "specialInstructions" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Call" (
    "id" TEXT NOT NULL,
    "executionId" TEXT,
    "orderId" TEXT,
    "agentType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'queued',
    "duration" DOUBLE PRECISION,
    "transcript" TEXT,
    "extractedData" TEXT,
    "summary" TEXT,
    "cost" DOUBLE PRECISION,
    "recordingUrl" TEXT,
    "customerPhone" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Call_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL,
    "callId" TEXT NOT NULL,
    "orderId" TEXT,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "foodRating" INTEGER,
    "deliveryRating" INTEGER,
    "favoriteDish" TEXT,
    "complaints" TEXT,
    "wouldRecommend" BOOLEAN,
    "overallSentiment" TEXT,
    "verbatimFeedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "bolnaApiKey" TEXT NOT NULL DEFAULT '',
    "confirmationAgentId" TEXT NOT NULL DEFAULT '',
    "feedbackAgentId" TEXT NOT NULL DEFAULT '',
    "restaurantName" TEXT NOT NULL DEFAULT 'Spice Route Kitchen',
    "restaurantPhone" TEXT NOT NULL DEFAULT '',
    "webhookSecret" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderId_key" ON "Order"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "Call_executionId_key" ON "Call"("executionId");

-- AddForeignKey
ALTER TABLE "Call" ADD CONSTRAINT "Call_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
