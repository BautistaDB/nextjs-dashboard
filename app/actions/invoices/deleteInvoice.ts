"use server";

import { prisma } from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deleteInvoice(id: string) {
  await prisma.invoice.delete({
    where: { id },
  });
  revalidatePath("/dashboard/invoices");
}
