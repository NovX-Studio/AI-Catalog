import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface ChatMessage {
  role: "user" | "model";
  text: string;
}

export async function POST(req: NextRequest) {
  try {
    const { message, history } = (await req.json()) as {
      message: string;
      history: ChatMessage[];
    };

    if (!message?.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const products = await db.product.findMany({
      where: { available: true },
      include: { category: true },
    });

    const totalProducts = products.length;
    const inStock = products.filter(p => p.stock > 0).length;
    const outOfStock = products.filter(p => p.stock === 0).length;
    const totalValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);

    const catalogContext = products.map((p) => {
      let specs = {};
      try { specs = JSON.parse(p.specs); } catch {}
      return {
        name: p.name,
        brand: p.brand,
        category: p.category.name,
        description: p.description,
        price: p.price,
        stock: p.stock,
        specifications: specs,
      };
    });

    const systemInstruction = `You are a knowledgeable and friendly sales assistant for an electronics store. You are an expert in technology products.

CATALOG STATISTICS:
- Total products: ${totalProducts}
- In stock: ${inStock}
- Out of stock: ${outOfStock}
- Total catalog value: $${totalValue.toFixed(2)}

Here is the complete product catalog with full specifications:

${JSON.stringify(catalogContext, null, 2)}

Your capabilities:
- Answer questions about product availability and stock
- Compare products against each other using their real specifications
- Recommend products based on customer needs and budget
- Explain technical specifications in simple terms
- Suggest alternatives if a product is out of stock
- Help customers find the right product for their use case (gaming, office, streaming, etc.)

Rules:
- ONLY answer based on products that exist in the catalog above
- When comparing products, use the actual specs
- If a product is out of stock, suggest similar alternatives that ARE in stock
- Be enthusiastic but honest — don't oversell
- Respond in the same language the customer uses
- Keep answers concise but helpful
- If asked about a product not in the catalog, say you don't carry it but suggest what you do have in that category`;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const chat = model.startChat({
      systemInstruction: { role: "system", parts: [{ text: systemInstruction }] },
      history: history.map((msg) => ({
        role: msg.role,
        parts: [{ text: msg.text }],
      })),
    });

    const result = await chat.sendMessage(message);
    const reply = result.response.text();

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: "Failed to process chat message" },
      { status: 500 }
    );
  }
}
