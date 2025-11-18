import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

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

  async changeApproval(docId: string) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { id: docId },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    await this.prisma.doctor.update({
      where: { id: docId },
      data: { isApproved: !doctor.isApproved },
    });

    return { success: true, message: 'Approval status changed' };
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

  async addDoctor(data: any) {
    const { email, password, name, ...doctorData } = data;
    
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create User and Doctor in transaction
    return this.prisma.$transaction(async (prisma) => {
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role: 'DOCTOR',
          image: doctorData.image || '',
          isActive: true,
        },
      });

      const doctor = await prisma.doctor.create({
        data: {
          userId: user.id,
          speciality: doctorData.speciality,
          experience: doctorData.experience,
          fees: Number(doctorData.fees),
          about: doctorData.about,
          degree: doctorData.degree || '',
          addressLine1: doctorData.address1 || '',
          addressLine2: doctorData.address2 || '',
          available: true,
          isApproved: true, // Admin created doctors are approved by default
        },
      });

      return { user, doctor };
    });
  }

  async deleteDoctor(docId: string) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { id: docId },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    // Delete User (cascades to Doctor)
    await this.prisma.user.delete({
      where: { id: doctor.userId },
    });

    return { success: true, message: 'Doctor deleted successfully' };
  }

  async getAllDoctors() {
    const doctors = await this.prisma.doctor.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return doctors;
  }
}
