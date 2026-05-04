# Talas App — API Reference

## Overview

- **Base URL (tRPC):** `/api/trpc`
- **Base URL (REST):** `/api/*`
- **Auth:** Clerk Bearer Token via session header — `Authorization: Bearer <token>`
- **Default auth level:** All tRPC procedures are `protectedProcedure` (auth required) unless noted.
- **tRPC transport:** `query` maps to GET semantics; `mutation` maps to POST semantics. All requests are HTTP POST to the tRPC endpoint with input in the request body as JSON.

---

## Conventions

### Required field notation
- `required: true` — must be present
- `required: false` — optional

### Pagination types
- **Offset pagination:** uses `limit` + `offset`
- **Cursor pagination (Infinite Query):** uses `limit` + `cursor`; response includes `nextCursor`

### Common error codes (all tRPC endpoints)

| HTTP Status | tRPC Code | Meaning |
|---|---|---|
| 400 | `BAD_REQUEST` | Invalid or missing input |
| 401 | `UNAUTHORIZED` | Token missing or invalid |
| 403 | `FORBIDDEN` | Insufficient permissions |
| 404 | `NOT_FOUND` | Resource does not exist |
| 409 | `CONFLICT` | Duplicate resource |
| 500 | `INTERNAL_SERVER_ERROR` | Unexpected server error |

---

## Enums

```
genderType:      MALE | FEMALE
notifType:       FOLLOW | LIKE_PROJECT | LIKE_COMMENT | COMMENT_PROJECT | COMMENT | REPLY_COMMENT | COLLABORATION
ownershipType:   OWNER | COLLABORATOR
collabStatus:    PENDING | ACCEPTED | REJECTED
searchType:      PROJECT | USER | CATEGORY
```

---

## 1. User Router (`user.*`)

### 1.1 `user.syncWithSupabase`
**Endpoint:** `POST /api/trpc/user.syncWithSupabase`
**Type:** mutation
**Description:** Creates or verifies a user record. If user does not exist, creates new user and associated `count_summary`. Generates unique username from email.

**Input:**
| Field | Type | Required |
|---|---|---|
| `id` | string | true — Clerk user ID |
| `name` | string | true — Display name |
| `email` | string (email) | true |
| `auth_type` | string | true — e.g. `"google"`, `"github"` |
| `photo_profile` | string (URL) | true |

**Success Response `200`:**
```json
{
  "success": true,
  "message": "Successfully synced user with Supabase",
  "data": {
    "id": "user_2abc123",
    "username": "dev",
    "name": "Dev User",
    "email": "dev@example.com",
    "auth_type": "google",
    "photo_profile": "https://...",
    "created_at": "2026-05-04T10:00:00.000Z"
  }
}
```

**Errors:**
| Code | Message |
|---|---|
| 401 | Authentication token missing or invalid |
| 500 | Database sync failure |

---

### 1.2 `user.getAll`
**Endpoint:** `GET /api/trpc/user.getAll`
**Type:** query
**Description:** Returns paginated list of all users with profile info.

**Input (all optional):**
| Field | Type | Required |
|---|---|---|
| `limit` | integer | false — Max records to return |
| `offset` | integer | false — Records to skip |

**Success Response `200`:**
```json
{
  "success": true,
  "message": "Successfully get all users",
  "data": [
    {
      "username": "dev",
      "name": "Dev User",
      "bio": "Hello world",
      "photo_profile": "https://...",
      "instagram": null,
      "linkedin": null,
      "github": "https://github.com/dev",
      "gender": "MALE",
      "email_contact": "dev@example.com"
    }
  ]
}
```

---

### 1.3 `user.getById`
**Endpoint:** `GET /api/trpc/user.getById`
**Type:** query
**Description:** Retrieves a single user by their ID, including `count_summary`.

**Input:**
| Field | Type | Required |
|---|---|---|
| `id` | string | true — User ID |

