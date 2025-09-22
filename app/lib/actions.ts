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
  name: z.string().min(1, { message: "El nombre es obligatorio" }),
  email: z.string().email({ message: "Por favor, ingrese un email válido" }),
  image_url: z
    .string()
    .min(1, { message: "La imagen es obligatoria" })
    .nullable(), // acepta null
});

const ProductSchema = z.object({
  name: z.string().min(1, { message: "El nombre es obligatorio" }),
  description: z.string().min(1, { message: "La descripcion es obligatoria" }),
  price: z.coerce
    .number()
    .gt(0, { message: "Por favor, ingrese un monto maoyr a $0" }),
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

const CreateCustomer = CustomerSchema;

// export async function createCustomer(
//   prevState: CustomerState,
//   formData: FormData
// ) {
//   const file = formData.get("image_url") as File | null;
//   const image_url = file?.size ? `/customers/${file.name}` : null;

//   const validatedFields = CreateCustomer.safeParse({
//     name: formData.get("name"),
//     email: formData.get("email"),
//     image_url,
//   });

//   if (!validatedFields.success) {
//     return {
//       errors: validatedFields.error.flatten().fieldErrors,
//       message: "Faltan campos. No se pudo crear el cliente.",
//     };
//   }

//   const { name, email } = validatedFields.data;
export const createCustomer = action
  .inputSchema(CreateCustomer)
  .action(async ({ parsedInput }) => {
    const { name, email, image_url } = parsedInput;

    try {
      await prisma.customer.create({
        data: {
          name,
          email,
          image_url,
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

export async function updateCustomer(
  id: string,
  prevState: CustomerState,
  formData: FormData
): Promise<CustomerState> {
  try {
    const name = String(formData.get("name") ?? "");
    const email = String(formData.get("email") ?? "");
    const imageFile = formData.get("image_url");

    const existingCustomer = await prisma.customer.findUnique({
      where: { id },
      select: { image_url: true },
    });

    if (!existingCustomer) {
      return { message: "Customer not found", errors: {} };
    }

    let imageUrl = existingCustomer.image_url; // valor por defecto

    if (imageFile && imageFile instanceof File && imageFile.size > 0) {
      const uploadedUrl = `/uploads/${imageFile.name}`;
      imageUrl = uploadedUrl;
    }

    await prisma.customer.update({
      where: { id },
      data: { name, email, image_url: imageUrl },
    });
  } catch (e) {
    console.error(e);
    return { message: "Failed to update customer", errors: {} };
  }

  revalidatePath("/dashboard/customers");
  redirect("/dashboard/customers");
}

export async function deleteCustomer(id: string) {
  await prisma.customer.delete({
    where: { id },
  });
  revalidatePath("/dashboard/customers");
}

/* --------------  PRODUCTS ---------------- */

const CreateProduct = ProductSchema;

export async function createProduct(
  prevState: ProductsState,
  formData: FormData
) {
  const validatedFields = CreateProduct.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    price: formData.get("price"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Faltan campos. No se pudo crear el cliente.",
    };
  }

  const { name, description, price } = validatedFields.data;

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
}

const UpdateProduct = ProductSchema;

export async function updateProduct(
  id: string,
  prevState: ProductsState,
  formData: FormData
) {
  const validated = UpdateProduct.safeParse({
    name: formData.get("name"),
    description: formData.get("description") ?? null,
    price: formData.get("price"),
  });

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      message: "Faltan o son inválidos algunos campos. No se pudo actualizar.",
    };
  }

  const { name, description, price } = validated.data;

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
}

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
