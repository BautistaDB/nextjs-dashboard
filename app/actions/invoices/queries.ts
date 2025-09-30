"use server"

import { prisma } from "@/app/lib/prisma";
import { InvoiceStatus } from "@/generated";

const ITEMS_PER_PAGE = 6;

export async function fetchFilteredInvoices(
  query: string,
  currentPage: number
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const invoices = await prisma.invoice.findMany({
      select: {
        id: true,
        date: true,
        status: true,
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            image_url: true,
          },
        },
        products: {
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
          },
        },
      },
      where: {
        OR: [
          {
            customer: {
              OR: [
                { name: { contains: query, mode: "insensitive" } },
                { email: { contains: query, mode: "insensitive" } },
              ],
            },
          },
          {
            status:
              (query?.toLowerCase?.() ?? "") in InvoiceStatus
                ? { equals: query.toLowerCase() as InvoiceStatus }
                : undefined,
          },
        ],
      },
      orderBy: { date: "desc" },
      take: ITEMS_PER_PAGE,
      skip: offset,
    });

    const invoicesWithAmount = invoices.map((invoice) => {
      const products = invoice.products.map((product) => ({
        ...product,
        price: Number(product.price),
      }));

      const amount = products.reduce((sum, product) => sum + product.price, 0);

      return {
        ...invoice,
        customer: {
          ...invoice.customer,
          image_url: invoice.customer.image_url ?? "/customers/default.png",
        },
        products,
        amount,
      };
    });

    return invoicesWithAmount;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch invoices.");
  }
}

export async function fetchInvoiceById(id: string) {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      select: {
        id: true,
        customer_id: true,
        status: true,
        products: { select: { price: true } },
      },
    });

    if (!invoice) return null;

    const total =
      invoice.products?.reduce((s, p) => s + Number(p.price), 0) ?? 0;

    return {
      id: invoice.id,
      customer_id: invoice.customer_id,
      status: invoice.status,
      total,
    };
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch invoice.");
  }
}

export async function fetchInvoiceEditData(invoiceId: string) {
  const [invoice, products] = await Promise.all([
    prisma.invoice.findUnique({
      where: { id: invoiceId },
      select: {
        id: true,
        customer_id: true,
        status: true,
        date: true,
      },
    }),
    prisma.product.findMany({
      where: {
        OR: [
          {
            invoice_id: null,
          },
          {
            invoice_id: invoiceId,
          },
        ],
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        invoice_id: true,
      },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!invoice) return null;

  return {
    invoice,
    products,
  };
}

export async function fetchInvoicesPages(query: string) {
  try {
    const data = await prisma.invoice.count({
      where: {
        OR: [
          {
            customer: {
              OR: [
                { name: { contains: query, mode: "insensitive" } },
                { email: { contains: query, mode: "insensitive" } },
              ],
            },
          },
          {
            status:
              (query?.toLowerCase?.() ?? "") in InvoiceStatus
                ? { equals: query.toLowerCase() as InvoiceStatus }
                : undefined,
          },
        ],
      },
    });

    const totalPages = Math.ceil(Number(data) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch total number of invoices.");
  }
}
