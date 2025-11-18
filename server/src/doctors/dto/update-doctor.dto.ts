import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';

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
