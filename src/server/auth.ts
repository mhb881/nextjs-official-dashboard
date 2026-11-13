import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { drizzleAdapter } from "@better-auth/drizzle-adapter/relations-v2";
import { db } from "../db/index";
import * as schema from "../db/schema";
import { env } from "../env";

export const auth = betterAuth({
  // 使用环境变量中的 BETTER_AUTH_URL / BETTER_AUTH_SECRET。
  // 生产环境应显式配置正确的站点 URL 和高熵 Secret。
  baseURL: env.BETTER_AUTH_URL,
  database: drizzleAdapter(db, {
    provider: "pg", // or "pg" or "mysql"
    schema: {
      ...schema,
    },
  }),
  //... the rest of your config
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 5,
    maxPasswordLength: 128,
  },
  plugins: [
    // 让 Server Actions 中由 Better Auth 产生的 Set-Cookie
    // 能通过 Next.js cookies API 写回响应。
    nextCookies(),
  ],
});
