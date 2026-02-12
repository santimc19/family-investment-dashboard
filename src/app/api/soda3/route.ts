import { NextResponse } from "next/server";

const SODA3_URL = "https://www.datos.gov.co/resource/qhpu-8ixx.json";

export async function GET() {
  try {
    const params = new URLSearchParams({
      $order: "fecha_corte DESC",
      $limit: "200",
      $select:
        "nombre_patrimonio,nombre_entidad,fecha_corte,rentabilidad_diaria,rentabilidad_mensual,rentabilidad_semestral,rentabilidad_anual,valor_unidad_operaciones",
    });

    const res = await fetch(`${SODA3_URL}?${params}`, {
      headers: {
        "X-App-Token": process.env.SODA3_APP_TOKEN || "",
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!res.ok) {
      throw new Error(`SODA3 API error: ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("SODA3 fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch SODA3 data" },
      { status: 500 }
    );
  }
}
