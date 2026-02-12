import Link from "next/link";
import { getPersonInvestments } from "@/lib/queries";
import { formatUSD } from "@/lib/format";

export const dynamic = "force-dynamic";

type Soda3Record = {
  nombre_patrimonio: string;
  nombre_entidad: string;
  rentabilidad_anual: string;
  rentabilidad_mensual: string;
  rentabilidad_diaria: string;
};

async function fetchSoda3(): Promise<Soda3Record[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin
      : "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/soda3`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

function matchSoda3(
  investmentName: string,
  soda3Data: Soda3Record[]
): Soda3Record | null {
  const nameLC = investmentName.toLowerCase();
  for (const record of soda3Data) {
    const s3Name = (record.nombre_patrimonio || "").toLowerCase();
    if (
      nameLC.includes(s3Name.substring(0, 15)) ||
      s3Name.includes(nameLC.substring(0, 15))
    ) {
      return record;
    }
  }
  return null;
}

export default async function PersonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { person, snapshots } = await getPersonInvestments(slug);
  const soda3Data = await fetchSoda3();

  const latestByInvestment = new Map<
    string,
    {
      investment_name: string;
      platform: string;
      l1_category: string | null;
      l2_category: string | null;
      country: string | null;
      currency: string;
      ter: number;
      balance_original: number;
      balance_usd: number;
      snapshot_date: string;
    }
  >();

  for (const snap of snapshots) {
    const inv = snap.investments as unknown as {
      id: string;
      investment_name: string;
      platform: string;
      l1_category: string | null;
      l2_category: string | null;
      country: string | null;
      currency: string;
      ter: number;
    };

    if (latestByInvestment.has(inv.id)) continue;
    latestByInvestment.set(inv.id, {
      investment_name: inv.investment_name,
      platform: inv.platform,
      l1_category: inv.l1_category,
      l2_category: inv.l2_category,
      country: inv.country,
      currency: inv.currency,
      ter: inv.ter,
      balance_original: snap.balance_original,
      balance_usd: snap.balance_usd,
      snapshot_date: snap.snapshot_date,
    });
  }

  const investments = Array.from(latestByInvestment.values()).sort(
    (a, b) => b.balance_usd - a.balance_usd
  );
  const totalUsd = investments.reduce((sum, inv) => sum + inv.balance_usd, 0);

  const categoryTotals = new Map<string, number>();
  for (const inv of investments) {
    const cat = inv.l1_category || "Other";
    categoryTotals.set(cat, (categoryTotals.get(cat) || 0) + inv.balance_usd);
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[13px] text-zinc-500 hover:text-zinc-300 transition-colors mb-4"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M10 4l-4 4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Portfolio
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          {person.name}
        </h1>
        <p className="text-4xl font-bold font-mono text-white mt-1">
          {formatUSD(totalUsd)}
        </p>
      </div>

      {/* Category breakdown pills */}
      {categoryTotals.size > 0 && (
        <div className="flex flex-wrap gap-2">
          {Array.from(categoryTotals.entries())
            .sort((a, b) => b[1] - a[1])
            .map(([cat, amount]) => (
              <div
                key={cat}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800/50 border border-zinc-800/60"
              >
                <span className="text-xs font-medium text-zinc-400">{cat}</span>
                <span className="text-xs font-mono text-zinc-500">
                  {formatUSD(amount)}
                </span>
                <span className="text-[10px] font-mono text-zinc-600">
                  {totalUsd > 0 ? ((amount / totalUsd) * 100).toFixed(0) : 0}%
                </span>
              </div>
            ))}
        </div>
      )}

      {/* Investment cards */}
      <div className="space-y-2">
        {investments.map((inv, i) => {
          const soda3Match =
            inv.country === "Colombia"
              ? matchSoda3(inv.investment_name, soda3Data)
              : null;
          const apyGross = soda3Match
            ? parseFloat(soda3Match.rentabilidad_anual)
            : null;
          const apyNet =
            apyGross !== null ? apyGross - (inv.ter || 0) : null;
          const pct = totalUsd > 0 ? ((inv.balance_usd / totalUsd) * 100).toFixed(1) : "0";

          return (
            <div
              key={i}
              className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/40 hover:border-zinc-700/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-[15px] font-medium text-zinc-200 truncate">
                      {inv.investment_name}
                    </p>
                    {soda3Match && (
                      <span className="shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/20">
                        SODA3
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-zinc-500">{inv.platform}</span>
                    <span className="text-zinc-700">&middot;</span>
                    <span className="text-xs text-zinc-600">
                      {inv.l1_category}
                      {inv.l2_category ? ` / ${inv.l2_category}` : ""}
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[15px] font-bold font-mono text-white">
                    {formatUSD(inv.balance_usd)}
                  </p>
                  <p className="text-xs font-mono text-zinc-600 mt-0.5">
                    {inv.balance_original.toLocaleString("en-US", {
                      maximumFractionDigits: 0,
                    })}{" "}
                    {inv.currency}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-800/40">
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-zinc-800/60 text-zinc-500">
                    {inv.country || "\u2014"}
                  </span>
                  <span className="text-[11px] font-mono text-zinc-600">
                    {pct}% of portfolio
                  </span>
                </div>
                <div className="text-right">
                  {apyGross !== null ? (
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-mono font-semibold ${
                          apyGross >= 0 ? "text-emerald-400" : "text-red-400"
                        }`}
                      >
                        {apyGross.toFixed(2)}% APY
                      </span>
                      {apyNet !== null && apyNet !== apyGross && (
                        <span className="text-[11px] font-mono text-zinc-600">
                          ({apyNet.toFixed(2)}% net)
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-[11px] text-zinc-700">No APY data</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {investments.length === 0 && (
        <div className="p-8 text-center rounded-2xl bg-zinc-900/30 border border-zinc-800/40">
          <p className="text-zinc-500 text-sm">No investments found.</p>
        </div>
      )}
    </div>
  );
}
