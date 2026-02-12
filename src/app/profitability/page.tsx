import { ProfitabilityExplorer } from "./profitability-chart";

export const dynamic = "force-dynamic";

type Soda3Fund = {
  nombre_patrimonio: string;
  nombre_entidad: string;
  rentabilidad_anual: string;
};

async function fetchFundList(): Promise<Soda3Fund[]> {
  try {
    // Get the latest date
    const dateParams = new URLSearchParams({
      $select: "fecha_corte",
      $order: "fecha_corte DESC",
      $limit: "1",
    });
    const dateRes = await fetch(
      `https://www.datos.gov.co/resource/qhpu-8ixx.json?${dateParams}`,
      {
        headers: { "X-App-Token": process.env.SODA3_APP_TOKEN || "" },
        next: { revalidate: 3600 },
      }
    );
    if (!dateRes.ok) return [];
    const dateData = await dateRes.json();
    if (!dateData.length) return [];
    const latestDate = dateData[0].fecha_corte;

    // Fetch all funds for the latest date
    const params = new URLSearchParams({
      $where: `fecha_corte='${latestDate}'`,
      $limit: "1000",
      $select: "nombre_patrimonio,nombre_entidad,rentabilidad_anual",
      $order: "nombre_patrimonio ASC",
    });
    const res = await fetch(
      `https://www.datos.gov.co/resource/qhpu-8ixx.json?${params}`,
      {
        headers: { "X-App-Token": process.env.SODA3_APP_TOKEN || "" },
        next: { revalidate: 3600 },
      }
    );
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function ProfitabilityPage() {
  const funds = await fetchFundList();

  // Deduplicate by fund name (some have multiple share classes)
  const uniqueFunds = new Map<string, Soda3Fund>();
  for (const fund of funds) {
    const key = fund.nombre_patrimonio;
    if (!uniqueFunds.has(key)) {
      uniqueFunds.set(key, fund);
    }
  }

  const fundList = Array.from(uniqueFunds.values()).map((f) => ({
    name: f.nombre_patrimonio,
    entity: f.nombre_entidad,
    currentApy: parseFloat(f.rentabilidad_anual) || 0,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Fund Profitability
        </h1>
        <p className="text-[13px] text-zinc-500 mt-1">
          Colombian FIC returns from SODA3 (datos.gov.co) — last 12 months
        </p>
      </div>

      {fundList.length > 0 ? (
        <ProfitabilityExplorer funds={fundList} />
      ) : (
        <div className="p-12 text-center rounded-2xl bg-zinc-900/30 border border-zinc-800/40">
          <p className="text-zinc-500 text-sm">Unable to load fund data from SODA3.</p>
        </div>
      )}
    </div>
  );
}
