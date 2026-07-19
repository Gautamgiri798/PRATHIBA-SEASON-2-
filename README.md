# 🏆 Pratibha Season 2 — Voting & Administration Platform

An elegant, secure, and mobile-responsive digital voting system designed for the **Pratibha Season 2 Awards**, presented by the **Sambalpuriya Youth Association**. The platform showcases regional talent across 10 categories, allowing verified users to cast votes, while providing admins with a secure, real-time results dashboard and voter registration logs.

---

## 🌟 Key Features

*   **Responsive Voting Flow**: Seamless 3-step wizard (Verify Identity → Cast Votes across 10 Categories → Review & Submit).
*   **Film Reel Progress Strip**: A visual negative film strip acting as a progress bar, rendering category poster thumbnails that light up as the user votes.
*   **PostgreSQL Database**: Production-ready relational database integration using connection pooling (`pg`), auto-migrated schemas, and atomic SQL transactions.
*   **Secure Administration Dashboard**: Gatekeeper passcode login, HTTP-only cookie session management, live results leaderboards with dynamic percentage share progress bars, and leading indicators.
*   **Segmented Voter Reports**: A separate, paginated logs view for admins to view voter registry details (Names, Mobile/Email, timestamps) in Indian Standard Time (IST).

---

## 🛠️ Tech Stack

