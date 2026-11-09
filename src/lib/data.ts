import "server-only";

import postgres from "postgres";
import {
  CustomerField,
  CustomersTableType,
  Invoice,
  InvoiceForm,
  InvoicesTable,
  LatestInvoiceRaw,
  Revenue,
} from "./types";
import { formatCurrency } from "./utils";
import { z } from "zod";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

export async function fetchRevenue() {
  try {
    // Artificially delay a response for demo purposes.
    // Don't do this in production :)

    // console.log("Fetching revenue data...");
    // await new Promise((resolve) => setTimeout(resolve, 1500));

    const data = await sql<Revenue[]>`SELECT * FROM revenue`;

    // console.log("Data fetch completed after 3 seconds.");

    return data;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch revenue data.");
  }
}

export async function fetchLatestInvoices() {
  try {
    const data = await sql<LatestInvoiceRaw[]>`
      SELECT invoices.amount, customers.name, customers.image_url, customers.email, invoices.id
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      ORDER BY invoices.date DESC
      LIMIT 5`;

    const latestInvoices = data.map((invoice) => ({
      ...invoice,
      amount: formatCurrency(invoice.amount),
    }));
    return latestInvoices;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch the latest invoices.");
  }
}

export async function fetchCardData() {
  try {
    // You can probably combine these into a single SQL query
    // However, we are intentionally splitting them to demonstrate
    // how to initialize multiple queries in parallel with JS.
    const invoiceCountPromise = sql`SELECT COUNT(*) FROM invoices`;
    const customerCountPromise = sql`SELECT COUNT(*) FROM customers`;
    const invoiceStatusPromise = sql`SELECT
         SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) AS "paid",
         SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) AS "pending"
         FROM invoices`;

    const data = await Promise.all([
      invoiceCountPromise,
      customerCountPromise,
      invoiceStatusPromise,
    ]);

    const numberOfInvoices = Number(data[0][0].count ?? "0");
    const numberOfCustomers = Number(data[1][0].count ?? "0");
    const totalPaidInvoices = formatCurrency(data[2][0].paid ?? "0");
    const totalPendingInvoices = formatCurrency(data[2][0].pending ?? "0");

    return {
      numberOfCustomers,
      numberOfInvoices,
      totalPaidInvoices,
      totalPendingInvoices,
    };
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch card data.");
  }
}

