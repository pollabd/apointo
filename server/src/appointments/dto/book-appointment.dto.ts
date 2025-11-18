import { IsString, IsDateString, IsUUID } from 'class-validator';

export class BookAppointmentDto {
  @IsUUID()
  doctorId: string;

  @IsDateString()
  appointmentDate: string;

  @IsString()
  timeSlot: string;
}
