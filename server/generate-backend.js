const fs = require('fs');
const path = require('path');

// Helper function to create directories
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Helper function to write file
function writeFile(filePath, content) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content);
  console.log(`✅ Created: ${filePath}`);
}

console.log('🚀 Generating NestJS Backend Files...\n');

// ============================================
// AUTH MODULE
// ============================================

// Auth DTOs
writeFile('src/auth/dto/register.dto.ts', `import { IsEmail, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { UserRole } from '@prisma/client';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}
`);

writeFile('src/auth/dto/login.dto.ts', `import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
`);

// Auth Strategies
writeFile('src/auth/strategies/jwt.strategy.ts', `import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        image: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    return user;
  }
}
`);

writeFile('src/auth/strategies/local.strategy.ts', `import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }
}
`);

// Auth Guards
writeFile('src/auth/guards/jwt-auth.guard.ts', `import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
`);

writeFile('src/auth/guards/local-auth.guard.ts', `import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}
`);

writeFile('src/auth/guards/roles.guard.ts', `import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRoles) {
      return true;
    }
    
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.role === role);
  }
}
`);

// Auth Decorators
writeFile('src/auth/decorators/roles.decorator.ts', `import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@prisma/client';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
`);

writeFile('src/auth/decorators/current-user.decorator.ts', `import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
`);

// Auth Service
writeFile('src/auth/auth.service.ts', `import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';
import { UserRole } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        password: hashedPassword,
        name: registerDto.name,
        phone: registerDto.phone,
        role: registerDto.role || UserRole.PATIENT,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        createdAt: true,
      },
    });

    const token = this.generateToken(user);

    return {
      user,
      token,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.generateToken(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        image: user.image,
      },
      token,
    };
  }

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.isActive) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  generateToken(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return this.jwtService.sign(payload);
  }
}
`);

// Auth Controller
writeFile('src/auth/auth.controller.ts', `import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
`);

// Auth Module
writeFile('src/auth/auth.module.ts', `import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: { expiresIn: config.get('JWT_EXPIRES_IN') || '7d' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, LocalStrategy],
  exports: [AuthService],
})
export class AuthModule {}
`);

// ============================================
// USERS MODULE
// ============================================

writeFile('src/users/dto/update-profile.dto.ts', `import { IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { Gender } from '@prisma/client';

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsOptional()
  address?: any;

  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;
}
`);

writeFile('src/users/users.service.ts', `import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        image: true,
        address: true,
        gender: true,
        dateOfBirth: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateProfile(id: string, updateProfileDto: UpdateProfileDto) {
    const user = await this.prisma.user.update({
      where: { id },
      data: updateProfileDto,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        image: true,
        address: true,
        gender: true,
        dateOfBirth: true,
      },
    });

    return user;
  }

  async updateImage(id: string, imageUrl: string) {
    return this.prisma.user.update({
      where: { id },
      data: { image: imageUrl },
      select: {
        id: true,
        image: true,
      },
    });
  }

  async getUserAppointments(userId: string) {
    return this.prisma.appointment.findMany({
      where: { patientId: userId },
      include: {
        doctor: {
          include: {
            user: {
              select: {
                name: true,
                image: true,
              },
            },
          },
        },
      },
      orderBy: { appointmentDate: 'desc' },
    });
  }
}
`);

writeFile('src/users/users.controller.ts', `import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  Post,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UploadService } from '../upload/upload.service';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(
    private usersService: UsersService,
    private uploadService: UploadService,
  ) {}

  @Get('profile')
  async getProfile(@CurrentUser() user: any) {
    return this.usersService.findById(user.id);
  }

  @Put('profile')
  async updateProfile(
    @CurrentUser() user: any,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(user.id, updateProfileDto);
  }

  @Post('upload-image')
  @UseInterceptors(FileInterceptor('image'))
  async uploadImage(
    @CurrentUser() user: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const imageUrl = await this.uploadService.uploadImage(file);
    return this.usersService.updateImage(user.id, imageUrl);
  }

  @Get('appointments')
  async getAppointments(@CurrentUser() user: any) {
    return this.usersService.getUserAppointments(user.id);
  }
}
`);

