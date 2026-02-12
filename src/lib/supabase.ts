import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types matching our Supabase schema
export type Person = {
  id: string;
  name: string;
  slug: string;
};

export type Investment = {
  id: string;
  person_id: string;
  investment_name: string;
  platform: string;
  l1_category: string | null;
  l2_category: string | null;
  country: string | null;
  currency: string;
  ter: number;
  is_active: boolean;
  people?: Person;
};

export type MonthlySnapshot = {
  id: string;
  investment_id: string;
  snapshot_date: string;
  balance_original: number;
  currency_original: string;
  balance_usd: number;
  fx_rate: number;
  investments?: Investment;
};

export type FxRate = {
  id: string;
  rate_date: string;
  pair: string;
  rate: number;
};

export type AuditLog = {
  id: string;
  execution_date: string;
  workflow_name: string | null;
  action: string;
  details: Record<string, unknown> | null;
  status: string;
  error_message: string | null;
};
