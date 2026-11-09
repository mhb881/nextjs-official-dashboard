"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import postgres from "postgres";
import { redirect } from "next/navigation";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

// 1. 定义表单验证模式
const FormSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce.number(),
  status: z.enum(["pending", "paid"]),
  date: z.string(),
});

// 定义创建发票的验证模式，id 是数据库自动生成的，不需要用户输入；date 下面的函数生成的
const CreateInvoice = FormSchema.omit({ id: true, date: true });
// 使用 Zod 声明预期类型模式
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

export async function createInvoice(data: FormData) {
  // 3. 验证表单数据
  const { customerId, amount, status } = CreateInvoice.parse({
    customerId: data.get("customerId"),
    amount: data.get("amount"),
    status: data.get("status"),
  });
  // 4. 转换金额为分
  const amountInCents = amount * 100;
  // 5. 生成当前日期
  const date = new Date().toISOString().split("T")[0];

  try {
    // 6. 插入发票数据
    await sql`
    INSERT INTO invoices (customer_id, amount, status, date)
    VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
  `;
  } catch (error) {
    console.error(error);
    return { message: "Database error: Failed to create invoice." };
  }

  // 7. 重新验证发票列表，确保显示最新的发票
  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}

export async function updateInvoice(id: string, formData: FormData) {
  // 先拿数据
  const { customerId, amount, status } = UpdateInvoice.parse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });

  const amountInCents = amount * 100;

  try {
    await sql`
    UPDATE invoices
    SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
    WHERE id = ${id}
  `;
  } catch (error) {
    console.error(error);
    return { message: "Database error: Failed to update invoice." };
  }

  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}

export async function deleteInvoice(id: string) {
  throw new Error("Failed to Delete Invoice");
  await sql`DELETE FROM  invoices WHERE id = ${id}`;
  revalidatePath("/dashboard/invoices");
}
