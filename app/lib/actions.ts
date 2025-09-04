"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { PrismaClient } from "../../generated/prisma";

const prisma = new PrismaClient();

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: "Please select a customer.",
  }),
  amount: z.coerce
    .number()
    .gt(0, { message: "Please enter an amount greater than $0." }),
  status: z.enum(["pending", "paid"], {
    invalid_type_error: "Please select an invoice status.",
  }),
  date: z.string(),
});

const CustomerSchema = z.object({
  name: z.string().min(1, { message: "El nombre es obligatorio" }),
  email: z.string().email({ message: "Por favor, ingrese un email válido" }),
  image_url: z.string().min(1, { message: "La imagen es obligatoria" }),
});

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
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

const CreateCustomer = CustomerSchema.omit({});

export async function createCustomer(
  prevState: CustomerState,
  formData: FormData
) {
  // Tomamos el archivo
  const file = formData.get("image_url") as File | null;

  // Por ahora guardamos solo el nombre, o null si no hay archivo
const image_url = file ? `/customers/${file.name}` : "/customers/default.png";


  // Validamos con Zod (name, email obligatorios, image_url opcional)
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
    await prisma.customers.create({
      data: {
        name: name,
        email: email,
        image_url: image_url,
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

const UpdateCustomer = CreateCustomer.omit({});

export async function updateCustomer(
  id: string,
  prevState: CustomerState,
  formData: FormData
) {
  const validatedFields = UpdateCustomer.safeParse({
    customerId: formData.get("customerId"),
    name: formData.get("name"),
    email: formData.get("email"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Create Invoice.",
    };
  }

  const { name, email } = validatedFields.data;

  try {
    await prisma.customers.update({
      where:{id: id},
      data:{
        name: name,
        email: email,
      }
    })
  } catch (error) {
    console.error(error);
  }

  revalidatePath("/dashboard/customers");
  redirect("/dashboard/customers");
}
export async function deleteCustomer(id: string) {
  await prisma.customers.delete({
    where: {id: id}
  })
  revalidatePath("/dashboard/customers");
}

const CreateInvoice = FormSchema.omit({ id: true, date: true });

export async function createInvoice(
  prevState: InvoicesState,
  formData: FormData
) {
  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });
  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Create Invoice.",
    };
  }

  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split("T")[0];

  try {
    await prisma.invoices.create({
      data: {
        customer_id: customerId,
        amount: amountInCents,
        status: status,
        date: date,
      }
    })
  } catch (error) {
    console.error(error);
  }

  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}

const UpdateInvoice = FormSchema.omit({ id: true, date: true });

export async function updateInvoice(
  id: string,
  prevState: InvoicesState,
  formData: FormData
) {
  const validatedFields = UpdateInvoice.safeParse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Update Invoice.",
    };
  }

  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;

  try {
    await prisma.invoices.update({
      where: {id: id},
      data: {
        customer_id: customerId,
        amount: amountInCents,
        status: status,
      }
    })
  } catch (error) {
    return { message: "Database Error: Failed to Update Invoice." };
  }

  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}

export async function deleteInvoice(id: string) {
  await prisma.invoices.delete({
    where:{id: id}
  });
  revalidatePath("/dashboard/invoices");
}

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
