# Quick Stats Calculation Documentation

This document explains how the **Quick Stats** displayed in the Discovery Sidebar are calculated.

## Location in Codebase

- **Service Function**: `getCommunityQuickStats()` in `src/features/trending/services/trending_services.ts`
- **Display Component**: `DiscoverySidebar.tsx` in `src/features/trending/components/`

---

## Statistics Breakdown

### 1. Trending Items (`totalItems`)

**What it shows**: The total number of unique items (tracks, albums, playlists) that have any community engagement.

**How it's calculated**:
```sql
SELECT COUNT(*) FROM item_stats
```

This counts all rows in the `item_stats` table. An item appears in `item_stats` when it receives at least one rating, comment, favorite, or tag from any user.

---

### 2. Total Members (`totalMembers`)

**What it shows**: The total number of registered users in the community.

**How it's calculated**:
```sql
SELECT COUNT(*) FROM profiles
```

This counts all rows in the `profiles` table, which represents all registered users.

---

### 3. Active Users This Month (`currentActiveUsers`)

**What it shows**: The number of unique users who have performed any interactive action in the last 30 days.

**How it's calculated**:
The system queries 4 different tables for activity in the last 30 days:

1. **Ratings**: Users who rated any item
   ```sql
   SELECT user_id FROM ratings WHERE created_at >= (NOW - 30 days)
   ```

2. **Comments**: Users who commented on any item
   ```sql
   SELECT user_id FROM comments WHERE created_at >= (NOW - 30 days)
   ```

3. **Favorites**: Users who favorited any item
   ```sql
   SELECT user_id FROM favorites WHERE created_at >= (NOW - 30 days)
   ```

4. **Tags**: Users who added tags to any item
   ```sql
   SELECT user_id FROM item_tags WHERE created_at >= (NOW - 30 days)
   ```

All user IDs from these queries are combined into a **Set** (which automatically removes duplicates), and the count of unique users is returned.

**Note**: A user who rates 10 items and comments 5 times is still counted as 1 active user.

---

### 4. New This Week (`thisWeek`)

**What it shows**: The number of new items that received their first community engagement in the last 7 days.

**How it's calculated**:
```sql
SELECT COUNT(*) FROM item_stats WHERE created_at >= (NOW - 7 days)
```

This counts items whose `item_stats` row was created in the last week. When an item receives its first rating, comment, favorite, or tag, a new row is created in `item_stats`.

---

## Real-time Updates

The Quick Stats automatically refresh when:
- The page loads
- A user triggers a manual refresh
- Real-time Supabase events are detected for:
  - New ratings
  - New comments
  - New favorites
  - New tags
  - New activities

To prevent excessive API calls, updates are **debounced** with a 1-second delay.

---

## Database Tables Used

| Table | Purpose |
|-------|---------|
| `item_stats` | Aggregated statistics per item (ratings, comments, favorites, tags count) |
| `profiles` | User accounts |
| `ratings` | Individual user ratings |
| `comments` | Individual user comments |
| `favorites` | User favorite items |
| `item_tags` | Tags applied to items by users |

---

## Code Reference

The main calculation function can be found at:
```
src/features/trending/services/trending_services.ts
```

Function: `getCommunityQuickStats()`

Lines: ~628-685 (approximately)
