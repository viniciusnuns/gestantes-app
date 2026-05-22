# Gestar em Movimento 🤰✨

**Wellness app for pregnant women** — exercises, community, education, and support throughout pregnancy.

## Features (MVP Phase 1)

- 🎯 Personalized onboarding (gestational week, objectives, discomforts)
- 🏠 Daily home dashboard with recommendations
- 📚 Organized exercise library (by trimester, objective, duration)
- 📅 Gestational calendar with pregnancy insights
- 💬 Community (segmented by trimester and phase)
- 🏆 Gamification (points, achievements, consistency ranking)
- 📊 Progress tracking

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **UI:** React + Tailwind CSS
- **Database:** Mock data (ready for SQLite/Supabase)
- **Icons:** Lucide React
- **Images:** Unsplash/Pixabay (remote)

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Test the App

1. **Onboarding:** Complete 4 screens to personalize
2. **Home:** View daily recommendations
3. **Library:** Browse exercises by category
4. **Community:** See posts from other expecting mothers
5. **Calendar:** Check pregnancy development
6. **Progress:** View points and achievements

## Project Structure

```
gestantes-app/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Home page (entry point)
│   ├── onboarding/             # Onboarding flow
│   ├── home/                   # Main dashboard
│   ├── biblioteca/             # Exercise library
│   ├── comunidade/             # Community section
│   ├── calendario/             # Gestational calendar
│   └── progresso/              # Progress/achievements
├── components/
│   ├── nav/BottomNav.tsx       # Bottom navigation
│   ├── onboarding/             # Onboarding components
│   ├── home/                   # Home page components
│   ├── library/                # Library components
│   └── community/              # Community components
├── lib/
│   ├── data.ts                 # Mock data
│   └── utils.ts                # Utilities
├── public/                     # Static assets
├── styles/
│   └── globals.css             # Global styles
├── tailwind.config.js          # Tailwind configuration
└── package.json
```

## Color Palette

- **Primary (Warm Rose):** #D4A5A5
- **Secondary (Soft Purple):** #C4A8D9
- **Accent (Warm Peach):** #F5C89A
- **Background (Warm White):** #FBF8F4
- **Text (Dark Taupe):** #5C4C5C

## Design Philosophy

🤍 **Caring & Affectionate:** Warm color palette designed to make pregnant women feel supported and understood.

👥 **Community-First:** "You're not alone in this pregnancy" — strong emphasis on connection.

📊 **Consistent Over Perfect:** Ranking by days active, not performance metrics.

✨ **Progressive:** MVP starts with core features, expands to premium content.

## Next Phases

- **Phase 2:** Notifications, better ranking
- **Phase 3:** Personalization by gestational week
- **Phase 4:** Native iOS/Android app
- **Phase 5:** Premium content (labor prep, postpartum)

## Status

🚧 **Under Development** — MVP visual prototype

---

**Built with ❤️ for expecting mothers**
