import Link from "next/link";
import {
  getPeople,
  getPortfolioSummary,
  getLatestSnapshotDate,
} from "@/lib/queries";
import { formatUSD, formatDate } from "@/lib/format";

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

  for (const snap of snapshots) {
    const inv = snap.investments as unknown as {
      id: string;
      people: { name: string; slug: string };
    };
    const person = inv.people;

    if (seenInvestments.has(inv.id)) continue;
    seenInvestments.add(inv.id);

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

  return (
    <div>
      <div className="mb-10">
        <h1 className="text-2xl font-bold tracking-tight">
          Portfolio Overview
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          {latestDate
            ? `Last updated: ${formatDate(latestDate)}`
            : "No data yet — run the n8n workflow to import balances"}
        </p>
      </div>

      <div className="mb-10 p-6 rounded-xl bg-zinc-900/50 border border-zinc-800/60">
        <p className="text-xs uppercase tracking-widest text-zinc-500 mb-1">
          Total Portfolio
        </p>
        <p className="text-4xl font-bold tracking-tight text-white">
          {formatUSD(grandTotal)}
        </p>
        <p className="text-sm text-zinc-500 mt-1">
          {seenInvestments.size} investments across {personTotals.size} members
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {people.map((person) => {
          const data = personTotals.get(person.slug);
          return (
            <Link
              key={person.id}
              href={`/person/${person.slug}`}
              className="group p-5 rounded-xl bg-zinc-900/30 border border-zinc-800/40 hover:border-amber-500/30 hover:bg-zinc-900/60 transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">
                  {person.name}
                </span>
                <span className="text-xs text-zinc-600">
                  {data?.investments || 0} investments
                </span>
              </div>
              <p className="text-2xl font-bold tracking-tight">
                {data ? formatUSD(data.total) : "$0"}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
