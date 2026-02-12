"use client";

import { useState, useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";

type InvestmentRow = {
  person_name: string;
  person_slug: string;
  investment_name: string;
  l1_category: string;
  l2_category: string;
  country: string;
  currency: string;
  balance_usd: number;
};

const PALETTE = [
  "#f59e0b", "#10b981", "#6366f1", "#f43f5e", "#8b5cf6",
  "#06b6d4", "#ec4899", "#84cc16", "#f97316", "#14b8a6",
];

function breakdownBy(data: InvestmentRow[], key: keyof InvestmentRow) {
  const map = new Map<string, number>();
  for (const row of data) {
    const label = (row[key] as string) || "Other";
    map.set(label, (map.get(label) || 0) + row.balance_usd);
  }
  return Array.from(map.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

function DonutChart({
  title,
  data,
  total,
}: {
  title: string;
  data: { name: string; value: number }[];
  total: number;
}) {
  return (
    <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/40">
      <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-4">
        {title}
      </p>
      <div className="flex items-center gap-4">
        <div className="shrink-0">
          <PieChart width={140} height={140}>
            <Pie
              data={data}
              cx={65}
              cy={65}
              innerRadius={38}
              outerRadius={62}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
            >
              {data.map((_, i) => (
                <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "#18181b",
                border: "1px solid #27272a",
                borderRadius: "10px",
                color: "#fafafa",
                fontSize: "12px",
                padding: "8px 12px",
              }}
              formatter={(value) =>
                `$${Number(value).toLocaleString("en-US", { maximumFractionDigits: 0 })}`
              }
            />
          </PieChart>
        </div>
        <div className="flex-1 min-w-0 space-y-1.5">
          {data.map((item, i) => {
            const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : "0";
            return (
              <div key={item.name} className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: PALETTE[i % PALETTE.length] }}
                />
                <span className="text-xs text-zinc-400 truncate flex-1">
                  {item.name}
                </span>
                <span className="text-xs font-mono text-zinc-500 shrink-0">
                  {pct}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function ExposureCharts({
  investments,
  members,
}: {
  investments: InvestmentRow[];
  members: { name: string; slug: string }[];
}) {
  const [selectedMember, setSelectedMember] = useState<string>("all");

  const filtered = useMemo(() => {
    if (selectedMember === "all") return investments;
    return investments.filter((inv) => inv.person_slug === selectedMember);
  }, [investments, selectedMember]);

  const total = filtered.reduce((sum, inv) => sum + inv.balance_usd, 0);

  const l1Data = breakdownBy(filtered, "l1_category");
  const l2Data = breakdownBy(filtered, "l2_category");
  const countryData = breakdownBy(filtered, "country");
  const currencyData = breakdownBy(filtered, "currency");

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-lg font-semibold text-white">Exposure</h2>
        <div className="flex items-center gap-1 bg-zinc-900/60 rounded-lg p-0.5 border border-zinc-800/50 flex-wrap">
          <button
            onClick={() => setSelectedMember("all")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              selectedMember === "all"
                ? "bg-zinc-800 text-white shadow-sm"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            All Members
          </button>
          {members.map((m) => (
            <button
              key={m.slug}
              onClick={() =>
                setSelectedMember(
                  selectedMember === m.slug ? "all" : m.slug
                )
              }
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                selectedMember === m.slug
                  ? "bg-zinc-800 text-white shadow-sm"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {m.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <DonutChart title="Asset Class" data={l1Data} total={total} />
        <DonutChart title="Sub-Category" data={l2Data} total={total} />
        <DonutChart title="Country" data={countryData} total={total} />
        <DonutChart title="Currency" data={currencyData} total={total} />
      </div>
    </div>
  );
}
