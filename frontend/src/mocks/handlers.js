import { http, HttpResponse } from 'msw';

const API_URL = 'http://localhost:5000/api';

export const handlers = [
  // Catch-all for OPTIONS requests
  http.options('*', () => {
    return new HttpResponse(null, { status: 200 });
  }),

  // Auth
  http.post(`${API_URL}/auth/login`, async ({ request }) => {
    const { email, password } = await request.json();
    if (email === 'test@example.com' && password === 'password123') {
      return HttpResponse.json({
        token: 'fake-jwt-token',
        user: {
          id: 'user-1',
          name: 'Test User',
          email: 'test@example.com',
          role: 'PATIENT',
        },
      });
    }
    return new HttpResponse(null, { status: 401 });
  }),

  http.post(`${API_URL}/auth/register`, async ({ request }) => {
    return HttpResponse.json({
      token: 'fake-jwt-token',
      user: {
        id: 'user-1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'PATIENT',
      },
    });
  }),

  // Doctors
  http.get(`${API_URL}/doctors`, () => {
    return HttpResponse.json([
      {
        id: 'doc-1',
        user: { name: 'Dr. Richard James', image: '/doc1.png' },
        speciality: 'General_physician',
        degree: 'MBBS',
        experience: '4 Years',
        about: 'Dr. Richard has a strong commitment...',
        fees: 50,
        addressLine1: '123 Lane',
        addressLine2: 'City',
        available: true,
      },
      {
        id: 'doc-2',
        user: { name: 'Dr. Sarah Smith', image: '/doc2.png' },
        speciality: 'Gynecologist',
        degree: 'MBBS',
        experience: '3 Years',
        about: 'Dr. Sarah is...',
        fees: 60,
        addressLine1: '456 Street',
        addressLine2: 'City',
        available: true,
      },
    ]);
  }),

  http.get(`${API_URL}/doctors/:id`, ({ params }) => {
    const { id } = params;
    return HttpResponse.json({
      id: id,
      user: { name: 'Dr. Richard James', image: '/doc1.png' },
      speciality: 'General_physician',
      degree: 'MBBS',
      experience: '4 Years',
      about: 'Dr. Richard has a strong commitment...',
      fees: 50,
      addressLine1: '123 Lane',
      addressLine2: 'City',
      available: true,
    });
  }),

  http.get(`${API_URL}/doctors/:id/slots`, () => {
    // Return some dummy slots
    return HttpResponse.json([
      { datetime: new Date().toISOString(), time: '10:00 AM' },
      { datetime: new Date().toISOString(), time: '10:30 AM' },
    ]);
  }),

  http.get(`${API_URL}/doctors/speciality/:speciality`, () => {
    return HttpResponse.json([
      {
        id: 'doc-2',
        user: { name: 'Dr. Sarah Smith', image: '/doc2.png' },
        speciality: 'Gynecologist',
        available: true,
      },
    ]);
  }),

  // Appointments
  http.post(`${API_URL}/appointments/book`, () => {
    return HttpResponse.json({ success: true, message: 'Appointment booked' });
  }),

  http.get(`${API_URL}/appointments/user`, () => {
    return HttpResponse.json([
      {
        id: 'appt-1',
        doctor: {
          user: { name: 'Dr. Richard James', image: '/doc1.png' },
          speciality: 'General_physician',
          addressLine1: '123 Lane',
          addressLine2: 'City',
        },
        appointmentDate: new Date().toISOString(),
        timeSlot: '10:00 AM',
        status: 'PENDING',
        paymentStatus: 'UNPAID',
      },
    ]);
  }),

  // User Profile
  http.get(`${API_URL}/user/profile`, () => {
    return HttpResponse.json({
      name: 'Test User',
      email: 'test@example.com',
      phone: '1234567890',
      address: { line1: 'My House', line2: 'Street' },
      gender: 'MALE',
      dateOfBirth: '1990-01-01',
      image: '/profile.png',
    });
  }),

  http.put(`${API_URL}/user/profile`, async ({ request }) => {
    const data = await request.json();
    return HttpResponse.json({
      ...data,
      email: 'test@example.com', // email usually doesn't change
    });
  }),
];
