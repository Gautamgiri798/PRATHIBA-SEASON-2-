# Pratibha Season 2 — Voting Website

A voting site for the Pratibha Season 2 awards (presented by Sambalpuriya Youth Association): 10 categories, 5 nominees each, one vote per mobile number or email. 

This project uses a local **SQLite database** (`votes.db`) which automatically initializes itself on startup.

---

## Why this needs a real backend

To prevent duplicate votes, the check has to happen on a server against a shared database.
- Next.js API route (`app/api/vote/route.ts`) runs server-side.
- SQLite (`votes.db` file) stores voters and votes.
- A `voters.contact` column has a **unique constraint** — a second attempt with the same number/email is rejected by the database itself.
- A database transaction writes the voter + all 10 category picks atomically.

---

## 1. Run it locally

No database configuration is needed! The database schema automatically creates itself in a `votes.db` file the first time you run the app.

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:3000` in your browser.

---

## 2. Admin Panel & Sub-Pages

There is a secure administration panel available.
*   **Access Control**: Only the admin can log in. When loading `/admin`, you will see a professional login page requesting the admin passcode.
*   **Cookie Authentication**: Authenticating sets a secure, HTTP-only cookie (`admin_session`) on your browser. This cookie expires in 1 day and is validated by the server on each request.
*   **Passcode Configuration**: By default, the passcode is `admin123`. You can customize this by setting the `ADMIN_PASSCODE` environment variable in your production environment (or in a local `.env.local` file):
    ```env
    ADMIN_PASSCODE=your-secret-passcode
    ```

Once logged in, the admin can navigate between two sections:
1.  **Results Dashboard (`/admin`)**: Displays total registered voters, total votes cast, and live percentage share graphs/leaders for each category.
2.  **Voter Logs (`/admin/voters`)**: Displays a detailed data log report table containing voter names, contact details, contact type (mobile or email), and local-format registration time.
    - *Unauthenticated users attempting to access `/admin/voters` are automatically redirected to `/admin` to log in.*

---

## 3. Alternative Database Checks (CLI)

Since SQLite stores data in a local file (`votes.db`), you can also inspect it directly from your terminal:
- **CLI**:
  ```bash
  sqlite3 votes.db "select * from vote_tallies;"
  ```
- Or open it with any graphical SQLite explorer (like [DB Browser for SQLite](https://sqlitebrowser.org/)).

---

## 4. Deploy

Because SQLite is file-based:
- **Serverless platforms** like **Vercel** or **Netlify** have read-only/ephemeral filesystems. Any votes written there will be wiped out when the serverless function restarts.
- **Recommended Deployments**:
  - Deploy to a VPS (like DigitalOcean, Linode) or PaaS platforms with persistent volumes (like **Railway**, **Render**, or **Fly.io**).
  - Alternatively, if you wish to deploy to Vercel/Netlify, you can easily change the database client to connect to a cloud SQLite service like **Turso** using `@libsql/client`.

---

## 5. Add the real nominees

Edit `lib/categories.ts`. Each category has an `id` and exactly 5 nominees with a `name` and optional `subtitle` (e.g. a song or film title).

```ts
{ id: "n1", name: "Aditya Sahu" },
```

---

## Project structure

```
app/
  page.tsx           the whole voting flow (landing → identity → 10 categories → review → submit)
  admin/
    page.tsx         secure login screen and results dashboard
    voters/
      page.tsx       secure data log report table showing names, contacts, and registration times
  api/vote/route.ts  server-side endpoint that validates + runs SQLite transaction
  layout.tsx, globals.css
components/
  FilmReelProgress.tsx   the 10-frame progress strip
  NomineeCard.tsx        selectable nominee row
lib/
  categories.ts      edit this to set real nominees
  validate.ts        phone/email normalization + validation
  db.ts              local SQLite connection & auto-schema creator
votes.db             the SQLite database file (created automatically on startup)
```