writeFile('src/users/users.module.ts', `import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [UploadModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
`);

// ============================================
// DOCTORS MODULE
// ============================================

writeFile('src/doctors/dto/update-doctor.dto.ts', `import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class UpdateDoctorDto {
  @IsString()
  @IsOptional()
  about?: string;

  @IsNumber()
  @IsOptional()
  fees?: number;

  @IsString()
  @IsOptional()
  addressLine1?: string;

  @IsString()
  @IsOptional()
  addressLine2?: string;

  @IsBoolean()
  @IsOptional()
  available?: boolean;
}
`);

writeFile('src/doctors/doctors.service.ts', `import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Speciality } from '@prisma/client';

@Injectable()
export class DoctorsService {
  constructor(private prisma: PrismaService) {}

  async findAll(speciality?: string) {
    const where: any = { available: true };
    
    if (speciality && speciality !== 'all') {
      where.speciality = speciality as Speciality;
    }

    return this.prisma.doctor.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            phone: true,
          },
        },
      },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    return doctor;
  }

  async findBySpeciality(speciality: string) {
    return this.prisma.doctor.findMany({
      where: {
        speciality: speciality as Speciality,
        available: true,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });
  }

  async getAvailableSlots(doctorId: string, date?: string) {
    const doctor = await this.findById(doctorId);
    
    if (!doctor.available) {
      return [];
    }

    // Get existing appointments for the doctor
    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    const bookedAppointments = await this.prisma.appointment.findMany({
      where: {
        doctorId,
        appointmentDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          not: 'CANCELLED',
        },
      },
      select: {
        timeSlot: true,
      },
    });

    const bookedSlots = bookedAppointments.map((apt) => apt.timeSlot);

    // Generate time slots (10 AM to 9 PM, 30-minute intervals)
    const slots = [];
    const now = new Date();
    const isToday = targetDate.toDateString() === now.toDateString();

    for (let hour = 10; hour < 21; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const slotTime = new Date(targetDate);
        slotTime.setHours(hour, minute, 0, 0);

        // Skip past slots for today
        if (isToday && slotTime <= now) {
          continue;
        }

        const timeString = slotTime.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        });

        if (!bookedSlots.includes(timeString)) {
          slots.push({
            time: timeString,
            datetime: slotTime,
            available: true,
          });
        }
      }
    }

    return slots;
  }

  async getDoctorAppointments(userId: string) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { userId },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor profile not found');
    }

    return this.prisma.appointment.findMany({
      where: { doctorId: doctor.id },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            image: true,
          },
        },
      },
      orderBy: { appointmentDate: 'desc' },
    });
  }

  async updateProfile(userId: string, updateDto: any) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { userId },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor profile not found');
    }

    return this.prisma.doctor.update({
      where: { id: doctor.id },
      data: updateDto,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });
  }
}
`);

writeFile('src/doctors/doctors.controller.ts', `import {
  Controller,
  Get,
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

  @Put('profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DOCTOR)
  async updateProfile(
    @CurrentUser() user: any,
    @Body() updateDoctorDto: UpdateDoctorDto,
  ) {
    return this.doctorsService.updateProfile(user.id, updateDoctorDto);
  }

  @Get('my/appointments')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DOCTOR)
  async getMyAppointments(@CurrentUser() user: any) {
    return this.doctorsService.getDoctorAppointments(user.id);
  }
}
`);

writeFile('src/doctors/doctors.module.ts', `import { Module } from '@nestjs/common';
import { DoctorsService } from './doctors.service';
import { DoctorsController } from './doctors.controller';

@Module({
  controllers: [DoctorsController],
  providers: [DoctorsService],
  exports: [DoctorsService],
})
export class DoctorsModule {}
`);

// ============================================
// APPOINTMENTS MODULE
// ============================================

