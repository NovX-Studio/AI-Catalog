import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { geminiModel } from "@/lib/gemini";

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

    const systemInstruction = `You are a knowledgeable and friendly sales assistant for an electronics store. You are an expert in technology products. Here is the complete product catalog with full specifications:

${JSON.stringify(catalogContext, null, 2)}

Your capabilities:
- Answer questions about product availability and stock
- Compare products against each other using their real specifications (e.g., "Is the HyperX better than the Logitech?")
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

    const chat = geminiModel.startChat({
      systemInstruction: { role: "system", parts: [{ text: systemInstruction }] },
      history: history.map((msg) => ({
        role: msg.role,
        parts: [{ text: msg.text }],
      })),
    });

    const result = await chat.sendMessage(message);
    const reply = result.response.text();

    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json(
      { error: "Failed to process chat message" },
      { status: 500 }
    );
  }
}
