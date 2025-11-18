import { PrismaClient, UserRole, Speciality, Gender } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Hash password for all users
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create Admin User
  const admin = await prisma.user.upsert({
    where: { email: 'admin@apointo.com' },
    update: {},
    create: {
      email: 'admin@apointo.com',
      password: hashedPassword,
      name: 'Admin User',
      phone: '+1234567890',
      role: UserRole.ADMIN,
      gender: Gender.MALE,
      isActive: true,
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // Create Doctors with their user accounts
  const doctorsData = [
    {
      email: 'richard.james@apointo.com',
      name: 'Dr. Richard James',
      speciality: Speciality.General_physician,
      degree: 'MBBS',
      experience: '4 Years',
      fees: 50,
      addressLine1: '17th Cross, Richmond',
      addressLine2: 'Circle, Ring Road, London',
      about:
        'Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.',
      image: '/images/doctors/doc1.png',
    },
    {
      email: 'emily.larson@apointo.com',
      name: 'Dr. Emily Larson',
      speciality: Speciality.Gynecologist,
      degree: 'MBBS',
      experience: '3 Years',
      fees: 60,
      addressLine1: '27th Cross, Richmond',
      addressLine2: 'Circle, Ring Road, London',
      about:
        'Dr. Larson specializes in women\'s health with a compassionate approach to patient care and comprehensive treatment plans.',
      image: '/images/doctors/doc2.png',
    },
    {
      email: 'sarah.patel@apointo.com',
      name: 'Dr. Sarah Patel',
      speciality: Speciality.Dermatologist,
      degree: 'MBBS',
      experience: '1 Years',
      fees: 30,
      addressLine1: '37th Cross, Richmond',
      addressLine2: 'Circle, Ring Road, London',
      about:
        'Dr. Patel is dedicated to providing expert dermatological care with focus on skin health and aesthetic treatments.',
      image: '/images/doctors/doc3.png',
    },
    {
      email: 'christopher.lee@apointo.com',
      name: 'Dr. Christopher Lee',
      speciality: Speciality.Pediatricians,
      degree: 'MBBS',
      experience: '2 Years',
      fees: 40,
      addressLine1: '47th Cross, Richmond',
      addressLine2: 'Circle, Ring Road, London',
      about:
        'Dr. Lee provides compassionate pediatric care with expertise in child development and preventive health.',
      image: '/images/doctors/doc4.png',
    },
    {
      email: 'jennifer.garcia@apointo.com',
      name: 'Dr. Jennifer Garcia',
      speciality: Speciality.Neurologist,
      degree: 'MBBS',
      experience: '4 Years',
      fees: 50,
      addressLine1: '57th Cross, Richmond',
      addressLine2: 'Circle, Ring Road, London',
      about:
        'Dr. Garcia specializes in neurological disorders with advanced diagnostic and treatment approaches.',
      image: '/images/doctors/doc5.png',
    },
    {
      email: 'andrew.williams@apointo.com',
      name: 'Dr. Andrew Williams',
      speciality: Speciality.Neurologist,
      degree: 'MBBS',
      experience: '4 Years',
      fees: 50,
      addressLine1: '57th Cross, Richmond',
      addressLine2: 'Circle, Ring Road, London',
      about:
        'Dr. Williams brings extensive experience in treating complex neurological conditions with patient-centered care.',
      image: '/images/doctors/doc6.png',
    },
    {
      email: 'christopher.davis@apointo.com',
      name: 'Dr. Christopher Davis',
      speciality: Speciality.General_physician,
      degree: 'MBBS',
      experience: '4 Years',
      fees: 50,
      addressLine1: '17th Cross, Richmond',
      addressLine2: 'Circle, Ring Road, London',
      about:
        'Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.',
      image: '/images/doctors/doc7.png',
    },
    {
      email: 'timothy.white@apointo.com',
      name: 'Dr. Timothy White',
      speciality: Speciality.Gynecologist,
      degree: 'MBBS',
      experience: '3 Years',
      fees: 60,
      addressLine1: '27th Cross, Richmond',
      addressLine2: 'Circle, Ring Road, London',
      about:
        'Dr. White provides expert gynecological care with emphasis on women\'s wellness and reproductive health.',
      image: '/images/doctors/doc8.png',
    },
    {
      email: 'ava.mitchell@apointo.com',
      name: 'Dr. Ava Mitchell',
      speciality: Speciality.Dermatologist,
      degree: 'MBBS',
      experience: '1 Years',
      fees: 30,
      addressLine1: '37th Cross, Richmond',
      addressLine2: 'Circle, Ring Road, London',
      about:
        'Dr. Mitchell offers comprehensive dermatology services with focus on both medical and cosmetic treatments.',
      image: '/images/doctors/doc9.png',
    },
    {
      email: 'jeffrey.king@apointo.com',
      name: 'Dr. Jeffrey King',
      speciality: Speciality.Pediatricians,
      degree: 'MBBS',
      experience: '2 Years',
      fees: 40,
      addressLine1: '47th Cross, Richmond',
      addressLine2: 'Circle, Ring Road, London',
      about:
        'Dr. King is committed to providing high-quality pediatric care with focus on preventive health and development.',
      image: '/images/doctors/doc10.png',
    },
    {
      email: 'zoe.kelly@apointo.com',
      name: 'Dr. Zoe Kelly',
      speciality: Speciality.Neurologist,
      degree: 'MBBS',
      experience: '4 Years',
      fees: 50,
      addressLine1: '57th Cross, Richmond',
      addressLine2: 'Circle, Ring Road, London',
      about:
        'Dr. Kelly specializes in neurological care with expertise in diagnosis and treatment of brain and nervous system disorders.',
      image: '/images/doctors/doc11.png',
    },
    {
      email: 'patrick.harris@apointo.com',
      name: 'Dr. Patrick Harris',
      speciality: Speciality.Neurologist,
      degree: 'MBBS',
      experience: '4 Years',
      fees: 50,
      addressLine1: '57th Cross, Richmond',
      addressLine2: 'Circle, Ring Road, London',
      about:
        'Dr. Harris provides comprehensive neurological care with advanced treatment options for various conditions.',
      image: '/images/doctors/doc12.png',
    },
    {
      email: 'chloe.evans@apointo.com',
      name: 'Dr. Chloe Evans',
      speciality: Speciality.General_physician,
      degree: 'MBBS',
      experience: '4 Years',
      fees: 50,
      addressLine1: '17th Cross, Richmond',
      addressLine2: 'Circle, Ring Road, London',
      about:
        'Dr. Evans delivers comprehensive primary care with focus on preventive medicine and patient education.',
      image: '/images/doctors/doc13.png',
    },
    {
      email: 'ryan.martinez@apointo.com',
      name: 'Dr. Ryan Martinez',
      speciality: Speciality.Gynecologist,
      degree: 'MBBS',
      experience: '3 Years',
      fees: 60,
      addressLine1: '27th Cross, Richmond',
      addressLine2: 'Circle, Ring Road, London',
      about:
        'Dr. Martinez provides expert gynecological care with compassionate approach to women\'s health needs.',
      image: '/images/doctors/doc14.png',
    },
    {
      email: 'amelia.hill@apointo.com',
      name: 'Dr. Amelia Hill',
      speciality: Speciality.Dermatologist,
      degree: 'MBBS',
      experience: '1 Years',
      fees: 30,
      addressLine1: '37th Cross, Richmond',
      addressLine2: 'Circle, Ring Road, London',
      about:
        'Dr. Hill specializes in dermatological care with expertise in skin conditions and aesthetic procedures.',
      image: '/images/doctors/doc15.png',
    },
  ];

  for (const doctorData of doctorsData) {
    const user = await prisma.user.upsert({
      where: { email: doctorData.email },
      update: {},
      create: {
        email: doctorData.email,
        password: hashedPassword,
        name: doctorData.name,
        phone: '+1234567890',
        role: UserRole.DOCTOR,
        gender: Gender.MALE,
        image: doctorData.image,
        isActive: true,
      },
    });

    await prisma.doctor.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        speciality: doctorData.speciality,
        degree: doctorData.degree,
        experience: doctorData.experience,
        about: doctorData.about,
        fees: doctorData.fees,
        addressLine1: doctorData.addressLine1,
        addressLine2: doctorData.addressLine2,
        available: true,
        isApproved: true,
        rating: 4.5,
        reviewCount: 0,
      },
    });

    console.log(`✅ Doctor created: ${doctorData.name}`);
  }

  // Create sample patients
  const patient1 = await prisma.user.upsert({
    where: { email: 'patient@test.com' },
    update: {},
    create: {
      email: 'patient@test.com',
      password: hashedPassword,
      name: 'John Doe',
      phone: '+1234567890',
      role: UserRole.PATIENT,
      gender: Gender.MALE,
      dateOfBirth: new Date('1990-01-15'),
      address: {
        line1: '123 Main Street',
        line2: 'Apartment 4B, New York',
      },
      isActive: true,
    },
  });
  console.log('✅ Sample patient created:', patient1.email);

  console.log('🎉 Seeding completed successfully!');
  console.log('\n📝 Login credentials:');
  console.log('Admin: admin@apointo.com / password123');
  console.log('Doctor: richard.james@apointo.com / password123');
  console.log('Patient: patient@test.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
