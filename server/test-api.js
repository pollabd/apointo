const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
let authToken = '';
let patientToken = '';
let doctorToken = '';
let adminToken = '';
let testDoctorId = '';
let testAppointmentId = '';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(name) {
  console.log(`\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  log(`Testing: ${name}`, 'blue');
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Test 1: Health Check
async function testHealthCheck() {
  logTest('Health Check');
  try {
    const response = await axios.get(`${BASE_URL.replace('/api', '')}/`);
    logSuccess('Server is running');
    return true;
  } catch (error) {
    logError(`Server not responding: ${error.message}`);
    return false;
  }
}

// Test 2: Register Patient
async function testRegisterPatient() {
  logTest('Register Patient');
  try {
    const response = await axios.post(`${BASE_URL}/auth/register`, {
      email: `testpatient${Date.now()}@test.com`,
      password: 'password123',
      name: 'Test Patient',
      phone: '+1234567890',
      role: 'PATIENT',
    });
    
    if (response.data.token) {
      patientToken = response.data.token;
      logSuccess('Patient registered successfully');
      logSuccess(`Token received: ${patientToken.substring(0, 20)}...`);
      return true;
    }
  } catch (error) {
    logError(`Registration failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Test 3: Login Patient
async function testLoginPatient() {
  logTest('Login Patient');
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'patient@test.com',
      password: 'password123',
    });
    
    if (response.data.token) {
      patientToken = response.data.token;
      logSuccess('Patient login successful');
      logSuccess(`User: ${response.data.user.name} (${response.data.user.role})`);
      return true;
    }
  } catch (error) {
    logError(`Login failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Test 4: Login Doctor
async function testLoginDoctor() {
  logTest('Login Doctor');
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'richard.james@apointo.com',
      password: 'password123',
    });
    
    if (response.data.token) {
      doctorToken = response.data.token;
      logSuccess('Doctor login successful');
      logSuccess(`User: ${response.data.user.name} (${response.data.user.role})`);
      return true;
    }
  } catch (error) {
    logError(`Login failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Test 5: Login Admin
async function testLoginAdmin() {
  logTest('Login Admin');
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@apointo.com',
      password: 'password123',
    });
    
    if (response.data.token) {
      adminToken = response.data.token;
      logSuccess('Admin login successful');
      logSuccess(`User: ${response.data.user.name} (${response.data.user.role})`);
      return true;
    }
  } catch (error) {
    logError(`Login failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Test 6: Get All Doctors (Public)
async function testGetAllDoctors() {
  logTest('Get All Doctors (Public)');
  try {
    const response = await axios.get(`${BASE_URL}/doctors`);
    
    if (response.data && response.data.length > 0) {
      testDoctorId = response.data[0].id;
      logSuccess(`Found ${response.data.length} doctors`);
      logSuccess(`First doctor: ${response.data[0].user.name} (${response.data[0].speciality})`);
      logSuccess(`Saved doctor ID for testing: ${testDoctorId}`);
      return true;
    }
  } catch (error) {
    logError(`Failed to get doctors: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Test 7: Get Doctor by ID
async function testGetDoctorById() {
  logTest('Get Doctor by ID');
  try {
    const response = await axios.get(`${BASE_URL}/doctors/${testDoctorId}`);
    
    if (response.data) {
      logSuccess(`Doctor: ${response.data.user.name}`);
      logSuccess(`Speciality: ${response.data.speciality}`);
      logSuccess(`Fees: $${response.data.fees}`);
      return true;
    }
  } catch (error) {
    logError(`Failed to get doctor: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Test 8: Get Doctors by Speciality
async function testGetDoctorsBySpeciality() {
  logTest('Get Doctors by Speciality');
  try {
    const response = await axios.get(`${BASE_URL}/doctors/speciality/General_physician`);
    
    if (response.data) {
      logSuccess(`Found ${response.data.length} General Physicians`);
      return true;
    }
  } catch (error) {
    logError(`Failed to get doctors by speciality: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Test 9: Get Available Slots
async function testGetAvailableSlots() {
  logTest('Get Available Time Slots');
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    
    const response = await axios.get(`${BASE_URL}/doctors/${testDoctorId}/slots?date=${dateStr}`);
    
    if (response.data) {
      logSuccess(`Found ${response.data.length} available slots`);
      if (response.data.length > 0) {
        logSuccess(`First slot: ${response.data[0].time}`);
      }
      return true;
    }
  } catch (error) {
    logError(`Failed to get slots: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Test 10: Get User Profile
async function testGetUserProfile() {
  logTest('Get User Profile');
  try {
    const response = await axios.get(`${BASE_URL}/user/profile`, {
      headers: { Authorization: `Bearer ${patientToken}` },
    });
    
    if (response.data) {
      logSuccess(`Profile: ${response.data.name}`);
      logSuccess(`Email: ${response.data.email}`);
      logSuccess(`Role: ${response.data.role}`);
      return true;
    }
  } catch (error) {
    logError(`Failed to get profile: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Test 11: Update User Profile
async function testUpdateUserProfile() {
  logTest('Update User Profile');
  try {
    const response = await axios.put(
      `${BASE_URL}/user/profile`,
      {
        phone: '+1987654321',
        gender: 'MALE',
      },
      {
        headers: { Authorization: `Bearer ${patientToken}` },
      }
    );
    
    if (response.data) {
      logSuccess('Profile updated successfully');
      logSuccess(`Updated phone: ${response.data.phone}`);
      return true;
    }
  } catch (error) {
    logError(`Failed to update profile: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Test 12: Book Appointment
async function testBookAppointment() {
  logTest('Book Appointment');
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    
    const response = await axios.post(
      `${BASE_URL}/appointments/book`,
      {
        doctorId: testDoctorId,
        appointmentDate: dateStr,
        timeSlot: '10:00 AM',
      },
      {
        headers: { Authorization: `Bearer ${patientToken}` },
      }
    );
    
    if (response.data) {
      testAppointmentId = response.data.id;
      logSuccess('Appointment booked successfully');
      logSuccess(`Appointment ID: ${testAppointmentId}`);
      logSuccess(`Date: ${dateStr} at 10:00 AM`);
      logSuccess(`Status: ${response.data.status}`);
      return true;
    }
  } catch (error) {
    logError(`Failed to book appointment: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Test 13: Get User Appointments
async function testGetUserAppointments() {
  logTest('Get User Appointments');
  try {
    const response = await axios.get(`${BASE_URL}/appointments/user`, {
      headers: { Authorization: `Bearer ${patientToken}` },
    });
    
    if (response.data) {
      logSuccess(`Found ${response.data.length} appointments`);
      if (response.data.length > 0) {
        logSuccess(`Latest appointment status: ${response.data[0].status}`);
      }
      return true;
    }
  } catch (error) {
    logError(`Failed to get appointments: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Test 14: Cancel Appointment
async function testCancelAppointment() {
  logTest('Cancel Appointment');
  try {
    const response = await axios.put(
      `${BASE_URL}/appointments/${testAppointmentId}/cancel`,
      {
        reason: 'Test cancellation',
      },
      {
        headers: { Authorization: `Bearer ${patientToken}` },
      }
    );
    
    if (response.data) {
      logSuccess('Appointment cancelled successfully');
      logSuccess(`Status: ${response.data.status}`);
      return true;
    }
  } catch (error) {
    logError(`Failed to cancel appointment: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Test 15: Admin - Get Dashboard Stats
async function testAdminDashboardStats() {
  logTest('Admin Dashboard Stats');
  try {
    const response = await axios.get(`${BASE_URL}/admin/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    
    if (response.data) {
      logSuccess(`Total Users: ${response.data.totalUsers}`);
      logSuccess(`Total Doctors: ${response.data.totalDoctors}`);
      logSuccess(`Total Patients: ${response.data.totalPatients}`);
      logSuccess(`Total Appointments: ${response.data.totalAppointments}`);
      logSuccess(`Total Revenue: $${response.data.totalRevenue}`);
      return true;
    }
  } catch (error) {
    logError(`Failed to get stats: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Test 16: Admin - Get All Users
async function testAdminGetAllUsers() {
  logTest('Admin Get All Users');
  try {
    const response = await axios.get(`${BASE_URL}/admin/users?page=1&limit=10`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    
    if (response.data) {
      logSuccess(`Found ${response.data.total} total users`);
      logSuccess(`Page ${response.data.page} of ${response.data.totalPages}`);
      return true;
    }
  } catch (error) {
    logError(`Failed to get users: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Test 17: Admin - Get All Appointments
async function testAdminGetAllAppointments() {
  logTest('Admin Get All Appointments');
  try {
    const response = await axios.get(`${BASE_URL}/admin/appointments?page=1&limit=10`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    
    if (response.data) {
      logSuccess(`Found ${response.data.total} total appointments`);
      logSuccess(`Page ${response.data.page} of ${response.data.totalPages}`);
      return true;
    }
  } catch (error) {
    logError(`Failed to get appointments: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Test 18: Role-Based Access Control
async function testRoleBasedAccess() {
  logTest('Role-Based Access Control');
  try {
    // Try to access admin endpoint with patient token (should fail)
    try {
      await axios.get(`${BASE_URL}/admin/stats`, {
        headers: { Authorization: `Bearer ${patientToken}` },
      });
      logError('RBAC failed: Patient was able to access admin endpoint');
      return false;
    } catch (error) {
      if (error.response?.status === 403) {
        logSuccess('RBAC working: Patient correctly denied access to admin endpoint');
        return true;
      } else {
        logError(`Unexpected error: ${error.message}`);
        return false;
      }
    }
  } catch (error) {
    logError(`RBAC test failed: ${error.message}`);
    return false;
  }
}

// Main test runner
async function runAllTests() {
  console.log('\n');
  log('╔════════════════════════════════════════════════════════════╗', 'cyan');
  log('║         APOINTO BACKEND API TEST SUITE                    ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════╝', 'cyan');
  console.log('\n');
  
  log('Waiting for server to be ready...', 'yellow');
  await sleep(3000);
  
  const tests = [
    { name: 'Health Check', fn: testHealthCheck },
    { name: 'Register Patient', fn: testRegisterPatient },
    { name: 'Login Patient', fn: testLoginPatient },
    { name: 'Login Doctor', fn: testLoginDoctor },
    { name: 'Login Admin', fn: testLoginAdmin },
    { name: 'Get All Doctors', fn: testGetAllDoctors },
    { name: 'Get Doctor by ID', fn: testGetDoctorById },
    { name: 'Get Doctors by Speciality', fn: testGetDoctorsBySpeciality },
    { name: 'Get Available Slots', fn: testGetAvailableSlots },
    { name: 'Get User Profile', fn: testGetUserProfile },
    { name: 'Update User Profile', fn: testUpdateUserProfile },
    { name: 'Book Appointment', fn: testBookAppointment },
    { name: 'Get User Appointments', fn: testGetUserAppointments },
    { name: 'Cancel Appointment', fn: testCancelAppointment },
    { name: 'Admin Dashboard Stats', fn: testAdminDashboardStats },
    { name: 'Admin Get All Users', fn: testAdminGetAllUsers },
    { name: 'Admin Get All Appointments', fn: testAdminGetAllAppointments },
    { name: 'Role-Based Access Control', fn: testRoleBasedAccess },
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    const result = await test.fn();
    if (result) {
      passed++;
    } else {
      failed++;
    }
    await sleep(500);
  }
  
  console.log('\n');
  log('╔════════════════════════════════════════════════════════════╗', 'cyan');
  log('║                    TEST RESULTS                            ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════╝', 'cyan');
  console.log('\n');
  
  log(`Total Tests: ${tests.length}`, 'blue');
  log(`Passed: ${passed}`, 'green');
  log(`Failed: ${failed}`, 'red');
  log(`Success Rate: ${((passed / tests.length) * 100).toFixed(2)}%`, 'blue');
  
  console.log('\n');
  
  if (failed === 0) {
    log('╔════════════════════════════════════════════════════════════╗', 'green');
    log('║              🎉 ALL TESTS PASSED! 🎉                      ║', 'green');
    log('║         Backend is working perfectly!                      ║', 'green');
    log('╚════════════════════════════════════════════════════════════╝', 'green');
  } else {
    log('╔════════════════════════════════════════════════════════════╗', 'red');
    log('║              ⚠️  SOME TESTS FAILED ⚠️                     ║', 'red');
    log('║         Please check the errors above                      ║', 'red');
    log('╚════════════════════════════════════════════════════════════╝', 'red');
  }
  
  console.log('\n');
  process.exit(failed === 0 ? 0 : 1);
}

// Run tests
runAllTests().catch((error) => {
  logError(`Test suite failed: ${error.message}`);
  process.exit(1);
});
