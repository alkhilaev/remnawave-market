/*
  Warnings:

  - You are about to drop the column `basePrice` on the `vpn_plans` table. All the data in the column will be lost.
  - You are about to drop the column `durationDays` on the `vpn_plans` table. All the data in the column will be lost.
  - You are about to drop the column `extraDevicePrice` on the `vpn_plans` table. All the data in the column will be lost.
  - You are about to drop the column `extraTrafficPricePerGB` on the `vpn_plans` table. All the data in the column will be lost.
  - Added the required column `bypassTrafficLimitGB` to the `subscriptions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `durationDays` to the `subscriptions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `defaultBypassTrafficLimitGB` to the `vpn_plans` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN     "bypassTrafficLimitGB" INTEGER NOT NULL,
ADD COLUMN     "durationDays" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "vpn_plans" DROP COLUMN "basePrice",
DROP COLUMN "durationDays",
DROP COLUMN "extraDevicePrice",
DROP COLUMN "extraTrafficPricePerGB",
ADD COLUMN     "defaultBypassTrafficLimitGB" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "plan_periods" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "durationDays" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plan_periods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_extra_traffic" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "trafficGB" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plan_extra_traffic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_extra_bypass_traffic" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "bypassTrafficGB" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plan_extra_bypass_traffic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_extra_devices" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "deviceCount" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plan_extra_devices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "plan_periods_planId_durationDays_key" ON "plan_periods"("planId", "durationDays");

-- CreateIndex
CREATE UNIQUE INDEX "plan_extra_traffic_planId_trafficGB_key" ON "plan_extra_traffic"("planId", "trafficGB");

-- CreateIndex
CREATE UNIQUE INDEX "plan_extra_bypass_traffic_planId_bypassTrafficGB_key" ON "plan_extra_bypass_traffic"("planId", "bypassTrafficGB");

-- CreateIndex
CREATE UNIQUE INDEX "plan_extra_devices_planId_deviceCount_key" ON "plan_extra_devices"("planId", "deviceCount");

-- AddForeignKey
ALTER TABLE "plan_periods" ADD CONSTRAINT "plan_periods_planId_fkey" FOREIGN KEY ("planId") REFERENCES "vpn_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_extra_traffic" ADD CONSTRAINT "plan_extra_traffic_planId_fkey" FOREIGN KEY ("planId") REFERENCES "vpn_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_extra_bypass_traffic" ADD CONSTRAINT "plan_extra_bypass_traffic_planId_fkey" FOREIGN KEY ("planId") REFERENCES "vpn_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_extra_devices" ADD CONSTRAINT "plan_extra_devices_planId_fkey" FOREIGN KEY ("planId") REFERENCES "vpn_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;
