"use server";
import { prisma } from "@/app/lib/prisma";
import { action } from "@/app/lib/safe-actions";
import { InvoiceSchema } from "../../validations/schemas";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const CreateInvoice = InvoiceSchema.omit({ id: true });

export const createInvoice = action
  .inputSchema(CreateInvoice)
  .action(async ({ parsedInput }) => {
    const { customerId, productIds, status } = parsedInput;

    try {
      const invoice = await prisma.invoice.create({
        data: {
          customer_id: customerId,
          status,
          date: new Date(),
          products: {
            connect: productIds.map((id) => ({
              id,
            })),
          },
        },
        select: { id: true },
      });
    } catch (error) {
      console.error(error);
      throw new Error("Ocurrió un error inesperado, contacte a administración");
    }
    revalidatePath("/dashboard/invoices");
    redirect("/dashboard/invoices");
  });