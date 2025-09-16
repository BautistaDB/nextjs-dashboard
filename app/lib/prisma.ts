import { PrismaClient } from "generated";
import { ProductStatus } from "./definitions";
import { array } from "zod";

export const prisma = new PrismaClient().$extends({
  result: {
    product: {
      price: {
        compute: ({ price }) => parseInt(price.toString()),
      },
      status: {
        needs: {"invoice_id": true},
        compute: ({invoice_id}) =>
          (invoice_id === null ? "Available" : "Sold") satisfies ProductStatus,
      },
    },
  },
});
