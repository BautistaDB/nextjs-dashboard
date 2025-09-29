"use server";
import { prisma } from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deleteCustomer(id: string) {
  await prisma.customer.delete({
    where: { id },
  });
  revalidatePath("/dashboard/customers");
}