import { z } from "zod";

export const CustomerSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, { message: "El nombre es obligatorio" }),
  email: z.string().email({ message: "Por favor, ingrese un email válido" }),
  image_url: z
    .string()
    .min(1, { message: "La imagen es obligatoria" })
    .nullable(),
});