"use server"
import { prisma } from "@/app/lib/prisma";
import { action } from "@/app/lib/safe-actions";
import { revalidatePath } from "next/cache";
import { ProductSchema } from "../../validations/schemas";
import { redirect } from "next/navigation";

const CreateProduct = ProductSchema.omit({id:true});

export const createProduct = action
  .inputSchema(CreateProduct)
  .action(async ({ parsedInput }) => {
    const { name, description, price } = parsedInput;

  try {
    await prisma.product.create({
      data: {
        name,
        description,
        price,
      },
    });
  } catch (error) {
    console.error(error);
    return {
      message: "Error en la base de datos. No se pudo crear el cliente.",
    };
  }

  revalidatePath("/dashboard/products");
  redirect("/dashboard/products");
});