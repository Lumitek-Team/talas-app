# Talas App

Talas is a full-stack social platform designed for developers and creators to showcase their projects, collaborate with others, and engage with a community of innovators. The application provides a robust environment for project discovery, featuring rich text editing, social interactions, and a comprehensive notification system.

## Project Overview

The Talas App serves as a digital portfolio and collaboration hub. It enables users to:
- **Showcase Projects**: Share detailed project descriptions using a rich text editor (CKEditor 5), complete with image galleries and video embeds.
- **Engage with the Community**: Interact through deeply nested comment systems, likes, and bookmarks.
- **Collaborate**: Find and invite collaborators to join projects, managing roles and statuses within the platform.
- **Discover**: Search and browse projects by categories, popularity, or specific creators through a dynamic feed.
- **Stay Updated**: Track interactions and community activities via a real-time notification system.

## Tech Stack

The application is built using a modern, high-performance tech stack:

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v4, Radix UI (Headless components), Framer Motion (Animations)
- **API Layer**: tRPC (End-to-end type safety)
- **State Management**: TanStack Query (Server state), Zustand (Client state)
- **Authentication**: Clerk
- **Database**: PostgreSQL (Hosted via Supabase)
- **ORM**: Prisma
- **Form Handling**: React Hook Form, Zod (Schema validation)
- **Editor**: CKEditor 5

## Architectural Decisions

- **tRPC for Type-Safety**: Utilized tRPC to establish a shared type layer between the client and server, significantly reducing runtime errors and improving developer velocity.
- **Next.js App Router**: Leveraged the latest Next.js features for optimized server-side rendering, layout management, and efficient routing.
- **Relational Data Modeling**: Implemented a comprehensive PostgreSQL schema using Prisma to handle complex relationships such as nested comments, follower systems, and project collaboration roles.
- **Client-Side Optimization**: Integrated `browser-image-compression` and `react-easy-crop` to ensure media uploads are optimized before storage, improving application performance and reducing bandwidth costs.
- **Component-Driven Design**: Developed a modular UI system using Radix UI primitives and Tailwind CSS for accessibility, consistency, and rapid iteration.

## Setup Instructions

### Prerequisites

- Node.js 18.x or higher
- A Supabase account (or local PostgreSQL instance)
- A Clerk account for authentication

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/talas-app.git
   cd talas-app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Configuration**:
   Create a `.env` file in the root directory by copying the `.env.example`:
   ```bash
   cp .env.example .env
   ```
   Fill in your respective credentials for Supabase, Clerk, and your database URL.

4. **Database Setup**:
   Generate the Prisma client and push the schema to your database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**:
   ```bash
   npm run dev
   ```

### Seeding the Database (Optional)

To populate the application with initial data:
```bash
npm run seed
```

## Live Deployment

The application is deployed and can be accessed at:
[https://talas-app.vercel.app](https://talas-app.vercel.app)