*   **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
*   **Language**: [TypeScript](https://www.typescriptlang.org/)
*   **Frontend & Styling**: [React 18](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/), Glassmorphism UI & custom CSS animations
*   **Database**: [PostgreSQL](https://www.postgresql.org/) via [`pg`](https://node-postgres.com/) (connection pooling, atomic transactions & automatic schema migrations)
*   **Containerization**: [Docker](https://www.docker.com/) & Docker Compose (`postgres:16-alpine` + `node:20-slim`)
*   **Authentication & Security**: Passcode gatekeeper with HTTP-Only cookie session management

---

## 📁 Folder Structure

```text
pratibha-season-2-awards/
├── app/                        # Next.js App Router Pages & API Routes
│   ├── admin/                  # Admin Dashboard Views
│   │   ├── page.tsx            # Login panel / results charts
│   │   └── voters/             # Separate voter registration report
│   │       └── page.tsx
│   ├── api/
│   │   └── vote/
│   │       └── route.ts        # Vote receiver & PostgreSQL transaction API
│   ├── globals.css             # Glassmorphic themes & gold gradients
│   ├── layout.tsx
│   └── page.tsx                # Multi-step voter wizard
├── components/                 # Shared UI Components
│   ├── FilmReelProgress.tsx    # Responsive visual film progress bar
│   └── NomineeCard.tsx         # Nominee details & image display card
├── lib/                        # Backend Helpers & Constants
│   ├── categories.ts           # Categories config & Nominees registry
│   ├── db.ts                   # PostgreSQL client pool, schema migrator & async queries
│   └── validate.ts             # Contact details validator & formatter
├── public/                     # Static Local Assets (nominee photos & category cards)
│   ├── nominees/               # Place candidate portraits here
│   └── categories/             # Place progress bar category cards here
├── .env.example                # Admin passcode & DATABASE_URL template
├── Dockerfile                  # Multi-stage Docker production builder
├── docker-compose.yml          # PostgreSQL 16 + Next.js App Compose definition
├── package.json
├── README.md                   # Platform documentation
└── tsconfig.json
```

---

## ⚙️ Technical Workflow & System Design

```mermaid
graph TD
    A[Voter enters Name & Contact] -->|Client Validation| B[Check Mobile or Email format]
    B -->|Verified| C[Film Strip Step 1 to 10]
    C -->|Choose Nominees| D[Review Picks Page]
    D -->|Submit| E[POST /api/vote]
    E -->|Database Check| F{Has contact voted?}
    F -->|Yes| G[Error: Already Voted]
    F -->|No| H[Insert Voter Record & Tallies]
    H -->|Commit Transaction| I[Success Page + Set Local Flag]
```

### 1. Verification Phase (Step 1 of 3)
*   **User Action**: The voter inputs their Full Name and chooses validation by Indian Mobile Number (10 digits) or Email Address.
*   **Validation**: The system runs formatting checks using `lib/validate.ts` before unlocking the voting ballot.

### 2. Balloting Phase (Step 2 of 3)
*   **User Action**: The voter navigates the 10 film strip steps, selecting exactly one nominee per category.
*   **Film Reel strip**: The `FilmReelProgress` bar renders category poster images that switch from a dark, low-opacity negative view into a lit, colored card frame once a vote is cast.

### 3. Submission Phase (Step 3 of 3)
*   **User Action**: Review selected nominees alongside their photo avatars and click **Submit**.
*   **Transaction Block**: Next.js API route (`app/api/vote/route.ts`) takes the ballot, opens a transaction in PostgreSQL, checks that the contact has not voted yet (due to the `voters.contact` unique constraint), inserts the registration details, increments the nominee tallies, and commits the records.

### 4. Admin Inspection & Voting Controls
*   **Results Panel (`/admin`)**: Admins authenticate using `ADMIN_PASSCODE` (default `admin123`). This issues a secure HTTP-only cookie. The dashboard renders live metrics and nominee ranking bars.
*   **Voter Window Controls**: Authenticated admins can manually start and stop/pause the voting process, or set a target date-time deadline. 
*   **Live Countdown**: When a deadline is set, both admins and voters see a live pulsing countdown timer. Once the deadline passes (or if voting is manually stopped), users are blocked from voting and redirected to a "Voting Closed" page.
*   **Data Logs (`/admin/voters`)**: Displays detailed voter lists in a separate logs grid. Timestamps are formatted to India Standard Time (IST) for easy reference.

---

## 🚀 Getting Started

### 1. Docker Compose (Recommended)
Launch both the **PostgreSQL 16** database container and the **Next.js Web Application** using Docker Desktop:

```bash
# Build and run containers in detached mode
docker compose up --build -d
```
* **Web App**: [http://localhost:3000](http://localhost:3000)
* **Admin Panel**: [http://localhost:3000/admin](http://localhost:3000/admin) (Passcode: `admin123`)

### 2. Local Node.js Development
If running directly on your host machine, ensure you have a running PostgreSQL instance:

```bash
# 1. Create .env.local file with your PostgreSQL DATABASE_URL
ADMIN_PASSCODE=admin123
DATABASE_URL=postgres://postgres:postgrespassword@localhost:5432/pratibha_db

# 2. Install dependencies
npm install

# 3. Run dev server
npm run dev
```

### 3. Database Administration
To inspect PostgreSQL vote records directly from your console:
```bash
# Query the live vote tallies table inside the Docker container
docker exec -it pratibha-postgres psql -U postgres -d pratibha_db -c "SELECT * FROM vote_tallies;"
```

---

## 🎨 Asset Customization

### Local Images
To replace stock pictures with official nominees and category assets:
1. Save your images under `public/nominees/` and `public/categories/`.
2. Open `lib/categories.ts` and set the paths (starting with `/` since `public` is the root asset directory):
    ```typescript
    // In lib/categories.ts
    thumbnailUrl: "/categories/best-actor.jpg",
    nominees: [
      { id: "n1", name: "Aditya Sahu", imageUrl: "/nominees/aditya.jpg" }
    ]
    ```

### Production Deployment
Since the application uses PostgreSQL, it can be deployed to any modern cloud platform:
*   **Railway / Render**: Connect your GitHub repository. Set `DATABASE_URL` to a provisioned PostgreSQL instance and `ADMIN_PASSCODE`. Railway/Render will build the `Dockerfile` automatically.
*   **Serverless Hosting (Vercel / Netlify)**: Provide a cloud PostgreSQL connection string (e.g. from **Supabase**, **Neon**, or **AWS RDS**) in your `DATABASE_URL` environment variable.
