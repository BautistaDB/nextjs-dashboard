"use server"

import { prisma } from "@/app/lib/prisma";
import { action } from "@/app/lib/safe-actions";
import { revalidatePath } from "next/cache";
import { ProductSchema } from "@/app/lib/schemas";
import { redirect } from "next/navigation";

const UpdateProduct = ProductSchema;

export const updateProduct = action
  .inputSchema(UpdateProduct)
  .action(async ({ parsedInput }) => {
    const { id, name, description, price } = parsedInput;

  try {
    await prisma.product.update({
      where: { id },
      data: {
        name,
        description: description ?? null,
        price,
      },
    });
  } catch (error) {
    console.error(error);
    return { message: "Error en la base de datos. No se pudo actualizar." };
  }
  revalidatePath("/dashboard/products");
  redirect("/dashboard/products");
});
