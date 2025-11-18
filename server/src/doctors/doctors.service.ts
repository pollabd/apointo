import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Speciality } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class DoctorsService {
  constructor(private prisma: PrismaService) {}

  async registerDoctor(registerDoctorDto: any, imagePath: string) {
    const { email, password, name, ...doctorData } = registerDoctorDto;

    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create User and Doctor in transaction
    return this.prisma.$transaction(async (prisma) => {
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role: 'DOCTOR',
          image: imagePath,
          isActive: true,
        },
      });

      const doctor = await prisma.doctor.create({
        data: {
          userId: user.id,
          speciality: doctorData.speciality,
          degree: doctorData.degree,
          experience: doctorData.experience,
          about: doctorData.about,
          fees: Number(doctorData.fees),
          addressLine1: doctorData.address1,
          addressLine2: doctorData.address2,
          available: true,
          isApproved: false, // Default to false for self-registration
        },
      });

      return { user, doctor };
    });
  }

  async findAll(speciality?: string) {
    const where: any = { available: true, isApproved: true };
    
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

  async getDoctorProfile(userId: string) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { userId },
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

    if (!doctor) {
      throw new NotFoundException('Doctor profile not found');
    }

    return doctor;
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

  async getDashboardStats(userId: string) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { userId },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor profile not found');
    }

    const [appointments, earnings, patients] = await Promise.all([
      this.prisma.appointment.count({
        where: { doctorId: doctor.id },
      }),
      this.prisma.appointment.aggregate({
        where: { 
          doctorId: doctor.id,
          paymentStatus: 'PAID'
        },
        _sum: { paymentAmount: true },
      }),
      this.prisma.appointment.findMany({
        where: { doctorId: doctor.id },
        distinct: ['patientId'],
        select: { patientId: true },
      }),
    ]);

    const latestAppointments = await this.prisma.appointment.findMany({
      where: { doctorId: doctor.id },
      take: 5,
      orderBy: { appointmentDate: 'desc' },
      include: {
        patient: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    });

    return {
      appointments,
      earnings: earnings._sum.paymentAmount || 0,
      patients: patients.length,
      latestAppointments,
    };
  }
}
