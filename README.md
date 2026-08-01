# 🏆 Pratibha Season 2 — Voting & Administration Platform

An elegant, secure, and mobile-responsive digital voting system designed for the **Pratibha Season 2 Awards**, presented by the **Sambalpuriya Youth Association**. The platform showcases regional talent across award categories, allowing verified users to cast votes while providing administrators with real-time tallies, a dedicated winners portal, and voter registration logs.

---

## 🌟 Key Features

*   **Streamlined 3-Step Voting Flow**: User identity verification via 10-digit mobile number → Ballot casting across award categories → Final review & submission.
*   **Dynamic Film Reel Progress Bar**: Adaptive visual negative film strip acting as a progress bar, rendering category poster thumbnails that automatically adjust columns and light up as votes are placed.
*   **High-Fidelity Nominee Display**: Fixed-aspect portrait image containers (`w-24 h-28` / `w-28 h-32`) with `object-cover object-top` alignment ensuring candidate faces are always clearly visible.
*   **Test Voting Simulator (`/admin/test-vote`)**: A sandboxed test voting wizard with independent data tables (`test_votes.db` or PostgreSQL test pool) enabling admins to simulate and test the end-to-end voting experience without corrupting the live election tallies. Includes active toggle controls on the Admin Dashboard to inspect Live vs. Test logs, tallies, and leaderboards.
*   **Cinematic Results Reveal Portal (`/admin/reveal`)**: A television-style live results ceremony tool for administrators. Selecting any category initiates a cinematic 5-second countdown accompanied by synthesized sci-fi audio beeps, followed by an animated vote bar expansion (with a synthesized low-frequency Kettle Drum roll and deep sub-bass rumble generated via the Web Audio API). When the reveal completes, confetti bursts, the winner is highlighted with gold card animations, and a custom "Congratulations" card autoplays their theme song from `/songs/`. Supports both Live and Test mode databases.
*   **WhatsApp Verification System**: Renders an enlarged, high-visibility WhatsApp verification banner on the success page of both public and test voting flows. Injects official WhatsApp contact numbers (linked via standard `wa.me`) and official group invitation links, asking voters to send screenshot validations.
*   **Voter Registry Logs & Choices Inspector (`/admin/voters`)**: Detailed voter audit trail (Full Name, Mobile Number, Timestamp in IST) for duplicate prevention. Features a "Voted Choices" column with native collapsible dropdowns, letting admins audit exact nominee list selections per voter.
*   **Real-time Voters Finder (Search)**: Integrated an interactive client-side query finder in the logs sheet, allowing admins to search/find registered voters instantly as they type by matching full names or contact/mobile numbers.
*   **Individual Voter Deletion with Cascades**: Added support for individual voter deletions with cascades. Includes a custom, styled, inline overlay confirmation warning box presenting the target's name and contact, which updates the database and refreshes the client router cache automatically.
*   **Dedicated Winners Portal (`/admin/winners`)**: Specialized admin view highlighting official category winners (top-voted nominees or tied leaders 🏆) with gold award cards, vote counts, and percentage share.
*   **Live Admin Leaderboard (`/admin`)**: Real-time votes tally dashboard with dynamic percentage progress bars, leading indicators, ballot activation/pause controls, and deadline countdown timers.
*   **Dual Database Engine (PostgreSQL + SQLite Fallback)**: Production-ready PostgreSQL integration (`pg`) with automatic fallback to local zero-config SQLite (`votes.db`) for offline or development environments.

---

## 🛠️ Tech Stack

