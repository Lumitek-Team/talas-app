// server/trpc-server.ts

import { appRouter } from "../server";
import { createContext } from "../server/context";

export async function getTrpcCaller() {
  const ctx = await createContext();
  return appRouter.createCaller(ctx);
}
