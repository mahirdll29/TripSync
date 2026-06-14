# ✈️ TripSync

> A lightning-fast, offline-first trip planning application designed for absolute privacy and seamless coordination.

Built as a **weekend vibecoded project** by [@mahirdll29](https://github.com/mahirdll29). 🚀

---

## ✨ Features

- **Offline-First Local Database:** Fully migrated away from clunky cloud databases. TripSync runs on a blazingly fast SQLite instance directly on your machine.
- **Passwordless Authentication:** No cumbersome OAuth configurations or passwords. Secure, 30-day persistent JWT sessions using simple Name + Email magic links.
- **Dynamic City Routing:** Add multiple destinations per trip, neatly organized in sleek, animated tabs.
- **Hotel Shortlisting:** Drop Booking.com, Airbnb, Agoda, or Expedia links. TripSync automatically tags the booking source and lets you shortlist favorites.
- **Seamless Sharing:** Generate secure invite links. Anyone joining instantly sees the synchronized itinerary.

## 🛠️ Tech Stack

- **Framework:** [Next.js 15 (App Router)](https://nextjs.org/)
- **Styling:** Vanilla CSS with modern Glassmorphism & custom utility classes
- **Database:** [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) (Zero config, local file-based DB)
- **Authentication:** [NextAuth.js v5](https://authjs.dev/) (Custom JWT Credentials)
- **Validation:** [Zod](https://zod.dev/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)

---

## 🚀 Getting Started

Since TripSync is designed for local, private use, getting it running is incredibly simple. No cloud database keys required.

### Prerequisites
- Node.js 20+ installed

### 1. Clone the repository
```bash
git clone https://github.com/mahirdll29/tripsync.git
cd tripsync
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start the Development Server
```bash
npm run dev
```

That's it! 
- TripSync will automatically create your local database file (`tripsync.db`) on the first run.
- Open [http://localhost:3000](http://localhost:3000) in your browser.
- Enter any name and email to instantly log in.

---

## 📂 Project Architecture

```
tripsync/
├── src/
│   ├── app/              # Next.js App Router & API Handlers
│   ├── components/       # Reusable React components (UI, Modals, Cards)
│   ├── lib/              # Core logic
│   │   ├── db.ts         # SQLite Schema and connection
│   │   ├── queries.ts    # SQL abstraction layer
│   │   ├── auth.ts       # NextAuth configuration
│   │   └── validations.ts# Zod schemas
│   └── types/            # TypeScript interfaces
├── tripsync.db           # Auto-generated local SQLite database
└── next.config.ts        # Next.js configuration
```

## 🤝 Contributing
Since this is a personal weekend project, contributions aren't expected, but feel free to fork the repository and customize it for your own trips!

## 📜 License
This project is open-source and available under the [MIT License](LICENSE).
