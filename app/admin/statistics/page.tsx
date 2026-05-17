"use client";

import { useState, useEffect, useCallback } from "react";
import { TrendingUp, TrendingDown, DollarSign, Package, Loader2, Download, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { downloadCSV } from "@/lib/csv";
import dynamic from "next/dynamic";

const BarChart = dynamic(() => import("recharts").then(m => m.BarChart), { ssr: false });
const Bar = dynamic(() => import("recharts").then(m => m.Bar), { ssr: false });
const XAxis = dynamic(() => import("recharts").then(m => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then(m => m.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then(m => m.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then(m => m.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import("recharts").then(m => m.ResponsiveContainer), { ssr: false });
const PieChart = dynamic(() => import("recharts").then(m => m.PieChart), { ssr: false });
const Pie = dynamic(() => import("recharts").then(m => m.Pie), { ssr: false });
const Cell = dynamic(() => import("recharts").then(m => m.Cell), { ssr: false });
const AreaChart = dynamic(() => import("recharts").then(m => m.AreaChart), { ssr: false });
const Area = dynamic(() => import("recharts").then(m => m.Area), { ssr: false });

interface AggregatedSale { date: string; revenue: number; cost: number; profit: number; }
interface ProductSale { name: string; units: number; }
interface CategorySale { name: string; value: number; }
interface RevenueMonth { month: string; revenue: number; }
interface Totals { revenue: number; cost: number; profit: number; unitsSold: number; }
interface StatisticsData {
  totals: Totals;
  dailyData: AggregatedSale[];
  topProducts: ProductSale[];
  categoryData: CategorySale[];
  monthlyRevenue: RevenueMonth[];
}

export default function StatisticsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<StatisticsData | null>(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const fetchStats = useCallback(async (from?: string, to?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      const res = await fetch(`/api/statistics${params.toString() ? `?${params}` : ""}`);
      const d = await res.json();
      setData(d);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const COLORS = ["#059669", "#10B981", "#34D399", "#6EE7B7", "#A7F3D0", "#D1FAE5", "#ECFDF5"];

  function applyDateFilter() {
    fetchStats(fromDate || undefined, toDate || undefined);
  }

  function clearDateFilter() {
    setFromDate("");
    setToDate("");
    fetchStats();
  }

  if (loading && !data) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Statistics</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Sales analytics and insights.</p>
        </div>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
        </div>
      </div>
    );
  }

  const totals = data?.totals;
  const hasSales = totals && totals.unitsSold > 0;

  if (!hasSales) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Statistics</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Sales analytics and insights.</p>
        </div>
        <div className="flex flex-col items-center justify-center py-24 text-zinc-400">
          <svg className="h-14 w-14 mb-4 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
          </svg>
          <p className="text-lg font-semibold text-zinc-500">No sales recorded yet</p>
          <p className="text-sm mt-1">Go to Sales to register your first sale.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Statistics</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Sales analytics and insights.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => {
            if (!data) return;
            const rows: Record<string, unknown>[] = [];
            data.dailyData.forEach((d) => rows.push({ Date: d.date, Revenue: d.revenue, Cost: d.cost, Profit: d.profit }));
            data.topProducts.forEach((p) => rows.push({ "Top Products": p.name, "Units Sold": p.units }));
            data.categoryData.forEach((c) => rows.push({ Category: c.name, Revenue: c.value }));
            downloadCSV(rows, "statistics");
          }} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-zinc-200 text-xs font-medium text-zinc-600 hover:bg-zinc-50 transition-colors active:scale-95">
            <Download className="h-3.5 w-3.5" /> Export CSV
          </button>
        </div>
      </div>

      {/* Date range filter */}
      <div className="flex items-center gap-3 mb-6 p-4 rounded-2xl bg-white border border-zinc-200/60 shadow-sm">
        <Calendar className="h-4 w-4 text-zinc-400" />
        <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="px-3 py-1.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
        <span className="text-zinc-300">—</span>
        <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="px-3 py-1.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
        <button onClick={applyDateFilter} className="px-4 py-1.5 rounded-full bg-emerald-500 text-white text-xs font-medium hover:bg-emerald-600 transition-colors active:scale-95">Apply</button>
        {(fromDate || toDate) && <button onClick={clearDateFilter} className="text-xs text-zinc-400 hover:text-zinc-600 underline">Clear</button>}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Revenue", value: `$${totals!.revenue.toFixed(2)}`, icon: DollarSign, color: "bg-emerald-50 text-emerald-600" },
          { label: "Total Cost", value: `$${totals!.cost.toFixed(2)}`, icon: TrendingDown, color: "bg-red-50 text-red-500" },
          { label: "Net Profit", value: `$${totals!.profit.toFixed(2)}`, icon: TrendingUp, color: totals!.profit >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500" },
          { label: "Units Sold", value: totals!.unitsSold, icon: Package, color: "bg-emerald-50 text-emerald-600" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl p-5 border border-zinc-200/60 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", color)}>
                <Icon className="h-4.5 w-4.5" />
              </div>
            </div>
            <p className="text-2xl font-bold text-zinc-900 tracking-tight">{value}</p>
            <p className="text-xs text-zinc-500 mt-0.5 font-medium">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 border border-zinc-200/60 shadow-sm">
          <h3 className="text-sm font-semibold text-zinc-900 mb-4 tracking-tight">Revenue vs Cost vs Profit</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data!.dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="revenue" fill="#10B981" name="Revenue" radius={[4, 4, 0, 0]} />
              <Bar dataKey="cost" fill="#EF4444" name="Cost" radius={[4, 4, 0, 0]} />
              <Bar dataKey="profit" fill="#059669" name="Profit" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-zinc-200/60 shadow-sm">
          <h3 className="text-sm font-semibold text-zinc-900 mb-4 tracking-tight">Top 5 Most Sold Products</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data!.topProducts} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={120} />
              <Tooltip />
              <Bar dataKey="units" fill="#059669" name="Units Sold" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-zinc-200/60 shadow-sm">
          <h3 className="text-sm font-semibold text-zinc-900 mb-4 tracking-tight">Sales by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={data!.categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" nameKey="name" label={(entry: any) => `${entry.name} ${((entry.percent ?? 0) * 100).toFixed(0)}%`}>
                {data!.categoryData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-zinc-200/60 shadow-sm">
          <h3 className="text-sm font-semibold text-zinc-900 mb-4 tracking-tight">Revenue Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data!.monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Area type="monotone" dataKey="revenue" stroke="#059669" fill="#059669" fillOpacity={0.15} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
