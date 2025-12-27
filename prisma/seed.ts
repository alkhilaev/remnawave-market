import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Запуск сидирования базы данных...');

  // Получаем данные супер-админа из переменных окружения
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD;

  if (!superAdminEmail || !superAdminPassword) {
    console.warn(
      '⚠️  SUPER_ADMIN_EMAIL или SUPER_ADMIN_PASSWORD не установлены в .env',
    );
    console.warn('⚠️  Пропускаем создание супер-администратора');
    return;
  }

  // Проверяем существует ли уже супер-админ
  const existingSuperAdmin = await prisma.user.findFirst({
    where: { role: Role.SUPER_ADMIN },
  });

  if (existingSuperAdmin) {
    console.log('✅ Супер-администратор уже существует');
    console.log(`   Email: ${existingSuperAdmin.email}`);
    return;
  }

  // Хешируем пароль
  const hashedPassword = await bcrypt.hash(superAdminPassword, 10);

  // Создаём супер-администратора
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

main()
  .catch((e) => {
    console.error('❌ Ошибка при сидировании:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
