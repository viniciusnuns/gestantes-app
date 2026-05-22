# PRD — Gestar em Movimento MVP

**Project:** Wellness app for pregnant women  
**Version:** MVP Phase 1  
**Status:** Development (Day 1)  
**Owner:** Você (Terapeuta)

---

## Vision

**"You're not alone in this pregnancy"** — A warm, caring app that helps expectant mothers feel supported through exercise, community, and education.

**Differentiation:** Consistency-based ranking (not performance), community segmented by trimester, gamification designed for emotional support.

---

## Scope - MVP Phase 1

### Must-Have (Core)
- [x] Onboarding (4 screens: welcome, pregnancy data, objectives, discomforts)
- [ ] Home dashboard (daily recommendations, progress, quick access)
- [ ] Exercise library (filterable by trimester, objective, duration)
- [ ] Community (feed segmented by category)
- [ ] Pregnancy calendar (week-by-week insights)
- [ ] Progress tracking (points, achievements, ranking)
- [ ] Bottom navigation (5 main sections)

### Nice-to-Have (Phase 2)
- Notifications (reminders for daily exercises)
- Better ranking visualization
- Personalization by week
- Premium content (labor prep module)

### Out of Scope (Phase 3+)
- Native iOS/Android
- Video streaming (using mock images)
- Premium payment processing
- User authentication (mock users)

---

## User Flows

### Flow 1: Onboarding (NEW USER)
```
Welcome Screen → Pregnancy Data → Objectives → Discomforts → Success Screen → Home
```

### Flow 2: Daily Dashboard (LOGGED IN)
```
Home (view day's exercises) → Start Practice → Complete → View Feedback → Home
```

### Flow 3: Explore Library
```
Library → Filter by Category → Select Exercise → View Details → Complete/Return
```

### Flow 4: Community Engagement
```
Community → View Posts → Read Comments → Maybe Post → Return
```

---

## Screens & Pages

| Screen | Route | Status | Notes |
|--------|-------|--------|-------|
| Welcome/Onboarding | `/` | ✅ DONE | 4-step flow, saves data |
| Home Dashboard | `/home` | 🏗️ TODO | Daily recs, progress |
| Exercise Library | `/biblioteca` | 🏗️ TODO | Filterable grid |
| Community | `/comunidade` | 🏗️ TODO | Feed by category |
| Calendar | `/calendario` | 🏗️ TODO | Week insights |
| Progress/Achievements | `/progresso` | 🏗️ TODO | Points, achievements |
| Exercise Detail | `/biblioteca/[id]` | 🏗️ TODO | Video mock, instructions |

---

## Data Model

### Mock Data (In `/lib/data.ts`)
- Current user (you)
- 6 exercises (1º/2º/3º trimester)
- 5 community posts (various categories)
- 8 users in ranking
- 5 achievements
- Pregnancy calendar (40 weeks)

### User State (localStorage MVP)
- Name, week, due date, objectives, discomforts
- Completed exercises (today, week)
- Points accumulated
- Posts viewed

---

## Design System

### Colors (Warm & Caring)
- **Primary:** #D4A5A5 (Warm rose)
- **Secondary:** #C4A8D9 (Soft purple)
- **Accent:** #F5C89A (Warm peach)
- **Background:** #FBF8F4 (Warm white)
- **Text:** #5C4C5C (Dark taupe)

### Typography
- **Headlines:** Bold, 2xl-4xl
- **Body:** Regular, base
- **Small:** Regular, sm

### Components
- Cards (white bg, soft shadow)
- Buttons (primary/secondary/accent/outline)
- Badges (status indicators)
- Bottom nav (5 items, centered icons)

---

## Development Phases

### Phase 1: Core Pages (THIS SPRINT)
1. **Home Dashboard** — Daily recommendations + progress
2. **Exercise Library** — Grid view + filter
3. **Community Feed** — Posts by category
4. **Pregnancy Calendar** — Week insights
5. **Progress View** — Achievements + ranking

### Phase 2: Refinement
- Notifications
- Better interactions
- Loading states
- Error handling

### Phase 3: Polish
- Animations
- Dark mode
- Performance
- Mobile optimization

---

## Acceptance Criteria

- [x] Onboarding flow complete (4 screens)
- [ ] Home dashboard displays day's exercises
- [ ] Library can filter by trimester/objective/duration
- [ ] Community shows 5+ posts
- [ ] Calendar displays pregnancy info
- [ ] Points system increments
- [ ] Bottom nav navigates between 5 sections
- [ ] All mock data loads from `/lib/data.ts`
- [ ] No external API calls (mock only)
- [ ] Responsive mobile-first design
- [ ] Color palette matches spec
- [ ] Images from Unsplash/Pixabay

---

## Technical Stack

- **Framework:** Next.js 14 (App Router)
- **UI:** React + Tailwind CSS
- **State:** React hooks (useState)
- **Icons:** Lucide React (or HTML emojis)
- **Images:** Unsplash/Pixabay (remote URLs)
- **Database:** Mock data in `/lib/data.ts`

---

## Files to Create

```
app/
├── home/
│   └── page.tsx                    # Dashboard
├── biblioteca/
│   ├── page.tsx                    # Library
│   └── [id]/page.tsx               # Exercise detail
├── comunidade/
│   └── page.tsx                    # Community feed
├── calendario/
│   └── page.tsx                    # Pregnancy calendar
└── progresso/
    └── page.tsx                    # Achievements & ranking

components/
├── nav/
│   └── BottomNav.tsx               # Navigation bar
├── home/
│   ├── DailyExercises.tsx
│   ├── ProgressWidget.tsx
│   └── QuickActions.tsx
├── library/
│   ├── ExerciseCard.tsx
│   ├── FilterBar.tsx
│   └── ExerciseDetail.tsx
├── community/
│   ├── PostCard.tsx
│   ├── CategoryTabs.tsx
│   └── FeedList.tsx
└── shared/
    ├── Card.tsx
    ├── Button.tsx
    └── Badge.tsx
```

---

## Success Metrics (MVP)

- ✅ Onboarding completes in <2 minutes
- ✅ All pages load in <1 second
- ✅ No runtime errors
- ✅ Responsive on mobile/tablet/desktop
- ✅ Colors match spec
- ✅ Complete user flow from onboarding → home → library → community

---

## Notes for @dev

- Use mock data extensively (no real API)
- Keep components small and reusable
- Focus on mobile-first design
- Don't over-engineer state management (hooks are fine)
- Use Tailwind utilities, not custom CSS
- Test on mobile device/browser before submitting
- Include placeholder images (will swap later)

**Timeline:** Build all pages by end of today/tomorrow morning so you can test with your patients this week.

---

**Created:** 2026-05-21  
**Next Review:** When all pages are complete
