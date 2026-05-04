// src/app/_trpc/Provider.tsx
'use client'

import { createTRPCReact } from '@trpc/react-query'
import { AppRouter } from '../server'
export const trpc = createTRPCReact<AppRouter>({})