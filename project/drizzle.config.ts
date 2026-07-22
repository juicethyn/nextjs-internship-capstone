import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local" });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
	throw new Error("DATABASE_URL is not defined in the environment variables.");
}

export default defineConfig({
	out: "./drizzle",
	schema: "./lib/db/schema.ts",
	dialect: "postgresql",
	dbCredentials: {
		url: databaseUrl,
	},
	migrations: {
		schema: "public",
		table: "_drizzle_migrations",
	},
});