*   **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
*   **Language**: [TypeScript](https://www.typescriptlang.org/)
*   **Frontend & Styling**: [React 18](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/), Framer Motion, Glassmorphism UI & custom CSS animations
*   **Libraries**: `canvas-confetti` (for celebrations), `lottie-react` (for trophy/celebration animations), `react-countup` (for animated counter tallies)
*   **Database**: [PostgreSQL](https://www.postgresql.org/) via [`pg`](https://node-postgres.com/) with automatic fallback to [Node SQLite](https://nodejs.org/api/sqlite.html) (`votes.db`)
*   **Containerization**: [Docker](https://www.docker.com/) & Docker Compose (`postgres:16-alpine` + `node:20-slim`)
*   **Authentication & Security**: Passcode gatekeeper with HTTP-Only cookie session management

---

## 📁 Folder Structure

```text
pratibha-season-2-awards/
├── app/                        # Next.js App Router Pages & API Routes
│   ├── admin/                  # Admin Dashboard Views
│   │   ├── page.tsx            # Main dashboard / live tallies leaderboard
│   │   ├── reveal/             # Cinematic winner reveal portal
│   │   │   ├── page.tsx        # Server page wrapper
│   │   │   └── RevealClient.tsx # Client-side presentation logic & synth audio
│   │   ├── voters/             # Separate voter registration audit log
│   │   │   └── page.tsx
│   │   └── winners/            # Category winners showcase view
│   │       └── page.tsx
│   ├── api/
│   │   ├── admin/
│   │   │   └── reveal/         # Reveal data API (handles tallies, ranks, and ties)
│   │   │       └── route.ts
│   │   ├── settings/           # Voting active/deadline control API
│   │   └── vote/               # Vote receiver & DB transaction API
│   ├── globals.css             # Glassmorphic themes & gold gradients
│   ├── layout.tsx
│   └── page.tsx                # Multi-step voter wizard
├── components/                 # Shared UI Components
│   ├── FilmReelProgress.tsx    # Adaptive visual film progress bar
│   └── NomineeCard.tsx         # Nominee card with fixed portrait image container
├── lib/                        # Backend Helpers & Constants
│   ├── categories.ts           # Categories config & Nominees registry
│   ├── db.ts                   # Dual DB driver (PostgreSQL + SQLite fallback) & SQL queries
│   └── validate.ts             # Contact details validator & formatter
├── public/                     # Static Local Assets (nominee photos, cards, & audio)
│   ├── nominees/               # Organized candidate portrait folders
│   └── songs/                  # Winner theme songs (MP3 format)
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
    A[Voter enters Full Name & 10-Digit Mobile Number] -->|Format Validation| B[Verify 10-Digit Mobile]
    B -->|Verified| C[Film Strip Category Balloting]
    C -->|Select Nominees| D[Review Final Picks Page]
    D -->|Submit Votes| E[POST /api/vote]
    E -->|Database Check| F{Has mobile number voted?}
    F -->|Yes| G[Error: Already Voted]
    F -->|No| H[Insert Voter Record & Increment Tallies]
    H -->|Commit Transaction| I[Success Page + Set Local Flag]
```

### 1. Verification Phase (Step 1 of 3)
*   **User Action**: The voter inputs their Full Name and 10-digit Indian Mobile Number.
*   **Validation**: The system runs formatting checks using `lib/validate.ts` before unlocking the voting ballot.

### 2. Balloting Phase (Step 2 of 3)
*   **User Action**: The voter navigates category steps, selecting exactly one nominee per category.
*   **Film Reel Strip**: The `FilmReelProgress` bar renders category poster thumbnails that automatically adapt to the total category count and light up as votes are cast.

### 3. Submission Phase (Step 3 of 3)
*   **User Action**: Review selected nominees alongside their clear portrait photo avatars and click **Submit**.
*   **Transaction Block**: The API route (`app/api/vote/route.ts`) handles the ballot in an atomic database transaction, preventing duplicate votes based on the unique mobile contact constraint.

### 4. Admin Portal Features
*   **Live Leaderboard (`/admin`)**: Authenticate via `ADMIN_PASSCODE` (default `admin123`) to view live tallies, rank bars, and ballot controls (Start/Pause voting, set deadline).
*   **Cinematic Reveal Ceremony (`/admin/reveal`)**: A premium results reveal system featuring:
    *   **Interactive Countdown**: A 5-second cinematic countdown with Web Audio API synthesized tones.
    *   **Animated Reveal**: Slowly scaling results charts (18 seconds long) accompanied by synthesized drum-roll audio to maximize suspense.
    *   **Winner Highlight**: Multidirectional canvas-confetti bursts combined with visual rank indicators.
    *   **Audio Integration**: Automatically plays the custom winner theme song file from `/public/songs/` on final congratulations card load.
*   **Winners Gallery (`/admin/winners`)**: Dedicated winners portal displaying only top-voted candidates (or tied leaders 🏆) per category.
*   **Data Logs (`/admin/voters`)**: Comprehensive voter list display (Name, Mobile, Timestamp in IST) for audit purposes.

---

## 🚀 Getting Started

### 1. Docker Compose (Recommended)
Launch both the **PostgreSQL 16** container and the **Next.js Application** using Docker Desktop:

```bash
# Build and run containers in detached mode
docker compose up --build -d
```
* **Web App**: [http://localhost:3000](http://localhost:3000)
* **Admin Panel**: [http://localhost:3000/admin](http://localhost:3000/admin) (Passcode: `admin123`)
* **Winners Portal**: [http://localhost:3000/admin/winners](http://localhost:3000/admin/winners)
* **Cinematic Reveal**: [http://localhost:3000/admin/reveal](http://localhost:3000/admin/reveal)

### 2. Local Node.js Development
```bash
# 1. Create .env.local file with your configuration
ADMIN_PASSCODE=admin123
DATABASE_URL=postgres://postgres:postgrespassword@localhost:5432/pratibha_db

# 2. Install dependencies
npm install

# 3. Run dev server (will automatically fall back to SQLite if PostgreSQL is offline)
npm run dev
```

### 3. Database Inspection
Query records directly via Docker:
```bash
# Query the live vote tallies table inside the Docker container
docker exec -it pratibha-postgres psql -U postgres -d pratibha_db -c "SELECT * FROM vote_tallies;"
```

---

## 🎨 Asset Customization

### Nominee Images
To update nominee pictures:
1. Save images under `public/nominees/<Category Name>/` (e.g. `public/nominees/Best Singer Male/Pratap Sahu.jpeg`).
2. Update `lib/categories.ts` paths:
    ```typescript
    {
      id: "n1",
      name: "Pratap Sahu",
      imageUrl: "/nominees/Best Singer Male/Pratap Sahu.jpeg"
    }
    ```

### Winner Theme Songs
The Cinematic Reveal portal can automatically play a theme song for the category winner:
1. Save the song in MP3 format under `public/songs/` (e.g. `public/songs/Gulap Phool.mp3`).
2. Ensure the `song` property in `lib/categories.ts` matches the filename (excluding the `.mp3` extension) exactly:
    ```typescript
    {
      id: "nominee-id",
      name: "Nominee Name",
      song: "Gulap Phool",
      imageUrl: "/nominees/..."
    }
    ```
The platform automatically decodes and handles URL-encoding of filenames (e.g. spaces and special characters).