writeFile('src/appointments/dto/book-appointment.dto.ts', `import { IsString, IsDateString, IsUUID } from 'class-validator';

export class BookAppointmentDto {
  @IsUUID()
  doctorId: string;

  @IsDateString()
  appointmentDate: string;

  @IsString()
  timeSlot: string;
}
`);

writeFile('src/appointments/dto/cancel-appointment.dto.ts', `import { IsString, IsOptional } from 'class-validator';

export class CancelAppointmentDto {
  @IsString()
  @IsOptional()
  reason?: string;
}
`);

writeFile('src/appointments/appointments.service.ts', `import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BookAppointmentDto } from './dto/book-appointment.dto';
import { AppointmentStatus, UserRole } from '@prisma/client';

@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService) {}

  async bookAppointment(patientId: string, bookDto: BookAppointmentDto) {
    // Check if doctor exists and is available
    const doctor = await this.prisma.doctor.findUnique({
      where: { id: bookDto.doctorId },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    if (!doctor.available) {
      throw new BadRequestException('Doctor is not available');
    }

    // Check if slot is available
    const appointmentDate = new Date(bookDto.appointmentDate);
    const existingAppointment = await this.prisma.appointment.findFirst({
      where: {
        doctorId: bookDto.doctorId,
        appointmentDate,
        timeSlot: bookDto.timeSlot,
        status: {
          not: AppointmentStatus.CANCELLED,
        },
      },
    });

    if (existingAppointment) {
      throw new BadRequestException('This time slot is already booked');
    }

    // Create appointment
    const appointment = await this.prisma.appointment.create({
      data: {
        patientId,
        doctorId: bookDto.doctorId,
        appointmentDate,
        timeSlot: bookDto.timeSlot,
        paymentAmount: doctor.fees,
        status: AppointmentStatus.PENDING,
      },
      include: {
        doctor: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
      },
    });

    return appointment;
  }

  async getUserAppointments(userId: string) {
    return this.prisma.appointment.findMany({
      where: { patientId: userId },
      include: {
        doctor: {
          include: {
            user: {
              select: {
                name: true,
                image: true,
              },
            },
          },
        },
      },
      orderBy: { appointmentDate: 'desc' },
    });
  }

  async cancelAppointment(
    appointmentId: string,
    userId: string,
    userRole: UserRole,
    reason?: string,
  ) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    // Check authorization
    if (userRole === UserRole.PATIENT && appointment.patientId !== userId) {
      throw new ForbiddenException('You can only cancel your own appointments');
    }

    if (appointment.status === AppointmentStatus.CANCELLED) {
      throw new BadRequestException('Appointment is already cancelled');
    }

    if (appointment.status === AppointmentStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel completed appointment');
    }

    return this.prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        status: AppointmentStatus.CANCELLED,
        cancellationReason: reason,
      },
    });
  }

  async completeAppointment(appointmentId: string, doctorUserId: string) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { userId: doctorUserId },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor profile not found');
    }

    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (appointment.doctorId !== doctor.id) {
      throw new ForbiddenException('You can only complete your own appointments');
    }

    return this.prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: AppointmentStatus.COMPLETED },
    });
  }
}
`);

writeFile('src/appointments/appointments.controller.ts', `import {
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
import { UserRole } from '@prisma/client';

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
}
`);

writeFile('src/appointments/appointments.module.ts', `import { Module } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';

@Module({
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}
`);

// ============================================
// ADMIN MODULE
// ============================================

