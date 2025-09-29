import { z } from "zod";

export const InvoiceSchema = z.object({
  id: z.string().uuid(),
  customerId: z.string().uuid(),
  productIds: z
    .array(z.string().uuid())
    .min(1, { message: "Selecciona por lo menos un vehículo" }),
  status: z.enum(["pending", "paid"]),
});