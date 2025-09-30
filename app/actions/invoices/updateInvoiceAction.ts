"use server";
import { prisma } from "@/app/lib/prisma";
import { action } from "@/app/lib/safe-actions";
import { InvoiceSchema } from "../../validations/schemas";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const UpdateInvoice = InvoiceSchema;

export const updateInvoice = action
  .inputSchema(UpdateInvoice)
  .action(async ({ parsedInput }) => {
    const { id, customerId, status, productIds = [] } = parsedInput;

    try {
      const options = await prisma.product.findMany({
        where: {
          id: { in: productIds },
          OR: [{ invoice_id: null }, { invoice_id: id }],
        },
        select: { id: true },
      });

      const finalIds = options.map((p) => p.id);

      await prisma.invoice.update({
        where: { id },
        data: {
          customer_id: customerId,
          status,
          products: { set: finalIds.map((pid) => ({ id: pid })) },
        },
      });
    } catch (e) {
      console.error("updateInvoice error:", e);
      return { message: "Database Error: Failed to Update Invoice." };
    }
    revalidatePath("/dashboard/invoices");
    redirect("/dashboard/invoices");
  });