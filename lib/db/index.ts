import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

declare global {
  var _pgClient: postgres.Sql | undefined;
}

// max: 1 is required for serverless (Vercel) — each function instance should hold
// at most one connection to avoid exhausting Supabase Transaction Pooler limits.
// In dev we reuse the connection across HMR reloads via the global singleton.
const client =
  global._pgClient ??
  postgres(process.env.DATABASE_URL!, {
    prepare: false, // required for Supabase Transaction pooler (port 6543)
    max: 1,
  });

if (process.env.NODE_ENV !== "production") {
  global._pgClient = client;
}

export const db = drizzle(client, { schema });
