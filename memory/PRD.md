# KleverCal - Product Requirements Document

## Overview
**Product Name:** KleverCal  
**Type:** SaaS Scheduling Platform  
**Competitors:** zcal, TidyCal, Calendly  
**Status:** MVP Complete  
**Date:** February 2026

## Original Problem Statement
Create a competitive scheduling/calendar booking product like zcal or TidyCal with:
- All 3 calendar integrations (Google, Outlook, Apple)
- AI features: NLP scheduling + Lead scoring with Gemini
- JWT auth + Google social login
- Custom availability settings, meeting types, buffer times, limits
- Public booking pages with shareable links

## User Personas
1. **Freelancers** - Need simple scheduling for client consultations
2. **Sales Teams** - Require lead qualification before meetings
3. **Consultants** - Want branded booking pages
4. **Small Businesses** - Need efficient appointment management

## Core Requirements (Static)
- [x] User authentication (email/password + Google OAuth)
- [x] Meeting types management (CRUD)
- [x] Availability settings (weekly schedule)
- [x] Public booking pages
- [x] Appointments management
- [x] AI NLP scheduling
- [x] Lead scoring capability
- [ ] Calendar sync (Google, Outlook, Apple)
- [ ] Email reminders
- [ ] White-label custom domains

## Architecture
- **Frontend:** React 19 + Tailwind CSS + Shadcn UI
- **Backend:** FastAPI (Python)
- **Database:** MongoDB
- **AI:** Gemini 3 Flash via emergentintegrations
- **Auth:** JWT + Emergent Google OAuth

## What's Been Implemented (MVP - Feb 2026)

### Backend APIs
- `/api/auth/*` - Registration, login, session management
- `/api/booking-types/*` - Full CRUD for meeting types
- `/api/availability` - Weekly availability management
- `/api/appointments/*` - Booking creation and management
- `/api/ai/parse-schedule` - NLP scheduling with Gemini
- `/api/ai/lead-score` - Lead qualification AI
- `/api/public/*` - Public booking endpoints
- `/api/dashboard/stats` - Dashboard statistics
- `/api/profile` - User profile management

### Frontend Pages
- Landing page with hero, features, testimonials, CTA
- Login/Signup with email and Google OAuth
- Dashboard with stats cards and quick actions
- Meeting Types management page
- Availability settings page
- Bookings list with status management
- AI Assistant page for NLP scheduling
- Profile and branding settings
- Public booking page with calendar and time slots

### Design System
- Fonts: Manrope (headings), IBM Plex Sans (body)
- Colors: Violet (#7c3aed) primary, Indigo secondary
- Style: "Soft Utility" aesthetic with rounded corners
- Responsive layout with sidebar navigation

## Prioritized Backlog

### P0 (Critical - Next Sprint)
- [ ] Google Calendar OAuth integration (read/write events)
- [ ] Real-time busy/free detection from connected calendars
- [ ] Email confirmation for bookings

### P1 (Important)
- [ ] Outlook Calendar integration
- [ ] Apple Calendar integration
- [ ] Recurring meeting types
- [ ] Meeting reminders (email/SMS)

### P2 (Nice to Have)
- [ ] White-label custom domains (CNAME)
- [ ] Team scheduling (round-robin)
- [ ] Video conferencing integrations (Zoom, Google Meet)
- [ ] Payment collection (Stripe)
- [ ] Custom form questions with lead scoring

## Next Tasks
1. Implement Google Calendar OAuth flow
2. Add calendar sync to show real availability
3. Set up email service for booking confirmations
4. Build webhook listener for calendar updates
5. Add meeting reminders feature

## Demo Account
- Email: demo@klevercal.com
- Password: demo123
- Public booking link: /book/30-minute-discovery-call-0c1f42

## Tech Notes
- AI features use Emergent LLM Key for Gemini access
- MongoDB stores all user data with custom user_id (not ObjectId)
- JWT tokens expire in 7 days
- Google OAuth uses Emergent auth service
