import { getHistoricalData, getPeople } from "@/lib/queries";
import { HistoryChart } from "./chart";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const [history, people] = await Promise.all([
    getHistoricalData(),
    getPeople(),
  ]);

  // Person-level: { personName -> { date -> totalUsd } }
  const personMap = new Map<string, Map<string, number>>();
  // Platform-level per person: { personName -> { platform -> { date -> totalUsd } } }
  const platformMap = new Map<string, Map<string, Map<string, number>>>();

  for (const snap of history) {
    const inv = snap.investments as unknown as {
      person_id: string;
      platform: string;
      people: { name: string; slug: string };
    };
    const personName = inv.people.name;
    const platform = inv.platform;
    const date = snap.snapshot_date;

    // Person-level aggregation
    if (!personMap.has(personName)) personMap.set(personName, new Map());
    const personDates = personMap.get(personName)!;
    personDates.set(date, (personDates.get(date) || 0) + snap.balance_usd);

    // Platform-level aggregation per person
    if (!platformMap.has(personName)) platformMap.set(personName, new Map());
    const personPlatforms = platformMap.get(personName)!;
    if (!personPlatforms.has(platform)) personPlatforms.set(platform, new Map());
    const platDates = personPlatforms.get(platform)!;
    platDates.set(date, (platDates.get(date) || 0) + snap.balance_usd);
  }

  const allDates = new Set<string>();
  personMap.forEach((dates) => dates.forEach((_, d) => allDates.add(d)));
  const sortedDates = Array.from(allDates).sort();

  // Person-level chart data (for "All Members" view)
  const personChartData = sortedDates.map((date) => {
    const point: Record<string, string | number> = { date };
    personMap.forEach((dates, person) => {
      point[person] = dates.get(date) || 0;
    });
    return point;
  });

  // Platform-level chart data per person (for individual person view)
  const platformChartData: Record<string, {
    data: Record<string, string | number>[];
    platforms: string[];
  }> = {};

  for (const [personName, platforms] of platformMap) {
    const platformNames = Array.from(platforms.keys()).sort();
    const data = sortedDates.map((date) => {
      const point: Record<string, string | number> = { date };
      for (const [plat, dates] of platforms) {
        point[plat] = dates.get(date) || 0;
      }
      return point;
    });
    platformChartData[personName] = { data, platforms: platformNames };
  }

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

      {personChartData.length > 0 ? (
        <div className="p-6 rounded-2xl bg-zinc-900/30 border border-zinc-800/40">
          <HistoryChart
            personData={personChartData}
            personNames={personNames}
            platformData={platformChartData}
          />
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
