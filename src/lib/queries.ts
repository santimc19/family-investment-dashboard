import { supabase } from "./supabase";

export async function getPeople() {
  const { data, error } = await supabase
    .from("people")
    .select("*")
    .order("name");
  if (error) {
    console.error("getPeople error:", error.message);
    return [];
  }
  return data;
}

export async function getPortfolioSummary() {
  const { data, error } = await supabase
    .from("monthly_snapshots")
    .select(
      `
      balance_usd,
      snapshot_date,
      investments!inner (
        id,
        investment_name,
        platform,
        l1_category,
        l2_category,
        country,
        currency,
        ter,
        person_id,
        people!inner (
          id,
          name,
          slug
        )
      )
    `
    )
    .order("snapshot_date", { ascending: false });

  if (error) {
    console.error("getPortfolioSummary error:", error.message);
    return [];
  }
  return data;
}

export async function getPersonInvestments(personSlug: string) {
  const { data: person, error: personError } = await supabase
    .from("people")
    .select("*")
    .eq("slug", personSlug)
    .single();

  if (personError) {
    console.error("getPersonInvestments person error:", personError.message);
    return { person: { id: "", name: personSlug, slug: personSlug }, snapshots: [] };
  }

  const { data: snapshots, error: snapError } = await supabase
    .from("monthly_snapshots")
    .select(
      `
      *,
      investments!inner (
        *,
        people!inner (*)
      )
    `
    )
    .eq("investments.person_id", person.id)
    .order("snapshot_date", { ascending: false });

  if (snapError) {
    console.error("getPersonInvestments snapshots error:", snapError.message);
    return { person, snapshots: [] };
  }

  return { person, snapshots };
}

export async function getHistoricalData() {
  const { data, error } = await supabase
    .from("monthly_snapshots")
    .select(
      `
      snapshot_date,
      balance_usd,
      investments!inner (
        investment_name,
        platform,
        person_id,
        people!inner (name, slug)
      )
    `
    )
    .order("snapshot_date", { ascending: true });

  if (error) {
    console.error("getHistoricalData error:", error.message);
    return [];
  }
  return data;
}

export async function getAuditLogs() {
  const { data, error } = await supabase
    .from("audit_logs")
    .select("*")
    .order("execution_date", { ascending: false })
    .limit(50);

  if (error) {
    console.error("getAuditLogs error:", error.message);
    return [];
  }
  return data;
}

export async function getLatestSnapshotDate() {
  const { data, error } = await supabase
    .from("monthly_snapshots")
    .select("snapshot_date")
    .order("snapshot_date", { ascending: false })
    .limit(1);

  if (error) {
    console.error("getLatestSnapshotDate error:", error.message);
    return null;
  }
  return data?.[0]?.snapshot_date || null;
}