**Success Response `200`:**
```json
{
  "success": true,
  "message": "Successfully get user",
  "data": {
    "id": "user_2abc123",
    "username": "dev",
    "name": "Dev User",
    "bio": "Hello",
    "photo_profile": "https://...",
    "instagram": null,
    "linkedin": null,
    "github": null,
    "gender": "MALE",
    "email_contact": "dev@example.com",
    "count_summary": {
      "count_project": 5,
      "count_follower": 12,
      "count_following": 8,
      "all_notif_read": true
    }
  }
}
```

---

### 1.4 `user.getByUsername`
**Endpoint:** `GET /api/trpc/user.getByUsername`
**Type:** query
**Description:** Retrieves a single user by username, including `count_summary`.

**Input:**
| Field | Type | Required |
|---|---|---|
| `username` | string | true |

**Success Response:** Same shape as `user.getById`.

---

### 1.5 `user.update`
**Endpoint:** `POST /api/trpc/user.update`
**Type:** mutation
**Description:** Updates user profile fields. Validates username uniqueness if changed.

**Input:**
| Field | Type | Required |
|---|---|---|
| `id` | string | true — User ID |
| `data.username` | string | false — Must be unique |
| `data.name` | string | false |
| `data.bio` | string | false |
| `data.photo_profile` | string (URL) | false |
| `data.instagram` | string | false |
| `data.linkedin` | string (URL) | false |
| `data.github` | string (URL) | false |
| `data.gender` | `MALE` \| `FEMALE` | false |
| `data.email_contact` | string | false |

**Errors:**
| Code | Message |
|---|---|
| 500 | `"Username sudah digunakan oleh pengguna lain."` — Username already taken |

---

### 1.6 `user.getPhotoProfile`
**Endpoint:** `GET /api/trpc/user.getPhotoProfile`
**Type:** query
**Description:** Returns only the profile photo URL for a user. Lookup by ID or username.

**Input (at least one):**
| Field | Type | Required |
|---|---|---|
| `id` | string | false — User ID |
| `username` | string | false |

---

### 1.7 `user.getAllFollower`
**Endpoint:** `GET /api/trpc/user.getAllFollower`
**Type:** query
**Description:** Returns paginated list of followers for a given user.

**Input:**
| Field | Type | Required |
|---|---|---|
| `id_following` | string | true — The user whose followers to list |
| `limit` | integer | false |
| `offset` | integer | false |

---

### 1.8 `user.getAllFollowing`
**Endpoint:** `GET /api/trpc/user.getAllFollowing`
**Type:** query
**Description:** Returns paginated list of users that a given user follows.

**Input:**
| Field | Type | Required |
|---|---|---|
| `id_follower` | string | true — The user whose following list to retrieve |
| `limit` | integer | false |
| `offset` | integer | false |

---

### 1.9 `user.getBookmarked`
**Endpoint:** `GET /api/trpc/user.getBookmarked`
**Type:** query (Infinite Query — cursor paginated)
**Description:** Returns cursor-paginated bookmarked projects for a user with interaction status flags.

**Input:**
| Field | Type | Required | Default |
|---|---|---|---|
| `id` | string | true — Bookmark owner user ID | — |
| `id_user` | string | false — Viewer user ID for interaction flags | — |
| `limit` | integer (1–100) | false | 12 |
| `cursor` | string | false | — |

---

### 1.10 `user.getSelectCollab`
**Endpoint:** `GET /api/trpc/user.getSelectCollab`
**Type:** query
**Description:** Searches users by name or username for collaborator selection. Excludes the current user from results.

**Input:**
| Field | Type | Required |
|---|---|---|
| `query` | string | true — Search term |
| `id_user` | string | true — Current user ID to exclude |

---

### 1.11 `user.getNotification`
**Endpoint:** `GET /api/trpc/user.getNotification`
**Type:** query (Infinite Query — cursor paginated)
**Description:** Returns cursor-paginated notifications from the last 30 days.

**Input:**
| Field | Type | Required | Default |
|---|---|---|---|
| `id_user` | string | true | — |
| `limit` | integer (1–100) | false | 12 |
| `cursor` | string | false | — |

---

