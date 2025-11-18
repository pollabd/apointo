import {
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

    if (userRole === UserRole.PATIENT && appointment.patientId !== userId) {
      throw new ForbiddenException('You can only cancel your own appointments');
    }

    if (userRole === UserRole.DOCTOR) {
      const doctor = await this.prisma.doctor.findUnique({
        where: { userId },
      });
      if (!doctor || appointment.doctorId !== doctor.id) {
        throw new ForbiddenException('You can only cancel your own appointments');
      }
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

  async updateAppointmentStatus(
    appointmentId: string,
    status: AppointmentStatus,
    doctorUserId: string,
  ) {
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
      throw new ForbiddenException('You can only update your own appointments');
    }

    return this.prisma.appointment.update({
      where: { id: appointmentId },
      data: { status },
    });
  }
}
