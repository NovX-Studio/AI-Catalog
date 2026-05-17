"use client";

import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, DollarSign, Package, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";

const BarChart = dynamic(() => import("recharts").then(m => m.BarChart), { ssr: false });
const Bar = dynamic(() => import("recharts").then(m => m.Bar), { ssr: false });
const XAxis = dynamic(() => import("recharts").then(m => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then(m => m.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then(m => m.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then(m => m.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import("recharts").then(m => m.ResponsiveContainer), { ssr: false });
const LineChart = dynamic(() => import("recharts").then(m => m.LineChart), { ssr: false });
const Line = dynamic(() => import("recharts").then(m => m.Line), { ssr: false });
const PieChart = dynamic(() => import("recharts").then(m => m.PieChart), { ssr: false });
const Pie = dynamic(() => import("recharts").then(m => m.Pie), { ssr: false });
const Cell = dynamic(() => import("recharts").then(m => m.Cell), { ssr: false });
const AreaChart = dynamic(() => import("recharts").then(m => m.AreaChart), { ssr: false });
const Area = dynamic(() => import("recharts").then(m => m.Area), { ssr: false });

interface AggregatedSale {
  date: string;
  revenue: number;
  cost: number;
  profit: number;
}

interface ProductSale {
  name: string;
  units: number;
}

interface CategorySale {
  name: string;
  value: number;
}

interface RevenueMonth {
  month: string;
  revenue: number;
}

export default function StatisticsPage() {
  const [loading, setLoading] = useState(true);
  const [dailyData, setDailyData] = useState<AggregatedSale[]>([]);
  const [topProducts, setTopProducts] = useState<ProductSale[]>([]);
  const [categoryData, setCategoryData] = useState<CategorySale[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState<RevenueMonth[]>([]);
  const [totals, setTotals] = useState({ revenue: 0, cost: 0, profit: 0, unitsSold: 0 });

  useEffect(() => {
    fetch("/api/statistics")
      .then(r => r.json())
      .then(data => {
        setDailyData(data.dailyData);
        setTopProducts(data.topProducts);
        setCategoryData(data.categoryData);
        setMonthlyRevenue(data.monthlyRevenue);
        setTotals(data.totals);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const COLORS = ["#6C47FF", "#10B981", "#F59E0B", "#EF4444", "#3B82F6", "#8B5CF6", "#EC4899"];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 text-[#6C47FF] animate-spin" />
      </div>
    );
  }

  if (totals.unitsSold === 0) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#111827]" style={{ letterSpacing: "-0.02em" }}>Statistics</h1>
          <p className="text-sm text-[#6B7280] mt-0.5">Sales analytics and insights.</p>
        </div>
        <div className="flex flex-col items-center justify-center py-24 text-gray-400">
          <BarChart3Icon className="h-14 w-14 mb-4 text-gray-300" />
          <p className="text-lg font-semibold text-gray-500">No sales recorded yet</p>
          <p className="text-sm mt-1">Go to Sales to register your first sale.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#111827]" style={{ letterSpacing: "-0.02em" }}>Statistics</h1>
        <p className="text-sm text-[#6B7280] mt-0.5">Sales analytics and insights.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Revenue", value: `$${totals.revenue.toFixed(2)}`, icon: DollarSign, color: "bg-emerald-50 text-emerald-600" },
          { label: "Total Cost", value: `$${totals.cost.toFixed(2)}`, icon: TrendingDown, color: "bg-red-50 text-red-500" },
          { label: "Net Profit", value: `$${totals.profit.toFixed(2)}`, icon: TrendingUp, color: totals.profit >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500" },
          { label: "Units Sold", value: totals.unitsSold, icon: Package, color: "bg-[#F5F2FF] text-[#6C47FF]" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", color)}>
                <Icon className="h-4.5 w-4.5" />
              </div>
            </div>
            <p className="text-2xl font-bold text-[#111827]" style={{ letterSpacing: "-0.02em" }}>{value}</p>
            <p className="text-xs text-[#6B7280] mt-0.5 font-medium">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-sm font-semibold text-[#111827] mb-4">Revenue vs Cost vs Profit (Last 30 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="revenue" fill="#10B981" name="Revenue" radius={[4, 4, 0, 0]} />
              <Bar dataKey="cost" fill="#EF4444" name="Cost" radius={[4, 4, 0, 0]} />
              <Bar dataKey="profit" fill="#6C47FF" name="Profit" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-sm font-semibold text-[#111827] mb-4">Top 5 Most Sold Products</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topProducts} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={120} />
              <Tooltip />
              <Bar dataKey="units" fill="#6C47FF" name="Units Sold" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-sm font-semibold text-[#111827] mb-4">Sales by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" nameKey="name" label={(entry: any) => `${entry.name} ${((entry.percent ?? 0) * 100).toFixed(0)}%`}>
                {categoryData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-sm font-semibold text-[#111827] mb-4">Revenue Over Time (Last 12 Months)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Area type="monotone" dataKey="revenue" stroke="#6C47FF" fill="#6C47FF" fillOpacity={0.15} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function BarChart3Icon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  );
}