### 1.12 `user.getRequestCollab`
**Endpoint:** `GET /api/trpc/user.getRequestCollab`
**Type:** query
**Description:** Returns pending collaboration requests for a user.

**Input:** Raw string — user ID directly (not a JSON object).

---

### 1.13 `user.getAllProjects`
**Endpoint:** `GET /api/trpc/user.getAllProjects`
**Type:** query (Infinite Query — cursor paginated)
**Description:** Returns cursor-paginated projects owned or collaborated on by a user. Can exclude pinned projects.

**Input:**
| Field | Type | Required | Default |
|---|---|---|---|
| `id_user` | string | false — User ID | — |
| `limit` | integer (1–100) | false | 50 |
| `cursor` | string | false | — |
| `excludePinned` | boolean | false | — |

---

### 1.14 `user.getPinnedProjects`
**Endpoint:** `GET /api/trpc/user.getPinnedProjects`
**Type:** query
**Description:** Returns all pinned projects for a user with interaction flags.

**Input:**
| Field | Type | Required |
|---|---|---|
| `id_user` | string | true |

---

## 2. Project Router (`project.*`)

### 2.1 `project.getOne`
**Endpoint:** `GET /api/trpc/project.getOne`
**Type:** query
**Description:** Retrieves a single project by ID or slug. Archived projects are visible only to owners. Includes bookmark and like status.

**Input:**
| Field | Type | Required |
|---|---|---|
| `id` | string | true — Project ID or slug |
| `id_user` | string | true — Viewer user ID for interaction flags |

**Success Response `200`:**
```json
{
  "success": true,
  "message": "Successfully get project",
  "data": {
    "id": "01HX...",
    "title": "My Project",
    "slug": "my-project",
    "content": "<p>Project description...</p>",
    "image1": "path/to/image.webp",
    "image2": null,
    "image3": null,
    "image4": null,
    "image5": null,
    "video": null,
    "count_likes": 5,
    "count_comments": 3,
    "is_archived": false,
    "link_figma": null,
    "link_github": "https://github.com/...",
    "created_at": "2026-05-04T10:00:00.000Z",
    "updated_at": "2026-05-04T10:00:00.000Z",
    "category": { "id": "...", "title": "Web", "slug": "web" },
    "project_user": [
      {
        "user": { "id": "...", "name": "Dev", "username": "dev", "photo_profile": "..." },
        "ownership": "OWNER"
      }
    ],
    "is_bookmarked": false,
    "is_liked": true
  }
}
```

---

### 2.2 `project.getAll`
**Endpoint:** `GET /api/trpc/project.getAll`
**Type:** query (Infinite Query — cursor paginated)
**Description:** Returns cursor-paginated non-archived projects with interaction flags.

**Input:**
| Field | Type | Required | Default |
|---|---|---|---|
| `id_user` | string | false — Viewer user ID | — |
| `limit` | integer (1–100) | false | 50 |
| `cursor` | string | false | — |

---

### 2.3 `project.getArchived`
**Endpoint:** `GET /api/trpc/project.getArchived`
**Type:** query (Infinite Query — cursor paginated)
**Description:** Returns cursor-paginated archived projects owned by the requesting user.

**Input:**
| Field | Type | Required | Default |
|---|---|---|---|
| `id_user` | string | false — Owner user ID | — |
| `limit` | integer (1–100) | false | 50 |
| `cursor` | string | false | — |

---

### 2.4 `project.checkSlug`
**Endpoint:** `GET /api/trpc/project.checkSlug`
**Type:** query
**Description:** Returns `true` if slug is already taken, `false` if available.

**Input:** Raw string — the slug to check (not a JSON object).

---

### 2.5 `project.create`
**Endpoint:** `POST /api/trpc/project.create`
**Type:** mutation
**Description:** Creates a new project. Auto-generates slug from title. Increments category and user project counts. Sends collaboration requests to listed collaborators.