writeFile('src/admin/admin.service.ts', `import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getAllUsers(page = 1, limit = 10, role?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};
    
    if (role) {
      where.role = role;
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      users,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getAllAppointments(page = 1, limit = 10, status?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};
    
    if (status) {
      where.status = status;
    }

    const [appointments, total] = await Promise.all([
      this.prisma.appointment.findMany({
        where,
        skip,
        take: limit,
        include: {
          patient: {
            select: {
              name: true,
              email: true,
              phone: true,
            },
          },
          doctor: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.appointment.count({ where }),
    ]);

    return {
      appointments,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getDashboardStats() {
    const [
      totalUsers,
      totalDoctors,
      totalPatients,
      totalAppointments,
      pendingAppointments,
      completedAppointments,
      totalRevenue,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: 'DOCTOR' } }),
      this.prisma.user.count({ where: { role: 'PATIENT' } }),
      this.prisma.appointment.count(),
      this.prisma.appointment.count({ where: { status: 'PENDING' } }),
      this.prisma.appointment.count({ where: { status: 'COMPLETED' } }),
      this.prisma.appointment.aggregate({
        where: { paymentStatus: 'PAID' },
        _sum: { paymentAmount: true },
      }),
    ]);

    return {
      totalUsers,
      totalDoctors,
      totalPatients,
      totalAppointments,
      pendingAppointments,
      completedAppointments,
      totalRevenue: totalRevenue._sum.paymentAmount || 0,
    };
  }

  async updateDoctor(doctorId: string, updateData: any) {
    return this.prisma.doctor.update({
      where: { id: doctorId },
      data: updateData,
    });
  }

  async deleteAppointment(appointmentId: string) {
    return this.prisma.appointment.delete({
      where: { id: appointmentId },
    });
  }
}
`);

writeFile('src/admin/admin.controller.ts', `import {
  Controller,
  Get,
  Put,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  ParseIntPipe,
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
    @Query('page', ParseIntPipe) page = 1,
    @Query('limit', ParseIntPipe) limit = 10,
    @Query('role') role?: string,
  ) {
    return this.adminService.getAllUsers(page, limit, role);
  }

  @Get('appointments')
  async getAllAppointments(
    @Query('page', ParseIntPipe) page = 1,
    @Query('limit', ParseIntPipe) limit = 10,
    @Query('status') status?: string,
  ) {
    return this.adminService.getAllAppointments(page, limit, status);
  }

  @Get('stats')
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
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
`);

writeFile('src/admin/admin.module.ts', `import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';

@Module({
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
`);

// ============================================
// PAYMENT MODULE
// ============================================

writeFile('src/payment/payment.service.ts', `import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import Stripe from 'stripe';
import { PaymentStatus } from '@prisma/client';

@Injectable()
export class PaymentService {
  private stripe: Stripe;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const stripeKey = this.configService.get('STRIPE_SECRET_KEY');
    if (stripeKey && stripeKey !== 'sk_test_your_stripe_secret_key') {
      this.stripe = new Stripe(stripeKey, {
        apiVersion: '2023-10-16',
      });
    }
  }

  async createPaymentIntent(appointmentId: string, userId: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        doctor: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!appointment) {
      throw new Error('Appointment not found');
    }

    if (appointment.patientId !== userId) {
      throw new Error('Unauthorized');
    }

    if (!this.stripe) {
      throw new Error('Stripe is not configured. Please add STRIPE_SECRET_KEY to .env');
    }

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(Number(appointment.paymentAmount) * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        appointmentId: appointment.id,
        patientId: userId,
        doctorId: appointment.doctorId,
      },
    });

    await this.prisma.appointment.update({
      where: { id: appointmentId },
      data: { paymentIntentId: paymentIntent.id },
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  }

  async verifyPayment(paymentIntentId: string) {
    if (!this.stripe) {
      throw new Error('Stripe is not configured');
    }

    const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      const appointment = await this.prisma.appointment.findFirst({
        where: { paymentIntentId },
      });

      if (appointment) {
        await this.prisma.appointment.update({
          where: { id: appointment.id },
          data: {
            paymentStatus: PaymentStatus.PAID,
            status: 'CONFIRMED',
          },
        });
      }

      return { success: true, status: 'paid' };
    }

    return { success: false, status: paymentIntent.status };
  }

  async handleWebhook(signature: string, payload: Buffer) {
    if (!this.stripe) {
      throw new Error('Stripe is not configured');
    }

    const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET');
    
    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret,
      );

      if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await this.verifyPayment(paymentIntent.id);
      }

      return { received: true };
    } catch (err) {
      throw new Error(\`Webhook Error: \${err.message}\`);
    }
  }
}
`);

