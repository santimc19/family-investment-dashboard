import Link from "next/link";
import { getPersonInvestments } from "@/lib/queries";
import { formatUSD, formatDate } from "@/lib/format";

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

  // Group snapshots by investment, take latest
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

  const investments = Array.from(latestByInvestment.values());
  const totalUsd = investments.reduce((sum, inv) => sum + inv.balance_usd, 0);

  return (
    <div>
      <div className="mb-8">
        <Link
          href="/"
          className="text-sm text-zinc-500 hover:text-amber-500 transition-colors"
        >
          &larr; Back to Portfolio
        </Link>
        <h1 className="text-2xl font-bold tracking-tight mt-3">
          {person.name}
        </h1>
        <p className="text-3xl font-bold text-white mt-1">
          {formatUSD(totalUsd)}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800/60 text-xs uppercase tracking-widest text-zinc-500">
              <th className="text-left py-3 pr-4">Investment</th>
              <th className="text-left py-3 pr-4">Platform</th>
              <th className="text-left py-3 pr-4">Type</th>
              <th className="text-right py-3 pr-4">Balance</th>
              <th className="text-right py-3 pr-4">USD</th>
              <th className="text-right py-3 pr-4">APY (Gross)</th>
              <th className="text-right py-3">Source</th>
            </tr>
          </thead>
          <tbody>
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

              return (
                <tr
                  key={i}
                  className="border-b border-zinc-800/30 hover:bg-zinc-900/30"
                >
                  <td className="py-3 pr-4">
                    <div className="font-medium text-zinc-200">
                      {inv.investment_name}
                    </div>
                    <div className="text-xs text-zinc-600">
                      {inv.l1_category}
                      {inv.l2_category ? ` / ${inv.l2_category}` : ""}
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-zinc-400">{inv.platform}</td>
                  <td className="py-3 pr-4">
                    <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                      {inv.country || "—"}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-right font-mono text-zinc-300">
                    {inv.balance_original.toLocaleString("en-US", {
                      maximumFractionDigits: 0,
                    })}{" "}
                    <span className="text-zinc-600 text-xs">
                      {inv.currency}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-right font-mono font-medium text-white">
                    {formatUSD(inv.balance_usd)}
                  </td>
                  <td className="py-3 pr-4 text-right font-mono">
                    {apyGross !== null ? (
                      <div>
                        <span
                          className={
                            apyGross >= 0 ? "text-emerald-400" : "text-red-400"
                          }
                        >
                          {apyGross.toFixed(2)}%
                        </span>
                        {apyNet !== null && apyNet !== apyGross && (
                          <div className="text-xs text-zinc-500">
                            Net: {apyNet.toFixed(2)}%
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-zinc-600">—</span>
                    )}
                  </td>
                  <td className="py-3 text-right">
                    {soda3Match ? (
                      <span className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        SODA3
                      </span>
                    ) : (
                      <span className="text-xs text-zinc-600">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