**Input:**
| Field | Type | Required |
|---|---|---|
| `id_user` | string | true — Owner user ID |
| `id_category` | string | true — Category ID |
| `title` | string | true |
| `content` | string (min 1 char) | true — HTML content |
| `is_archived` | boolean | false — Default: `false` |
| `image1` – `image5` | any | false — Image paths |
| `video` | any | false — Video path |
| `collaborators` | array of `{id, name, username, photo_profile?}` | false |
| `link_figma` | string (URL) | false |
| `link_github` | string (URL) | false |

---

### 2.6 `project.edit`
**Endpoint:** `POST /api/trpc/project.edit`
**Type:** mutation
**Permission:** Project owner only
**Description:** Updates project fields. Re-generates slug if title changes. Updates category counts if category changes.

**Input:**
| Field | Type | Required |
|---|---|---|
| `id` | string | true — Project ID |
| `id_user` | string | true — Owner user ID for verification |
| `id_category` | string | false — New category ID |
| `title` | string | false |
| `content` | string | false |
| `link_figma` | string (URL) | false |
| `link_github` | string (URL) | false |

**Errors:**
| Code | Message |
|---|---|
| 500 | `"Project not found or access denied."` |

---

### 2.7 `project.delete`
**Endpoint:** `POST /api/trpc/project.delete`
**Type:** mutation
**Permission:** Project owner only
**Description:** Permanently deletes a project, its comments, and associated images from storage. Decrements category and user counts.

**Input:**
| Field | Type | Required |
|---|---|---|
| `id` | string | true — Project ID |
| `id_user` | string | true — Owner user ID |

---

### 2.8 `project.getComments`
**Endpoint:** `GET /api/trpc/project.getComments`
**Type:** query
**Description:** Returns threaded comments for a project. Max nesting depth: 1 level. Includes `is_liked` status per comment.

**Input:**
| Field | Type | Required |
|---|---|---|
| `id` | string | true — Project ID |
| `id_user` | string | false — Viewer user ID for `is_liked` flag |

---

### 2.9 `project.archive`
**Endpoint:** `POST /api/trpc/project.archive`
**Type:** mutation
**Permission:** Project owner only
**Description:** Sets project `is_archived = true`. Decrements category and user project counts.

**Input:**
| Field | Type | Required |
|---|---|---|
| `id` | string | true — Project ID |
| `id_user` | string | true — Owner user ID |

---

### 2.10 `project.unarchive`
**Endpoint:** `POST /api/trpc/project.unarchive`
**Type:** mutation
**Permission:** Project owner only
**Description:** Sets project `is_archived = false` (publishes). Increments category and user project counts.

**Input:**
| Field | Type | Required |
|---|---|---|
| `id` | string | true — Project ID |
| `id_user` | string | true — Owner user ID |

---

## 3. Comment Router (`comment.*`)

### 3.1 `comment.create`
**Endpoint:** `POST /api/trpc/comment.create`
**Type:** mutation
**Description:** Creates a comment or reply on a project. Replies are limited to one level deep (no nested replies). Sends notifications to project owners, collaborators, and parent comment authors. Increments project `count_comments`.

**Input:**
| Field | Type | Required |
|---|---|---|
| `id_project` | string | true |
| `content` | string (1–1000 chars) | true |
| `parent_id` | string | false — null for top-level comment; set to parent comment ID for a reply |

**Success Response `200`:**
```json
{
  "success": true,
  "message": "Successfully comment",
  "data": {
    "id": "01HX...",
    "id_project": "...",
    "id_user": "...",
    "content": "Great project!",
    "parent_id": null,
    "created_at": "2026-05-04T10:00:00.000Z",
    "updated_at": "2026-05-04T10:00:00.000Z"
  },
  "count_likes": 4
}
```

**Errors:**
| Code | Description |
|---|---|
| 400 | Project ID/content missing, or reply depth exceeds 1 level |
| 401 | Not authenticated |
| 404 | Parent comment not found or project has no owner |
| 500 | Database error |

---

### 3.2 `comment.edit`
**Endpoint:** `POST /api/trpc/comment.edit`
**Type:** mutation
**Permission:** Comment author only
**Description:** Edits an existing comment's content.

