"use server"

import { RevenueTable } from "@/app/lib/definitions";
import { prisma } from "@/app/lib/prisma";
import { formatPriceFromCents } from "@/app/lib/utils";

const MONTHS = Array.from({ length: 12 }, (_, i) =>
  new Date(0, i).toLocaleString("en-US", { month: "short" }).toUpperCase()
) 

export async function fetchRevenueForChart(): Promise<RevenueTable[]> {
  const paid = await prisma.invoice.findMany({
    where: { status: "paid" },
    select: {
      date: true,
      products: { select: { price: true } },
    },
  });

  const acc: Record<string, number> = Object.fromEntries(
    MONTHS.map((m) => [m, 0])
  );

  for (const inv of paid) {
    const d = new Date(inv.date);
    const code = MONTHS[d.getUTCMonth()];
    const total = inv.products.reduce((s, p) => s + Number(p.price), 0);
    acc[code] += total;
  }

  return MONTHS.map((m) => ({ month: m, revenue: acc[m] }));
}

export async function fetchLatestInvoices() {
  try {
    const data = await prisma.invoice.findMany({
      take: 5,
      orderBy: { date: "desc" },
      select: {
        id: true,
        customer: {
          select: { name: true, image_url: true, email: true },
        },
        products: { select: { price: true } },
      },
    });

    const latestInvoices = data.map((invoice) => {
      const total =
        invoice.products.reduce((sum, p) => sum + Number(p.price), 0) ?? 0;

      return {
        id: invoice.id,
        amount: formatPriceFromCents(total),
        name: invoice.customer.name,
        image_url: invoice.customer.image_url ?? "/customers/default.png",
        email: invoice.customer.email,
      };
    });

    return latestInvoices;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch the latest invoices.");
  }
}

export async function fetchCardData() {
  try {
    const invoiceCountPromise = prisma.invoice.count();
    const customerCountPromise = prisma.customer.count();

    const paidInvoicesPromise = prisma.invoice.findMany({
      where: { status: "paid" },
      select: { products: { select: { price: true } } },
    });

    const pendingInvoicesPromise = prisma.invoice.findMany({
      where: { status: "pending" },
      select: { products: { select: { price: true } } },
    });

    const [numberOfInvoices, numberOfCustomers, paidList, pendingList] =
      await Promise.all([
        invoiceCountPromise,
        customerCountPromise,
        paidInvoicesPromise,
        pendingInvoicesPromise,
      ]);

    const sumProducts = (invoices: { products: { price: any }[] }[]) =>
      invoices.reduce(
        (acc, inv) =>
          acc + inv.products.reduce((s, p) => s + Number(p.price), 0),
        0
      );

    return {
      numberOfInvoices,
      numberOfCustomers,
      totalPaidInvoices: formatPriceFromCents(sumProducts(paidList)),
      totalPendingInvoices: formatPriceFromCents(sumProducts(pendingList)),
    };
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch card data.");
  }
}
