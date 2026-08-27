# QuickCourt Backend API Documentation

> **Base URL:** `https://unburied-jenell-levelly.ngrok-free.dev`  
> **Required Header:**  
> ```json
> {
>   "ngrok-skip-browser-warning": "true",
>   "Content-Type": "application/json"
> }
> ```

---

## 🔑 Pre-Seeded Test Credentials

| Role | Email | Password |
|------|-------|----------|
| **Customer** | `player@quickcourt.com` | `password123` |
| **Facility Owner** | `owner@quickcourt.com` | `password123` |
| **Admin** | `admin@quickcourt.com` | `password123` |

---

## 📋 Complete API Endpoints Reference

### 🔐 1. Authentication & OTP (5 Endpoints)

| Method | Endpoint | Description | Payload / Headers |
|--------|----------|-------------|-------------------|
| `POST` | `/api/auth/register` | Creates user, sends 6-digit OTP code | `{ "name": "Rahul", "email": "rahul@gmail.com", "password": "Password123", "role": "USER" }` |
| `POST` | `/api/auth/verify-otp` | Verifies OTP code, returns JWT token | `{ "email": "rahul@gmail.com", "code": "849201" }` |
| `POST` | `/api/auth/resend-otp` | Sends a new 6-digit OTP code | `{ "email": "rahul@gmail.com" }` |
| `POST` | `/api/auth/login` | Authenticates user, returns JWT token | `{ "email": "player@quickcourt.com", "password": "password123" }` |
| `GET` | `/api/users/me` | Fetches logged-in user profile | `Authorization: Bearer <TOKEN>` |

---

### 🏆 2. Customer / Venue Discovery & Booking (9 Endpoints)

| Method | Endpoint | Description | Query Params / Payload |
|--------|----------|-------------|------------------------|
| `GET` | `/api/venues` | Browse approved facilities | `?search=badminton&sport=Badminton&city=Bengaluru&minPrice=300&maxPrice=1000` |
| `GET` | `/api/venues/:id` | Specific venue details & active courts | Path param `:id` |
| `GET` | `/api/smart-picks` | Smart Pick slot recommendations | `?courtId=crt-1&date=YYYY-MM-DD` |
| `GET` | `/api/courts/:courtId/availability` | 1-hour slot grid state | `?date=YYYY-MM-DD` |
| `POST` | `/api/bookings` | Create booking (double-booking protected) | `{ "courtId": "crt-1", "date": "2026-08-28", "startTime": "18:00", "endTime": "19:00" }` |
| `POST` | `/api/payments` | Simulate payment execution | `{ "bookingId": "bkg-123", "paymentMethod": "CARD" }` |
| `GET` | `/api/bookings` | User booking history | `Authorization: Bearer <TOKEN>` |
| `GET` | `/api/bookings/:id` | Specific booking detail | `Authorization: Bearer <TOKEN>` |
| `PATCH` | `/api/bookings/:id/cancel` | Cancel booking & release slot | `{ "reason": "Change of plans" }` |

---

### 👤 3. User Profile (2 Endpoints)

| Method | Endpoint | Description | Payload |
|--------|----------|-------------|---------|
| `GET` | `/api/users/profile` | Get profile details | `Authorization: Bearer <TOKEN>` |
| `PATCH` | `/api/users/profile` | Update profile info | `{ "name": "Rahul Sharma", "profileImage": "https://..." }` |

---

### 🏢 4. Facility Owner Side (7 Endpoints)

| Method | Endpoint | Description | Payload / Headers |
|--------|----------|-------------|-------------------|
| `POST` | `/api/facilities` | Register facility (starts as `PENDING`) | Facility details object (`Authorization: Bearer <OWNER_TOKEN>`) |
| `GET` | `/api/facilities/my` | List owner's facilities | `Authorization: Bearer <OWNER_TOKEN>` |
| `PATCH` | `/api/facilities/:id` | Update facility details | `Authorization: Bearer <OWNER_TOKEN>` |
| `POST` | `/api/facilities/:facilityId/courts` | Add court to facility | `{ "name": "Court 1", "sport": "Badminton", "pricePerHour": 500, "openingTime": "06:00", "closingTime": "22:00" }` |
| `PATCH` | `/api/courts/:courtId` | Edit court price, hours, status | `Authorization: Bearer <OWNER_TOKEN>` |
| `POST` | `/api/courts/:courtId/blocks` | Block court slot for maintenance | `{ "date": "2026-08-28", "startTime": "13:00", "endTime": "15:00", "reason": "Maintenance" }` |
| `GET` | `/api/owner/analytics` | Revenue & court analytics | `Authorization: Bearer <OWNER_TOKEN>` |
| `GET` | `/api/owner/bookings` | Bookings for owner facilities | `Authorization: Bearer <OWNER_TOKEN>` |

---

### 🛡️ 5. Admin Side (7 Endpoints)

| Method | Endpoint | Description | Payload / Headers |
|--------|----------|-------------|-------------------|
| `GET` | `/api/admin/dashboard` | Platform KPI stats & revenue | `Authorization: Bearer <ADMIN_TOKEN>` |
| `GET` | `/api/admin/facilities/pending` | List pending facilities | `Authorization: Bearer <ADMIN_TOKEN>` |
| `PATCH` | `/api/admin/facilities/:id/approve` | Approve facility | `Authorization: Bearer <ADMIN_TOKEN>` |
| `PATCH` | `/api/admin/facilities/:id/reject` | Reject facility | `{ "reason": "Incomplete details" }` |
| `GET` | `/api/admin/users` | List & search platform users | `?search=rahul&role=USER&status=ACTIVE` |
| `PATCH` | `/api/admin/users/:id/ban` | Ban user | `Authorization: Bearer <ADMIN_TOKEN>` |
| `PATCH` | `/api/admin/users/:id/unban` | Unban user | `Authorization: Bearer <ADMIN_TOKEN>` |
