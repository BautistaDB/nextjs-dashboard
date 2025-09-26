// app/api/invoices/[invoiceId]/products/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

// TODO - Pasar route a una action

export async function GET(
  _req: Request,
  context: { params: Promise<{ invoiceId: string }> }
) {
  const { invoiceId } = await context.params;

  try {
    const products = await prisma.product.findMany({
      where: { invoice_id: invoiceId },
      select: { id: true, name: true, price: true },
    });

    const totalAmount = products.reduce(
      (acc, product) => acc + product.price,
      BigInt(0)
    );

    return NextResponse.json({ ok: true, products, totalAmount });
  } catch (err) {
    console.error("[GET /products] error:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to load products" },
      { status: 500 }
    );
  }
}
