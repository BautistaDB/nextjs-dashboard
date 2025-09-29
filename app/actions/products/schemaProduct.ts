import { z } from "zod";

export const ProductSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, { message: "El nombre es obligatorio" }),
  description: z.string().optional().transform((v) => (v?.trim() ? v : null)),
  price: z.bigint()
    .gt(BigInt(0), { message: "Por favor, ingrese un monto maoyr a $0" }),
});
