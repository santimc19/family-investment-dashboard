import Link from "next/link";
import {
  getPeople,
  getPortfolioSummary,
  getLatestSnapshotDate,
} from "@/lib/queries";
import { formatUSD, formatDate } from "@/lib/format";
import { ExposureCharts } from "./exposure-charts";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [people, snapshots, latestDate] = await Promise.all([
    getPeople(),
    getPortfolioSummary(),
    getLatestSnapshotDate(),
  ]);

  // Group by person, only counting latest snapshot per investment
  const personTotals = new Map<
    string,
    { name: string; slug: string; total: number; investments: number }
  >();
  const seenInvestments = new Set<string>();
  const exposureRows: {
    person_name: string;
    person_slug: string;
    investment_name: string;
    l1_category: string;
    l2_category: string;
    country: string;
    currency: string;
    balance_usd: number;
  }[] = [];

  for (const snap of snapshots) {
    const inv = snap.investments as unknown as {
      id: string;
      investment_name: string;
      l1_category: string | null;
      l2_category: string | null;
      country: string | null;
      currency: string;
      people: { name: string; slug: string };
    };
    const person = inv.people;

    if (seenInvestments.has(inv.id)) continue;
    seenInvestments.add(inv.id);

    exposureRows.push({
      person_name: person.name,
      person_slug: person.slug,
      investment_name: inv.investment_name,
      l1_category: inv.l1_category || "Other",
      l2_category: inv.l2_category || "Other",
      country: inv.country || "Other",
      currency: inv.currency || "Other",
      balance_usd: snap.balance_usd,
    });

    const existing = personTotals.get(person.slug) || {
      name: person.name,
      slug: person.slug,
      total: 0,
      investments: 0,
    };
    existing.total += snap.balance_usd;
    existing.investments += 1;
    personTotals.set(person.slug, existing);
  }

  const grandTotal = Array.from(personTotals.values()).reduce(
    (sum, p) => sum + p.total,
    0
  );

  const sortedMembers = Array.from(personTotals.values()).sort(
    (a, b) => b.total - a.total
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-[13px] text-zinc-500 mb-1">
          <span>Portfolio Overview</span>
          {latestDate && (
            <>
              <span className="text-zinc-700">|</span>
              <span>{formatDate(latestDate)}</span>
            </>
          )}
        </div>
        <div className="flex items-baseline gap-4">
          <h1 className="text-5xl font-bold tracking-tight text-white font-mono">
            {formatUSD(grandTotal)}
          </h1>
        </div>
        <p className="text-sm text-zinc-500 mt-2">
          {seenInvestments.size} positions across {personTotals.size} members
        </p>
      </div>

      {/* Allocation bar */}
      {grandTotal > 0 && (
        <div className="space-y-3">
          <div className="h-2 rounded-full overflow-hidden flex bg-zinc-800/50">
            {sortedMembers.map((member, i) => {
              const pct = (member.total / grandTotal) * 100;
              const colors = [
                "bg-amber-500",
                "bg-emerald-500",
                "bg-indigo-500",
                "bg-rose-400",
                "bg-violet-500",
              ];
              return (
                <div
                  key={member.slug}
                  className={`${colors[i % colors.length]} transition-all`}
                  style={{ width: `${pct}%` }}
                />
              );
            })}
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-1">
            {sortedMembers.map((member, i) => {
              const pct = ((member.total / grandTotal) * 100).toFixed(1);
              const dots = [
                "bg-amber-500",
                "bg-emerald-500",
                "bg-indigo-500",
                "bg-rose-400",
                "bg-violet-500",
              ];
              return (
                <div key={member.slug} className="flex items-center gap-1.5 text-xs text-zinc-500">
                  <div className={`w-2 h-2 rounded-full ${dots[i % dots.length]}`} />
                  <span>{member.name}</span>
                  <span className="text-zinc-600">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Member cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {people.map((person, i) => {
          const data = personTotals.get(person.slug);
          const pct = grandTotal > 0 && data ? ((data.total / grandTotal) * 100).toFixed(1) : "0";
          const colors = [
            "from-amber-500/10 to-amber-500/0 border-amber-500/20 hover:border-amber-500/40",
            "from-emerald-500/10 to-emerald-500/0 border-emerald-500/20 hover:border-emerald-500/40",
            "from-indigo-500/10 to-indigo-500/0 border-indigo-500/20 hover:border-indigo-500/40",
            "from-rose-400/10 to-rose-400/0 border-rose-400/20 hover:border-rose-400/40",
            "from-violet-500/10 to-violet-500/0 border-violet-500/20 hover:border-violet-500/40",
          ];
          const sortIdx = sortedMembers.findIndex((m) => m.slug === person.slug);
          const colorIdx = sortIdx >= 0 ? sortIdx : i;

          return (
            <Link
              key={person.id}
              href={`/person/${person.slug}`}
              className={`group relative p-5 rounded-2xl bg-gradient-to-b ${colors[colorIdx % colors.length]} border transition-all hover:scale-[1.02] active:scale-[0.98]`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-[15px] font-semibold text-zinc-200 group-hover:text-white transition-colors">
                    {person.name}
                  </p>
                  <p className="text-xs text-zinc-600 mt-0.5">
                    {data?.investments || 0} positions
                  </p>
                </div>
                <span className="text-xs font-mono text-zinc-600 bg-zinc-800/50 px-2 py-0.5 rounded-md">
                  {pct}%
                </span>
              </div>
              <p className="text-2xl font-bold tracking-tight font-mono text-white">
                {data ? formatUSD(data.total) : "$0"}
              </p>
              <div className="absolute bottom-5 right-5 text-zinc-700 group-hover:text-zinc-500 transition-colors">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Exposure breakdown */}
      {exposureRows.length > 0 && (
        <ExposureCharts
          investments={exposureRows}
          members={people.map((p) => ({ name: p.name, slug: p.slug }))}
        />
      )}

      {/* Empty state */}
      {!latestDate && (
        <div className="p-8 text-center rounded-2xl bg-zinc-900/30 border border-zinc-800/40">
          <p className="text-zinc-500 text-sm">
            No data yet. Run the n8n workflow to import balances.
          </p>
        </div>
      )}
    </div>
  );
}
