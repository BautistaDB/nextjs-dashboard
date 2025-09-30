"use server";

import { prisma } from "@/app/lib/prisma";
import { action } from "@/app/lib/safe-actions";
import { CustomerSchema } from "@/app/lib/schemas";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const UpdateCustomer = CustomerSchema;

export const updateCustomer = action
  .inputSchema(UpdateCustomer)
  .action(async ({ parsedInput }) => {
    const { id, name, email, image_url } = parsedInput;

    try {
      await prisma.customer.update({
        where: { id },
        data: {
          name,
          email,
          image_url: image_url ? image_url.startsWith("/customers/") ? image_url : `/customers/${image_url}` : "/customers/default.png",
        },
      });
    } catch (e) {
      console.error(e);
      throw new Error("Failed to update customer");
    }

    revalidatePath("/dashboard/customers");
    redirect("/dashboard/customers");
  });