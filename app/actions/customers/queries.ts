"use server"

import { prisma } from "@/app/lib/prisma";
import { action } from "@/app/lib/safe-actions";
import { CustomerSchema } from "@/app/lib/schemas";
import { Invoice } from "@/generated";

export async function fetchCustomers() {
  try {
    const customers = await prisma.customer.findMany({
      select: { id: true, name: true, email: true, image_url: true },
      orderBy: { name: "asc" },
    });

    return customers;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch all customers.");
  }
}

export async function fetchFilteredCustomers(query: string) {
  try {
    const customers = await prisma.customer.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        image_url: true,
        _count: { select: { invoices: true } },
      },
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
        ],
      },
      orderBy: { name: "asc" },
    });

    const invoices = await prisma.invoice.findMany({
      where: { customer_id: { in: customers.map((c) => c.id) } },
      include: { products: true },
    });

    type Total = { [Status in Invoice["status"]]?: number };
    const totals: Record<string, Total> = {};

    invoices.forEach((invoice) => {
      const amount = invoice.products.reduce(
        (sum, p) => sum + Number(p.price),
        0
      );
      if (!totals[invoice.customer_id]) totals[invoice.customer_id] = {};
      totals[invoice.customer_id][invoice.status] =
        (totals[invoice.customer_id][invoice.status] ?? 0) + amount;
    });

    return customers.map((customer) => ({
      ...customer,
      image_url: customer.image_url ?? "/customers/default.png",
      total: totals[customer.id] ?? {},
    }));
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch customer table.");
  }
}

export const fetchCustomerById = action
  .inputSchema(CustomerSchema.shape.id)
  .action(async ({ parsedInput: id }) => {
    const customer = await prisma.customer.findUniqueOrThrow({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        image_url: true,
      },
    });

    return {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      image_url: customer.image_url,
    };
  });