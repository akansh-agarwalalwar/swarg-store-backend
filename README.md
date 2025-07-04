# Backend API for Admin & Subadmin Management

## Overview
This backend provides RESTful APIs for managing Admins, Subadmins, Posted IDs, and monthly rent payments. It supports authentication, password reset via OTP, subadmin pausing, and cascading status updates for posted IDs.

## Features
- Admin and Subadmin registration/login
- Password reset with OTP (email)
- Subadmin rent payment tracking
- Admin can pause subadmins and their posted IDs
- Media upload for posted IDs

## Tech Stack
- Node.js, Express.js
- MongoDB (Mongoose)
- Nodemailer (for email)
- Multer (for file uploads)

## Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Variables:**
   Create a `.env` file in the backend directory with the following:
   ```env
   PORT=5000
   MONGO_URL=mongodb://localhost:27017/your-db
   JWT_SECRET=your_jwt_secret
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_email_password
   FROM_EMAIL=your_email@gmail.com
   ```

3. **Run the server:**
   ```bash
   npm run dev
   ```

## API Endpoints

### Auth & User Management
- `POST /api/admin/register` — Register admin
- `POST /api/admin/login` — Admin login
- `POST /api/subadmin/register` — Register subadmin (admin only)
- `POST /api/subadmin/login` — Subadmin login

### Password Reset (Admin & Subadmin)
- `POST /api/admin/request-password-reset` — Request OTP
- `POST /api/admin/verify-otp` — Verify OTP
- `POST /api/admin/reset-password` — Reset password
- `POST /api/subadmin/request-password-reset` — Request OTP
- `POST /api/subadmin/verify-otp` — Verify OTP
- `POST /api/subadmin/reset-password` — Reset password

### Subadmin Management
- `GET /api/subadmin/` — List all subadmins (admin only)
- `PUT /api/subadmin/:id` — Update subadmin (admin only, can pause)
- `DELETE /api/subadmin/:id` — Delete subadmin (admin only)

### Posted IDs
- `POST /api/postedid/create` — Create posted ID (admin/subadmin)
- `GET /api/postedid/` — List all posted IDs
- `GET /api/postedid/:id` — Get posted ID by ID
- `PATCH /api/postedid/:id/status` — Update posted ID status
- `PUT /api/postedid/:id` — Update posted ID

### Subadmin Rent
- `POST /api/subadmin/pay-rent` — Mark rent as paid for a month
- `GET /api/subadmin/rent-status` — Get rent payment status (by subadmin, month, year)

## Notes
- All sensitive actions require authentication (JWT in `Authorization` header).
- Media uploads are handled via `/uploads` directory.
- Email features require valid SMTP credentials.
- When a subadmin is paused, all their posted IDs are also paused.

## License
MIT