**Input:**
| Field | Type | Required |
|---|---|---|
| `id` | string | true — Comment ID |
| `content` | string (1–1000 chars) | true |
| `id_user` | string | true — Author user ID, verified against session |

**Errors:**
| Code | Description |
|---|---|
| 401 | Not authenticated |
| 403 | Not the comment author |
| 404 | Comment not found |

---

### 3.3 `comment.deleteById`
**Endpoint:** `POST /api/trpc/comment.deleteById`
**Type:** mutation
**Permission:** Comment author only
**Description:** Deletes a comment and all its descendant replies. Decrements `count_comments` by total number of deleted records.

**Input:**
| Field | Type | Required |
|---|---|---|
| `id` | string | true — Comment ID |
| `id_user` | string | true — Author user ID |
| `id_project` | string | true — Project ID (to update count) |

---

## 4. Follow Router (`follow.*`)

### 4.1 `follow.following`
**Endpoint:** `POST /api/trpc/follow.following`
**Type:** mutation
**Description:** Creates a follow relationship. Increments follower/following counts. Sends a `FOLLOW` notification to the followed user.

**Input:**
| Field | Type | Required |
|---|---|---|
| `id_follower` | string | true — The user doing the following |
| `id_following` | string | true — The user to follow |

**Errors:**
| Code | Description |
|---|---|
| 404 | One or both users not found |
| 409 | Already following this user |

---

### 4.2 `follow.unfollowing`
**Endpoint:** `POST /api/trpc/follow.unfollowing`
**Type:** mutation
**Description:** Removes a follow relationship. Decrements follower/following counts.

**Input:**
| Field | Type | Required |
|---|---|---|
| `id_follower` | string | true |
| `id_following` | string | true |

**Errors:**
| Code | Description |
|---|---|
| 404 | Follow relationship not found |

---

### 4.3 `follow.checkIsFollowing`
**Endpoint:** `GET /api/trpc/follow.checkIsFollowing`
**Type:** query
**Description:** Checks if user A is following user B.

**Input:**
| Field | Type | Required |
|---|---|---|
| `id_follower` | string | true |
| `id_following` | string | true — Target user ID |

**Success Response `200`:**
```json
{ "isFollowing": true }
```

---

## 5. Bookmark Router (`bookmark.*`)

### 5.1 `bookmark.create`
**Endpoint:** `POST /api/trpc/bookmark.create`
**Type:** mutation
**Description:** Bookmarks a project for a user.

**Input:**
| Field | Type | Required |
|---|---|---|
| `id_user` | string | true |
| `id_project` | string | true |

**Errors:**
| Code | Description |
|---|---|
| 409 | Bookmark already exists |

---

### 5.2 `bookmark.delete`
**Endpoint:** `POST /api/trpc/bookmark.delete`
**Type:** mutation
**Description:** Removes a user's bookmark on a project.

**Input:**
| Field | Type | Required |
|---|---|---|
| `id_user` | string | true |
| `id_project` | string | true |

---

## 6. Like Project Router (`likeProject.*`)

### 6.1 `likeProject.like`
**Endpoint:** `POST /api/trpc/likeProject.like`
**Type:** mutation
**Description:** Likes a project. Increments project `count_likes`. Sends `LIKE_PROJECT` notification to project owner and collaborators.

**Input:**
| Field | Type | Required |
|---|---|---|
| `id_user` | string | true — Liker user ID |
| `id_project` | string | true |

**Success Response `200`:**
```json
{
  "success": true,
  "message": "Project liked successfully",
  "count_likes": 6
}
```

**Errors:**
| Code | Description |
|---|---|
| 404 | Project or user not found |
| 409 | Already liked this project |

---

### 6.2 `likeProject.unlike`
**Endpoint:** `POST /api/trpc/likeProject.unlike`
**Type:** mutation
**Description:** Removes a like from a project. Decrements project `count_likes`.

**Input:**
| Field | Type | Required |
|---|---|---|
| `id_user` | string | true |
| `id_project` | string | true |

