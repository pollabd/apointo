import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('users')
  async getAllUsers(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('role') role?: string,
  ) {
    return this.adminService.getAllUsers(page, limit, role);
  }

  @Get('appointments')
  async getAllAppointments(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('status') status?: string,
  ) {
    return this.adminService.getAllAppointments(page, limit, status);
  }

  @Get('stats')
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Post('change-approval')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async changeApproval(@Body() body: { docId: string }) {
    return this.adminService.changeApproval(body.docId);
  }

  @Post('delete-doctor')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async deleteDoctor(@Body() body: { docId: string }) {
    return this.adminService.deleteDoctor(body.docId);
  }

  @Get('all-doctors')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getAllDoctors() {
    return this.adminService.getAllDoctors();
  }

  @Post('add-doctor')
  async addDoctor(@Body() addDoctorDto: any) {
    return this.adminService.addDoctor(addDoctorDto);
  }

  @Put('doctors/:id')
  async updateDoctor(@Param('id') id: string, @Body() updateData: any) {
    return this.adminService.updateDoctor(id, updateData);
  }

  @Delete('appointments/:id')
  async deleteAppointment(@Param('id') id: string) {
    return this.adminService.deleteAppointment(id);
  }
}
