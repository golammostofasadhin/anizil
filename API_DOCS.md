# Anizil Backend API Documentation

Base URL: `http://localhost:3001/api`

All responses follow the format:
```json
{
  "success": true|false,
  "message": "string",
  "data": {}
}
```

Authentication is via JWT token in cookie (`token`) or `Authorization: Bearer <token>` header.

---

## 1. Auth — `/api/auth`

### POST `/api/auth/register`
Register a new user.
- **Auth:** None
- **Body:** `{ name: string, email: string, password: string (min 6) }`
- **Success (201):** `{ success, data: { user, token } }`
- **Errors:** 400 (validation/dupe email), 403 (registration disabled), 500

### POST `/api/auth/login`
Login and receive JWT.
- **Auth:** None
- **Body:** `{ email: string, password: string }`
- **Success (200):** `{ success, data: { user, token } }`
- **Errors:** 400 (validation), 401 (bad credentials), 403 (banned), 500

### POST `/api/auth/logout`
Clear auth cookie.
- **Auth:** None
- **Success (200):** `{ success, message }`

### GET `/api/auth/me`
Get current user profile with stats.
- **Auth:** Token
- **Success (200):** `{ success, data: { ...user, stats: { watchlist, watched, achievements, unread_notifications } } }`

### POST `/api/auth/forgot-password`
Request password reset token.
- **Auth:** None
- **Body:** `{ email: string }`
- **Success (200):** `{ success, message, data: { reset_token } }`

### POST `/api/auth/reset-password`
Reset password using token.
- **Auth:** None
- **Body:** `{ token: string, password: string (min 6) }`
- **Success (200):** `{ success, message }`
- **Errors:** 400 (invalid token), 500

---

## 2. Anime — `/api/anime`

### GET `/api/anime`
List anime with filters and pagination.
- **Auth:** None
- **Query:** `page`, `limit`, `genre`, `status`, `sort` (rating|views|title|year|newest|oldest), `search`, `language`, `year`, `season`
- **Success (200):** `{ success, data: { anime[], pagination: { page, limit, total, pages } } }`

### GET `/api/anime/featured`
Get featured anime (top 10 by rating).
- **Auth:** None
- **Success (200):** `{ success, data: anime[] }`

### GET `/api/anime/trending`
Get trending ongoing anime (top 20 by views).
- **Auth:** None
- **Success (200):** `{ success, data: anime[] }`

### GET `/api/anime/recent`
Get recently updated anime (top 20 by latest episode).
- **Auth:** None
- **Success (200):** `{ success, data: anime[] }`

### GET `/api/anime/genres`
Get all unique genres.
- **Auth:** None
- **Success (200):** `{ success, data: string[] }`

### GET `/api/anime/schedule`
Get weekly broadcast schedule.
- **Auth:** None
- **Success (200):** `{ success, data: { Monday: anime[], ...Sunday: anime[] } }`

### GET `/api/anime/external/recent`
Fetch recent anime from Anikoto external API.
- **Auth:** None
- **Query:** `page`, `per_page`
- **Success (200):** `{ success, data: { anime[], pagination } }`

### GET `/api/anime/external/series/:id`
Fetch single anime from Anikoto by ID.
- **Auth:** None
- **Success (200):** `{ success, data }`

### GET `/api/anime/external/search`
Search Anikoto external API.
- **Auth:** None
- **Query:** `q` (search query)
- **Success (200):** `{ success, data }`

### GET `/api/anime/:slug`
Get anime detail by slug (increments views).
- **Auth:** None
- **Success (200):** `{ success, data: { ...anime, episodes[], similar[] } }`
- **Errors:** 404

### GET `/api/anime/:id/episodes`
Get episodes for an anime (paginated).
- **Auth:** None
- **Query:** `page`, `limit`
- **Success (200):** `{ success, data: { episodes[], pagination } }`
- **Errors:** 404

---

## 3. Episodes — `/api/episodes`

### GET `/api/episodes/:id`
Get episode detail with sources and prev/next navigation.
- **Auth:** None
- **Success (200):** `{ success, data: { ...episode, sources[], prev_episode, next_episode } }`
- **Errors:** 404

---

## 4. User — `/api/user`

### GET `/api/user/profile`
Get authenticated user profile with stats and recent activity.
- **Auth:** Token
- **Success (200):** `{ success, data: { ...user, stats: { watchlist, watched, achievements, comments }, recent_activity[] } }`

### PUT `/api/user/profile`
Update profile fields.
- **Auth:** Token
- **Body:** `{ name?: string, bio?: string, avatar?: string }`
- **Success (200):** `{ success, data: updatedUser }`
- **Errors:** 400 (validation/no fields)

