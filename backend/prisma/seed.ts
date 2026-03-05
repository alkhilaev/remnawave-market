import { PrismaClient, Role } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function seedSuperAdmin() {
  console.log('\n👑 Проверка супер-администратора...');

  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD;

  if (!superAdminEmail || !superAdminPassword) {
    console.warn(
      '⚠️  SUPER_ADMIN_EMAIL или SUPER_ADMIN_PASSWORD не установлены в .env',
    );
    console.warn('⚠️  Пропускаем создание супер-администратора');
    return;
  }

  const existingSuperAdmin = await prisma.user.findFirst({
    where: { role: Role.SUPER_ADMIN },
  });

  if (existingSuperAdmin) {
    console.log('✅ Супер-администратор уже существует');
    console.log(`   Email: ${existingSuperAdmin.email}`);
    return;
  }

  const hashedPassword = await bcrypt.hash(superAdminPassword, 10);

  const superAdmin = await prisma.user.create({
    data: {
      email: superAdminEmail,
      password: hashedPassword,
      role: Role.SUPER_ADMIN,
      balance: 0,
    },
  });

  console.log('✅ Супер-администратор успешно создан!');
  console.log(`   ID: ${superAdmin.id}`);
  console.log(`   Email: ${superAdmin.email}`);
  console.log(`   Роль: ${superAdmin.role}`);
}

async function seedDefaultPlan() {
  console.log('\n📦 Проверка дефолтного тарифа...');

  const existingPlan = await prisma.vPNPlan.findFirst();

  if (existingPlan) {
    console.log('✅ Тариф уже существует в системе, пропускаем создание');
    return;
  }

  // Создаём базовый тариф "Стандарт"
  const plan = await prisma.vPNPlan.create({
    data: {
      name: 'Стандарт',
      description: 'Стандартный тарифный план с гибкими опциями',
      defaultTrafficLimitGB: 1000, // 1 TB по умолчанию
      defaultBypassTrafficLimitGB: 50, // 50 GB для обхода заглушек
      defaultDeviceLimit: 2, // 2 устройства
      isActive: true,
      periods: {
        create: [
          { durationDays: 30, price: 199, isActive: true },   // 1 месяц
          { durationDays: 90, price: 499, isActive: true },   // 3 месяца
          { durationDays: 180, price: 899, isActive: true },  // 6 месяцев
          { durationDays: 365, price: 1549, isActive: true }, // 12 месяцев
        ],
      },
      extraTraffic: {
        create: [
          { trafficGB: 2000, price: 200, isActive: true }, // +1 TB
          { trafficGB: 4000, price: 400, isActive: true }, // +3 TB (итого 4 TB)
        ],
      },
      extraBypassTraffic: {
        create: [
          { bypassTrafficGB: 100, price: 100, isActive: true }, // +50 GB обхода
          { bypassTrafficGB: 200, price: 180, isActive: true }, // +150 GB обхода
        ],
      },
      extraDevices: {
        create: [
          { deviceCount: 4, price: 100, isActive: true }, // +2 устройства (итого 4)
          { deviceCount: 6, price: 200, isActive: true }, // +4 устройства (итого 6)
        ],
      },
    },
    include: {
      periods: true,
      extraTraffic: true,
      extraBypassTraffic: true,
      extraDevices: true,
    },
  });

  console.log('✅ Дефолтный тариф "Стандарт" создан!');
  console.log(`   ID: ${plan.id}`);
  console.log(`   Периодов: ${plan.periods.length}`);
  console.log(`   Доп. трафик: ${plan.extraTraffic.length} опций`);
  console.log(`   Доп. обход: ${plan.extraBypassTraffic.length} опций`);
  console.log(`   Доп. устройства: ${plan.extraDevices.length} опций`);
}

async function main() {
  console.log('🌱 Запуск сидирования базы данных...');

  await seedSuperAdmin();
  await seedDefaultPlan();

  console.log('\n✅ Сидирование завершено!');
}

main()
  .catch((e) => {
    console.error('❌ Ошибка при сидировании:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
