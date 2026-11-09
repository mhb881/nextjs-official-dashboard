import Form from "~/ui/invoices/edit-form";
import Breadcrumbs from "~/ui/invoices/breadcrumbs";
import { fetchCustomers, fetchInvoiceById } from "~/lib/data";
import { notFound } from "next/navigation";

/*
更新发票需要以下步骤：
1. 创建一个包含 invoice `id` 的动态路由段。
2. 从页面参数（page params）中读取 invoice `id`。
3. 从数据库中获取指定的发票。
4. 用发票数据预填充表单。
5. 更新数据库中的发票数据。
 */
export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params; // 这个是动态路由段参数
  const id = params.id;

  // 从数据库中获取发票和客户列表
  const [invoice, customers] = await Promise.all([
    fetchInvoiceById(id),
    fetchCustomers(),
  ]);

  if (!invoice) {
    notFound();
  }

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: "Invoices", href: "/dashboard/invoices" },
          {
            label: "Edit Invoice",
            href: `/dashboard/invoices/${id}/edit`,
            active: true,
          },
        ]}
      />
      {/* 用发票数据预填充表单 */}
      <Form invoice={invoice} customers={customers} />
    </main>
  );
}