### GET `/api/user/watchlist`
Get user's watchlist.
- **Auth:** Token
- **Query:** `status` (optional: watching|completed|plan_to_watch|on_hold|dropped)
- **Success (200):** `{ success, data: watchlist[] }`

### POST `/api/user/watchlist`
Add or update anime in watchlist. Awards achievements.
- **Auth:** Token
- **Body:** `{ animeId: int, status?: "watching"|"completed"|"plan_to_watch"|"on_hold"|"dropped" }`
- **Success (200):** `{ success, message }`
- **Errors:** 400 (validation), 404 (anime not found)

### DELETE `/api/user/watchlist/:animeId`
Remove anime from watchlist.
- **Auth:** Token
- **Success (200):** `{ success, message }`
- **Errors:** 404

### GET `/api/user/history`
Get watch history (paginated).
- **Auth:** Token
- **Query:** `page`, `limit`
- **Success (200):** `{ success, data: { history[], pagination } }`

### POST `/api/user/history`
Add or update watch history. Awards XP and checks achievements.
- **Auth:** Token
- **Body:** `{ animeId: int, episodeId: int, progress?: int (0-100), completed?: bool }`
- **Success (200):** `{ success, message }`
- **Errors:** 400 (validation)

### DELETE `/api/user/history`
Clear all watch history.
- **Auth:** Token
- **Success (200):** `{ success, message }`

### GET `/api/user/achievements`
Get all achievements with unlock status.
- **Auth:** Token
- **Success (200):** `{ success, data: { achievements[], total_xp, unlocked_count, total_count } }`

### GET `/api/user/notifications`
Get user notifications (last 50).
- **Auth:** Token
- **Success (200):** `{ success, data: { notifications[], unread_count } }`

### PUT `/api/user/notifications/read`
Mark all notifications as read.
- **Auth:** Token
- **Success (200):** `{ success, message }`

---

## 5. Comments — `/api/comments`

### GET `/api/comments`
Get comments by episode or anime (paginated, approved only).
- **Auth:** None
- **Query:** `episode_id` | `anime_id`, `page`, `limit`
- **Success (200):** `{ success, data: { comments[], pagination } }`
  - Each comment includes `replies[]` (max 5) and `reply_count`.

### GET `/api/comments/:episodeId`
Legacy: Get comments by episode ID in URL path.
- **Auth:** None
- **Query:** `page`, `limit`
- **Success (200):** `{ success, data: { comments[], pagination } }`

### POST `/api/comments`
Create a comment or reply. Awards 5 XP.
- **Auth:** Token
- **Body:** `{ content: string, episodeId?: int, animeId?: int, parentId?: int }` (episodeId or animeId required)
- **Success (201):** `{ success, data: { ...comment, xp_earned, new_xp } }`
- **Errors:** 400 (validation/missing target), 404 (parent not found)

### PUT `/api/comments/:id`
Edit a comment (owner only).
- **Auth:** Token
- **Body:** `{ content: string }`
- **Success (200):** `{ success, data: updatedComment }`
- **Errors:** 403 (not owner), 404

### DELETE `/api/comments/:id`
Delete a comment. Owner or mod/admin can delete.
- **Auth:** Token
- **Success (200):** `{ success, message }`
- **Errors:** 403, 404

### POST `/api/comments/:id/like`
Like a comment (increments count).
- **Auth:** Token
- **Success (200):** `{ success, data: { likes } }`
- **Errors:** 404

### POST `/api/comments/:id/report`
Report a comment. Sets status to "flagged".
- **Auth:** Token
- **Body:** `{ reason: string }`
- **Success (200):** `{ success, message }`
- **Errors:** 400 (already reported), 404

---

## 6. Forum — `/api/forum`

### GET `/api/forum/posts`
List forum posts (paginated).
- **Auth:** None
- **Query:** `page`, `limit`, `category` (general|recommendations|discussion|help), `sort` (popular|views)
- **Success (200):** `{ success, data: { posts[], pagination } }`

### GET `/api/forum/posts/:id`
Get forum post detail with replies (increments views).
- **Auth:** None
- **Success (200):** `{ success, data: { ...post, views, replies[] } }`
- **Errors:** 404

### POST `/api/forum/posts`
Create a forum post. Checks if forum is enabled.
- **Auth:** Token
- **Body:** `{ title: string, content: string, category?: "general"|"recommendations"|"discussion"|"help" }`
- **Success (201):** `{ success, data: newPost }`
- **Errors:** 400 (validation), 403 (forum disabled)

