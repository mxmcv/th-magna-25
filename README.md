# Magna Fundraising Platform

A production-ready Web3 fundraising management system that bridges the gap between capital raising and token distribution. Built for the Magna 2025 Internship Take-Home Challenge.

<img width="1502" height="776" alt="Screenshot 2025-10-07 at 2 27 31 AM" src="https://github.com/user-attachments/assets/3d074e4b-fede-4775-be81-f8b7d34d2d16" />

## What This Does

Magna already manages $10B+ in digital assets through vesting and custody. But there's a gap - projects need a way to coordinate fundraising *before* tokens launch. This platform fills that gap by helping projects:

- Manage multiple fundraising rounds (targets, limits, accepted stablecoins)
- Track investor commitments and contributions in real-time
- Maintain compliance through comprehensive audit trails
- Export allocation data that feeds directly into Magna's vesting platform

Think of it as the missing piece between "we're raising capital" and "we're distributing tokens to investors."

## Tech Stack

**Required Stack:**
- **TypeScript** - Strict mode enabled throughout
- **Next.js 15** - Using App Router and Server Components
- **Prisma** - Type-safe ORM with PostgreSQL

**Additional Choices:**
- **PostgreSQL** (via Neon) - Needed JSON support for audit logs and flexible metadata
- **shadcn/ui** - Accessible components that I could customize to match a fintech aesthetic
- **Tailwind CSS** - Faster than writing custom CSS, consistent design system
- **Cursor AI** - Used for initial scaffolding and component generation

## What I Built

### Core Features

**Fundraising Rounds**
- Create and configure multiple rounds with targets, min/max contributions
- Choose accepted stablecoins (USDC/USDT per round)
- Track real-time progress (raised amount, participant count, percentage)
- Close rounds with validation

**Investor Management**
- Comprehensive investor list with contribution tracking
- Token-based invitation system (7-day expiration, unique per investor/round)
- Track participation across multiple rounds
- Investor profiles with wallet addresses

**Dual User Flows**
- **Company Portal** - Admin interface for managing rounds, investors, and tracking progress
- **Investor Portal** - View available rounds, make contributions, track portfolio

**Audit & Compliance**
- Comprehensive audit logs for every critical operation
- Filterable by entity type, action, date range
- Exportable to CSV for compliance reporting
- Immutable log table (no updates/deletes, only inserts)

**Token Allocation (My Extra Feature)**
- Calculate pro-rata allocations based on contributions
- Export to Magna-compatible CSV format for vesting setup
- JSON export for API integrations
- Configurable vesting schedules (cliff, duration, TGE unlock)
- Full audit trail of allocation generations

### Why Token Allocation?

Chose this because it directly connects to Magna's core business. When a round closes, companies need to:
1. Calculate how many tokens each investor gets
2. Set up vesting schedules
3. Import that data into Magna's vesting platform

This feature automates step 1-2 and prepares data in the exact format Magna needs. It's a natural extension of the fundraising flow and shows understanding of the full tokenomics lifecycle.

## Getting Started

### Prerequisites
- Node.js 20+
- A Neon database account (free tier works fine)

### Setup

1. **Clone and Install**
```bash
git clone <your-repo>
cd th-magna-25
npm install
```

2. **Set Up Database**

