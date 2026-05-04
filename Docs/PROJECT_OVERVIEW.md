# Talas App - Master Project Blueprint & Documentation

## 1. Project Identity & Mission

**Talas App** is a high-fidelity social portfolio and collaboration ecosystem tailored for the modern creator (Developers, Designers, and Product Builders).

Unlike static portfolio sites, Talas focuses on **Proof of Work** and **Collaboration**. It allows users to not only showcase finished products but also to document the process, manage multi-user team ownership, and engage in a community-driven feedback loop.

---

## 2. User Personas & Functional Requirements

### **User Personas**

1.  **The Solo Creator:** Needs a beautiful, rich-text environment to showcase their technical stack and project results.
2.  **The Team Lead:** Needs to manage project visibility and invite collaborators to share credit for a joint venture.
3.  **The Recruiter/Scout:** Needs to filter projects by category and verify a user's social proof (followers, likes, active collaborations).

### **Functional Requirements (The "What")**

#### **A. Profile & Social Identity**

- **Identity Management:** Users must be able to sign in via social or email and maintain a profile with technical links (GitHub, LinkedIn, Figma).
- **Social Graph:** Ability to follow/unfollow users to curate a personal feed.
- **Performance Metrics:** Real-time tracking of project impact (likes, bookmarks) and social reach (follower counts).

#### **B. Project Engine**

- **Rich Documentation:** Support for multi-media project stories (Images, Videos, and Rich Text).
- **Metadata Integration:** Direct linking to source code (GitHub) and design files (Figma).
- **Life Cycle Management:** Ability to 'Pin' featured work to the top of a profile or 'Archive' older projects without deleting them.

#### **C. Collaboration Framework**

- **Shared Ownership:** Projects can have multiple "Collaborators" besides the "Owner".
- **Invitation Workflow:** A formal request system where users must 'Accept' or 'Reject' a collaboration invite.
- **Role Attribution:** Clear distinction in the UI between the project creator and the team members.

#### **D. Community Engagement**

- **Interactive Feedback:** Nested commenting system for deep discussions.
- **Content Curation:** Ability for users to 'Bookmark' projects into a private 'Saved' collection.
- **Real-time Awareness:** A notification center for every social touchpoint (likes, follows, comments, invites).

---

## 3. Tech Stack & Service Integration (The "How")

### **The "Golden Stack" (Frontend)**

- **Next.js 19 (App Router):** Utilizes Server Components for SEO/Performance and Client Components for interactivity.
- **Zustand (State Management):** Manages **Global UI State** (e.g., current active filters, temporary form data, and "sidebar open" states) that doesn't require server persistence.
- **tRPC + TanStack Query:** Manages **Server State**. Provides end-to-end type safety. If the database schema changes, the frontend will fail to compile, preventing runtime errors.
- **Tailwind CSS & Variants:** Implements a design system that is both flexible and strictly typed.
- **Framer Motion:** Handles orchestration of "feel" (page transitions, layout animations).

### **The "Engine Room" (Backend)**

- **Clerk Auth:** Secure, managed authentication. The user's `userId` is injected into every tRPC request context.
- **Prisma ORM:** A type-safe layer over PostgreSQL. It uses **ULIDs** (Universally Unique Lexicographically Sortable Identifiers) for IDs to ensure high performance and sortability.
- **PostgreSQL (Supabase):** The primary relational database, optimized with connection pooling for serverless environments.

---

## 4. Application Flow & Request Lifecycle

The application operates on a **Uni-Directional Type-Safe Flow**:

1.  **User Action:** A user submits a comment in `src/components/project/comment-form.tsx`.
2.  **Validation:** `react-hook-form` and `zod` validate the input on the client immediately.
3.  **Transmission:** `trpc.comment.create.useMutation()` sends the data to the server.
4.  **Security Check:** `src/app/server/context.ts` verifies the user's Clerk session.
5.  **Execution:** The tRPC procedure in `src/app/server/router/comment.ts` executes a Prisma transaction.
6.  **Notification Logic:** The server triggers a secondary write to the `Notification` table for the project owner.
7.  **Auto-Refresh:** On success, the client-side `invalidateQueries()` triggers, causing the `comment-section.tsx` to re-fetch and display the new comment without a page reload.