writeFile('src/payment/payment.controller.ts', `import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Headers,
  RawBodyRequest,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('payment')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Post('create-intent')
  @UseGuards(JwtAuthGuard)
  async createPaymentIntent(
    @Body('appointmentId') appointmentId: string,
    @CurrentUser() user: any,
  ) {
    return this.paymentService.createPaymentIntent(appointmentId, user.id);
  }

  @Post('verify')
  @UseGuards(JwtAuthGuard)
  async verifyPayment(@Body('paymentIntentId') paymentIntentId: string) {
    return this.paymentService.verifyPayment(paymentIntentId);
  }

  @Post('webhook')
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() request: RawBodyRequest<Request>,
  ) {
    return this.paymentService.handleWebhook(signature, request.rawBody);
  }
}
`);

writeFile('src/payment/payment.module.ts', `import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';

@Module({
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
`);

// ============================================
// UPLOAD MODULE
// ============================================

writeFile('src/upload/upload.service.ts', `import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UploadService {
  private cloudinaryConfigured: boolean;

  constructor(private configService: ConfigService) {
    const cloudName = this.configService.get('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.configService.get('CLOUDINARY_API_KEY');
    const apiSecret = this.configService.get('CLOUDINARY_API_SECRET');

    if (cloudName && apiKey && apiSecret) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
      });
      this.cloudinaryConfigured = true;
      console.log('✅ Cloudinary configured');
    } else {
      this.cloudinaryConfigured = false;
      console.log('⚠️  Cloudinary not configured, using local storage fallback');
    }
  }

  async uploadImage(file: Express.Multer.File): Promise<string> {
    if (!file) {
      throw new Error('No file provided');
    }

    // Try Cloudinary first
    if (this.cloudinaryConfigured) {
      try {
        const result = await this.uploadToCloudinary(file);
        return result;
      } catch (error) {
        console.error('Cloudinary upload failed, falling back to local storage:', error.message);
      }
    }

    // Fallback to local storage
    return this.uploadToLocal(file);
  }

  private async uploadToCloudinary(file: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'apointo',
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result.secure_url);
          }
        },
      ).end(file.buffer);
    });
  }

  private uploadToLocal(file: Express.Multer.File): string {
    const uploadsDir = path.join(process.cwd(), 'uploads');
    
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filename = \`\${Date.now()}-\${file.originalname}\`;
    const filepath = path.join(uploadsDir, filename);
    
    fs.writeFileSync(filepath, file.buffer);
    
    return \`/uploads/\${filename}\`;
  }

  async deleteImage(imageUrl: string): Promise<void> {
    if (imageUrl.startsWith('http')) {
      // Cloudinary image
      if (this.cloudinaryConfigured) {
        const publicId = this.extractPublicId(imageUrl);
        await cloudinary.uploader.destroy(publicId);
      }
    } else {
      // Local image
      const filepath = path.join(process.cwd(), imageUrl);
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
    }
  }

  private extractPublicId(url: string): string {
    const parts = url.split('/');
    const filename = parts[parts.length - 1];
    return filename.split('.')[0];
  }
}
`);

writeFile('src/upload/upload.module.ts', `import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    MulterModule.register({
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
      fileFilter: (req, file, cb) => {
        if (file.mimetype.match(/\\/(jpg|jpeg|png|gif)$/)) {
          cb(null, true);
        } else {
          cb(new Error('Only image files are allowed!'), false);
        }
      },
    }),
  ],
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule {}
`);

console.log('\n✨ All backend files generated successfully!');
console.log('\n📋 Next steps:');
console.log('1. Copy .env.example to .env and configure your environment variables');
console.log('2. Run: npm install');
console.log('3. Run: npx prisma generate');
console.log('4. Run: npx prisma migrate dev --name init');
console.log('5. Run: npx prisma db seed');
console.log('6. Run: npm run start:dev');
console.log('\n🎉 Your NestJS backend will be ready!');
