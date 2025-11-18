import { IsEmail, IsNotEmpty, IsString, MinLength, IsNumber, IsOptional } from 'class-validator';

export class AddDoctorDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  @IsNotEmpty()
  @IsString()
  speciality: string;

  @IsNotEmpty()
  @IsString()
  experience: string;

  @IsNotEmpty()
  @IsNumber()
  fees: number;

  @IsNotEmpty()
  @IsString()
  about: string;

  @IsOptional()
  @IsString()
  image?: string;
  
  @IsOptional()
  @IsString()
  degree?: string;
  
  @IsOptional()
  @IsString()
  address1?: string;
  
  @IsOptional()
  @IsString()
  address2?: string;
}
