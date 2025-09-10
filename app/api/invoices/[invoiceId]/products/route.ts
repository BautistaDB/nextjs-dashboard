// app/api/invoices/[invoiceId]/products/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "generated"; // ajusta este import a tu proyecto

const prisma = new PrismaClient();

export async function GET(
  _req: Request,
  { params }: { params: { invoiceId: string } }
) {
  const { invoiceId } = params;

  try {
    const products = await prisma.product.findMany({
      where: { invoice_id: invoiceId },
      select: { id: true, name: true, price: true },    
    });

    const totalAmount = products.reduce((acc, product) => acc + Number(product.price), 0);

    return NextResponse.json({ ok: true, products, totalAmount });
  } catch (err) {
    console.error("[GET /products] error:", err);
    return NextResponse.json({ ok: false, error: "Failed to load products" }, { status: 500 });
  }
}
