import { PrismaClient } from "generated";

export const prisma = new PrismaClient()

declare global {
  interface BigInt {
    toJSON(): Number;
  }
}
BigInt.prototype.toJSON = function () {
  return Number(this);
};