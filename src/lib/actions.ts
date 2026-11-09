"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import postgres from "postgres";
import { redirect } from "next/navigation";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

// 1. 定义表单验证模式
const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    error: "请选择一个客户",
  }),
  amount: z.coerce.number().gt(0, {
    error: "请输入大于0的金额",
  }),
  status: z.enum(["pending", "paid"], {
    error: "请选择一个发票状态",
  }),
  date: z.string(),
});

// 定义创建发票的验证模式，id 是数据库自动生成的，不需要用户输入；date 下面的函数生成的
const CreateInvoice = FormSchema.omit({ id: true, date: true });

// 使用 Zod 声明预期类型模式
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

// 定义状态类型，用于处理创建发票和更新发票的操作结果
export type State = {
  ok?: boolean;
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

export async function createInvoice(prevState: State, data: FormData) {
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
  prevState: State,
  formData: FormData,
) {
  // 使用 Zod 安全校验表单字段
  const validatedFields = UpdateInvoice.safeParse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });

  if (!validatedFields.success) {
    return {
      ok: false,
      // 🚀 Zod 4 最新最佳实践：顶层函数式提取 fieldErrors
      errors: z.flattenError(validatedFields.error).fieldErrors,
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
  await sql`DELETE FROM  invoices WHERE id = ${id}`;
  revalidatePath("/dashboard/invoices");
}
