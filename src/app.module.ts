import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClsModule } from 'nestjs-cls';
import { ClsPluginTransactional } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './modules/prisma/prisma.module';
import { PrismaService } from './modules/prisma/prisma.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { BalanceModule } from './modules/balance/balance.module';
import { PlansModule } from './modules/plans/plans.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { RemnawaveModule } from './modules/remnawave/remnawave.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // nestjs-cls для транзакций
    ClsModule.forRoot({
      plugins: [
        new ClsPluginTransactional({
          imports: [PrismaModule],
          adapter: new TransactionalAdapterPrisma({
            prismaInjectionToken: PrismaService,
          }),
        }),
      ],
      global: true,
      middleware: { mount: true },
    }),
    // Event Emitter для асинхронных событий
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    BalanceModule,
    PlansModule,
    SubscriptionsModule,
    PaymentsModule,
    RemnawaveModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
