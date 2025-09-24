-- CreateTable
CREATE TABLE "stock_prices" (
    "id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "change" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "changePct" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_prices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historical_data" (
    "id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "open" DECIMAL(10,2) NOT NULL,
    "high" DECIMAL(10,2) NOT NULL,
    "low" DECIMAL(10,2) NOT NULL,
    "close" DECIMAL(10,2) NOT NULL,
    "volume" INTEGER NOT NULL,

    CONSTRAINT "historical_data_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "stock_prices_symbol_timestamp_idx" ON "stock_prices"("symbol", "timestamp");

-- CreateIndex
CREATE INDEX "historical_data_symbol_idx" ON "historical_data"("symbol");

-- CreateIndex
CREATE UNIQUE INDEX "historical_data_symbol_date_key" ON "historical_data"("symbol", "date");
