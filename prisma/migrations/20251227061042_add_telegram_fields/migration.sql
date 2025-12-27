-- AlterTable
ALTER TABLE "users" ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "password" DROP NOT NULL,
ADD COLUMN "telegramId" TEXT,
ADD COLUMN "telegramUsername" TEXT,
ADD COLUMN "telegramFirstName" TEXT,
ADD COLUMN "telegramLastName" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_telegramId_key" ON "users"("telegramId");
