"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { PrismaClient } from "generated";

const prisma = new PrismaClient();

/* --------------  SCHEMAS ---------------- */

const InvoiceSchema = z.object({
  customerId: z.string().min(1),
  productIds: z
    .array(z.string().min(1))
    .min(1, { message: "Selecciona por lo menos un vehículo" }),
  status: z.enum(["pending", "paid"]),
});

const CustomerSchema = z.object({
  name: z.string().min(1, { message: "El nombre es obligatorio" }),
  email: z.string().email({ message: "Por favor, ingrese un email válido" }),
  image_url: z.string().min(1, { message: "La imagen es obligatoria" }),
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

const CreateInvoice = InvoiceSchema;

export async function createInvoice(
  prevState: InvoicesState,
  formData: FormData
) {
  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get("customerId"),
    productIds: formData.getAll("productIds"),
    status: formData.get("status"),
  });
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Create Invoice.",
    };
  }

  const { customerId, productIds, status } = validatedFields.data;

  try {
    const invoice = await prisma.invoice.create({
      data: {
        customer_id: customerId,
        status,
        date: new Date(),
        products: {
          connect: productIds.map((id) => ({
            id,
            // AND: {
            //   invoice_id: null,
            // },
          })),
        },
      },
      select: { id: true },
    });
  } catch (error) {
    console.error(error);
  }

  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}

const UpdateInvoice = InvoiceSchema;

export async function updateInvoice(
  id: string,
  prevState: InvoicesState,
  formData: FormData
) {
  const validatedFields = UpdateInvoice.safeParse({
    customerId: formData.get("customerId"),
    productIds: formData.getAll?.("productIds") ?? [],
    status: formData.get("status"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Update Invoice.",
    };
  }

  const { customerId, status } = validatedFields.data;

  try {
    await prisma.invoice.update({
      where: { id },
      data: {
        customer_id: customerId,
        status,
      },
    });
  } catch (error) {
    return { message: "Database Error: Failed to Update Invoice." };
  }

  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}

export async function deleteInvoice(id: string) {
  await prisma.invoice.delete({
    where: { id },
  });
  revalidatePath("/dashboard/invoices");
}

/* --------------  CUSTOMERS ---------------- */

const CreateCustomer = CustomerSchema;

export async function createCustomer(
  prevState: CustomerState,
  formData: FormData
) {
  const file = formData.get("image_url") as File | null;
  const image_url = file?.size ? `/customers/${file.name}` : null;

  const validatedFields = CreateCustomer.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    image_url,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Faltan campos. No se pudo crear el cliente.",
    };
  }

  const { name, email } = validatedFields.data;

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
}

const UpdateCustomer = CustomerSchema;

export async function updateCustomer(
  id: string,
  prevState: CustomerState,
  formData: FormData
) {
  const file = formData.get("image_url") as File | null;
  const image_url = file?.size ? `/customers/${file.name}` : null;

  const validatedFields = UpdateCustomer.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    image_url,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Create Invoice.",
    };
  }

  const { name, email } = validatedFields.data;

  try {
    await prisma.customer.update({
      where: { id },
      data: {
        name,
        email,
        image_url,
      },
    });
  } catch (error) {
    console.error(error);
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
