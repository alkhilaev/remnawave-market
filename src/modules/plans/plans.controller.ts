import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { PlansService } from './plans.service';
import { CreatePlanDto, UpdatePlanDto, TogglePlanDto } from '../../plans/dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { Role } from '@prisma/client';

@ApiTags('Тарифы')
@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Создать новый тариф (только админы)' })
  @ApiResponse({ status: 201, description: 'Тариф успешно создан' })
  async create(@Body() createPlanDto: CreatePlanDto) {
    return this.plansService.create(createPlanDto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Получить все активные тарифы' })
  @ApiQuery({
    name: 'showInactive',
    required: false,
    description: 'Показать неактивные (только для админов)',
  })
  @ApiResponse({ status: 200, description: 'Список тарифов' })
  async findAll(@Query('showInactive') showInactive?: string) {
    // showInactive доступен только админам (проверка в сервисе не нужна, т.к. это публичный endpoint)
    return this.plansService.findAll(showInactive === 'true');
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Получить тариф по ID' })
  @ApiParam({ name: 'id', description: 'ID тарифа' })
  @ApiResponse({ status: 200, description: 'Данные тарифа' })
  @ApiResponse({ status: 404, description: 'Тариф не найден' })
  async findOne(@Param('id') id: string) {
    return this.plansService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Обновить тариф (только админы)' })
  @ApiParam({ name: 'id', description: 'ID тарифа' })
  @ApiResponse({ status: 200, description: 'Тариф успешно обновлён' })
  async update(@Param('id') id: string, @Body() updatePlanDto: UpdatePlanDto) {
    return this.plansService.update(id, updatePlanDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Удалить тариф (только супер-админ)' })
  @ApiParam({ name: 'id', description: 'ID тарифа' })
  @ApiResponse({ status: 200, description: 'Тариф успешно удалён' })
  async remove(@Param('id') id: string) {
    return this.plansService.remove(id);
  }

  @Patch(':id/toggle')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Включить/выключить тариф (только админы)' })
  @ApiParam({ name: 'id', description: 'ID тарифа' })
  @ApiResponse({ status: 200, description: 'Статус тарифа изменён' })
  async togglePlan(@Param('id') id: string, @Body() toggleDto: TogglePlanDto) {
    return this.plansService.togglePlan(id, toggleDto);
  }

  @Post(':id/periods')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Добавить период к тарифу (только админы)' })
  @ApiParam({ name: 'id', description: 'ID тарифа' })
  async addPeriod(
    @Param('id') id: string,
    @Body() periodData: { durationDays: number; price: number; isActive?: boolean },
  ) {
    return this.plansService.addPeriod(id, periodData);
  }

  @Patch(':planId/periods/:periodId/toggle')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Включить/выключить период (только админы)' })
  async togglePeriod(
    @Param('planId') planId: string,
    @Param('periodId') periodId: string,
    @Body() body: { isActive: boolean },
  ) {
    return this.plansService.togglePeriod(planId, periodId, body.isActive);
  }

  @Delete(':planId/periods/:periodId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Удалить период (только админы)' })
  async removePeriod(
    @Param('planId') planId: string,
    @Param('periodId') periodId: string,
  ) {
    return this.plansService.removePeriod(planId, periodId);
  }
}
