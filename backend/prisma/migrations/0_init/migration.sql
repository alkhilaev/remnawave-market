-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'SUSPENDED', 'CANCELED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PROCESSING', 'SUCCEEDED', 'CANCELED', 'FAILED');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('DEPOSIT', 'SUBSCRIPTION_PURCHASE', 'SUBSCRIPTION_RENEWAL');

-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('YOOKASSA', 'BALANCE');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT,
    "password" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "balance" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "is_email_verified" BOOLEAN NOT NULL DEFAULT false,
    "email_verification_token" TEXT,
    "telegram_id" TEXT,
    "telegram_username" TEXT,
    "telegram_first_name" TEXT,
    "telegram_last_name" TEXT,
    "refresh_token" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT now(),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vpn_plans" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "default_traffic_limit_gb" INTEGER NOT NULL,
    "default_bypass_traffic_limit_gb" INTEGER NOT NULL,
    "default_device_limit" INTEGER NOT NULL,
    "bypass_traffic_enabled" BOOLEAN NOT NULL DEFAULT true,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT now(),

    CONSTRAINT "vpn_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_periods" (
    "id" UUID NOT NULL,
    "plan_id" UUID NOT NULL,
    "duration_days" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT now(),

    CONSTRAINT "plan_periods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_extra_traffic" (
    "id" UUID NOT NULL,
    "plan_id" UUID NOT NULL,
    "traffic_gb" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT now(),

    CONSTRAINT "plan_extra_traffic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_extra_bypass_traffic" (
    "id" UUID NOT NULL,
    "plan_id" UUID NOT NULL,
    "bypass_traffic_gb" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT now(),

    CONSTRAINT "plan_extra_bypass_traffic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_extra_devices" (
    "id" UUID NOT NULL,
    "plan_id" UUID NOT NULL,
    "device_count" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT now(),

    CONSTRAINT "plan_extra_devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "plan_id" UUID NOT NULL,
    "remnawave_key_id" TEXT,
    "remnawave_username" TEXT,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "traffic_limit_gb" INTEGER NOT NULL,
    "bypass_traffic_limit_gb" INTEGER NOT NULL,
    "device_limit" INTEGER NOT NULL,
    "duration_days" INTEGER NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "expiry_date" TIMESTAMP(3) NOT NULL,
    "auto_renewal" BOOLEAN NOT NULL DEFAULT false,
    "auto_renewal_payment_method_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT now(),

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "type" "PaymentType" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "provider" "PaymentProvider" NOT NULL,
    "provider_payment_id" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT now(),

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_telegram_id_key" ON "users"("telegram_id");

-- CreateIndex
CREATE UNIQUE INDEX "plan_periods_plan_id_duration_days_key" ON "plan_periods"("plan_id", "duration_days");

-- CreateIndex
CREATE UNIQUE INDEX "plan_extra_traffic_plan_id_traffic_gb_key" ON "plan_extra_traffic"("plan_id", "traffic_gb");

-- CreateIndex
CREATE UNIQUE INDEX "plan_extra_bypass_traffic_plan_id_bypass_traffic_gb_key" ON "plan_extra_bypass_traffic"("plan_id", "bypass_traffic_gb");

-- CreateIndex
CREATE UNIQUE INDEX "plan_extra_devices_plan_id_device_count_key" ON "plan_extra_devices"("plan_id", "device_count");

-- CreateIndex
CREATE INDEX "subscriptions_user_id_idx" ON "subscriptions"("user_id");

-- CreateIndex
CREATE INDEX "subscriptions_status_idx" ON "subscriptions"("status");

-- CreateIndex
CREATE INDEX "subscriptions_expiry_date_idx" ON "subscriptions"("expiry_date");

-- CreateIndex
CREATE INDEX "payments_user_id_idx" ON "payments"("user_id");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- CreateIndex
CREATE INDEX "payments_provider_payment_id_idx" ON "payments"("provider_payment_id");

-- AddForeignKey
ALTER TABLE "plan_periods" ADD CONSTRAINT "plan_periods_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "vpn_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_extra_traffic" ADD CONSTRAINT "plan_extra_traffic_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "vpn_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_extra_bypass_traffic" ADD CONSTRAINT "plan_extra_bypass_traffic_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "vpn_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_extra_devices" ADD CONSTRAINT "plan_extra_devices_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "vpn_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "vpn_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