### POST `/api/forum/posts/:id/reply`
Reply to a forum post. Notifies post author.
- **Auth:** Token
- **Body:** `{ content: string }`
- **Success (201):** `{ success, data: newReply }`
- **Errors:** 400 (validation), 404

### POST `/api/forum/posts/:id/like`
Like a forum post (increments count).
- **Auth:** Token
- **Success (200):** `{ success, data: { likes } }`
- **Errors:** 404

---

## 7. Admin — `/api/admin`

All admin routes require `auth` + `adminAuth` middleware. Specific routes also require permissions via `requirePermission()`.

### GET `/api/admin/dashboard`
Admin dashboard with aggregate stats.
- **Auth:** Admin
- **Success (200):** `{ success, data: { stats: { total_users, total_anime, total_episodes, total_views, new_users_today, new_anime_this_week, pending_reports, pending_comments, premium_users }, recent_users[], recent_anime[], popular_anime[] } }`

### GET `/api/admin/stats`
Alias for dashboard stats (flat response).
- **Auth:** Admin
- **Success (200):** `{ totalUsers, totalAnime, ... }`

### GET `/api/admin/anime`
Admin anime list with search/filter.
- **Auth:** Admin
- **Query:** `page`, `limit`, `search`, `status`
- **Success (200):** `{ success, data: { anime[], pagination } }`

### POST `/api/admin/anime`
Create anime entry.
- **Auth:** Admin + `manage_anime`
- **Body:** `{ title: string, genres?: string, status?: "ongoing"|"completed"|"upcoming"|"hiatus", series_title?, description?, poster?, banner?, studio?, rating?, mal_score?, release_year?, duration?, language?, broadcast_day?, broadcast_time?, season?, episode_count?, is_featured?, is_premium?, anilist_id?, mal_id?, anikoto_id? }`
- **Success (201):** `{ success, data: newAnime }`

### PUT `/api/admin/anime/:id`
Update anime entry.
- **Auth:** Admin + `manage_anime`
- **Body:** Any of the fields from POST (partial update)
- **Success (200):** `{ success, data: updatedAnime }`
- **Errors:** 400 (no fields)

### DELETE `/api/admin/anime/:id`
Delete anime entry.
- **Auth:** Admin + `manage_anime`
- **Success (200):** `{ success, message }`
- **Errors:** 404

### PUT `/api/admin/anime/:id/premium`
Toggle anime premium status.
- **Auth:** Admin + `manage_anime`
- **Body:** `{ is_premium: boolean }`
- **Success (200):** `{ success, message }`

### GET `/api/admin/episodes`
Admin episode list.
- **Auth:** Admin
- **Query:** `page`, `limit`, `anime_id`
- **Success (200):** `{ success, data: { episodes[], pagination } }`

### POST `/api/admin/episodes`
Create episode with optional sources.
- **Auth:** Admin + `manage_episodes`
- **Body:** `{ anime_id: int, episode_number: int, title?: string, description?, thumbnail?, duration?, sources?: [{ language, server_name, video_url, source_type? }] }`
- **Success (201):** `{ success, data: newEpisode }`
- **Errors:** 400 (duplicate episode number)

### PUT `/api/admin/episodes/:id`
Update episode. Replaces sources if provided.
- **Auth:** Admin + `manage_episodes`
- **Body:** `{ episode_number?, title?, description?, thumbnail?, duration?, sources?: [{ language, server_name, video_url, source_type? }] }`
- **Success (200):** `{ success, data: updatedEpisode }`
- **Errors:** 400 (no fields)

### DELETE `/api/admin/episodes/:id`
Delete episode (updates anime episode_count).
- **Auth:** Admin + `manage_episodes`
- **Success (200):** `{ success, message }`
- **Errors:** 404

### GET `/api/admin/users`
Admin user list.
- **Auth:** Admin
- **Query:** `page`, `limit`, `search`, `role`
- **Success (200):** `{ success, data: { users[], pagination } }`

### PUT `/api/admin/users/:id/role`
Change user role.
- **Auth:** Admin + `manage_users`
- **Body:** `{ role: "super_admin"|"content_admin"|"moderator"|"user" }`
- **Success (200):** `{ success, message }`
- **Errors:** 400 (validation), 403 (non-super_admin assigning super_admin), 404

### PUT `/api/admin/users/:id/ban`
Toggle ban status on a user.
- **Auth:** Admin + `manage_users`
- **Success (200):** `{ success, message }`
- **Errors:** 400 (self-ban), 404

### GET `/api/admin/comments`
Admin comment list with status filter.
- **Auth:** Admin
- **Query:** `page`, `limit`, `status` (pending|approved|flagged|removed)
- **Success (200):** `{ success, data: { comments[], pagination } }`

