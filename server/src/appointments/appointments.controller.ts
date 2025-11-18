import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { BookAppointmentDto } from './dto/book-appointment.dto';
import { CancelAppointmentDto } from './dto/cancel-appointment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole, AppointmentStatus } from '@prisma/client';

@Controller('appointments')
@UseGuards(JwtAuthGuard)
export class AppointmentsController {
  constructor(private appointmentsService: AppointmentsService) {}

  @Post('book')
  @Roles(UserRole.PATIENT)
  @UseGuards(RolesGuard)
  async bookAppointment(
    @CurrentUser() user: any,
    @Body() bookDto: BookAppointmentDto,
  ) {
    return this.appointmentsService.bookAppointment(user.id, bookDto);
  }

  @Get('user')
  @Roles(UserRole.PATIENT)
  @UseGuards(RolesGuard)
  async getUserAppointments(@CurrentUser() user: any) {
    return this.appointmentsService.getUserAppointments(user.id);
  }

  @Put(':id/cancel')
  async cancelAppointment(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() cancelDto: CancelAppointmentDto,
  ) {
    return this.appointmentsService.cancelAppointment(
      id,
      user.id,
      user.role,
      cancelDto.reason,
    );
  }

  @Put(':id/complete')
  @Roles(UserRole.DOCTOR)
  @UseGuards(RolesGuard)
  async completeAppointment(@Param('id') id: string, @CurrentUser() user: any) {
    return this.appointmentsService.completeAppointment(id, user.id);
  }

  @Put(':id/status')
  @Roles(UserRole.DOCTOR)
  @UseGuards(RolesGuard)
  async updateAppointmentStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
    @CurrentUser() user: any,
  ) {
    return this.appointmentsService.updateAppointmentStatus(
      id,
      body.status as AppointmentStatus,
      user.id,
    );
  }
}
