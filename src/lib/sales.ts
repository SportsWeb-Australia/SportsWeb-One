import { supabase } from "./supabase";

export interface SalesProduct {
  id: string;
  key: string;
  name: string;
  category: string;
  avg_deal_value: number;
  is_placeholder: boolean;
  active: boolean;
  sort: number;
}

export interface SalesTarget {
  id?: string;
  name: string;
  product_key: string | null;
  period: string;
  revenue_target: number;
  avg_deal_value: number;
  close_rate: number;
  show_rate: number;
  booking_rate: number;
  contact_rate: number;
  cta_conversion_rate: number;
  is_placeholder?: boolean;
  updated_at?: string;
}

/** The reverse-engineered activity ladder (counts, rounded up). */
export interface FormulaLadder {
  wins: number;
  presentations: number;
  demos: number;
  conversations: number;
  contacts: number;
  ctaViews: number;
}

const up = (n: number) => (isFinite(n) && n > 0 ? Math.ceil(n) : 0);

/** required_wins = target / deal; then each stage divided by its rate. */
export function computeLadder(t: {
  revenue_target: number;
  avg_deal_value: number;
  close_rate: number;
  show_rate: number;
  booking_rate: number;
  contact_rate: number;
  cta_conversion_rate: number;
}): FormulaLadder {
  const wins = t.avg_deal_value > 0 ? t.revenue_target / t.avg_deal_value : 0;
  const presentations = t.close_rate > 0 ? wins / t.close_rate : 0;
  const demos = t.show_rate > 0 ? presentations / t.show_rate : 0;
  const conversations = t.booking_rate > 0 ? demos / t.booking_rate : 0;
  const contacts = t.contact_rate > 0 ? conversations / t.contact_rate : 0;
  const ctaViews = t.cta_conversion_rate > 0 ? contacts / t.cta_conversion_rate : 0;
  return {
    wins: up(wins),
    presentations: up(presentations),
    demos: up(demos),
    conversations: up(conversations),
    contacts: up(contacts),
    ctaViews: up(ctaViews),
  };
}

export async function listSalesProducts(): Promise<SalesProduct[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.from("sales_products").select("*").eq("active", true).order("sort");
  if (error || !data) return [];
  return data as SalesProduct[];
}

export async function listSalesTargets(): Promise<SalesTarget[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.from("sales_targets").select("*").order("updated_at", { ascending: false });
  if (error || !data) return [];
  return data as SalesTarget[];
}

export async function saveSalesTarget(t: SalesTarget): Promise<string | null> {
  if (!supabase) return "Supabase not configured.";
  const row = { ...t, updated_at: new Date().toISOString() };
  const { error } = t.id
    ? await supabase.from("sales_targets").update(row).eq("id", t.id)
    : await supabase.from("sales_targets").insert(row);
  return error ? error.message : null;
}

export async function deleteSalesTarget(id: string): Promise<string | null> {
  if (!supabase) return "Supabase not configured.";
  const { error } = await supabase.from("sales_targets").delete().eq("id", id);
  return error ? error.message : null;
}