**Errors:**
| Code | Description |
|---|---|
| 404 | Like not found |

---

## 7. Like Comment Router (`likeComment.*`)

### 7.1 `likeComment.like`
**Endpoint:** `POST /api/trpc/likeComment.like`
**Type:** mutation
**Description:** Likes a comment. Increments comment like count. Sends `LIKE_COMMENT` notification to comment author (skipped if liker is the author).

**Input:**
| Field | Type | Required |
|---|---|---|
| `id_user` | string | true — Liker user ID |
| `id_comment` | string | true |

**Success Response `200`:**
```json
{
  "success": true,
  "message": "Comment liked successfully",
  "data": { "id": "...", "id_user": "...", "id_comment": "..." },
  "count_like": 3
}
```

**Errors:**
| Code | Description |
|---|---|
| 404 | Comment not found |
| 409 | Already liked |

---

### 7.2 `likeComment.unlike`
**Endpoint:** `POST /api/trpc/likeComment.unlike`
**Type:** mutation
**Description:** Removes a like from a comment. Decrements comment like count.

**Input:**
| Field | Type | Required |
|---|---|---|
| `id_user` | string | true |
| `id_comment` | string | true |

**Errors:**
| Code | Description |
|---|---|
| 404 | Like not found |

---

## 8. Notification Router (`notification.*`)

### 8.1 `notification.create`
**Endpoint:** `POST /api/trpc/notification.create`
**Type:** mutation
**Description:** Creates a notification for a user.

**Input:**
| Field | Type | Required | Default |
|---|---|---|---|
| `id_user` | string | true — Target user ID | — |
| `title` | string | true — Notification message | — |
| `type` | `notifType` enum | true | — |
| `is_read` | boolean | false | `false` |

**`notifType` values:** `FOLLOW`, `LIKE_PROJECT`, `LIKE_COMMENT`, `COMMENT_PROJECT`, `COMMENT`, `REPLY_COMMENT`, `COLLABORATION`

**Success Response `200`:**
```json
{
  "success": true,
  "message": "Successfully created notification",
  "data": {
    "id": "01HX...",
    "title": "dev liked your project",
    "created_at": "2026-05-04T10:00:00.000Z",
    "is_read": false,
    "type": "LIKE_PROJECT"
  }
}
```

**Errors:**
| Code | Description |
|---|---|
| 404 | User not found |

---

### 8.2 `notification.makeReaded`
**Endpoint:** `POST /api/trpc/notification.makeReaded`
**Type:** mutation
**Description:** Marks all unread notifications as read. Updates `all_notif_read` flag in `count_summary`.

**Input:**
| Field | Type | Required |
|---|---|---|
| `id_user` | string | true |

**Success Response `200`:**
```json
{
  "success": true,
  "message": "All notifications marked as read",
  "count": 5
}
```

---

### 8.3 `notification.getIsUnread`
**Endpoint:** `GET /api/trpc/notification.getIsUnread`
**Type:** query
**Description:** Returns a boolean indicating whether the user has any unread notifications or pending collaboration requests.

**Input:**
| Field | Type | Required |
|---|---|---|
| `id_user` | string | true |

**Success Response `200`:**
```json
{
  "success": true,
  "message": "Unread notifications count retrieved successfully",
  "data": true
}
```

---

## 9. Collaboration Router (`collaboration.*`)

### 9.1 `collaboration.accept`
**Endpoint:** `POST /api/trpc/collaboration.accept`
**Type:** mutation
**Description:** Accepts a pending collaboration request. Updates `collabStatus` to `ACCEPTED`. Sends a `COLLABORATION` notification to the project owner.

**Input:** Raw string — ProjectUser ID (not a JSON object).

**Success Response `200`:**
```json
{
  "success": true,
  "message": "You have accepted the collaboration",
  "data": {
    "id": "01HX...",
    "id_project": "...",
    "ownership": "COLLABORATOR",
    "collabStatus": "ACCEPTED"
  }
}
```

**Errors:**
| Code | Description |
|---|---|
| 404 | Collaboration not found |

