# Admin Dashboard API Guide

**Created by:** Dara (Data Engineer)  
**Date:** 2026-05-30  
**Status:** Ready for @dev implementation

---

## 📋 Overview

This guide documents all API endpoints needed to feed the Admin Dashboard with performance-optimized queries.

**Total Endpoints:** 7 (grouped by dashboard section)

---

## 🏗️ Architecture

```
Admin Dashboard (Frontend)
    ↓
API Routes (/api/admin/*)
    ↓
Supabase Queries (pre-written in queries_admin_dashboard.sql)
    ↓
PostgreSQL Views (v_user_stats, v_ranking)
```

---

## 📍 SECTION 1: Overview Stats

### Endpoint 1: `/api/admin/stats/overview`

**Method:** `GET`

**Response:**
```json
{
  "total_users": 47,
  "completed_onboarding": 35,
  "onboarding_completion_rate": 74,
  "users_with_activities": 28,
  "active_this_week": 12,
  "abandoned_users": 19,
  "abandonment_rate_percent": 40
}
```

**Query Used:** Query 1.1 (Core Stats)

**Implementation:**
```typescript
// app/api/admin/stats/overview/route.ts
import { supabase } from '@/lib/supabase'

export async function GET() {
  const { data, error } = await supabase.rpc('admin_stats_overview')
  
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
  
  return new Response(JSON.stringify(data[0]), { status: 200 })
}
```

---

### Endpoint 2: `/api/admin/stats/by-trimester`

**Method:** `GET`

**Response:**
```json
[
  { "trimester": 1, "user_count": 12, "percentage": 25 },
  { "trimester": 2, "user_count": 18, "percentage": 38 },
  { "trimester": 3, "user_count": 17, "percentage": 36 }
]
```

**Query Used:** Query 1.2 (Trimester Distribution)

---

### Endpoint 3: `/api/admin/stats/top-achievements`

**Method:** `GET`

**Response:**
```json
[
  { "achievement_id": "primeira_semana", "users_count": 8, "percentage": 17.0 },
  { "achievement_id": "30_dias", "users_count": 2, "percentage": 4.3 },
  { "achievement_id": "consistencia", "users_count": 0, "percentage": 0.0 }
]
```

**Query Used:** Query 1.3 (Top Achievements)

---

### Endpoint 4: `/api/admin/stats/activity`

**Method:** `GET`

**Response:**
```json
{
  "avg_active_days": 5,
  "avg_points": 125,
  "max_points": 450,
  "min_points": 0,
  "median_points": 100
}
```

**Query Used:** Query 1.4 (Activity Stats)

---

## 📋 SECTION 2: Users List

### Endpoint 5: `/api/admin/users`

**Method:** `GET`

**Query Parameters:**
- `status`: `null` (all) | `'completed'` | `'pending'`
- `trimester`: `null` (all) | `1` | `2` | `3`
- `active_this_week`: `null` (all) | `'true'` | `'false'`
- `sort_by`: `'signup_date'` | `'active_days'` | `'total_points'` | `'ranking'`
- `sort_order`: `'asc'` | `'desc'` (default: `'desc'`)
- `limit`: number (default: 50)
- `offset`: number (default: 0)

**Response:**
```json
{
  "total_count": 47,
  "users": [
    {
      "id": "uuid-1",
      "email": "mae1@gmail.com",
      "name": "Maria",
      "signup_date": "2026-05-15",
      "onboarding_completed": true,
      "onboarding_completed_date": "2026-05-16",
      "current_week": 26,
      "trimester": 2,
      "active_days": 6,
      "total_exercises": 12,
      "total_points": 240,
      "ranking_position": 2,
      "achievements_count": 1,
      "last_activity_date": "2026-05-29",
      "last_activity_time": "2026-05-29T14:23:00Z",
      "active_this_week": true
    },
    // ... more users
  ]
}
```

**Query Used:** Query 2.1 (Full User List)

**Implementation Notes:**
- Filtering happens at API level (after query)
- Sorting happens at SQL level (ORDER BY)
- Pagination via LIMIT + OFFSET

---

## 👤 SECTION 3: User Detail

### Endpoint 6: `/api/admin/users/[userId]`

**Method:** `GET`

**URL Parameters:**
- `userId`: User UUID