---

## 5. Detailed Project Structure & Mapping

```text
talas-app/
├── prisma/                     # DATABASE LAYER
│   ├── schema.prisma           # Single source of truth for all data entities
│   └── seed.ts                 # Script for populating local dev environment
├── src/
│   ├── app/                    # APP ROUTER ARCHITECTURE
│   │   ├── (pages)/            # UI views (Profile, Feeds, Settings)
│   │   ├── api/trpc/           # Gateway for all client-server communication
│   │   ├── server/             # THE BUSINESS LOGIC LAYER
│   │   │   ├── router/         # Modular API controllers (User, Project, Follow, etc.)
│   │   │   ├── context.ts      # Authentication & dependency injection logic
│   │   │   ├── index.ts        # Root router (The API Schema)
│   │   │   └── trpc.ts         # tRPC config & custom middlewares
│   │   └── _trpc/              # Client-side tRPC hooks configuration
│   ├── components/             # THE COMPONENT LIBRARY
│   │   ├── project/            # Complex features: Comment trees, Project forms
│   │   ├── profile/            # Social features: Follow buttons, Profile headers
│   │   ├── ui/                 # Atomic design: Buttons, Inputs, Dialogs (accessible)
│   │   └── layout/             # Structural: Navbar, Sidebar, Footer
│   ├── lib/                    # SYSTEM UTILITIES
│   │   ├── prisma.ts           # Shared Prisma client instance
│   │   └── supabase.ts         # Supabase client for storage and storage-edge ops
│   └── middleware.ts           # Route-level security (Clerk)
```

---

## 6. Data Schema & Relationships

- **Users & Projects:** Linked via `ProjectUser` table to support many-to-many collaboration.
- **Social Graph:** `Follow` table creates a self-referencing many-to-many relationship on the `User` table.
- **Engagement:** `LikeProject`, `Bookmark`, and `Comment` tables act as relational bridges between Users and Content.
- **Aggregates:** `count_summary` table acts as a read-cache for expensive counts (followers, total projects) to ensure the landing page and profiles load instantly.

---

## 7. Development Standards

- **Type Safety:** `any` is forbidden. All data must have a defined interface or Zod schema.
- **Component Pattern:** Favor **Composition** (passing components as props) over complex inheritance.
- **Performance:** Utilize Next.js Image optimization and dynamic imports for heavy components like CKEditor.
- **Security:** Never expose Prisma queries directly to the client; always wrap in tRPC procedures with context-based auth checks.

---

## 8. Operational Checklist (Run / Build / Test)

Quick commands used by contributors and CI:

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server (after build)
npm run start

# Run linter
npm run lint

# Seed local DB (uses Prisma seed defined in package.json)
npm run prisma -- prisma db seed
```

Notes:

- The `prisma` CLI is available via the `prisma` dependency in `devDependencies`.
- Local development typically requires a local Postgres instance or a Supabase project connected via `DATABASE_URL`.

## 9. Required Environment Variables (common list)

The codebase expects environment variables for database, auth providers, and storage. Confirm exact keys in your `.env` or hosting provider, but commonly required variables include:

- `DATABASE_URL` — Postgres connection string used by Prisma.
- `DIRECT_URL` — Optional direct connection string used by Prisma when using connection proxies.
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` or server-side `SUPABASE_SERVICE_ROLE_KEY` — if Supabase storage/auth is used.
- `CLERK_...` / `NEXT_PUBLIC_CLERK_...` — Clerk auth environment values (frontend and server keys).
- `NEXTAUTH_URL` or other callback URLs depending on deployment.

Always verify provider-specific names by checking the provider integration file (e.g., `src/lib/supabase.ts`, `src/app/server/context.ts`).

