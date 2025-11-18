import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DoctorsService } from './doctors.service';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@Controller('doctors')
export class DoctorsController {
  constructor(private doctorsService: DoctorsService) {}

  @Get()
  async findAll(@Query('speciality') speciality?: string) {
    return this.doctorsService.findAll(speciality);
  }

  @Get('speciality/:speciality')
  async findBySpeciality(@Param('speciality') speciality: string) {
    return this.doctorsService.findBySpeciality(speciality);
  }

  @Post('register')
  async register(@Body() registerDoctorDto: any) {
    // For now, image is not handled or passed as string. 
    // In real app, we'd use Multer.
    // I'll assume image is a URL or base64 string in DTO for now, or just a placeholder.
    const imagePath = "https://via.placeholder.com/150"; 
    return this.doctorsService.registerDoctor(registerDoctorDto, imagePath);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DOCTOR)
  async getProfile(@CurrentUser() user: any) {
    return this.doctorsService.getDoctorProfile(user.id);
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DOCTOR)
  async updateProfile(
    @CurrentUser() user: any,
    @Body() updateDoctorDto: UpdateDoctorDto,
  ) {
    return this.doctorsService.updateProfile(user.id, updateDoctorDto);
  }

  @Get('dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DOCTOR)
  async getDashboardStats(@CurrentUser() user: any) {
    return this.doctorsService.getDashboardStats(user.id);
  }

  @Get('my/appointments')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DOCTOR)
  async getMyAppointments(@CurrentUser() user: any) {
    return this.doctorsService.getDoctorAppointments(user.id);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.doctorsService.findById(id);
  }

  @Get(':id/slots')
  async getAvailableSlots(
    @Param('id') id: string,
    @Query('date') date?: string,
  ) {
    return this.doctorsService.getAvailableSlots(id, date);
  }
}