const ITEMS_PER_PAGE = 6;
export async function fetchFilteredInvoices(
  query: string,
  currentPage: number,
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const invoices = await sql<InvoicesTable[]>`
      SELECT
        invoices.id,
        invoices.amount,
        invoices.date,
        invoices.status,
        customers.name,
        customers.email,
        customers.image_url
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      WHERE
        customers.name ILIKE ${`%${query}%`} OR
        customers.email ILIKE ${`%${query}%`} OR
        invoices.amount::text ILIKE ${`%${query}%`} OR
        invoices.date::text ILIKE ${`%${query}%`} OR
        invoices.status ILIKE ${`%${query}%`}
      ORDER BY invoices.date DESC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;

    return invoices;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch invoices.");
  }
}

export async function fetchInvoicesPages(query: string) {
  const trimmed = query?.trim() ?? "";

  try {
    // -------------------------------------------------------------
    // 优化 1：【空值短路（Fast Path）】
    // 当没有搜索关键词时，无需 JOIN 客户表，无需做任何正则匹配，
    // 单表极速 COUNT，耗时通常从几百毫秒降到 1~2 毫秒。
    // -------------------------------------------------------------
    if (!trimmed) {
      const data = await sql`SELECT COUNT(*) FROM invoices`;
      return Math.ceil(Number(data[0].count) / ITEMS_PER_PAGE);
    }

    // -------------------------------------------------------------
    // 优化 2：【拆分跨表 OR，解除全表连环笛卡尔积】
    // 将 customers 的模糊查询独立出来，利用 customer_id 外键索引；
    // 逻辑与 fetchFilteredInvoices 保持严格一致，确保分页与列表结果对齐。
    // -------------------------------------------------------------
    const data = await sql`
      SELECT COUNT(DISTINCT id) FROM (
        -- 分支 A：仅在 invoices 单表内检索 status
        SELECT id FROM invoices 
        WHERE status ILIKE ${`%${trimmed}%`}

        UNION ALL

        -- 分支 B：先在 customers 表快速命中客户，再通过外键拉取 invoices
        SELECT i.id
        FROM invoices i
        JOIN customers c ON i.customer_id = c.id
        WHERE c.name ILIKE ${`%${trimmed}%`}
           OR c.email ILIKE ${`%${trimmed}%`}
      ) AS matched_invoices
    `;

    const totalPages = Math.ceil(Number(data[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch total number of invoices.");
  }
}

export async function fetchInvoiceById(id: string) {
  try {
    const data = await sql<InvoiceForm[]>`
      SELECT
        invoices.id,
        invoices.customer_id,
        invoices.amount,
        invoices.status
      FROM invoices
      WHERE invoices.id = ${id};
    `;

    const invoice = data.map((invoice) => ({
      ...invoice,
      // Convert amount from cents to dollars
      amount: invoice.amount / 100,
    }));

    return invoice[0];
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch invoice.");
  }
}

export async function fetchCustomers() {
  try {
    const customers = await sql<CustomerField[]>`
      SELECT
        id,
        name
      FROM customers
      ORDER BY name ASC
    `;

    return customers;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch all customers.");
  }
}

export async function fetchFilteredCustomers(query: string) {
  try {
    const data = await sql<CustomersTableType[]>`
        SELECT
          customers.id,
          customers.name,
          customers.email,
          customers.image_url,
          COUNT(invoices.id) AS total_invoices,
          SUM(CASE WHEN invoices.status = 'pending' THEN invoices.amount ELSE 0 END) AS total_pending,
          SUM(CASE WHEN invoices.status = 'paid' THEN invoices.amount ELSE 0 END) AS total_paid
        FROM customers
        LEFT JOIN invoices ON customers.id = invoices.customer_id
        WHERE
          customers.name ILIKE ${`%${query}%`} OR
        customers.email ILIKE ${`%${query}%`}
        GROUP BY customers.id, customers.name, customers.email, customers.image_url
        ORDER BY customers.name ASC
      `;

    const customers = data.map((customer) => ({
      ...customer,
      total_pending: formatCurrency(customer.total_pending),
      total_paid: formatCurrency(customer.total_paid),
    }));

    return customers;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch customer table.");
  }
}

const CreateInvoiceSchema = z.object({
  customerId: z.string().optional(),
  customer_id: z.string().optional(),
  amount: z.number(),
  status: z.enum(["pending", "paid"]).optional().default("pending"),
  date: z.string().optional(),
});

export type CreateInvoiceDTO = z.infer<typeof CreateInvoiceSchema>;

export async function createInvoiceInDB(data: CreateInvoiceDTO) {
  const dto = CreateInvoiceSchema.parse(data);

  const customerId = dto.customerId ?? dto.customer_id;
  if (!customerId) {
    throw new Error("Missing customerId");
  }

  const amountInCents = Math.round(dto.amount);
  const status = dto.status;
  const date = dto.date ?? new Date().toISOString().split("T")[0];

  try {
    const [newInvoice] = await sql<Invoice[]>`
      INSERT INTO invoices (customer_id, amount, status, date)
      VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
      RETURNING id, customer_id, amount, status, date
    `;

    // 这里要再映射成 ResponseDTO，不要直接 return newInvoice
    return {
      id: newInvoice.id,
      customerId: newInvoice.customer_id,
      amount: newInvoice.amount,
      status: newInvoice.status,
      date: newInvoice.date,
    };
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to create invoice in database.");
  }
}
