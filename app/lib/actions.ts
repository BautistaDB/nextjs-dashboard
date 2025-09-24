"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { prisma } from "./prisma";
import { action } from "./safe-actions";

/* --------------  SCHEMAS ---------------- */

const InvoiceSchema = z.object({
  id: z.string().uuid(),
  customerId: z.string().uuid(),
  productIds: z
    .array(z.string().uuid())
    .min(1, { message: "Selecciona por lo menos un vehículo" }),
  status: z.enum(["pending", "paid"]),
});

const CustomerSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, { message: "El nombre es obligatorio" }),
  email: z.string().email({ message: "Por favor, ingrese un email válido" }),
  image_url: z
    .string()
    .min(1, { message: "La imagen es obligatoria" })
    .nullable(),
});

const ProductSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, { message: "El nombre es obligatorio" }),
  description: z.string().optional().transform((v) => (v?.trim() ? v : null)),
  price: z.bigint()
    .gt(BigInt(0), { message: "Por favor, ingrese un monto maoyr a $0" }),
});

/* --------------  TYPES ---------------- */

export type CustomerState = {
  errors?: {
    name?: string[];
    email?: string[];
    image_url?: string[];
  };
  message?: string | null;
};

export type InvoicesState = {
  errors?: {
    customerId?: string[];
    productIds?: string[];
    status?: string[];
  };
  message?: string | null;
};

export type ProductsState = {
  errors?: {
    name?: string[];
    description?: string[];
    price?: string[];
  };
  message?: string | null;
};

/* --------------  INVOICES ---------------- */

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

export async function deleteInvoice(id: string) {
  await prisma.invoice.delete({
    where: { id },
  });
  revalidatePath("/dashboard/invoices");
}

/* --------------  CUSTOMERS ---------------- */

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

export async function deleteCustomer(id: string) {
  await prisma.customer.delete({
    where: { id },
  });
  revalidatePath("/dashboard/customers");
}

/* --------------  PRODUCTS ---------------- */

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

export async function deleteProduct(id: string) {
  await prisma.product.delete({
    where: { id },
  });
  revalidatePath("/dashboard/products");
}

/* --------------  AUTHENTICATE ---------------- */

export async function authenticate(
  prevState: string | undefined,
  formData: FormData
) {
  try {
    await signIn("credentials", formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Invalid credentials.";
        default:
          return "Something went wrong.";
      }
    }
    throw error;
  }
}
