# LifeGift Network - Organ Donation & Sharing Platform

A premium, production-grade healthcare SaaS platform connecting organ donors with recipients in real-time. Built with React, Vite, TailwindCSS, and Supabase.

---

## Live Demo

[oragan-donation-and-sharing-network-526fazl5v.vercel.app](https://oragan-donation-and-sharing-network-526fazl5v.vercel.app)

---

## Screenshots

### Home Page
![Home Page](./screenshots/home.png)

### Login Page
![Login Page](./screenshots/login.png)

### Donor Registration
![Donor Registration](./screenshots/donate.png)

### Find Organ
![Find Organ](./screenshots/find-organ.png)

### Emergency Requests
![Emergency Requests](./screenshots/emergency.png)

---

## Features

- Real-time Organ Matching - AI-powered compatibility engine based on blood type, organ type, and location
- Role-based Dashboards - Separate dashboards for Donors, Receivers, Hospitals, and Admins
- Emergency Request System - 24/7 critical organ request monitoring with live alerts
- Live Notifications - Realtime Supabase-powered notification system
- Advanced Search and Filters - Search donors, organs, and emergency requests
- Secure Authentication - Supabase Auth with role-based access control
- Admin Control Panel - Full system oversight, donor and request management
- Responsive Design - Fully optimized for mobile, tablet, and desktop

---

## Tech Stack

| Layer      | Technology               |
|------------|--------------------------|
| Frontend   | React 18 + Vite          |
| Styling    | TailwindCSS + Custom CSS |
| Backend    | Supabase (PostgreSQL)    |
| Auth       | Supabase Auth            |
| Realtime   | Supabase Realtime        |
| Deployment | Vercel                   |
| Icons      | Lucide React             |
| Font       | Inter (Google Fonts)     |

---

## Setup and Installation

### 1. Clone the repository

```bash
git clone https://github.com/Missgauri/oragan-donation-and-sharing-network-.git
cd oragan-donation-and-sharing-network-
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy `.env.example` to `.env` and fill in your Supabase credentials:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Set up the database

Run these SQL files in your Supabase SQL Editor in order:

1. `supabase_matching.sql`
2. `supabase_notifications.sql`
3. `supabase_fix.sql`

### 5. Start development server

```bash
npm run dev
```

---

## Database Tables

| Table              | Description                          |
|--------------------|--------------------------------------|
| donors             | Donor registration records           |
| donor_profiles     | Detailed donor profiles for matching |
| recipient_requests | Organ request records                |
| organs             | Public organ registry                |
| matches            | Confirmed donor-recipient matches    |
| notifications      | User notification records            |

---

## Team

| Name            | Role                           | GitHub                                        |
|-----------------|--------------------------------|-----------------------------------------------|
| Gauri Nikam     | UI/UX Designer & Project Lead  | [@Missgauri](https://github.com/Missgauri)    |
| Vaibhav Jaiswal | Backend & Supabase Integration | [@jaiswalvaibhav019](https://github.com/jaiswalvaibhav019) |
| Pragati Dolas   | Frontend Development           | [@pragatidolas](https://github.com/pragatidolas) |
| Jana            | Testing & Documentation        | [@badejana](https://github.com/badejana)      |

---

## License

This project is for educational purposes. All rights reserved 2026 LifeGift Network.

---

Made with love to save lives.