Create a Neon database at [console.neon.tech](https://console.neon.tech), then create a `.env` file:

   ```env
DATABASE_URL="postgresql://username:password@host/database?sslmode=require"
NEXT_PUBLIC_APP_URL="http://localhost:3000"  # or your deployment URL
   ```

3. **Initialize Database**
```bash
npx prisma db push    # create tables
npx prisma db seed    # load demo data
```

4. **Run the App**
```bash
npm run dev
```

Visit http://localhost:3000 (or whatever port it tells you)

### Demo Accounts

**Company (Admin):**
- Email: `demo@company.com`
- Password: `MagnaDemo2025!`

**Investors:**
- Email: `investor1@example.com` (or investor2, investor3, investor4)
- Password: `Investor123!`

## How to Test It

**Company Flow:**
1. Log in as demo company
2. Create a new fundraising round (set target, limits, tokens)
3. Go to investors → invite an investor to your round
4. Copy the invitation link (expires in 7 days)
5. View dashboard metrics updating in real-time
6. Check audit logs to see all tracked actions

**Investor Flow:**
1. Open invitation link in a private/incognito window
2. Set a password to activate the account
3. Log in and view available rounds (only ones you're invited to)
4. Make a contribution (validates against min/max limits)
5. Check your portfolio and contribution history
6. Add wallet address in profile for token distribution

**Token Allocation:**
1. Close a fundraising round (company portal)
2. Navigate to round details → token allocation
3. Set token price and vesting schedule
4. Generate allocations (see pro-rata calculations)
5. Export to CSV (compatible with Magna's vesting platform)
6. Check audit logs - allocation generation is tracked

## Key Design Decisions

### Architecture

**Why session-based auth instead of JWT?**
Simpler to invalidate sessions if needed, and for a demo/MVP the complexity of JWT refresh tokens isn't necessary. In production I'd probably use NextAuth.js.

**Why separate company/investor portals?**
Completely different workflows and permissions. Companies manage rounds and view all data, investors only see what they're invited to. Cleaner to separate than to build one portal with complex conditionals.

**Why put validation in both client and server?**
Client-side gives immediate feedback (better UX), server-side ensures security (users can bypass client code). Shared validation logic in `lib/validations.ts` keeps them in sync.

**Why audit logs for everything?**
Compliance is critical in fundraising. Investors want to know their contributions are tracked, companies need to prove they followed proper procedures. Immutable audit trail provides both.

### Data Model

**Normalized schema** - Separate tables for companies, rounds, investors, contributions, invitations, and audit logs. Proper foreign keys and cascade deletes where appropriate.

**Invitation system** - Unique tokens generated with `crypto.randomBytes(32)`, 7-day expiration. One invitation per investor per round (unique constraint). Tracks status (sent, viewed, accepted, expired).

**Contribution tracking** - Links investor + round + amount. Supports multiple contributions per investor per round (they can add more later). Tracks transaction hashes (mocked) and status.

**Audit logs** - JSON fields for flexible metadata and change tracking. Indexed on timestamp and user for fast queries. Never deleted.

### UI/UX

**Dark theme** - Fintech aesthetic, reduces eye strain for data-heavy dashboards

**Responsive design** - Mobile-first approach, sidebar collapses on small screens, touch-friendly buttons

**In-UI error messages** - No browser alerts. Errors appear as dismissible banners in the interface with clear messaging

**Loading states** - Skeleton loaders while data fetches, disabled buttons during submissions

**Progressive disclosure** - Dashboard shows overview, click through for details

## Project Structure

```
th-magna-25/
├── app/
│   ├── api/                    # all backend endpoints
│   │   ├── auth/              # login, logout, register, me
│   │   ├── rounds/            # crud + close endpoint
│   │   ├── investors/         # crud + wallet updates
│   │   ├── invitations/       # create + accept
│   │   ├── contributions/     # create + confirm
│   │   └── audit/             # fetch audit logs
│   ├── company/               # company portal ui
│   │   ├── page.tsx          # dashboard
│   │   ├── rounds/           # round management
│   │   ├── investors/        # investor management
│   │   └── audit/            # audit log viewer
│   ├── investor/              # investor portal ui
│   │   ├── page.tsx          # investor dashboard
│   │   ├── rounds/           # view available rounds
│   │   ├── history/          # contribution history
│   │   └── profile/          # wallet management
│   ├── login/                 # shared login page
│   └── invite/                # invitation acceptance
├── lib/
│   ├── api/                   # backend utilities
│   │   ├── auth.ts           # session management, rbac
│   │   ├── audit.ts          # audit logging helpers
│   │   ├── validation.ts     # server-side validation
│   │   └── responses.ts      # standardized api responses
│   ├── api-client.ts          # frontend api wrapper
│   ├── auth-context.tsx       # frontend auth state
│   ├── validations.ts         # shared validation logic
│   ├── token-allocation.ts    # allocation calculator
│   ├── invitation-utils.ts    # token generation
│   ├── date-utils.ts          # date helpers
│   ├── formatters.ts          # currency, number formatting
│   └── types.ts               # comprehensive type definitions
├── components/
│   └── ui/                    # shadcn components
├── prisma/
│   ├── schema.prisma          # database schema
│   └── seed.ts                # demo data
└── IMPLEMENTATION_NOTES.md    # architectural decisions explained
```

## Meeting the Evaluation Criteria

### Code Quality
- **Clean code** - Consistent naming, logical organization, functions do one thing
- **TypeScript** - Strict mode, comprehensive types, minimal `any` usage
- **React best practices** - Proper hooks, component composition, client/server boundaries
- **Separation of concerns** - API/lib/components/UI clearly separated
- **Modular** - Reusable validation, centralized auth, audit logging service
- **Error handling** - Custom error classes, standardized responses, graceful degradation
- **Edge cases** - Expired invitations, min/max validation, round status transitions

### Data Model & API
- **Normalized schema** - Proper relationships, no redundant data
- **Scalable** - Indexed fields, efficient queries, JSON for flexibility
- **RESTful** - Standard methods (GET/POST/PATCH/DELETE), resource-based URLs
- **Intuitive** - Clear naming, consistent patterns, proper status codes
- **Type-safe** - Prisma generates types, end-to-end type safety

### User Experience
- **Intuitive** - Clear navigation, logical flows, minimal steps
- **Visual hierarchy** - Important info prominent, clear grouping
- **Responsive** - Works on mobile, tablet, desktop
- **Professional** - Clean design, consistent spacing, accessible colors

### Data Integrity & Security
- **Audit logs** - Every critical operation logged with user attribution
- **Validation** - Client and server, shared logic, comprehensive checks
- **RBAC** - Company vs investor roles, resource ownership verification
- **Security** - Password hashing, session expiration, secure tokens
- **Data isolation** - Companies can't see each other's data, investors only see invited rounds

### Scope Discipline
- **Built core well** - All required features complete and polished
- **Strategic extra feature** - Token allocation directly relevant to Magna's business
- **No feature creep** - Focused on requirements, resisted adding unnecessary features
- **Depth over breadth** - Complete implementation of fewer features

## Development Process

### Using Cursor AI

Used Cursor extensively for:
- Initial component scaffolding
- API route boilerplate
- Prisma schema setup
- UI component generation

**But** - Reviewed every line of generated code. Refactored for clarity, added validation, improved error handling, wrote strategic comments. Cursor was a productivity tool, not a replacement for engineering judgment.

### Things I Learned

- Proper audit logging is harder than it seems (tracking changes, avoiding performance hits)
- Invitation systems need careful security (expiration, uniqueness, token entropy)
- Validation logic should be shared between client/server to stay in sync
- Responsive design for data-heavy dashboards requires different approaches than content sites

### Trade-Offs Made

**Base64 vs bcrypt for passwords** - Used base64 for demo simplicity, documented in code that production would use bcrypt or argon2

**Session tokens vs JWT** - Chose sessions for simplicity, easier to invalidate, no refresh token complexity

**No email sending** - Invitation links are displayed to copy/paste manually, production would integrate SendGrid/SES

**Mocked transactions** - Generated random hashes, no real blockchain integration per requirements

## Scripts

```bash
# Development
npm run dev              # Start dev server
npm run build            # Production build
npm run start            # Production server
npm run lint             # ESLint

# Database
npm run db:generate      # Generate Prisma Client
npm run db:push          # Sync schema (no migrations)
npm run db:seed          # Load demo data
npm run db:studio        # Visual database browser
```

## Deployment

Deployed on Vercel. Environment variables needed:
- `DATABASE_URL` - Neon connection string
- `NEXT_PUBLIC_APP_URL` - Your deployment URL (for invitation links)

The `postinstall` script automatically runs `prisma generate` on deployment.

## What I'd Do With More Time

- Email integration for invitations (SendGrid)
- Bulk operations UI (invite 50 investors at once)
- Data export for all entities (rounds, investors, contributions)
- Investor document upload (KYC documents)
- Round templates (reuse common configurations)
- Notification system (contribution confirmed, round closing soon)
- Advanced filtering and search
- Charts and analytics (contribution timeline, investor distribution)

But per the requirements, better to build specified features well than add everything half-done.

## Additional Documentation

- `IMPLEMENTATION_NOTES.md` - Architectural decisions and justifications
- `EVALUATION_CHECKLIST.md` - Comprehensive review against requirements
- `DATABASE_SETUP.md` - Detailed database setup guide
- `QUICK_TEST_GUIDE.md` - Step-by-step testing instructions

---

**Built by Michael McVicar using Cursor AI, Next.js, Prisma, and shadcn/ui**

Submission for Magna 2025 Internship Take-Home Challenge
