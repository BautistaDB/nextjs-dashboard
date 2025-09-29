import { prisma } from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deleteProduct(id: string) {
  await prisma.product.delete({
    where: { id },
  });
  revalidatePath("/dashboard/products");
}