### PUT `/api/admin/comments/:id/status`
Set comment moderation status.
- **Auth:** Admin + `manage_comments`
- **Body:** `{ status: "pending"|"approved"|"flagged"|"removed" }`
- **Success (200):** `{ success, message }`
- **Errors:** 404

### POST `/api/admin/comments/bulk/:action`
Bulk comment actions: `approve`, `flag`, `remove`.
- **Auth:** Admin + `manage_comments`
- **Body:** `{ ids: int[] }`
- **Success (200):** `{ success, message }`
- **Errors:** 400 (no IDs/invalid action)

### GET `/api/admin/reports`
Admin report list.
- **Auth:** Admin
- **Query:** `page`, `limit`, `status` (pending|dismissed|resolved)
- **Success (200):** `{ success, data: { reports[], pagination } }`

### PUT `/api/admin/reports/:id`
Handle a report (dismiss/resolve). Resolving auto-removes the comment.
- **Auth:** Admin + `manage_reports`
- **Body:** `{ status: "pending"|"dismissed"|"resolved" }`
- **Success (200):** `{ success, message }`
- **Errors:** 404

### GET `/api/admin/settings`
Get all site settings.
- **Auth:** Admin
- **Success (200):** `{ success, data: { [key]: { value, type } } }`

### PUT `/api/admin/settings`
Update site settings (upsert).
- **Auth:** Admin + `manage_settings`
- **Body:** `{ [setting_key]: value, ... }`
- **Success (200):** `{ success, message }`

### GET `/api/admin/settings/ads`
Get ad-related settings (keys prefixed with `ad_`).
- **Auth:** Admin
- **Success (200):** `{ success, data: { [key]: value } }`

### PUT `/api/admin/settings/ads`
Update ad settings.
- **Auth:** Admin + `manage_settings`
- **Body:** `{ [key]: value }` (keys auto-prefixed with `ad_`)
- **Success (200):** `{ success, message }`

### GET `/api/admin/api-tokens`
List all API tokens.
- **Auth:** Admin
- **Success (200):** `{ success, data: tokens[] }`

### POST `/api/admin/api-tokens`
Create an API token for a user.
- **Auth:** Admin + `manage_tokens`
- **Body:** `{ user_id: int, name: string, scope: "read"|"write"|"admin" }`
- **Success (201):** `{ success, data: newToken }`

### DELETE `/api/admin/api-tokens/:id`
Delete an API token.
- **Auth:** Admin + `manage_tokens`
- **Success (200):** `{ success, message }`
- **Errors:** 404

### GET `/api/admin/redeem-codes`
List all redeem codes.
- **Auth:** Admin
- **Query:** `page`, `limit`
- **Success (200):** `{ success, data: { codes[], pagination } }`

### POST `/api/admin/redeem-codes`
Generate redeem codes (batch or custom).
- **Auth:** Admin + `manage_codes`
- **Body:** `{ reward_type: "xp"|"premium_days"|"credits", reward_amount: int (min 1), count?: int (1-100), code?: string }`
- **Success (201):** `{ success, data: { codes[], count } }`
- **Errors:** 400 (dupe code)

### DELETE `/api/admin/redeem-codes/:id`
Delete a redeem code.
- **Auth:** Admin + `manage_codes`
- **Success (200):** `{ success, message }`
- **Errors:** 404

### GET `/api/admin/roles`
Get role definitions with permissions.
- **Auth:** Admin
- **Success (200):** `{ success, data: [{ name, description, permissions[] }] }`

### PUT `/api/admin/roles/:role`
Update permissions for a role.
- **Auth:** Admin + `manage_roles`
- **Body:** `{ permissions: string[] }`
- **Success (200):** `{ success, message }`
- **Errors:** 400 (invalid role)

### POST `/api/admin/frames`
Create a profile frame.
- **Auth:** Admin + `manage_settings`
- **Body:** `{ name: string, image_url: string, price_xp: int, rarity?: "common"|"rare"|"epic"|"legendary", border_color?: string, sort_order?: int }`
- **Success (201):** `{ success, data: { id } }`

### DELETE `/api/admin/frames/:id`
Delete a profile frame.
- **Auth:** Admin + `manage_settings`
- **Success (200):** `{ success, message }`

### GET `/api/admin/analytics`
Get analytics data.
- **Auth:** Admin
- **Query:** `range` ("7d"|"30d"|"90d")
- **Success (200):** `{ success, data: { totalUsers, totalAnime, totalViews, dailyUsers[], dailyAnime[], topAnime[] } }`

