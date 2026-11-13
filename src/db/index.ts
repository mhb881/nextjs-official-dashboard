import { drizzle } from "drizzle-orm/neon-http";
import { env } from "../env";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema"; // Drizzle 1.0 的 db 初始化

const sql = neon(env.DATABASE_URL);
export const db = drizzle({ client: sql });
