import { prisma } from "@/app/lib/prisma";
import { action } from "@/app/lib/safe-actions";
import { InvoiceSchema } from "@/app/lib/schemas";

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