---

### 9.2 `collaboration.reject`
**Endpoint:** `POST /api/trpc/collaboration.reject`
**Type:** mutation
**Description:** Rejects and deletes a pending collaboration request. Sends a `COLLABORATION` notification to the project owner.

**Input:** Raw string — ProjectUser ID (not a JSON object).

**Errors:**
| Code | Description |
|---|---|
| 404 | Collaboration not found |

---

## 10. Search Router (`search.*`)

### 10.1 `search.search`
**Endpoint:** `GET /api/trpc/search.search`
**Type:** query (Infinite Query — cursor paginated)
**Description:** Unified search. Searches projects by title, users by name/username, or categories by title. Supports cursor pagination and category filtering (for project search only).

**Input:**
| Field | Type | Required | Default |
|---|---|---|---|
| `type` | `PROJECT` \| `USER` \| `CATEGORY` | true | — |
| `id_user` | string | true — Viewer user ID | — |
| `search` | string (max 100) | false — Search query | — |
| `category` | string | false — Category slug; use `"__all__"` for all (projects only) | — |
| `limit` | integer (1–100) | false | 50 |
| `cursor` | string | false | — |

**Success Response `200` (type = PROJECT):**
```json
{
  "success": true,
  "message": "Successfully get projects",
  "data": [
    {
      "id": "...",
      "title": "...",
      "slug": "...",
      "is_bookmarked": false,
      "is_liked": true,
      "category": { "id": "...", "title": "...", "slug": "..." },
      "project_user": [{ "user": { "..." }, "ownership": "OWNER" }]
    }
  ],
  "nextCursor": "01HX..."
}
```

**Success Response `200` (type = USER):**
```json
{
  "success": true,
  "message": "Successfully get users",
  "data": [
    {
      "id": "...",
      "name": "Dev",
      "username": "dev",
      "photo_profile": "...",
      "github": "...",
      "count_summary": {
        "count_project": 5,
        "count_follower": 12,
        "count_following": 8
      }
    }
  ],
  "nextCursor": "dev-123"
}
```

**Errors:**
| Code | Description |
|---|---|
| 400 | Unsupported search type |

---

### 10.2 `search.getPopularPost`
**Endpoint:** `GET /api/trpc/search.getPopularPost`
**Type:** query
**Description:** Returns the highest `popularity_score` non-archived project per category, computed via a raw SQL window function.

**Input:**
| Field | Type | Required |
|---|---|---|
| `id_user` | string | true — Viewer user ID |

---

## 11. Category Router (`category.*`)

### 11.1 `category.getAll`
**Endpoint:** `GET /api/trpc/category.getAll`
**Type:** query
**Description:** Returns all categories sorted by `count_projects` descending.

**Input:** None.

**Success Response `200`:**
```json
{
  "success": true,
  "message": "Successfully get 5 categories",
  "data": [
    { "id": "...", "slug": "web-development", "title": "Web Development", "count_projects": 42 }
  ]
}
```

---

### 11.2 `category.getOne`
**Endpoint:** `GET /api/trpc/category.getOne`
**Type:** query
**Description:** Returns a single category by ID or slug.

**Input (at least one):**
| Field | Type | Required |
|---|---|---|
| `id` | string | false — Category ID |
| `slug` | string | false — Category slug |

---

## 12. Pin Router (`pin.*`)

### 12.1 `pin.pin`
**Endpoint:** `POST /api/trpc/pin.pin`
**Type:** mutation
**Permission:** Project owner or accepted collaborator
**Description:** Pins a project to the user's profile.

**Input:**
| Field | Type | Required |
|---|---|---|
| `id_project` | string | true — Project ID or slug |
| `id_user` | string | true |

**Errors:**
| Code | Description |
|---|---|
| 404 | Project not found or no permission |
| 409 | Already pinned |

---

### 12.2 `pin.unpin`
**Endpoint:** `POST /api/trpc/pin.unpin`
**Type:** mutation
**Permission:** Project owner or accepted collaborator
**Description:** Removes a pinned project from the user's profile.