### GET `/api/admin/activities`
Get activity feed.
- **Auth:** Admin
- **Query:** `limit` (default 20)
- **Success (200):** `{ success, activities[] }`

---

## 8. Import — `/api/import`

All import routes require `auth` + `adminAuth`.

### GET `/api/import/anikoto/status`
Check if Anikoto API is online.
- **Auth:** Admin
- **Success (200):** `{ success, online: boolean }`

### GET `/api/import/anikoto/search`
Search Anikoto API. Marks results with `imported` flag.
- **Auth:** Admin
- **Query:** `q`, `page`
- **Success (200):** `{ success, data: { anime[], pagination } }`

### GET `/api/import/anikoto/browse`
Browse or search Anikoto API.
- **Auth:** Admin
- **Query:** `q`, `page`, `per_page`
- **Success (200):** `{ success, data: { anime[], pagination } }`

### POST `/api/import/anikoto`
Import anime from Anikoto (full import with episodes).
- **Auth:** Admin + `add_anime`
- **Body:** `{ anikoto_id: int, is_premium?: boolean }`
- **Success (201):** `{ success, data: newAnime }`
- **Errors:** 400 (already imported/missing ID), 500 (API error)

---

## 9. Search — `/api/search`

### GET `/api/search`
Full-text search across anime.
- **Auth:** None
- **Query:** `q` (required), `page`, `limit`
- **Success (200):** `{ success, data: { anime[], genres[], pagination, query } }`
- **Errors:** 400 (missing query)

---

## 10. Shop — `/api/shop`

### POST `/api/shop/redeem`
Redeem a code (XP, credits, or premium days).
- **Auth:** Token
- **Body:** `{ code: string }`
- **Success (200):** `{ success, message, data: { new_xp } }`
- **Errors:** 400 (invalid/redeemed code)

### GET `/api/shop/inventory`
Get user's earned items from activity feed.
- **Auth:** Token
- **Success (200):** `{ success, data: { items[] } }`

### POST `/api/shop/purchase`
Purchase an XP pack (simulated).
- **Auth:** Token
- **Body:** `{ itemId: "small"|"medium"|"large"|"mega" }`
  - small: 500 XP ($0.99), medium: 1500 XP ($2.49), large: 5000 XP ($6.99), mega: 15000 XP ($17.99)
- **Success (200):** `{ success, message, data: { xp_added } }`
- **Errors:** 400 (invalid pack)

### GET `/api/shop/frames`
Get all active profile frames.
- **Auth:** None
- **Success (200):** `{ success, data: frames[] }`

### GET `/api/shop/frames/my`
Get user's purchased frames and active frame.
- **Auth:** Token
- **Success (200):** `{ success, data: { frames[], active_frame_id } }`

### POST `/api/shop/frames/purchase`
Purchase a profile frame with XP.
- **Auth:** Token
- **Body:** `{ frame_id: int }`
- **Success (200):** `{ success, message, data: { new_xp } }`
- **Errors:** 400 (insufficient XP/already owned), 404

### POST `/api/shop/frames/activate`
Activate a frame or remove current frame.
- **Auth:** Token
- **Body:** `{ frame_id: int|null }` (null or 0 to remove)
- **Success (200):** `{ success, message }`
- **Errors:** 400 (not owned)

### POST `/api/shop/purchase-anime`
Unlock premium anime with XP (200 XP).
- **Auth:** Token
- **Body:** `{ anime_id: int }`
- **Success (200):** `{ success, message, data: { new_xp } }`
- **Errors:** 400 (not premium/already owned/insufficient XP)

### GET `/api/shop/anime-access/:animeId`
Check if user has access to a premium anime.
- **Auth:** Token
- **Success (200):** `{ success, data: { has_access: boolean } }`

### GET `/api/shop/xp-info`
Get XP earning methods and level thresholds.
- **Auth:** Token
- **Success (200):** `{ success, data: { methods[], level_thresholds } }`

---

## 11. Utility

### GET `/api/health`
Health check endpoint.
- **Auth:** None
- **Success (200):** `{ success: true, message: "Anizil API is running", timestamp }`

---

## Permission Reference

| Role | Permissions |
|------|-------------|
| `super_admin` | manage_users, manage_anime, manage_episodes, manage_settings, manage_roles, manage_comments, manage_reports, manage_tokens, manage_codes |
| `content_admin` | manage_anime, manage_episodes, manage_comments, view_reports |
| `moderator` | manage_comments, manage_reports, view_users |
| `user` | (none) |

Note: Role permissions can be customized via the `role_permissions` setting key.
