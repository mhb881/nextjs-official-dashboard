import "dotenv/config";
import { defineConfig } from "drizzle-kit";
import { env } from "~/env";

export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schema.ts",
  dialect: "postgresql",
  // ✅ 核心隔离 1：只扫描并管理 public 模式，禁止触碰
  schemaFilter: ["public"],
  // ✅ 核心隔离 2：只更新认证 4 张表，禁止触碰 invoices、customers 等业务表
  tablesFilter: ["user", "session", "account", "verification"],
  dbCredentials: {
    url: env.DATABASE_URL!,
  },
});
