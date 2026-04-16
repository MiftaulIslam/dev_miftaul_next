import "server-only";

import { neon } from "@neondatabase/serverless";

let sqlClient: any = null;

export function getSql() {
  if (sqlClient) {
    return sqlClient;
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set.");
  }

  sqlClient = neon(connectionString);
  return sqlClient;
}
