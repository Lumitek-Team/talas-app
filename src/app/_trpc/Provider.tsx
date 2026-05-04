// src/app/_trpc/Provider.tsx
"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import { useState } from "react";
import { trpc } from "./client";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data is considered fresh for 60 seconds — no redundant refetches during that window
        staleTime: 60 * 1000,
        // Keep unused cache in memory for 5 minutes after component unmounts
        gcTime: 5 * 60 * 1000,
        // Not refetch just because the user switched browser tabs and came back
        refetchOnWindowFocus: false,
        // One retry on failure
        retry: 1,
        retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000), // exponential backoff
      },
    },
  });
}

// Singleton pattern: avoid creating a new QueryClient on every render
let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: always create a new client (no shared state between requests)
    return makeQueryClient();
  }
  // Browser: reuse existing client
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}

export default function Provider({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: "/api/trpc",
          transformer: superjson,
        }),
      ],
    }),
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
