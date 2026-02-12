import { getHistoricalData, getPeople } from "@/lib/queries";
import { HistoryChart } from "./chart";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const [history, people] = await Promise.all([
    getHistoricalData(),
    getPeople(),
  ]);

  // Group by person and date for charting
  const chartData = new Map<
    string,
    Map<string, number>
  >();

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

  // Transform to Recharts format
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
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">
          Historical Balances
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Total portfolio value over time (USD)
        </p>
      </div>

      {rechartsData.length > 0 ? (
        <div className="p-6 rounded-xl bg-zinc-900/30 border border-zinc-800/40">
          <HistoryChart data={rechartsData} personNames={personNames} />
        </div>
      ) : (
        <div className="p-10 text-center text-zinc-500 rounded-xl bg-zinc-900/30 border border-zinc-800/40">
          <p>No historical data yet.</p>
          <p className="text-sm mt-1">
            Charts will appear after 2+ months of balance data.
          </p>
        </div>
      )}
    </div>
  );
}
