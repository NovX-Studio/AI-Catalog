import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { headers } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message, history } = await request.json();

    const products = await db.product.findMany({
      include: { category: true },
    });

    const sales = await db.sale.findMany({
      include: { product: true },
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);
    const totalCost = sales.reduce((sum, s) => {
      const product = products.find(p => p.id === s.productId);
      return sum + (product ? product.costPrice * s.quantity : 0);
    }, 0);
    const totalProfit = totalRevenue - totalCost;
    const totalUnitsSold = sales.reduce((sum, s) => sum + s.quantity, 0);

    const lowStockProducts = products.filter(p => p.stock > 0 && p.stock <= 5);
    const outOfStockProducts = products.filter(p => p.stock === 0);

    const contextData = {
      summary: {
        totalProducts: products.length,
        totalRevenue: totalRevenue.toFixed(2),
        totalCost: totalCost.toFixed(2),
        totalProfit: totalProfit.toFixed(2),
        totalUnitsSold,
        lowStockProducts: lowStockProducts.map(p => ({ name: p.name, stock: p.stock })),
        outOfStockProducts: outOfStockProducts.map(p => p.name),
      },
      products: products.map(p => ({
        name: p.name,
        brand: p.brand,
        category: p.category.name,
        price: p.price,
        costPrice: p.costPrice,
        stock: p.stock,
        margin: ((p.price - p.costPrice) / p.price * 100).toFixed(1) + "%",
      })),
      recentSales: sales.slice(0, 50).map(s => ({
        product: s.product.name,
        quantity: s.quantity,
        unitPrice: s.unitPrice,
        total: s.total,
        date: s.createdAt.toISOString().split("T")[0],
      })),
    };

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const systemInstructionText = `You are an intelligent business analytics assistant for an electronics store. You have access to the following real-time business data:

${JSON.stringify(contextData, null, 2)}

Your capabilities:
- Answer questions about sales performance, revenue, costs, and profit margins
- Identify best-selling and worst-selling products
- Alert about low stock or out-of-stock products
- Provide insights about which categories perform best
- Calculate profit margins per product
- Suggest which products to restock
- Compare product performance over time
- Give business recommendations based on the data

Rules:
- Always base your answers on the actual data provided above
- Be concise but insightful
- Use numbers and percentages when relevant
- If asked something not covered by the data, say so honestly
- Respond in the same language the user writes in
- Format numbers as currency when talking about money (use $)`;

    const chat = model.startChat({
      history: history.map((msg: any) => ({
        role: msg.role,
        parts: [{ text: msg.text }],
      })),
      systemInstruction: { role: "system", parts: [{ text: systemInstructionText }] },
    });

    const result = await chat.sendMessage(message);
    const reply = result.response.text();

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Admin chat error:", error);
    return NextResponse.json(
      { error: "Failed to get AI response" },
      { status: 500 }
    );
  }
}
