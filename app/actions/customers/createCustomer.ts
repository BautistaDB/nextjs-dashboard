"use server";

import { prisma } from "@/app/lib/prisma";
import { action } from "@/app/lib/safe-actions";
import { CustomerSchema } from "@/app/lib/schemas";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const CreateCustomer = CustomerSchema.omit({id:true});

export const createCustomer = action
  .inputSchema(CreateCustomer)
  .action(async ({ parsedInput }) => {
    const { name, email, image_url } = parsedInput;

    try {
      await prisma.customer.create({
        data: {
          name,
          email,
          image_url: image_url ? image_url.startsWith("/customers/") ? image_url : `/customers/${image_url}` : "/customers/default.png",
        },
      });
    } catch (error) {
      console.error(error);
      return {
        message: "Error en la base de datos. No se pudo crear el cliente.",
      };
    }

    revalidatePath("/dashboard/customers");
    redirect("/dashboard/customers");
  });
