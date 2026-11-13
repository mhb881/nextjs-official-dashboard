import { getSessionCookie } from "better-auth/cookies";
import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);

  if (!sessionCookie) {
    // 基于当前站点的 Base URL 构建 /login 目标地址
    const loginUrl = new URL("/login", request.nextUrl);

    // 提取用户原本尝试访问的完整路径与查询参数
    const callbackUrl = `${request.nextUrl.pathname}${request.nextUrl.search}`;

    /*
    将原路径挂载为查询参数（最终生成 /login?callbackUrl=%2Fdashboard%2F...）
    以便用户在登录成功后能无缝跳回原页面。
     */
    loginUrl.searchParams.set("callbackUrl", callbackUrl);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// 路由匹配规则
export const config = {
  matcher: ["/dashboard/:path*"],
};
