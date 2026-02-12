import { getHistoricalData, getPeople } from "@/lib/queries";
import { HistoryChart } from "./chart";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const [history, people] = await Promise.all([
    getHistoricalData(),
    getPeople(),
  ]);

  const chartData = new Map<string, Map<string, number>>();

  for (const snap of history) {
    const inv = snap.investments as unknown as {
      person_id: string;
      people: { name: string; slug: string };
    };
    const personName = inv.people.name;
    const date = snap.snapshot_date;

    if (!chartData.has(personName)) {
      chartData.set(personName, new Map());
    }
    const personDates = chartData.get(personName)!;
    const existing = personDates.get(date) || 0;
    personDates.set(date, existing + snap.balance_usd);
  }

  const allDates = new Set<string>();
  chartData.forEach((dates) => dates.forEach((_, d) => allDates.add(d)));
  const sortedDates = Array.from(allDates).sort();

  const rechartsData = sortedDates.map((date) => {
    const point: Record<string, string | number> = { date };
    chartData.forEach((dates, person) => {
      point[person] = dates.get(date) || 0;
    });
    return point;
  });

  const personNames = people.map((p) => p.name);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Historical Balances
        </h1>
        <p className="text-[13px] text-zinc-500 mt-1">
          Total portfolio value over time (USD)
        </p>
      </div>

      {rechartsData.length > 0 ? (
        <div className="p-6 rounded-2xl bg-zinc-900/30 border border-zinc-800/40">
          <HistoryChart data={rechartsData} personNames={personNames} />
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl bg-zinc-900/30 border border-zinc-800/40">
          <div className="text-zinc-600 mb-2">
            <svg className="mx-auto" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 3v18h18" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7 16l4-8 4 4 4-6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <p className="text-zinc-500 text-sm">No historical data yet.</p>
          <p className="text-zinc-600 text-xs mt-1">
            Charts will appear after 2+ months of balance data.
          </p>
        </div>
      )}
    </div>
  );
}
