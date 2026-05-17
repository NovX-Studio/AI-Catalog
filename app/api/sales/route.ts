import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET() {
  try {
    const sales = await db.sale.findMany({
      include: { product: { include: { category: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(sales);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch sales" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { productId, quantity, unitPrice } = body;

    if (!productId || !quantity || quantity < 1) {
      return NextResponse.json({ error: "Invalid sale data" }, { status: 400 });
    }

    const product = await db.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (quantity > product.stock) {
      return NextResponse.json(
        { error: `Insufficient stock. Available: ${product.stock}` },
        { status: 400 }
      );
    }

    const total = quantity * unitPrice;

    const [sale] = await db.$transaction([
      db.sale.create({
        data: { productId, quantity, unitPrice, total },
      }),
      db.product.update({
        where: { id: productId },
        data: { stock: { decrement: quantity } },
      }),
    ]);

    return NextResponse.json(sale, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create sale" },
      { status: 500 }
    );
  }
}