## 10. Prisma & Database Workflows

- Migrations: `npx prisma migrate dev` for local development and `npx prisma migrate deploy` in CI/production.
- Generate client: `npx prisma generate` (usually run automatically during install/build).
- Seed: configured in `package.json` as `prisma.seed` -> runs `ts-node prisma/seed.ts`.
- Schema source of truth: `prisma/schema.prisma` (see `prisma/schema.prisma`).

## 11. Detailed Data Model Summary (high-level)

The Prisma schema defines the core domain entities and relations. Key models and responsibilities:

- `User` — primary actor with profile fields, social links, and relations for bookmarks, comments, follows, notifications, and project membership.
- `Project` — central content object; supports multiple images, media links, counts for likes and comments, and relation to `Category`.
- `Comment` — supports nested replies via `parent_id` and a `CommentReplies` relation.
- `ProjectUser` — join table for many-to-many between `User` and `Project`, with `ownership` and `collabStatus` fields.
- `Follow`, `Bookmark`, `LikeProject`, `LikeComment`, `Notification`, `pinProject` — engagement and social graph tables.

Enums capture business rules like `ownershipType` (`OWNER`/`COLLABORATOR`) and `collabStatusType` (`PENDING`/`ACCEPTED`/`REJECTED`).

Refer to `prisma/schema.prisma` for exact field types and indexes.

## 12. Request Lifecycle — detailed trace (example: commenting)

1. Client validates comment input with `react-hook-form` and `zod` in `src/components/project/comment-form.tsx`.
2. The component calls a tRPC mutation via the client tRPC hook (e.g., `trpc.comment.create.useMutation()`).
3. tRPC client sends the request to `src/app/api/trpc/[trpc].ts` (Next.js API route) which proxies to the tRPC router.
4. Middleware in `src/app/server/trpc.ts` / `src/app/server/context.ts` injects authenticated user info (Clerk session) into the tRPC context.
5. The `comment.create` procedure in `src/app/server/router/comment.ts` performs validation, executes Prisma writes, and updates auxiliary tables (counts, notifications).
6. On success, the client invalidates relevant React Query cache keys (e.g., `comment.list`), causing UI to re-fetch and render the new comment.

## 13. Key Files / Where To Look (quick map)

- App entry & routing: `src/app/` and `src/app/layout.tsx` (App Router root pages).
- Server API & routers: `src/app/server/` and `src/app/server/router/` (tRPC procedures and router index).
- Client tRPC config: `src/_trpc/client.ts` and `src/_trpc/Provider.tsx`.
- Database client: `src/lib/prisma.ts`.
- Supabase integration: `src/lib/supabase.ts`.
- Components: `src/components/` (search for `project`, `profile`, `ui`, `layout`).

## 14. Coding Conventions & Patterns

- Use `zod` for input validation at both client and server boundaries.
- Use tRPC procedure input/output types to preserve end-to-end type safety.
- Prefer server components for data-fetching UI when no client interactivity is required.
- Heavy interactive widgets (e.g., CKEditor) should be dynamically imported and run as client components.

## 15. CI / Deployment Notes

- The project uses Next.js and should be deployable to platforms supporting the App Router (Vercel, Netlify, Cloudflare Pages with adapters, etc.).
- Ensure environment variables are configured on the host (database, Clerk, Supabase keys).
- Run database migrations and seeds as part of the deployment/upgrade process.

## 16. Contribution Checklist

When opening a PR, ensure:

- Type-checks pass (`tsc --noEmit`).
- Linting passes (`npm run lint`).
- Prisma migrations are included if the schema changed.
- Add/update `zod` schemas and tRPC procedure types where the API contract changed.

---

## 17. What this document is NOT

This overview is a single-file orientation and not a replacement for code-level docs. For implementation details refer to the linked source files above (routers, components, and `prisma/schema.prisma`).

---

_Last updated: $(date)_
