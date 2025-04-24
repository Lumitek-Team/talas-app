// src/app/api/user/route.ts
import { db } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const users = await db.user.findMany();
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
