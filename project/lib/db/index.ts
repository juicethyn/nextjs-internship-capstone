import { neonConfig, Pool } from "@neondatabase/serverless";
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as relations from "./relations";
import * as schema from "./schema";

config({ path: ".env.local" });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
	throw new Error("DATABASE_URL is not defined in the environment variables.");
}

neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: databaseUrl });

export const db = drizzle({
	client: pool,
	schema: { ...schema, ...relations },
});
