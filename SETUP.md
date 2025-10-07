# Setup Guide

Comprehensive setup instructions for the Magna Fundraising Platform.

## Quick Setup (5 minutes)

### 1. Clone and Install

```bash
git clone <your-repository-url>
cd th-magna-25
npm install
```

### 2. Create Neon Database

1. Go to [console.neon.tech](https://console.neon.tech)
2. Sign up or log in (free tier is fine)
3. Click "Create Project"
4. Choose a name (e.g., "magna-fundraising")
5. Select a region close to you
6. Copy the connection string from the dashboard

### 3. Configure Environment

Create a `.env` file in the root directory:

```env
# Database connection (from Neon)
DATABASE_URL="postgresql://username:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require"

# App URL (for invitation links)
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Optional: Node environment
NODE_ENV="development"
```

**Important:** The `NEXT_PUBLIC_APP_URL` is used to generate invitation links. When you deploy, update this to your production URL.

### 4. Set Up Database

```bash
# Generate Prisma Client
npx prisma generate

# Create all tables
npx prisma db push

# Load demo data (company + investors + rounds)
npx prisma db seed
```

### 5. Run the Application

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## Demo Credentials

After seeding, you'll have these accounts:

**Company Account:**
- Email: `demo@company.com`
- Password: `MagnaDemo2025!`

**Investor Accounts:**
- Email: `investor1@example.com` (also investor2, investor3, investor4)
- Password: `Investor123!`

## Project Structure

```
th-magna-25/
├── app/
│   ├── api/                    # backend api endpoints
│   │   ├── auth/              # authentication endpoints
│   │   │   ├── login/
│   │   │   ├── logout/
│   │   │   ├── register/
│   │   │   └── me/
│   │   ├── rounds/            # round crud + close
│   │   ├── investors/         # investor crud
│   │   ├── invitations/       # invitation system
│   │   ├── contributions/     # contribution tracking
│   │   └── audit/             # audit log queries
│   ├── company/               # company portal (admin)
│   │   ├── page.tsx          # dashboard
│   │   ├── layout.tsx        # sidebar nav
│   │   ├── rounds/           # round management
│   │   │   ├── page.tsx      # list rounds
│   │   │   ├── new/          # create round
│   │   │   └── [id]/         # view/edit/investors
│   │   ├── investors/        # investor management
│   │   │   ├── page.tsx      # list investors
│   │   │   ├── invite/       # generate invitation
│   │   │   └── [id]/         # investor details
│   │   └── audit/            # audit logs viewer
│   ├── investor/              # investor portal
│   │   ├── page.tsx          # dashboard
│   │   ├── layout.tsx        # sidebar nav
│   │   ├── rounds/           # available rounds
│   │   ├── history/          # contribution history
│   │   └── profile/          # wallet management
│   ├── login/                 # shared login page
│   ├── invite/                # invitation acceptance
│   │   └── accept/           # token validation
│   ├── layout.tsx             # root layout
│   ├── page.tsx               # landing page
│   └── globals.css            # global styles
├── components/
│   ├── ui/                    # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── ...
│   ├── dashboard/             # dashboard-specific components
│   ├── skeletons.tsx          # loading states
│   └── error-boundary.tsx     # error handling
├── lib/
│   ├── api/                   # backend utilities
│   │   ├── auth.ts           # session management, rbac
│   │   ├── audit.ts          # audit logging service
│   │   ├── validation.ts     # server-side validation
│   │   └── responses.ts      # standardized api responses
│   ├── api-client.ts          # frontend api wrapper
│   ├── auth-context.tsx       # frontend auth state
│   ├── providers.tsx          # context providers
│   ├── validations.ts         # shared validation logic
│   ├── token-allocation.ts    # allocation calculator
│   ├── invitation-utils.ts    # invitation token generation
│   ├── date-utils.ts          # date helpers
│   ├── formatters.ts          # currency/number formatting
│   ├── constants.ts           # app constants
│   ├── types.ts               # typescript type definitions
│   ├── prisma.ts              # prisma client singleton
│   └── utils.ts               # misc utilities
├── prisma/
│   ├── schema.prisma          # database schema
│   └── seed.ts                # demo data script
├── public/                     # static assets
├── .env                        # environment variables (create this)
├── .env.example                # example env file
├── package.json                # dependencies
├── tsconfig.json               # typescript config
├── next.config.ts              # next.js config
├── tailwind.config.ts          # tailwind config
├── components.json             # shadcn/ui config
└── README.md                   # main documentation
```

## Understanding the Database Schema

### Core Models

**company**
- represents a project raising funds
- has many rounds
- one company per sign up

**round**
- fundraising round with target, limits, dates
- belongs to one company
- has many investors (through invitations)
- has many contributions
- can have multiple tokens accepted (usdc/usdt)

**investor**
- individual who invests in rounds
- created when first invited
- sets password on first invitation acceptance
- has many contributions across multiple rounds
- optional wallet address for token distribution

**invitation**
- links investor to round
- unique token with 7-day expiration
- tracks status (sent, viewed, accepted, expired)
- unique constraint: one invitation per investor per round

**contribution**
- tracks investor investment in a round
- amount, token type, transaction hash (mocked)
- status: pending or confirmed
- investors can make multiple contributions to same round

**audit log**
- immutable record of all critical operations
- tracks who did what when
- json fields for flexible metadata
- never updated or deleted, only inserted

### relationships

```
company (1) ──< rounds (many)
round (1) ──< contributions (many)
round (1) ──< invitations (many)
investor (1) ──< contributions (many)
investor (1) ──< invitations (many)
```

## Key Features Explained

### Authentication Flow

1. **company registration** - creates company account (currently disabled in ui per requirements)
2. **company login** - validates email/password, creates session
3. **investor invitation** - company generates unique token link
4. **investor activation** - investor clicks link, sets password
5. **investor login** - validates email/password, creates session

sessions stored as http-only cookies, expire after 30 days.

### invitation system

**generation:**
- company selects investor(s) and round(s)
- system generates crypto-random 64-char token
- creates invitation record with 7-day expiration
- returns link: `https://yourapp.com/invite/accept?token=xxx`

**acceptance:**
- investor opens link
- system validates token (exists, not expired, not used)
- investor sets password
- invitation status → accepted
- investor status → active

**security:**
- tokens use `crypto.randomBytes(32)` - cryptographically secure
- one-time use (status changes to accepted)
- expires after 7 days
- unique per investor/round combo

### contribution flow

**investor side:**
1. view available rounds (only ones invited to)
2. click "contribute"
3. enter amount and select token (usdc/usdt)
4. client validates against min/max
5. server validates and creates contribution record
6. generates mock transaction hash
7. sets status to pending

**company side:**
1. view contributions in round details
2. click "confirm" on contribution
3. status changes to confirmed
4. round's raised amount updates
5. audit log records confirmation

### audit logging

every critical operation logs:
- **what** - entity type (round, investor, contribution)
- **who** - user id and type (company/investor)
- **when** - timestamp
- **details** - changes made (old value → new value)
- **metadata** - additional context (ip address, etc)

logged actions:
- create (round, investor, invitation)
- update (round details, investor info)
- delete (round, investor)
- contribute (new contribution)
- confirm (contribution confirmed)
- invite (invitation sent)
- close_round (round closed)
- token_allocation (allocation generated)
- token_export (allocation exported)
- login/logout/register (auth events)

### token allocation

**when round closes:**
1. company navigates to round → token allocation
2. sets token price (e.g., $0.10 per token)
3. optionally configures vesting (cliff, duration, tge unlock)
4. system calculates pro-rata allocations:
   - investor contributed $100k, total raised $500k
   - investor gets 20% of tokens
   - if price is $0.10, they get 1M tokens

**export formats:**
- **csv** - formatted for magna's vesting platform import
- **json** - structured data for api integrations

## API Overview

all apis return:
```json
{
  "success": true,
  "data": { ... }
}
```

or on error:
```json
{
  "success": false,
  "error": {
    "message": "descriptive error message",
    "code": "ERROR_CODE",
    "details": { ... }
  }
}
```

### authentication apis

- `POST /api/auth/login` - log in (company or investor)
- `POST /api/auth/logout` - log out (clears session)
- `POST /api/auth/register` - register company (not used in current ui)
- `GET /api/auth/me` - get current user info

### round apis

- `GET /api/rounds` - list rounds (filtered by user role)
- `POST /api/rounds` - create round (company only)
- `GET /api/rounds/[id]` - get round details
- `PATCH /api/rounds/[id]` - update round (company only)
- `DELETE /api/rounds/[id]` - delete round (company only)
- `POST /api/rounds/[id]/close` - close round (company only)
- `POST /api/rounds/[id]/token-allocation` - generate allocations

### investor apis

- `GET /api/investors` - list investors (company sees all, investor sees self)
- `POST /api/investors` - create investor (company only)
- `GET /api/investors/[id]` - get investor details
- `PATCH /api/investors/[id]` - update investor (company or self)
- `DELETE /api/investors/[id]` - delete investor (company only)

### invitation apis

- `POST /api/invitations` - create invitation(s) (company only)
- `POST /api/invitations/accept` - accept invitation (via token)

### contribution apis

- `GET /api/contributions` - list contributions (filtered by user role)
- `POST /api/contributions` - create contribution (investor only)
- `POST /api/contributions/[id]/confirm` - confirm contribution (company only)

### audit apis

- `GET /api/audit` - fetch audit logs (filtered by role, supports pagination)

## Available Scripts

```bash
# development
npm run dev              # start development server (port 3000)
npm run build            # build for production
npm run start            # run production build
npm run lint             # run eslint

# database
npm run db:generate      # generate prisma client types
npm run db:push          # sync schema without migrations
npm run db:seed          # load demo data
npm run db:studio        # open prisma studio (gui for db)

# database migrations (for production)
npm run db:migrate       # create and apply migrations
```

## Deployment

### Deploying to Vercel

1. **push to github**
   ```bash
   git add .
   git commit -m "ready for deployment"
   git push
   ```

2. **connect to vercel**
   - go to [vercel.com](https://vercel.com)
   - click "import project"
   - select your github repo
   - vercel auto-detects next.js

3. **add environment variables**
   - in vercel project settings → environment variables
   - add `DATABASE_URL` (your neon connection string)
   - add `NEXT_PUBLIC_APP_URL` (your vercel url)

4. **deploy**
   - vercel automatically deploys on push
   - the `postinstall` script runs `prisma generate`

5. **initialize database**
   - after first deploy, run from vercel cli:
   ```bash
   vercel env pull .env.local  # pull env vars
   npx prisma db push          # create tables
   npx prisma db seed          # load demo data
   ```

### deploying elsewhere

works on any platform supporting node.js 20+:
- **railway** - auto-detects and deploys
- **render** - add build command: `npm run build`
- **fly.io** - requires dockerfile (can generate)
- **digitalocean app platform** - simple next.js template

**environment variables needed:**
- `DATABASE_URL` - your postgres connection string
- `NEXT_PUBLIC_APP_URL` - your deployment url

## Troubleshooting

### "Prisma Client Not Found"

```bash
npx prisma generate
```

the prisma client must be generated after `npm install`. the `postinstall` script should handle this, but if it fails run manually.

### "database connection failed"

check:
- `.env` file exists in root directory
- `DATABASE_URL` is correct (copy from neon dashboard)
- connection string includes `?sslmode=require`
- neon project is active (not paused)

test connection:
```bash
npx prisma db push
```

### "port 3000 already in use"

kill process:
```bash
lsof -ti:3000 | xargs kill -9
```

or use different port:
```bash
PORT=3001 npm run dev
```

### "type error: property X does not exist"

prisma types might be stale:
```bash
npx prisma generate
```

then restart typescript server in your editor.

### "invalid invitation token"

check:
- token hasn't expired (7 days from creation)
- token hasn't been used already (status is 'sent')
- you copied the full token from the url

### "contribution amount invalid"

ensure:
- amount is between round's min/max contribution
- amount is a valid number
- if you've contributed before, total doesn't exceed max

### build fails on vercel

check:
- `prisma generate` runs in `postinstall` script
- `DATABASE_URL` is set in vercel env vars
- `package.json` has all dependencies (not devDependencies)

## Useful Prisma Commands

```bash
# view database in browser (http://localhost:5555)
npx prisma studio

# reset database (careful: deletes all data)
npx prisma db push --force-reset

# view generated sql for schema
npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma

# format schema file
npx prisma format

# validate schema
npx prisma validate
```

## Development Tips

### Testing Different Roles

use multiple browser profiles:
- **regular browser** - logged in as company
- **incognito/private window** - logged in as investor

this lets you test both flows simultaneously.

### viewing audit logs

audit logs table gets big fast during testing. use prisma studio to view/filter:
```bash
npx prisma studio
```

or query directly in the ui at `/company/audit`

### testing invitations

invitation links expire after 7 days. to test expiration:
1. create invitation
2. in prisma studio, manually change `expiresAt` to past date
3. try to accept - should show "expired" message

### simulating production

build and run production mode locally:
```bash
npm run build
npm run start
```

this catches build errors and tests optimizations.

## Database Maintenance

### Backing Up Data

neon automatically backs up, but to export manually:

```bash
# dump schema only
pg_dump $DATABASE_URL --schema-only > schema.sql

# dump data only
pg_dump $DATABASE_URL --data-only > data.sql

# dump everything
pg_dump $DATABASE_URL > full_backup.sql
```

### resetting to demo data

```bash
npx prisma db push --force-reset  # deletes everything
npx prisma db seed                # reloads demo data
```

**warning:** this deletes all data in the database.

## Next Steps

Now that you have the app running:

1. **Explore both portals** - Log in as company and investor to see both workflows
2. **Test core features** - Create a round, invite an investor, make a contribution
3. **Check audit logs** - See how all actions are tracked
4. **Try token allocation** - Close a round and generate allocations
5. **Review the code** - Understand how API routes, validation, and auth work

## Additional Resources

- [next.js documentation](https://nextjs.org/docs)
- [prisma documentation](https://www.prisma.io/docs)
- [neon documentation](https://neon.tech/docs)
- [shadcn/ui documentation](https://ui.shadcn.com)
- [tailwind css documentation](https://tailwindcss.com/docs)

## Need Help?

Check these files for more details:
- `README.md` - High-level overview and design decisions
- `IMPLEMENTATION_NOTES.md` - Architectural decisions explained
- `QUICK_TEST_GUIDE.md` - Step-by-step testing guide
- `DATABASE_SETUP.md` - Detailed database setup

---

**Questions or issues?** Check the code comments or review the API route files - they include detailed documentation on expected inputs/outputs and validation rules.
