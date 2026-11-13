/*
1. 项目中使用了 @t3-oss/env-nextjs（src/env.ts）对环境变量进行类型安全校验。

2. 当你在 Next.js 环境（pnpm run dev）下运行时，Next.js 会自动将 .env 的内容注入到 process.env 中。

3. 但当你通过 tsx 独立在终端运行脚本（如 pnpm exec tsx src/scripts/seed-user.ts）时，
   Next.js 并没有启动，Node.js 默认不会自动读取 .env，
   导致 process.env.DATABASE_URL 为 undefined，从而被校验拦截。

在独立脚本的最顶部第一行引入 dotenv/config（你的项目中已安装 dotenv），让 Node.js 优先加载 .env 文件  
*/
import "dotenv/config";
import { auth } from "../server/auth";

async function main() {
  console.log("🚀 正在创建测试用户...");

  const response = await auth.api.signUpEmail({
    body: {
      name: "admin",
      email: "user@email.com",
      password: "12345", // ⚠️ 注意：密码长度必须 >= 5 位（auth.ts 中限制了 minPasswordLength: 5）
    },
  });

  console.log("✅ 用户创建成功！", response.user);
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ 创建用户失败:", err);
  process.exit(1);
});

// pnpm exec tsx src/scripts/seed-user.ts
