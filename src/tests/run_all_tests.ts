import express from 'express';
import apiRouter from '../routes/api';
import { mockUsers, mockFacilities, mockCourts, mockBlocks, mockBookings, mockOtps } from '../data/mockStore';

const app = express();
app.use(express.json());
app.use('/api', apiRouter);

const server = app.listen(0);
const address = server.address() as any;
const PORT = address.port;
const BASE_URL = `http://localhost:${PORT}/api`;

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, testName: string, failureDetails?: string) {
  if (condition) {
    results.push({ name: testName, passed: true });
    console.log(`  ✅ PASS: ${testName}`);
  } else {
    results.push({ name: testName, passed: false, error: failureDetails });
    console.error(`  ❌ FAIL: ${testName} - ${failureDetails}`);
  }
}

async function runTests() {
  console.log(`\n🚀 Starting QuickCourt Backend End-to-End Test Suite on Port ${PORT}...\n`);

  let ownerToken = '';
  let customerToken = '';
  let adminToken = '';

  // ----------------------------------------------------
  // 1. AUTHENTICATION & OTP TESTS
  // ----------------------------------------------------
  console.log(`--- [1. AUTH & OTP TESTS] ---`);

  // Test 1.1: Register new user
  try {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Runner',
        email: 'testrunner@quickcourt.com',
        password: 'password123',
        role: 'USER',
      }),
    });
    const data: any = await res.json();
    assert(res.status === 201 && data.success === true, 'POST /api/auth/register creates user & generates OTP');
  } catch (e: any) {
    assert(false, 'POST /api/auth/register creates user & generates OTP', e.message);
  }

  // Test 1.2: Register duplicate email
  try {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Runner Duplicate',
        email: 'testrunner@quickcourt.com',
        password: 'password123',
      }),
    });
    const data: any = await res.json();
    assert(res.status === 400 && data.success === false, 'POST /api/auth/register rejects duplicate email');
  } catch (e: any) {
    assert(false, 'POST /api/auth/register rejects duplicate email', e.message);
  }

  // Test 1.3: Verify OTP with valid code
  try {
    const otpObj = mockOtps.find((o: any) => o.email === 'testrunner@quickcourt.com');
    assert(!!otpObj, 'OTP record found in mock store for newly registered user');

    if (otpObj) {
      const res = await fetch(`${BASE_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'testrunner@quickcourt.com',
          code: otpObj.code,
        }),
      });
      const data: any = await res.json();
      assert(res.status === 200 && data.success === true && !!data.data.token, 'POST /api/auth/verify-otp verifies valid OTP and returns JWT token');
    }
  } catch (e: any) {
    assert(false, 'POST /api/auth/verify-otp verifies valid OTP and returns JWT token', e.message);
  }

  // Test 1.4: Verify OTP with invalid code
  try {
    const res = await fetch(`${BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'testrunner@quickcourt.com',
        code: '999999',
      }),
    });
    const data: any = await res.json();
    assert(res.status === 400 && data.success === false, 'POST /api/auth/verify-otp rejects invalid code');
  } catch (e: any) {
    assert(false, 'POST /api/auth/verify-otp rejects invalid code', e.message);
  }

  // Test 1.5: Login existing seed users
  try {
    // Login Owner
    let res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'owner@quickcourt.com', password: 'password123' }),
    });
    let data: any = await res.json();
    ownerToken = data.token;
    assert(res.status === 200 && !!ownerToken, 'POST /api/auth/login logs in Facility Owner');

    // Login Customer
    res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'player@quickcourt.com', password: 'password123' }),
    });
    data = await res.json();
    customerToken = data.token;
    assert(res.status === 200 && !!customerToken, 'POST /api/auth/login logs in Customer User');

    // Login Admin
    res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@quickcourt.com', password: 'password123' }),
    });
    data = await res.json();
    adminToken = data.token;
    assert(res.status === 200 && !!adminToken, 'POST /api/auth/login logs in Admin User');
  } catch (e: any) {
    assert(false, 'Login seed users', e.message);
  }

  // Test 1.6: GET /api/users/me authenticated vs unauthenticated
  try {
    let res = await fetch(`${BASE_URL}/users/me`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    let data: any = await res.json();
    assert(res.status === 200 && data.user.email === 'player@quickcourt.com', 'GET /api/users/me returns authenticated user details');

    res = await fetch(`${BASE_URL}/users/me`);
    assert(res.status === 401, 'GET /api/users/me rejects unauthenticated request');
  } catch (e: any) {
    assert(false, 'GET /api/users/me endpoint', e.message);
  }

  // ----------------------------------------------------
  // 2. VENUE DISCOVERY & SMART PICKS
  // ----------------------------------------------------
  console.log(`\n--- [2. VENUE DISCOVERY & SMART PICKS] ---`);

  // Test 2.1: GET /api/venues (Public)
  try {
    const res = await fetch(`${BASE_URL}/venues`);
    const data: any = await res.json();
    assert(res.status === 200 && data.venues.length > 0, 'GET /api/venues returns list of approved venues');
    assert(data.venues.every((v: any) => v.status === 'APPROVED'), 'GET /api/venues only returns APPROVED venues (BR-02)');
  } catch (e: any) {
    assert(false, 'GET /api/venues', e.message);
  }

  // Test 2.2: GET /api/venues with search & filters
  try {
    let res = await fetch(`${BASE_URL}/venues?search=Smash`);
    let data: any = await res.json();
    assert(data.venues.length === 1 && data.venues[0].name.includes('Smash'), 'GET /api/venues?search=Smash filters correctly');

    res = await fetch(`${BASE_URL}/venues?sport=Badminton`);
    data = await res.json();
    assert(data.venues.length > 0, 'GET /api/venues?sport=Badminton filters by sport');

    res = await fetch(`${BASE_URL}/venues?minPrice=400&maxPrice=600`);
    data = await res.json();
    assert(data.venues.length > 0 && data.venues.every((v: any) => v.startingPrice >= 400 && v.startingPrice <= 600), 'GET /api/venues price range filter works');
  } catch (e: any) {
    assert(false, 'GET /api/venues filters', e.message);
  }

  // Test 2.3: GET /api/venues/:id (Approved vs Pending)
  try {
    let res = await fetch(`${BASE_URL}/venues/fac-1`);
    let data: any = await res.json();
    assert(res.status === 200 && data.venue.id === 'fac-1', 'GET /api/venues/fac-1 returns detailed approved venue');

    res = await fetch(`${BASE_URL}/venues/fac-2`);
    data = await res.json();
    assert(res.status === 404, 'GET /api/venues/fac-2 hides pending venue from public view');
  } catch (e: any) {
    assert(false, 'GET /api/venues/:id details', e.message);
  }

  // Test 2.4: GET /api/smart-picks
  try {
    const res = await fetch(`${BASE_URL}/smart-picks?courtId=crt-1&date=2026-08-28`);
    const data: any = await res.json();
    assert(res.status === 200 && data.recommendations.length > 0, 'GET /api/smart-picks returns slot recommendations');
  } catch (e: any) {
    assert(false, 'GET /api/smart-picks', e.message);
  }

  // ----------------------------------------------------
  // 3. FACILITY OWNER MANAGEMENT & COURTS
  // ----------------------------------------------------
  console.log(`\n--- [3. FACILITY OWNER MANAGEMENT & COURTS] ---`);

  let createdFacilityId = '';
  let createdCourtId = '';

  // Test 3.1: Create facility as Owner
  try {
    const res = await fetch(`${BASE_URL}/facilities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ownerToken}`,
      },
      body: JSON.stringify({
        name: 'Apex Sports Club',
        description: 'Modern sports center with indoor synthetic courts.',
        address: '88 Tech Park Way',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560100',
        phone: '+91 9988776655',
        sports: ['Badminton', 'Table Tennis'],
        amenities: ['Parking', 'AC', 'Locker'],
      }),
    });
    const data: any = await res.json();
    createdFacilityId = data.facility?.id;
    assert(res.status === 201 && data.facility.status === 'PENDING', 'POST /api/facilities creates new facility with PENDING status');
  } catch (e: any) {
    assert(false, 'POST /api/facilities create facility', e.message);
  }

  // Test 3.2: Role check - Create facility as Customer (Should be Forbidden)
  try {
    const res = await fetch(`${BASE_URL}/facilities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        name: 'Illegal Facility',
        description: 'Customer trying to create facility.',
        address: '123 Fake Street',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560000',
        phone: '+91 1122334455',
        sports: ['Tennis'],
      }),
    });
    assert(res.status === 403, 'POST /api/facilities rejects non-owner user (403 Forbidden)');
  } catch (e: any) {
    assert(false, 'POST /api/facilities role check', e.message);
  }

  // Test 3.3: GET /api/facilities/my
  try {
    const res = await fetch(`${BASE_URL}/facilities/my`, {
      headers: { Authorization: `Bearer ${ownerToken}` },
    });
    const data: any = await res.json();
    assert(res.status === 200 && data.facilities.length >= 2, 'GET /api/facilities/my lists owner facilities');
  } catch (e: any) {
    assert(false, 'GET /api/facilities/my', e.message);
  }

  // Test 3.4: Add court to facility
  try {
    const res = await fetch(`${BASE_URL}/facilities/${createdFacilityId}/courts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ownerToken}`,
      },
      body: JSON.stringify({
        name: 'Synthetic Court 1',
        sport: 'Badminton',
        pricePerHour: 600,
        openingTime: '06:00',
        closingTime: '23:00',
      }),
    });
    const data: any = await res.json();
    createdCourtId = data.court?.id;
    assert(res.status === 201 && !!createdCourtId, 'POST /api/facilities/:id/courts adds court to facility');
  } catch (e: any) {
    assert(false, 'POST /api/facilities/:id/courts add court', e.message);
  }

  // Test 3.5: Add court as ADMIN user to test ownership/role check
  try {
    const res = await fetch(`${BASE_URL}/facilities/${createdFacilityId}/courts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: 'Admin Created Court',
        sport: 'Table Tennis',
        pricePerHour: 300,
        openingTime: '08:00',
        closingTime: '20:00',
      }),
    });
    const data: any = await res.json();
    assert(res.status === 201, 'POST /api/facilities/:id/courts allows ADMIN user to add court', `Status: ${res.status}, msg: ${data.message}`);
  } catch (e: any) {
    assert(false, 'POST /api/facilities/:id/courts as ADMIN', e.message);
  }

  // Test 3.6: Update Court
  try {
    const res = await fetch(`${BASE_URL}/courts/${createdCourtId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ownerToken}`,
      },
      body: JSON.stringify({
        pricePerHour: 650,
      }),
    });
    const data: any = await res.json();
    assert(res.status === 200 && data.court.pricePerHour === 650, 'PATCH /api/courts/:courtId updates court details');
  } catch (e: any) {
    assert(false, 'PATCH /api/courts/:courtId', e.message);
  }

  // ----------------------------------------------------
  // 4. MAINTENANCE BLOCKS & AVAILABILITY
  // ----------------------------------------------------
  console.log(`\n--- [4. MAINTENANCE BLOCKS & AVAILABILITY] ---`);

  let createdBlockId = '';

  // Test 4.1: GET availability
  try {
    const res = await fetch(`${BASE_URL}/courts/crt-1/availability?date=2026-08-28`);
    const data: any = await res.json();
    assert(res.status === 200 && data.slots.length > 0, 'GET /api/courts/:id/availability returns slots');
    const slot13 = data.slots.find((s: any) => s.startTime === '13:00');
    assert(slot13 && slot13.status === 'MAINTENANCE', 'GET /api/courts/:id/availability marks blocked slots as MAINTENANCE');
  } catch (e: any) {
    assert(false, 'GET /api/courts/:id/availability', e.message);
  }

  // Test 4.2: Create court block
  try {
    const res = await fetch(`${BASE_URL}/courts/crt-1/blocks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ownerToken}`,
      },
      body: JSON.stringify({
        date: '2026-08-29',
        startTime: '10:00',
        endTime: '12:00',
        reason: 'Lighting repairs',
      }),
    });
    const data: any = await res.json();
    createdBlockId = data.block?.id;
    assert(res.status === 201 && !!createdBlockId, 'POST /api/courts/:id/blocks creates maintenance block');
  } catch (e: any) {
    assert(false, 'POST /api/courts/:id/blocks', e.message);
  }

  // Test 4.3: Delete court block
  try {
    const res = await fetch(`${BASE_URL}/court-blocks/${createdBlockId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${ownerToken}` },
    });
    const data: any = await res.json();
    assert(res.status === 200 && data.success === true, 'DELETE /api/court-blocks/:id removes court block');
  } catch (e: any) {
    assert(false, 'DELETE /api/court-blocks/:id', e.message);
  }

  // ----------------------------------------------------
  // 5. BOOKINGS & PAYMENTS
  // ----------------------------------------------------
  console.log(`\n--- [5. BOOKINGS & PAYMENTS] ---`);

  let newBookingId = '';

  // Test 5.1: Create valid booking
  try {
    const res = await fetch(`${BASE_URL}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        courtId: 'crt-1',
        date: '2026-08-28',
        startTime: '08:00',
        endTime: '09:00',
      }),
    });
    const data: any = await res.json();
    newBookingId = data.booking?.id;
    assert(res.status === 201 && !!newBookingId, 'POST /api/bookings creates valid booking');
  } catch (e: any) {
    assert(false, 'POST /api/bookings create valid booking', e.message);
  }

  // Test 5.2: Double booking conflict (Same court, date, startTime)
  try {
    const res = await fetch(`${BASE_URL}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        courtId: 'crt-1',
        date: '2026-08-28',
        startTime: '08:00',
        endTime: '09:00',
      }),
    });
    assert(res.status === 409, 'POST /api/bookings returns 409 Conflict for double booking');
  } catch (e: any) {
    assert(false, 'POST /api/bookings double booking check', e.message);
  }

  // Test 5.3: Booking on maintenance block range (e.g. 14:00 on block 13:00-15:00)
  try {
    const res = await fetch(`${BASE_URL}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        courtId: 'crt-1',
        date: '2026-08-28',
        startTime: '14:00',
        endTime: '15:00',
      }),
    });
    const data: any = await res.json();
    assert(res.status === 400 && data.success === false, 'POST /api/bookings prevents booking on blocked time range (14:00 on 13:00-15:00 block)', `Status: ${res.status}, msg: ${data.message}`);
  } catch (e: any) {
    assert(false, 'POST /api/bookings maintenance block range check', e.message);
  }

  // Test 5.4: Process payment
  try {
    const res = await fetch(`${BASE_URL}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        bookingId: newBookingId,
        paymentMethod: 'UPI',
      }),
    });
    const data: any = await res.json();
    assert(res.status === 200 && data.booking.paymentStatus === 'PAID', 'POST /api/payments processes payment successfully');
  } catch (e: any) {
    assert(false, 'POST /api/payments', e.message);
  }

  // Test 5.5: GET /api/bookings (My Bookings)
  try {
    const res = await fetch(`${BASE_URL}/bookings`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    const data: any = await res.json();
    assert(res.status === 200 && data.bookings.length > 0, 'GET /api/bookings returns user bookings');
  } catch (e: any) {
    assert(false, 'GET /api/bookings', e.message);
  }

  // Test 5.6: Cancel booking
  try {
    const res = await fetch(`${BASE_URL}/bookings/${newBookingId}/cancel`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({ reason: 'Schedule conflict' }),
    });
    const data: any = await res.json();
    assert(res.status === 200 && data.booking.status === 'CANCELLED', 'PATCH /api/bookings/:id/cancel cancels booking');
  } catch (e: any) {
    assert(false, 'PATCH /api/bookings/:id/cancel', e.message);
  }

  // ----------------------------------------------------
  // 6. OWNER BOOKINGS & ANALYTICS
  // ----------------------------------------------------
  console.log(`\n--- [6. OWNER BOOKINGS & ANALYTICS] ---`);

  try {
    const res = await fetch(`${BASE_URL}/owner/bookings`, {
      headers: { Authorization: `Bearer ${ownerToken}` },
    });
    const data: any = await res.json();
    assert(res.status === 200 && Array.isArray(data.bookings), 'GET /api/owner/bookings returns owner bookings');
  } catch (e: any) {
    assert(false, 'GET /api/owner/bookings', e.message);
  }

  try {
    const res = await fetch(`${BASE_URL}/owner/analytics`, {
      headers: { Authorization: `Bearer ${ownerToken}` },
    });
    const data: any = await res.json();
    assert(res.status === 200 && !!data.kpis && !!data.analytics, 'GET /api/owner/analytics returns owner KPIs & breakdown');
  } catch (e: any) {
    assert(false, 'GET /api/owner/analytics', e.message);
  }

  // ----------------------------------------------------
  // 7. ADMIN OPERATIONS
  // ----------------------------------------------------
  console.log(`\n--- [7. ADMIN OPERATIONS] ---`);

  // Test 7.1: GET Admin Dashboard
  try {
    let res = await fetch(`${BASE_URL}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    let data: any = await res.json();
    assert(res.status === 200 && !!data.kpis, 'GET /api/admin/dashboard returns platform KPIs');

    res = await fetch(`${BASE_URL}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    assert(res.status === 403, 'GET /api/admin/dashboard rejects customer role (403 Forbidden)');
  } catch (e: any) {
    assert(false, 'GET /api/admin/dashboard', e.message);
  }

  // Test 7.2: GET Pending Facilities
  try {
    const res = await fetch(`${BASE_URL}/admin/facilities/pending`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data: any = await res.json();
    assert(res.status === 200 && data.facilities.length > 0, 'GET /api/admin/facilities/pending returns pending facilities');
  } catch (e: any) {
    assert(false, 'GET /api/admin/facilities/pending', e.message);
  }

  // Test 7.3: Approve Facility
  try {
    const res = await fetch(`${BASE_URL}/admin/facilities/${createdFacilityId}/approve`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data: any = await res.json();
    assert(res.status === 200 && data.facility.status === 'APPROVED', 'PATCH /api/admin/facilities/:id/approve approves facility');
  } catch (e: any) {
    assert(false, 'PATCH /api/admin/facilities/:id/approve', e.message);
  }

  // Test 7.4: GET Admin Users
  try {
    const res = await fetch(`${BASE_URL}/admin/users`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data: any = await res.json();
    assert(res.status === 200 && data.users.length > 0, 'GET /api/admin/users returns platform users');
  } catch (e: any) {
    assert(false, 'GET /api/admin/users', e.message);
  }

  // Test 7.5: Ban user & verify ban enforcement
  try {
    let res = await fetch(`${BASE_URL}/admin/users/usr-customer-1/ban`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    let data: any = await res.json();
    assert(res.status === 200 && data.user.status === 'BANNED', 'PATCH /api/admin/users/:id/ban sets status to BANNED');

    // Attempt booking as banned user
    res = await fetch(`${BASE_URL}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        courtId: 'crt-1',
        date: '2026-08-28',
        startTime: '21:00',
        endTime: '22:00',
      }),
    });
    assert(res.status === 403, 'Banned user is prevented from creating bookings (BR-11)');

    // Unban user
    res = await fetch(`${BASE_URL}/admin/users/usr-customer-1/unban`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    data = await res.json();
    assert(res.status === 200 && data.user.status === 'ACTIVE', 'PATCH /api/admin/users/:id/unban restores user to ACTIVE status');
  } catch (e: any) {
    assert(false, 'Admin ban / unban user', e.message);
  }

  // ----------------------------------------------------
  // SUMMARY
  // ----------------------------------------------------
  console.log(`\n==================================================`);
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log(`📊 TEST SUITE SUMMARY:`);
  console.log(`   Total Tests: ${total}`);
  console.log(`   Passed:      ${passed}`);
  console.log(`   Failed:      ${failed}`);
  console.log(`==================================================\n`);

  if (failed > 0) {
    console.log(`❌ FAILING TESTS DETAILS:`);
    results.filter((r) => !r.passed).forEach((r) => {
      console.log(`   - ${r.name}: ${r.error}`);
    });
  }

  server.close();
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