**Response:**
```json
{
  "basic_info": {
    "id": "uuid-1",
    "email": "mae1@gmail.com",
    "name": "Maria",
    "phone": "+55 11 99999-9999",
    "created_at": "2026-05-15T10:30:00Z",
    "onboarding_completed": true,
    "onboarding_completed_at": "2026-05-16T15:45:00Z",
    "current_week": 26,
    "trimester": 2,
    "healthy_pregnancy": true,
    "had_intercurrence": false,
    "doctor_approved": true,
    "objectives": ["exercise", "health"],
    "discomforts": ["back_pain"]
  },
  "activity_stats": {
    "total_points": 240,
    "total_active_days": 6,
    "total_exercises": 12,
    "ranking_position": 2,
    "first_activity_date": "2026-05-16",
    "last_activity_date": "2026-05-29",
    "days_span": 14
  },
  "achievements": [
    {
      "achievement_id": "primeira_semana",
      "unlock_date": "2026-05-23",
      "unlock_time": "09:15:00"
    }
  ],
  "recent_activities": [
    {
      "id": "uuid-activity",
      "exercise_id": "ex_001",
      "exercise_name": "Caminhada Leve",
      "activity_date": "2026-05-29",
      "completed_at": "2026-05-29T14:23:00Z",
      "points_earned": 20,
      "source": "biblioteca"
    }
    // ... 9 more activities
  ],
  "top_exercises": [
    {
      "exercise_id": "ex_001",
      "exercise_name": "Caminhada Leve",
      "completion_count": 4,
      "total_points_from_exercise": 80
    }
    // ... more exercises
  ],
  "streak": {
    "max_consecutive_days": 7,
    "current_consecutive_days": 3
  }
}
```

**Queries Used:** Queries 3.1 - 3.6 (consolidated)

**Implementation Notes:**
- This endpoint makes 6 parallel queries
- Use Promise.all() to fetch all 6 queries concurrently
- Return consolidated response

```typescript
// app/api/admin/users/[userId]/route.ts
import { supabase } from '@/lib/supabase'

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  const [basicInfo, stats, achievements, activities, topExercises, streak] = await Promise.all([
    supabase.rpc('admin_user_basic_info', { user_id: params.userId }),
    supabase.rpc('admin_user_stats', { user_id: params.userId }),
    supabase.rpc('admin_user_achievements', { user_id: params.userId }),
    supabase.rpc('admin_user_activities', { user_id: params.userId }),
    supabase.rpc('admin_user_top_exercises', { user_id: params.userId }),
    supabase.rpc('admin_user_streak', { user_id: params.userId }),
  ])

  return new Response(JSON.stringify({
    basic_info: basicInfo.data?.[0],
    activity_stats: stats.data?.[0],
    achievements: achievements.data,
    recent_activities: activities.data,
    top_exercises: topExercises.data,
    streak: streak.data?.[0]
  }), { status: 200 })
}
```

---

## 🔐 Security

### Authentication

All admin endpoints require:

1. **Admin Key Header** (for now)
   ```
   x-admin-key: <secret-key>
   ```

2. **Future:** Upgrade to role-based access control
   ```typescript
   if (user.role !== 'admin') {
     return new Response({ error: 'Unauthorized' }, { status: 403 })
   }
   ```

### Example Middleware:

```typescript
// lib/middleware/adminAuth.ts
import { NextRequest, NextResponse } from 'next/server'

export function requireAdminKey(request: NextRequest) {
  const adminKey = request.headers.get('x-admin-key')
  
  if (adminKey !== process.env.ADMIN_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401 }
    )
  }
}
```

---

## 🚀 Implementation Checklist for @dev

- [ ] Create 7 API route files in `/app/api/admin/`
  - [ ] `/api/admin/stats/overview`
  - [ ] `/api/admin/stats/by-trimester`
  - [ ] `/api/admin/stats/top-achievements`
  - [ ] `/api/admin/stats/activity`
  - [ ] `/api/admin/users` (with filtering)
  - [ ] `/api/admin/users/[userId]`
  - [ ] `/api/admin/users/[userId]/reset-password` (already exists?)

- [ ] Create RPC functions in Supabase for each query
  - [ ] `admin_stats_overview()`
  - [ ] `admin_stats_by_trimester()`
  - [ ] `admin_stats_top_achievements()`
  - [ ] `admin_stats_activity()`
  - [ ] `admin_users_list()` (with filters)
  - [ ] `admin_user_basic_info(user_id)`
  - [ ] `admin_user_stats(user_id)`
  - [ ] `admin_user_achievements(user_id)`
  - [ ] `admin_user_activities(user_id)`
  - [ ] `admin_user_top_exercises(user_id)`
  - [ ] `admin_user_streak(user_id)`

- [ ] Create admin middleware for auth

- [ ] Create frontend components
  - [ ] Overview section
  - [ ] Users list (table with sorting/filtering)
  - [ ] User detail modal

---

## 📊 Performance Targets

| Query | Est. Time | Target |
|-------|-----------|--------|
| 1.1 Overview Stats | ~50ms | ✅ |
| 1.2 Trimester | ~30ms | ✅ |
| 1.3 Achievements | ~20ms | ✅ |
| 1.4 Activity | ~40ms | ✅ |
| 2.1 Users List | ~100-150ms | ⚠️ (acceptable) |
| 3.1 User Basic | ~5ms | ✅ |
| 3.2 User Stats | ~20ms | ✅ |
| 3.3-3.6 Other | ~50ms combined | ✅ |

**Dashboard Full Load:** ~400ms total (all queries in parallel)

---

## 🔄 Next Steps

1. @data-engineer: ✅ Queries are ready (this file)
2. @dev: Implement API routes + RPC functions
3. @ux-design-expert: Design dashboard UI
4. @qa: Test filtering, sorting, performance

---

**Questions?** Ask in agent coordination channel. Ready for @dev handoff! 🚀
