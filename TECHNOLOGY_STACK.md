# DeeMeet - Complete Technology Stack Documentation

> **Last Updated:** February 3, 2026  
> **Application:** DeeMeet - Business Appointment Scheduling Platform  
> **Live URLs:**
> - Frontend: https://www.deemeet.in
> - Backend API: https://klevercal-api-721707771890.us-central1.run.app

---

## 📋 Table of Contents

1. [Backend Technologies](#backend-technologies)
2. [Frontend Technologies](#frontend-technologies)
3. [Third-Party APIs & Integrations](#third-party-apis--integrations)
4. [Cloud Infrastructure](#cloud-infrastructure)
5. [Database & Storage](#database--storage)
6. [Development Tools](#development-tools)
7. [Security & Authentication](#security--authentication)

---

## 🔧 Backend Technologies

### Core Framework
- **FastAPI** - Modern, high-performance Python web framework for building APIs
- **Uvicorn** - Lightning-fast ASGI server implementation
- **Starlette** - Lightweight ASGI framework/toolkit (FastAPI dependency)
- **Pydantic** - Data validation and settings management using Python type annotations

### Database & ODM
- **Motor** - Asynchronous Python driver for MongoDB
- **PyMongo** - Official MongoDB driver for Python
- **DNSPython** - DNS toolkit for Python (required for MongoDB Atlas connections)

### Authentication & Security
- **PyJWT** - JSON Web Token implementation in Python
- **python-jose** - JavaScript Object Signing and Encryption (JOSE) implementation
- **bcrypt** - Password hashing library
- **passlib** - Password hashing framework
- **cryptography** - Cryptographic recipes and primitives

### Email Services
- **Jinja2** - Modern templating engine for Python (used for email templates)
- **email-validator** - Robust email syntax and deliverability validation

### Third-Party API Clients

#### Google Services
- **google-api-python-client** - Google API client library
- **google-auth** - Google authentication library
- **google-auth-httplib2** - HTTP/2 transport for Google Auth
- **google-auth-oauthlib** - OAuth 2.0 integration for Google services
- **google-ai-generativelanguage** - Google AI language models
- **google-genai** - Google Generative AI SDK
- **google-generativeai** - Google's Generative AI Python SDK

#### Payment Processing
- **stripe** - Official Stripe Python library for payment processing

#### AI & Machine Learning
- **openai** - Official OpenAI Python library
- **litellm** - Unified interface for multiple LLM providers
- **tiktoken** - Fast BPE tokenizer for use with OpenAI's models
- **huggingface_hub** - Client library for Hugging Face Hub

### HTTP & Network Libraries
- **aiohttp** - Asynchronous HTTP client/server framework
- **httpx** - Next-generation HTTP client with async support
- **requests** - Simple HTTP library for Python
- **requests-oauthlib** - OAuth library support for Requests
- **oauthlib** - Generic OAuth implementation

### Data Processing
- **pandas** - Data analysis and manipulation library
- **numpy** - Fundamental package for scientific computing
- **python-dateutil** - Extensions to the standard Python datetime module
- **pytz** - World timezone definitions

### File Handling & Storage
- **boto3** - AWS SDK for Python (Amazon S3 integration)
- **botocore** - Low-level interface to AWS services
- **s3transfer** - Amazon S3 transfer manager
- **pillow** - Python Imaging Library (PIL fork) for image processing
- **python-multipart** - Streaming multipart parser for Python

### Development & Testing
- **pytest** - Full-featured Python testing framework
- **black** - Uncompromising Python code formatter
- **flake8** - Python linting tool
- **mypy** - Static type checker for Python
- **isort** - Python import sorting utility

### Utilities & Helpers
- **python-dotenv** - Read key-value pairs from .env files
- **PyYAML** - YAML parser and emitter for Python
- **rich** - Rich text and beautiful formatting in the terminal
- **typer** - Build CLI applications based on Python type hints
- **click** - Command Line Interface Creation Kit

### Data Validation & Schemas
- **jsonschema** - JSON Schema validation
- **marsupport** - Object serialization/deserialization library
- **pydantic-core** - Core validation logic for Pydantic

### Additional Libraries
- **certifi** - Python package for providing Mozilla's CA Bundle
- **urllib3** - HTTP client for Python
- **websockets** - WebSocket implementation
- **grpcio** - HTTP/2-based RPC framework
- **protobuf** - Protocol Buffers

---

## 🎨 Frontend Technologies

### Core Framework & Build Tools
- **React 19.0.0** - JavaScript library for building user interfaces
- **React DOM 19.0.0** - React package for working with the DOM
- **React Scripts 5.0.1** - Scripts and configuration used by Create React App
- **CRACO (Create React App Configuration Override) 7.1.0** - Configuration layer for CRA

### Routing
- **React Router DOM 7.5.1** - Declarative routing for React applications

### UI Component Libraries

#### Radix UI Primitives (Unstyled, Accessible Components)
- **@radix-ui/react-accordion** - Vertically stacked set of interactive headings
- **@radix-ui/react-alert-dialog** - Modal dialog that interrupts the user
- **@radix-ui/react-aspect-ratio** - Aspect ratio container
- **@radix-ui/react-avatar** - Image element with fallback
- **@radix-ui/react-checkbox** - Binary input controls
- **@radix-ui/react-collapsible** - Interactive component to show/hide content
- **@radix-ui/react-context-menu** - Menu triggered by right-click
- **@radix-ui/react-dialog** - Modal window overlays
- **@radix-ui/react-dropdown-menu** - Dropdown menu component
- **@radix-ui/react-hover-card** - Preview content on hover
- **@radix-ui/react-label** - Accessible label component
- **@radix-ui/react-menubar** - Menu bar navigation
- **@radix-ui/react-navigation-menu** - Navigation menu component
- **@radix-ui/react-popover** - Floating content container
- **@radix-ui/react-progress** - Progress indicator
- **@radix-ui/react-radio-group** - Set of checkable buttons (radio buttons)
- **@radix-ui/react-scroll-area** - Custom scrollbar component
- **@radix-ui/react-select** - Displays list of options for selection
- **@radix-ui/react-separator** - Visual separator
- **@radix-ui/react-slider** - Input for selecting a value from a range
- **@radix-ui/react-slot** - Merges props onto immediate child
- **@radix-ui/react-switch** - Toggle switch component
- **@radix-ui/react-tabs** - Layered sections of content (tabs)
- **@radix-ui/react-toast** - Succinct message notifications
- **@radix-ui/react-toggle** - Two-state button
- **@radix-ui/react-toggle-group** - Group of toggle buttons
- **@radix-ui/react-tooltip** - Popup that displays information

### Styling & Design System
- **TailwindCSS 3.4.17** - Utility-first CSS framework
- **tailwindcss-animate 1.0.7** - Animation utilities for Tailwind
- **tailwind-merge 3.2.0** - Utility for merging Tailwind CSS classes
- **PostCSS 8.4.49** - Tool for transforming CSS with JavaScript
- **Autoprefixer 10.4.20** - PostCSS plugin to parse CSS and add vendor prefixes
- **class-variance-authority 0.7.1** - CVA for creating variant-based component APIs
- **clsx 2.1.1** - Utility for constructing className strings conditionally

### Typography
- **@fontsource/open-sauce-two 5.2.5** - Self-hosted Open Sauce Two font

### Form Handling & Validation
- **React Hook Form 7.56.2** - Performant, flexible forms with easy validation
- **@hookform/resolvers 5.0.1** - Validation resolvers for React Hook Form
- **Zod 3.24.4** - TypeScript-first schema validation library
- **ajv 8.17.1** - JSON schema validator

### Date & Time
- **date-fns 4.1.0** - Modern JavaScript date utility library
- **react-day-picker 8.10.1** - Date picker component for React

### Icons & Visual Elements
- **lucide-react 0.507.0** - Beautiful & consistent icon toolkit
- **react-confetti 6.4.0** - Confetti component for celebrations

### UI Enhancement Libraries
- **cmdk 1.1.1** - Command menu component (⌘K)
- **sonner 2.0.3** - Opinionated toast component for React
- **next-themes 0.4.6** - Perfect dark mode in Next.js and React
- **vaul 1.1.2** - Drawer component for React
- **input-otp 1.4.2** - OTP input component

### Specialized Input Components
- **react-phone-number-input 3.4.14** - International phone number input

### Layout & Interaction
- **react-resizable-panels 3.0.1** - React components for resizable panel layouts
- **embla-carousel-react 8.6.0** - Carousel/slider component library

### Data Visualization
- **recharts 3.6.0** - Composable charting library built on React components

### HTTP Client
- **axios 1.8.4** - Promise-based HTTP client

### Development Tools & Linting
- **ESLint 9.23.0** - Pluggable JavaScript linter
- **@eslint/js** - ESLint JavaScript language implementation
- **eslint-plugin-import** - ESLint plugin with rules for ES6+ import/export
- **eslint-plugin-jsx-a11y** - Static AST checker for accessibility rules
- **eslint-plugin-react** - React-specific linting rules
- **eslint-plugin-react-hooks** - ESLint rules for React Hooks
- **@babel/plugin-proposal-private-property-in-object** - Babel plugin for private property syntax

### Package Management
- **Yarn 1.22.22** - Fast, reliable, and secure dependency management

---

## 🔌 Third-Party APIs & Integrations

### Calendar & Scheduling Integrations
1. **Google Calendar API**
   - OAuth 2.0 authentication
   - Event creation and management
   - Google Meet link generation
   - Automatic calendar sync
   - Attendee management

2. **Microsoft Outlook Calendar** (Configured)
   - Calendar synchronization
   - Event management
   - Microsoft Teams meeting integration

3. **Apple iCloud Calendar** (Configured)
   - Calendar sync with Apple devices
   - Cross-platform availability

4. **Zoom Meetings API**
   - OAuth 2.0 authentication
   - Video meeting creation
   - Scheduled meeting management
   - Meeting link generation
   - Participant management
   - **Client ID:** MyNO9r3cTb6A2RN6amZ7vg
   - **App Status:** Development (Draft mode)

5. **Microsoft Teams** (Configured)
   - Teams meeting creation
   - Microsoft 365 integration

### Email Service Provider
- **Brevo (formerly Sendinblue)**
  - SMTP relay: `smtp-relay.brevo.com:587`
  - Transactional email delivery
  - Email templates
  - Delivery tracking
  - From Email: `notifications@deemeet.app`
  - From Name: `DeeMeet`

### AI & Machine Learning Services
1. **OpenAI API**
   - GPT models for AI assistance
   - Natural language processing
   - Meeting scheduling assistance

2. **Google Generative AI (Gemini)**
   - Advanced AI capabilities
   - Content generation
   - Smart suggestions

### Image & Media Services
- **ImgBB API**
  - Image hosting and CDN
  - Avatar and profile picture storage
  - Public image URLs

### Payment Processing
- **Stripe**
  - Subscription management
  - Payment processing
  - Billing automation
  - Webhook integration

---

## ☁️ Cloud Infrastructure

### Hosting & Deployment

#### Backend
- **Google Cloud Run**
  - Containerized deployment
  - Automatic scaling
  - Serverless architecture
  - Region: `us-central1`
  - Service URL: `https://klevercal-api-721707771890.us-central1.run.app`
  - Container Registry: Google Container Registry (GCR)
  - Port: `8080`

#### Frontend
- **Vercel**
  - Serverless deployment
  - Edge network CDN
  - Automatic deployments from Git
  - Custom domain: `www.deemeet.in`
  - HTTPS/SSL certificates
  - Instant rollbacks

### Container & Orchestration
- **Docker**
  - Backend containerization
  - Consistent development/production environments
  - Base Image: `python:3.11-slim`

### Cloud Storage
- **Amazon S3** (via boto3)
  - File storage
  - Static asset hosting
  - Backup storage

---

## 🗄️ Database & Storage

### Primary Database
- **MongoDB Atlas**
  - Cloud-hosted NoSQL database
  - Connection: `mongodb+srv://gulshanmehto:rBvD0y3GOpodXOiS@klevercal.9ajzkhh.mongodb.net/`
  - Database Name: `klevercal`
  - Cluster: `klevercal.9ajzkhh.mongodb.net`
  - Collections:
    - `users` - User accounts and profiles
    - `booking_types` - Appointment types and configurations
    - `appointments` - Scheduled meetings
    - `availability` - User availability schedules
    - OAuth tokens and refresh tokens

### Data Access Pattern
- **Async/Await Pattern** with Motor driver
- **Connection Pooling** for optimal performance
- **Document Validation** via Pydantic models

---

## 🔐 Security & Authentication

### Authentication Methods
1. **JWT (JSON Web Tokens)**
   - Stateless authentication
   - Token expiration management
   - Secure token signing with `JWT_SECRET`

2. **OAuth 2.0**
   - Google OAuth for calendar access
   - Zoom OAuth for meeting creation
   - Microsoft OAuth for Teams/Outlook
   - Secure authorization code flow
   - Refresh token rotation

### Password Security
- **bcrypt** hashing algorithm
- **Salt** generation for password storage
- **passlib** for password policy enforcement

### Data Security
- **Environment Variables** for sensitive data
- **HTTPS/TLS** encryption in transit
- **MongoDB Atlas** encryption at rest
- **CORS** configuration for API security

### Email Security
- **SMTP TLS/STARTTLS** encryption
- **SPF/DKIM** verification (via Brevo)
- **Sender authentication** and verification

---

## 🛠️ Development Tools

### Code Quality & Formatting
- **Black** - Python code formatter
- **Flake8** - Python linting
- **MyPy** - Static type checking
- **isort** - Import sorting
- **ESLint** - JavaScript/React linting
- **Prettier** (via CRACO) - Code formatting

### Testing Frameworks
- **pytest** - Python testing framework
- **React Testing Library** (via react-scripts)

### Version Control
- **Git** - Version control system
- **GitHub** - Repository hosting (inferred)

### Build Tools
- **CRACO** - Custom React App configuration
- **Webpack** (via react-scripts) - Module bundler
- **Babel** - JavaScript transpiler

### Command Line Tools
- **Typer** - CLI application framework
- **Click** - CLI creation kit
- **Rich** - Terminal formatting

---

## 📦 Key Environment Variables

### Backend (`backend/.env`)
```bash
# Database
MONGO_URL=mongodb+srv://...
DB_NAME=klevercal

# Authentication
JWT_SECRET=<secret>

# SMTP (Brevo)
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=a1643f001@smtp-brevo.com
SMTP_PASSWORD=<password>
SMTP_FROM_EMAIL=notifications@deemeet.app
SMTP_FROM_NAME=DeeMeet

# Google OAuth
GOOGLE_CLIENT_ID=<client_id>
GOOGLE_CLIENT_SECRET=<client_secret>

# Zoom OAuth
ZOOM_CLIENT_ID=MyNO9r3cTb6A2RN6amZ7vg
ZOOM_CLIENT_SECRET=<client_secret>

# Image Storage
IMGBB_API_KEY=<api_key>
```

### Frontend (`frontend/.env`)
```bash
REACT_APP_BACKEND_URL=https://klevercal-api-721707771890.us-central1.run.app
```

---

## 📊 Architecture Overview

### Application Architecture
```
┌─────────────────────────────────────────────────────┐
│                   User Browser                       │
│              (www.deemeet.in)                        │
└─────────────────┬───────────────────────────────────┘
                  │
                  │ HTTPS
                  ▼
┌─────────────────────────────────────────────────────┐
│            Vercel Edge Network                       │
│         (Frontend - React SPA)                       │
└─────────────────┬───────────────────────────────────┘
                  │
                  │ REST API (HTTPS)
                  ▼
┌─────────────────────────────────────────────────────┐
│         Google Cloud Run                             │
│       (Backend - FastAPI)                            │
│   klevercal-api-721707771890.us-central1.run.app    │
└─────┬──────┬──────┬──────┬──────┬───────────────────┘
      │      │      │      │      │
      │      │      │      │      └─────► Stripe API
      │      │      │      └────────────► Zoom API
      │      │      └───────────────────► Google APIs
      │      └──────────────────────────► Brevo SMTP
      └─────────────────────────────────► MongoDB Atlas
```

### Data Flow
1. **User Request** → Vercel Edge Network
2. **Frontend** → Renders React UI
3. **API Call** → FastAPI backend on Cloud Run
4. **Authentication** → JWT validation
5. **Database** → MongoDB Atlas query
6. **External APIs** → Google/Zoom/Stripe integration
7. **Response** → JSON data back to frontend
8. **Email** → Brevo SMTP for notifications

---

## 🎯 Key Features Enabled by Technology Stack

### Real-Time Features
- Async/await architecture for non-blocking I/O
- WebSocket support for real-time updates
- Fast API response times with FastAPI

### Scalability
- Serverless architecture on Cloud Run
- Auto-scaling based on traffic
- CDN distribution via Vercel Edge Network
- Connection pooling for database efficiency

### Developer Experience
- Type safety with TypeScript/Zod (frontend) and Pydantic (backend)
- Hot reloading in development
- Comprehensive linting and formatting
- Clear separation of concerns

### User Experience
- Modern, accessible UI with Radix primitives
- Smooth animations with Tailwind
- Responsive design
- Dark mode support
- Fast page loads with edge caching

---

## 📝 Version Information

| Component | Version | Status |
|-----------|---------|--------|
| Python | 3.11 | ✅ Active |
| Node.js | 18+ | ✅ Active |
| React | 19.0.0 | ✅ Latest |
| FastAPI | Latest | ✅ Active |
| MongoDB | Atlas Cloud | ✅ Active |
| Docker | Latest | ✅ Active |

---

## 🔄 Continuous Integration/Deployment

### Frontend (Vercel)
- **Trigger:** Git push to main branch
- **Build Command:** `npm run build` or `yarn build`
- **Output Directory:** `build/`
- **Auto-deployments:** ✅ Enabled

### Backend (Google Cloud Run)
- **Trigger:** Manual deployment via gcloud CLI
- **Build:** Docker container build
- **Registry:** Google Container Registry
- **Deployment Script:** `deploy-backend.sh`

---

## 📚 Additional Documentation

- **Email Setup:** `EMAIL_SETUP_COMPLETE.md`
- **Brevo Configuration:** `BREVO_SETUP.md`
- **Zoom Integration:** `ZOOM_INTEGRATION_SETUP.md`
- **Backend Deployment:** `DEPLOY_BACKEND.md`
- **Domain Connection:** `CONNECT_DOMAIN.md`

---

**DeeMeet Technology Stack** - Comprehensive documentation of all technologies, libraries, and APIs powering the DeeMeet scheduling platform.
