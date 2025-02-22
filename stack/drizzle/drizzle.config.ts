// drizzle.config.ts
import type { Config } from "drizzle-kit";
import { config as loadEnv } from "dotenv";
loadEnv();

export default {
    schema: "./stack/drizzle/schema",
    out: "./stack/drizzle/migrations",
    dialect: "postgresql",
    // driver: "pg",
    dbCredentials: {
        host: "40.121.178.60",
        port: 5442,
        user: "mediprep",
        password: "password",
        database: "mediprep",
        ssl: process.env.PG_SSL_MODE === 'true',
    },
    verbose: true,
    strict: true,
} as Config ;