**Input:**
| Field | Type | Required |
|---|---|---|
| `id_project` | string | true — Project ID or slug |
| `id_user` | string | true |

**Errors:**
| Code | Description |
|---|---|
| 404 | Project not found or pin not found |

---

## 13. REST Endpoints

These use standard HTTP REST via Next.js App Router. Auth is the same Clerk Bearer Token.

---

### 13.1 Upload Profile Image
**URL:** `POST /api/profile/editProfile`
**Content-Type:** `multipart/form-data`
**Description:** Uploads a new profile image. Deletes the old image if `oldImagePath` is provided. Stores files under `{userId}/{folder}/`.

**Request (form-data):**
| Field | Type | Required |
|---|---|---|
| `file` | File | true — Image file to upload |
| `folder` | string | true — Storage folder name |
| `oldImagePath` | string | false — Path to old image for deletion |

**Example:**
```bash
curl -X POST https://your-app.com/api/profile/editProfile \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  -F "file=@photo.jpg" \
  -F "folder=profile" \
  -F "oldImagePath=user_123/profile/old.jpg"
```

**Success Response `200`:**
```json
{ "newImagePath": "user_123/profile/1714816800000-photo.webp" }
```

**Errors:**
| Status | Message | Description |
|---|---|---|
| 400 | `"File and folder are required."` | Missing required fields |
| 401 | `"Unauthorized"` | No valid session |
| 500 | `"Failed to edit profile image."` | Upload failure |

---

### 13.2 Create Project (REST)
**URL:** `POST /api/project/create`
**Content-Type:** `multipart/form-data`
**Description:** Creates a project with image uploads. Uploads images to Supabase Storage, then internally calls `trpc.project.create`.

**Request (form-data):**
| Field | Type | Required |
|---|---|---|
| `title` | string | true |
| `id_category` | string | true |
| `content` | string | true — HTML content body |
| `image1` | File | true — Primary image |
| `image2` – `image5` | File | false — Additional images |
| `link_figma` | string | false |
| `link_github` | string | false |
| `collaborators` | JSON string | false — Array of `{id, name, username, photo_profile?}` |

**Errors:**
| Status | Message | Description |
|---|---|---|
| 400 | `"Name, id_category and content are required"` | Missing required fields |
| 500 | `"Failed to upload image"` | Image upload failure |
| 500 | `"Failed to create project"` | Database creation failure |

---

### 13.3 Edit Project (REST)
**URL:** `POST /api/project/edit`
**Content-Type:** `multipart/form-data`
**Description:** Edits project metadata. Internally calls `trpc.project.edit`.

**Request (form-data):**
| Field | Type | Required |
|---|---|---|
| `id` | string | true — Project ID |
| `id_category` | string | false |
| `title` | string | false |
| `content` | string | false |
| `link_figma` | string | false |
| `link_github` | string | false |

**Errors:**
| Status | Message | Description |
|---|---|---|
| 400 | `"Project ID and user ID are required"` | Missing IDs |
| 404 | `"Project not found or access denied"` | Not found or not owner |
| 500 | `"Failed to edit project"` | Database error |

---

### 13.4 Upload Project Images
**URL:** `POST /api/project/uploadImage`
**Content-Type:** `multipart/form-data`
**Description:** Uploads one or more images for a project. Stored under `{userId}/{folder}/`.

**Request (form-data):**
| Field | Type | Required |
|---|---|---|
| `folder` | string | true — e.g. `"project"` |
| `files[0]`, `files[1]`, ... | File | true — At least one image file |

**Success Response `200`:**
```json
{
  "filePaths": [
    "user_123/project/1714816800000-img1.webp",
    "user_123/project/1714816800001-img2.webp"
  ]
}
```

**Errors:**
| Status | Message | Description |
|---|---|---|
| 400 | `"Folder is required."` | Missing folder |
| 400 | `"No files provided."` | No files attached |
| 401 | `"Unauthorized"` | No valid session |
| 500 | `"Failed to upload images."` | Upload failure |
