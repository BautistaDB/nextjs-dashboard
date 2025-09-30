import { ProductFormat } from "@/app/lib/definitions";
import { prisma } from "@/app/lib/prisma";
import { action } from "@/app/lib/safe-actions";
import { InvoiceSchema } from "@/app/validations/schemas";

const ITEMS_PER_PAGE = 6;

export async function fetchFilteredProducts(
  query: string,
  currentPage: number
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    return await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        invoice_id: true,
      },
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
      },
      orderBy: { name: "asc" },
      take: ITEMS_PER_PAGE,
      skip: offset,
    });
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch invoices.");
  }
}

export async function fetchProductById(
  id: string
): Promise<ProductFormat | null> {
  return await prisma.product.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      invoice_id: true,
    },
  });
}

export async function fetchProducts(): Promise<ProductFormat[]> {
  const rows = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      invoice_id: true,
    },
    orderBy: { name: "asc" },
  });

  return rows.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    price:
      typeof p.price === "object" && p.price !== null && "toNumber" in p.price
        ? (p.price as any).toNumber()
        : Number(p.price),
    invoice_id: p.invoice_id,
  }));
}

export async function fetchProductsAvailable() {
  return await prisma.product.findMany({
    where: { invoice_id: null },
    select: {
      id: true,
      name: true,
      price: true,
      description: true,
      invoice_id: true,
    },
    orderBy: { name: "asc" },
  });
}

export async function fetchProductsPages(query: string) {
  try {
    const data = await prisma.product.count({
      where: {
        name: { contains: query, mode: "insensitive" },
      },
    });

    const totalPages = Math.ceil(Number(data) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch total number of invoices.");
  }
}

const GetProducts = InvoiceSchema.pick({ id: true });

export const getInvoiceProducts = action
  .inputSchema(GetProducts)
  .action(async ({ parsedInput }) => {
    const { id } = parsedInput;

    const products = await prisma.product.findMany({
      where: { invoice_id: id },
      select: {
        id: true,
        name: true,
        price: true,
        description: true,
        invoice_id: true,
      },
    });

    return {
      ok: true as const,
      products: products.map((p) => ({
        id: p.id,
        name: p.name,
        price: Number(p.price),
        description: p.description ?? null,
        invoice_id: p.invoice_id,
      })),
    };
  });
