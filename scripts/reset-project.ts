import { execSync } from "child_process";
import { createClerkClient } from "@clerk/backend";
import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "@prisma/client";

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SECRET_KEY || "",
);
const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log("Starting full-stack environment reset...");

  try {
    // 1. CLEAR CLERK USERS
    console.log("Clearing Clerk users...");
    const users = await clerk.users.getUserList({ limit: 100 });
    for (const user of users.data) {
      await clerk.users.deleteUser(user.id);
      console.log(`  - Deleted Clerk user: ${user.id}`);
    }

    // 2. RESET DATABASE SCHEMA VIA PRISMA
    console.log("Resetting database schema...");
    execSync("npx prisma migrate reset --force --skip-seed", {
      stdio: "inherit",
    });

    // 3. APPLY CUSTOM SQL / RLS POLICIES
    console.log("Applying custom database configurations and RLS...");
    const customQueries = `
      DO $$
      BEGIN
        -- APPLY RLS TO STORAGE BUCKET
        DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
        DROP POLICY IF EXISTS "Authenticated users can delete" ON storage.objects;
        DROP POLICY IF EXISTS "Authenticated users can edit" ON storage.objects;

        CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'project-images');
        CREATE POLICY "Authenticated users can delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'project-images');
        CREATE POLICY "Authenticated users can edit" ON storage.objects FOR UPDATE TO authenticated WITH CHECK (bucket_id = 'project-images');

        -- DROP INSECURE POLICY ON USER
        BEGIN
            DROP POLICY IF EXISTS "Allow anonymous pings" ON public."User";
        EXCEPTION WHEN undefined_table THEN
            NULL;
        END;

        BEGIN
            EXECUTE 'REVOKE SELECT ON "User" FROM anon';
        EXCEPTION WHEN undefined_table THEN
            NULL;
        END;

        -- CREATE ISOLATED TABLE TO PING
        IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = '_ping') THEN
          CREATE TABLE public."_ping" (
            "id" INT PRIMARY KEY
          );

          ALTER TABLE public."_ping" ENABLE ROW LEVEL SECURITY;

          CREATE POLICY "Allow anonymous pings" ON public."_ping"
            FOR SELECT
            TO anon
            USING (true);
        END IF;

        EXECUTE 'GRANT USAGE ON SCHEMA public TO anon';
        EXECUTE 'GRANT SELECT ON public."_ping" TO anon';
      END $$;
    `;    if (customQueries.trim()) {
      await prisma.$executeRawUnsafe(customQueries);
      console.log("  - Custom queries applied successfully.");
    }

    // 4. EMPTY SUPABASE STORAGE BUCKETS
    console.log("Emptying storage buckets...");
    const { data: buckets, error: bucketError } =
      await supabase.storage.listBuckets();
    if (bucketError) throw bucketError;

    if (buckets) {
      for (const bucket of buckets) {
        const { data: files, error: listError } = await supabase.storage
          .from(bucket.id)
          .list();
        if (listError) throw listError;

        if (files && files.length > 0) {
          const fileNames = files
            .map((f) => f.name)
            .filter((name) => name !== ".emptyFolderPlaceholder");

          if (fileNames.length > 0) {
            const { error: deleteError } = await supabase.storage
              .from(bucket.id)
              .remove(fileNames);
            if (deleteError) {
              console.error(
                `  Warning: Failed to clear bucket [${bucket.id}]:`,
                deleteError.message,
              );
            } else {
              console.log(`  - Emptied files from bucket: ${bucket.id}`);
            }
          }
        } else {
          console.log(`  - Bucket [${bucket.id}] is already empty.`);
        }
      }
    }

    // 5. RUN PRISMA SEED
    console.log("Executing prisma/seed.ts...");
    execSync("npx prisma db seed", { stdio: "inherit" });

    console.log("\nWorkspace environment successfully reset.");
  } catch (error) {
    console.error("Reset orchestrator failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
