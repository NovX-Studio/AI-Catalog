import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const fromParam = searchParams.get("from");
    const toParam = searchParams.get("to");

    const fromDate = fromParam ? new Date(fromParam) : null;
    const toDate = toParam ? new Date(toParam + "T23:59:59") : null;

    const products = await db.product.findMany();
    const sales = await db.sale.findMany({
      include: { product: { include: { category: true } } },
      orderBy: { createdAt: "desc" },
    });

    const filteredSales = sales.filter((s) => {
      if (fromDate && s.createdAt < fromDate) return false;
      if (toDate && s.createdAt > toDate) return false;
      return true;
    });

    const totalRevenue = filteredSales.reduce((sum, s) => sum + s.total, 0);
    const totalCost = filteredSales.reduce((sum, s) => {
      const product = products.find(p => p.id === s.productId);
      return sum + (product ? product.costPrice * s.quantity : 0);
    }, 0);
    const totalProfit = totalRevenue - totalCost;
    const totalUnitsSold = filteredSales.reduce((sum, s) => sum + s.quantity, 0);

    const now = new Date();
    const dailyData: Record<string, { revenue: number; cost: number; profit: number }> = {};

    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      dailyData[key] = { revenue: 0, cost: 0, profit: 0 };
    }

    filteredSales.forEach((s) => {
      const dateKey = s.createdAt.toISOString().split("T")[0];
      if (dailyData[dateKey]) {
        const product = products.find(p => p.id === s.productId);
        const cost = product ? product.costPrice * s.quantity : 0;
        dailyData[dateKey].revenue += s.total;
        dailyData[dateKey].cost += cost;
        dailyData[dateKey].profit += s.total - cost;
      }
    });

    const dailyArray = Object.entries(dailyData).map(([date, data]) => ({
      date,
      revenue: Math.round(data.revenue * 100) / 100,
      cost: Math.round(data.cost * 100) / 100,
      profit: Math.round(data.profit * 100) / 100,
    }));

    const productSales: Record<string, number> = {};
    filteredSales.forEach((s) => {
      const name = s.product?.name ?? "Unknown";
      productSales[name] = (productSales[name] || 0) + s.quantity;
    });

    const topProducts = Object.entries(productSales)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, units]) => ({ name, units }));

    const categorySales: Record<string, number> = {};
    filteredSales.forEach((s) => {
      const catName = s.product?.category?.name ?? "Uncategorized";
      categorySales[catName] = (categorySales[catName] || 0) + s.total;
    });

    const categoryData = Object.entries(categorySales)
      .map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }));

    const monthlyData: Record<string, number> = {};
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
      monthlyData[key] = 0;
    }

    filteredSales.forEach((s) => {
      const key = s.createdAt.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
      if (monthlyData[key] !== undefined) {
        monthlyData[key] += s.total;
      }
    });

    const monthlyRevenue = Object.entries(monthlyData).map(([month, revenue]) => ({
      month,
      revenue: Math.round(revenue * 100) / 100,
    }));

    return NextResponse.json({
      totals: {
        revenue: Math.round(totalRevenue * 100) / 100,
        cost: Math.round(totalCost * 100) / 100,
        profit: Math.round(totalProfit * 100) / 100,
        unitsSold: totalUnitsSold,
      },
      dailyData: dailyArray,
      topProducts,
      categoryData,
      monthlyRevenue,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}
