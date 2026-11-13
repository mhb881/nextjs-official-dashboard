"use server";

import { email, z } from "zod";
import { revalidatePath } from "next/cache";
import postgres from "postgres";
import { redirect } from "next/navigation";
import { CreateInvoiceFormSchema, LoginSchema } from "./zod/schema";
import { env } from "~/env";
import { auth } from "~/server/auth";
import { headers } from "next/headers";
import { isAPIError } from "better-auth/api";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

// 定义创建发票的验证模式，id 是数据库自动生成的，不需要用户输入；date 下面的函数生成的
const CreateInvoice = CreateInvoiceFormSchema.omit({ id: true, date: true });

// 使用 Zod 声明预期类型模式
const UpdateInvoice = CreateInvoiceFormSchema.omit({ id: true, date: true });

// 定义状态类型，用于处理创建发票和更新发票的操作结果
export type InvoiceState = {
  ok?: boolean;
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

export type LoginState = {
  ok?: boolean;
  errors?: {
    email?: string[];
    password?: string[];
  };
  message?: string | null;
};

/* ------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------- */

function getSafeCallbackUrl(value: FormDataEntryValue | null) {
  const fallback = "/dashboard";

  if (typeof value !== "string") return fallback;

  const baseUrl = env.BETTER_AUTH_URL;
  if (!baseUrl) return fallback;

  try {
    const base = new URL(baseUrl);
    const target = new URL(value, base);

    // 只允许跳回当前站点，拒绝外部 URL。
    if (target.origin !== base.origin) return fallback;

    return `${target.pathname}${target.search}${target.hash}`;
  } catch {
    return fallback;
  }
}

export async function authenticate(
  prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  // 首先是利用 zod 验证表单数据
  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      errors: z.flattenError(parsed.error).fieldErrors,
      message: "登录失败，请检查邮箱和密码。",
    };
  }

  // zod 验证通过后，提取数据
  const { email, password } = parsed.data;
  // 提取回调 URL
  const callbackUrl = getSafeCallbackUrl(formData.get("redirectTo"));

  try {
    // 调用 Better Auth 登录 API
    await auth.api.signInEmail({
      body: {
        email,
        password,
      },
      headers: await headers(),
    });
  } catch (error) {
    // 捕获 Better Auth 登录 API 异常
    if (isAPIError(error)) {
      // 不向用户透露邮箱是否存在等账户信息。
      return { ok: false, message: "邮箱或密码不正确。" };
    }

    console.error("Unexpected sign-in error:", error);
    return { ok: false, message: "登录暂时不可用，请稍后重试。" };
  }

  // redirect() 会通过特殊控制流结束当前执行；放在 try/catch 外面。
  redirect(callbackUrl);
}

export async function logout() {
  await auth.api.signOut({
    headers: await headers(),
  });

  redirect("/login");
}

/* ------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------- */

export async function createInvoice(prevState: InvoiceState, data: FormData) {
  // 使用 Zod 安全校验表单字段
  const validatedFields = CreateInvoice.safeParse({
    customerId: data.get("customerId"),
    amount: data.get("amount"),
    status: data.get("status"),
  });

  if (!validatedFields.success) {
    return {
      ok: false,
      errors: z.flattenError(validatedFields.error).fieldErrors,
      message: "缺少字段，创建发票失败。",
    };
  }

  const { customerId, amount, status } = validatedFields.data;
  // 提取清洗完成的数据并准备入库
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split("T")[0];

  try {
    await sql`
    INSERT INTO invoices (customer_id, amount, status, date)
    VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
  `;
  } catch (error) {
    console.error(error);
    // 捕获底层数据库异常并返回针对性提示
    return { ok: false, message: "Database error: Failed to create invoice." };
  }

  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}

export async function updateInvoice(
  id: string,
  prevState: InvoiceState,
  formData: FormData,
) {
  // 使用 Zod 安全校验表单字段
  const validatedFields = UpdateInvoice.safeParse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });

  if (!validatedFields.success) {
    // 🚀 Zod 4 最新最佳实践：顶层函数式提取 fieldErrors
    const { fieldErrors } = z.flattenError(validatedFields.error);

    return {
      ok: false,
      errors: fieldErrors,
      message: "缺少字段，更新发票失败。",
    };
  }

  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;

  try {
    await sql`
    UPDATE invoices
    SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
    WHERE id = ${id}
  `;
  } catch (error) {
    console.error(error);
    return { ok: false, message: "Database error: Failed to update invoice." };
  }

  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}

export async function deleteInvoice(id: string) {
  try {
    await sql`DELETE FROM  invoices WHERE id = ${id}`;
  } catch (error) {
    console.error(error);
    return { ok: false, message: "Database error: Failed to delete invoice." };
  }
  revalidatePath("/dashboard/invoices");
}
