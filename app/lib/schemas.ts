import { z } from "zod";

export const InvoiceSchema = z.object({
  id: z.string().uuid(),
  customerId: z.string().uuid(),
  productIds: z
    .array(z.string().uuid())
    .min(1, { message: "Selecciona por lo menos un vehículo" }),
  status: z.enum(["pending", "paid"]),
});

export const CustomerSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, { message: "El nombre es obligatorio" }),
  email: z.string().email({ message: "Por favor, ingrese un email válido" }),
  image_url: z
    .string()
    .min(1, { message: "La imagen es obligatoria" })
    .nullable(),
});

export const ProductSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, { message: "El nombre es obligatorio" }),
  description: z.string().optional().transform((v) => (v?.trim() ? v : null)),
  price: z.bigint()
    .gt(BigInt(0), { message: "Por favor, ingrese un monto maoyr a $0" }),
});

