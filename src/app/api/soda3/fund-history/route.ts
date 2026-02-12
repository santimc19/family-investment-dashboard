import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const fundName = request.nextUrl.searchParams.get("fund");
  if (!fundName) {
    return NextResponse.json({ error: "Missing fund parameter" }, { status: 400 });
  }

  try {
    // Fetch last 365 days of data for this specific fund
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const dateStr = oneYearAgo.toISOString().split("T")[0];

    const params = new URLSearchParams({
      $where: `nombre_patrimonio='${fundName}' AND fecha_corte >= '${dateStr}'`,
      $order: "fecha_corte ASC",
      $limit: "400",
      $select:
        "fecha_corte,nombre_patrimonio,nombre_entidad,rentabilidad_diaria,rentabilidad_mensual,rentabilidad_semestral,rentabilidad_anual,valor_unidad_operaciones",
    });

    const res = await fetch(
      `https://www.datos.gov.co/resource/qhpu-8ixx.json?${params}`,
      {
        headers: { "X-App-Token": process.env.SODA3_APP_TOKEN || "" },
      }
    );

    if (!res.ok) {
      return NextResponse.json({ error: "SODA3 API error" }, { status: 502 });
    }

    const data = await res.json();

    // Sample ~12 monthly data points (pick last record of each month)
    const monthlyMap = new Map<string, typeof data[0]>();
    for (const record of data) {
      const date = record.fecha_corte?.split("T")[0] || "";
      const monthKey = date.substring(0, 7); // "YYYY-MM"
      monthlyMap.set(monthKey, record); // last one per month wins (ASC order)
    }

    const monthly = Array.from(monthlyMap.values());

    return NextResponse.json(monthly);
  } catch {
    return NextResponse.json({ error: "Failed to fetch SODA3 data" }, { status: 500 });
  }
}
