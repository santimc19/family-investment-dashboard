"use client";

import { useState, useEffect, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

type Fund = {
  name: string;
  entity: string;
  currentApy: number;
};

type HistoryRecord = {
  fecha_corte: string;
  rentabilidad_anual: string;
  rentabilidad_mensual: string;
  rentabilidad_diaria: string;
  rentabilidad_semestral?: string;
  valor_unidad_operaciones?: string;
};

type ChartPoint = {
  date: string;
  apy: number;
  monthly: number;
  daily: number;
  unitValue: number | null;
};

export function ProfitabilityExplorer({ funds }: { funds: Fund[] }) {
  const [selectedFund, setSelectedFund] = useState<string>("");
  const [search, setSearch] = useState("");
  const [history, setHistory] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [metric, setMetric] = useState<"apy" | "monthly" | "daily">("apy");

  const filteredFunds = useMemo(() => {
    if (!search) return funds;
    const q = search.toLowerCase();
    return funds.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.entity.toLowerCase().includes(q)
    );
  }, [funds, search]);

  useEffect(() => {
    if (!selectedFund) {
      setHistory([]);
      return;
    }

    let cancelled = false;
    setLoading(true);

    fetch(`/api/soda3/fund-history?fund=${encodeURIComponent(selectedFund)}`)
      .then((res) => res.json())
      .then((data: HistoryRecord[]) => {
        if (cancelled) return;
        const points: ChartPoint[] = data.map((r) => ({
          date: r.fecha_corte?.split("T")[0] || "",
          apy: parseFloat(r.rentabilidad_anual) || 0,
          monthly: parseFloat(r.rentabilidad_mensual) || 0,
          daily: parseFloat(r.rentabilidad_diaria) || 0,
          unitValue: r.valor_unidad_operaciones
            ? parseFloat(r.valor_unidad_operaciones)
            : null,
        }));
        setHistory(points);
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setHistory([]);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [selectedFund]);

  const selectedInfo = funds.find((f) => f.name === selectedFund);

  const latestPoint = history.length > 0 ? history[history.length - 1] : null;

  return (
    <div className="space-y-6">
      {/* Search + Dropdown */}
      <div className="space-y-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search funds by name or entity..."
          className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/40 transition-all"
        />
        <div className="max-h-64 overflow-y-auto rounded-xl border border-zinc-800/50 bg-zinc-900/40">
          {filteredFunds.length === 0 ? (
            <p className="p-4 text-sm text-zinc-600 text-center">No funds match your search.</p>
          ) : (
            filteredFunds.map((fund) => (
              <button
                key={fund.name}
                onClick={() => {
                  setSelectedFund(fund.name);
                  setSearch("");
                }}
                className={`w-full text-left px-4 py-3 border-b border-zinc-800/30 last:border-b-0 transition-colors ${
                  selectedFund === fund.name
                    ? "bg-amber-500/10 border-l-2 border-l-amber-500"
                    : "hover:bg-zinc-800/40"
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-zinc-200 truncate">
                      {fund.name}
                    </p>
                    <p className="text-xs text-zinc-600 truncate mt-0.5">
                      {fund.entity}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 text-xs font-mono font-semibold ${
                      fund.currentApy >= 0 ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {fund.currentApy.toFixed(2)}%
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chart area */}
      {selectedFund && (
        <div className="p-6 rounded-2xl bg-zinc-900/30 border border-zinc-800/40 space-y-4">
          {/* Fund header */}
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[15px] font-semibold text-white truncate">
                {selectedFund}
              </p>
              <p className="text-xs text-zinc-500 mt-0.5">
                {selectedInfo?.entity}
              </p>
            </div>
            {latestPoint && (
              <div className="text-right shrink-0">
                <p className={`text-2xl font-bold font-mono ${
                  latestPoint.apy >= 0 ? "text-emerald-400" : "text-red-400"
                }`}>
                  {latestPoint.apy.toFixed(2)}%
                </p>
                <p className="text-[11px] text-zinc-600 mt-0.5">Annual return</p>
              </div>
            )}
          </div>

          {/* Metric toggle */}
          <div className="flex items-center gap-1 bg-zinc-900/60 rounded-lg p-0.5 border border-zinc-800/50">
            {([
              { key: "apy" as const, label: "Annual" },
              { key: "monthly" as const, label: "Monthly" },
              { key: "daily" as const, label: "Daily" },
            ]).map((m) => (
              <button
                key={m.key}
                onClick={() => setMetric(m.key)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  metric === m.key
                    ? "bg-zinc-800 text-white shadow-sm"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Chart */}
          {loading ? (
            <div className="h-[320px] flex items-center justify-center">
              <p className="text-sm text-zinc-600">Loading profitability data...</p>
            </div>
          ) : history.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={history}>
                <defs>
                  <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  stroke="#27272a"
                  tick={{ fill: "#52525b", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(d: string) =>
                    new Date(d + "T00:00:00").toLocaleDateString("en-US", {
                      month: "short",
                      year: "2-digit",
                    })
                  }
                />
                <YAxis
                  stroke="#27272a"
                  tick={{ fill: "#52525b", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: number) => `${v.toFixed(1)}%`}
                  width={50}
                  domain={["auto", "auto"]}
                />
                <ReferenceLine y={0} stroke="#3f3f46" strokeDasharray="3 3" />
                <Tooltip
                  contentStyle={{
                    background: "#18181b",
                    border: "1px solid #27272a",
                    borderRadius: "12px",
                    color: "#fafafa",
                    fontSize: "13px",
                    padding: "10px 14px",
                  }}
                  formatter={(value) =>
                    `${Number(value).toFixed(4)}%`
                  }
                  labelFormatter={(label) =>
                    new Date(String(label) + "T00:00:00").toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })
                  }
                />
                <Area
                  type="monotone"
                  dataKey={metric}
                  stroke="#f59e0b"
                  fill="url(#profitGrad)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: "#f59e0b", stroke: "#09090b", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[320px] flex items-center justify-center">
              <p className="text-sm text-zinc-600">No historical data available for this fund.</p>
            </div>
          )}

          {/* Stats row */}
          {history.length > 1 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {(() => {
                const apys = history.map((h) => h.apy);
                const min = Math.min(...apys);
                const max = Math.max(...apys);
                const avg = apys.reduce((s, v) => s + v, 0) / apys.length;
                const first = apys[0];
                const last = apys[apys.length - 1];
                const change = last - first;
                return [
                  { label: "Current", value: `${last.toFixed(2)}%`, color: last >= 0 ? "text-emerald-400" : "text-red-400" },
                  { label: "12M Avg", value: `${avg.toFixed(2)}%`, color: "text-zinc-300" },
                  { label: "12M Range", value: `${min.toFixed(1)}–${max.toFixed(1)}%`, color: "text-zinc-300" },
                  { label: "12M Change", value: `${change >= 0 ? "+" : ""}${change.toFixed(2)}pp`, color: change >= 0 ? "text-emerald-400" : "text-red-400" },
                ];
              })().map((stat) => (
                <div key={stat.label} className="px-3 py-2.5 rounded-lg bg-zinc-800/30 border border-zinc-800/40">
                  <p className="text-[10px] uppercase tracking-widest text-zinc-600">{stat.label}</p>
                  <p className={`text-sm font-mono font-semibold mt-0.5 ${stat.color}`}>{stat.value}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!selectedFund && (
        <div className="p-12 text-center rounded-2xl bg-zinc-900/30 border border-zinc-800/40">
          <p className="text-zinc-500 text-sm">Select a fund above to view its profitability history.</p>
        </div>
      )}
    </div>
  );
}
