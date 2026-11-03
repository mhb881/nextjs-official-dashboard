import { NextResponse } from "next/server";
import { z } from "zod";
import { createInvoiceInDB, fetchLatestInvoices } from "~/lib/data";

export async function GET() {
  const invoices = await fetchLatestInvoices();

  return NextResponse.json(invoices);
}

// 解决隐患 2：定义输入校验 Schema（校验 customerId、amount 是否合法）
const CreateInvoiceSchema = z.object({
  customerId: z.uuid({ message: "请提供合法的客户 UUID" }),
  // 支持数字或字符串转换，要求金额大于 0
  amount: z.coerce.number().positive({ message: "发票金额必须大于 0" }),
  status: z.enum(["pending", "paid"]).default("pending"),
});

export async function POST(request: Request) {
  try {
    // 解决隐患 1：捕获非法 JSON 解析异常，防止服务崩溃
    // ── 第一步：安全地拆开信封正文 (防范畸形 JSON) ──
    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      // 客户端发来的连合法的 JSON 字符串都不是 -> 400 Bad Request
      return NextResponse.json(
        { error: "请求体不是合法的 JSON 格式" },
        { status: 400 },
      );
    }

    // 解决隐患 2：Zod 结构与业务边界安全校验
    // ── 第二步：运行时数据校验 (使用 safeParse 而不是 parse，避免抛异常) ──
    const validationResult = CreateInvoiceSchema.safeParse(rawBody);

    if (!validationResult.success) {
      // 校验未通过：明确是客户端填错了数据 -> 返回 400 (或 422)，并附上具体哪个字段错了
      return NextResponse.json(
        {
          error: "参数校验失败",
          details: z.treeifyError(validationResult.error),
          // details 会生成类似: { amount: ['账单金额必须大于 0'] }，前端可以直接拿去标红表单！
        },
        { status: 400 },
      );
    }

    // 走到这里，validationResult.data 不仅在运行时 100% 安全，而且自动拥有完美的 TypeScript 类型！
    const validData = validationResult.data;

    // 解决隐患 3：捕获数据库底层执行异常（如外键不匹配、网络错误）

    // ── 第三步：执行核心业务与数据库操作 ──
    const newInvoice = await createInvoiceInDB(validData);

    // 解决隐患 4：符合 REST 规范的 201 Created 语义
    // ── 第四步：成功创建资源 -> 返回 201 Created ──
    return NextResponse.json({ data: newInvoice }, { status: 201 });
  } catch (error) {
    // ── 第五步：兜底捕获所有未预期的服务器内部异常 (如数据库连接断开) ──

    // 1. 对内：记录完整错误日志，供开发者排查
    console.error("[POST /api/invoices] 数据库或系统异常:", error);

    // 2. 对外：严格脱敏，绝不把 error.message 直接发给客户端 -> 返回 500
    return NextResponse.json(
      { error: "服务器开小差了，请稍后再试" },
      { status: 500 },
    );
  }
}
