import { z } from "zod";

// 定义表单验证模式
export const CreateInvoiceFormSchema = z.object({
  id: z.string(),
  customerId: z.string().min(1, {
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

//
export const LoginSchema = z.object({
  email: z.email("请输入有效的邮箱地址。"),
  password: z.string().min(5, "密码至少需要 5 个字符。"),
});
