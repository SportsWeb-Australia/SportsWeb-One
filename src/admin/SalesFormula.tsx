import { useEffect, useMemo, useState } from "react";
import {
  listSalesProducts,
  listSalesTargets,
  saveSalesTarget,
  deleteSalesTarget,
  computeLadder,
  type SalesProduct,
  type SalesTarget,
} from "../lib/sales";

const DEFAULT: SalesTarget = {
  name: "",
  product_key: "sportsweb_one",
  period: "monthly",
  revenue_target: 14000,
  avg_deal_value: 3500,
  close_rate: 0.3,
  show_rate: 0.8,
  booking_rate: 0.25,
  contact_rate: 0.35,
  cta_conversion_rate: 0.05,
};

const fmt = (n: number) => n.toLocaleString("en-AU");
const card: React.CSSProperties = { background: "#fff", border: "1px solid #e7eaf0", borderRadius: 14, padding: "1.1rem 1.25rem" };

function RateField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12.5, color: "#475467" }}>
      {label}
      <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
        <input
          type="number"
          min={0}
          max={100}
          value={Math.round(value * 100)}
          onChange={(e) => onChange(Math.max(0, Math.min(100, Number(e.target.value))) / 100)}
          style={{ width: 70, padding: "6px 8px", borderRadius: 8, border: "1px solid #d7dbe3", fontSize: 14 }}
        />
        <span style={{ color: "#8a94a6" }}>%</span>
      </span>
    </label>
  );
}

function Rung({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <div style={{ ...card, textAlign: "center", minWidth: 120, flex: 1 }}>
      <div style={{ fontSize: 26, fontWeight: 800, color: "#11161f", fontFamily: "var(--font-display, inherit)" }}>{fmt(value)}</div>
      <div style={{ fontSize: 12, color: "#475467", marginTop: 2 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: "#8a94a6", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

export function SalesFormula() {
  const [products, setProducts] = useState<SalesProduct[]>([]);
  const [targets, setTargets] = useState<SalesTarget[]>([]);
  const [t, setT] = useState<SalesTarget>(DEFAULT);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    listSalesProducts().then(setProducts);
    listSalesTargets().then(setTargets);
  }, []);

  const product = products.find((p) => p.key === t.product_key);
  const ladder = useMemo(() => computeLadder(t), [t]);

  const set = (patch: Partial<SalesTarget>) => setT((cur) => ({ ...cur, ...patch }));

  const pickProduct = (key: string) => {
    const p = products.find((x) => x.key === key);
    set({ product_key: key, avg_deal_value: p ? p.avg_deal_value : t.avg_deal_value });
  };

  const save = async () => {
    if (!t.name.trim()) {
      setMsg("Give the target a name first.");
      return;
    }
    setBusy(true);
    setMsg("");
    const err = await saveSalesTarget({ ...t, name: t.name.trim() });
    if (err) setMsg(err);
    else {
      setMsg("Saved.");
      setTargets(await listSalesTargets());
    }
    setBusy(false);
  };

  const remove = async (id?: string) => {
    if (!id) return;
    await deleteSalesTarget(id);
    setTargets(await listSalesTargets());
  };

  return (
    <div className="sw-admin-page">
      <header className="sw-admin-head">
        <div>
          <h1>Sales formula</h1>
          <p>Enter a revenue target and reverse-engineer the activity it takes to hit it.</p>
        </div>
      </header>

      <div
        style={{
          background: "#fff7ed",
          border: "1px solid #fed7aa",
          color: "#9a3412",
          borderRadius: 10,
          padding: "8px 12px",
          fontSize: 12.5,
          marginBottom: "1.25rem",
        }}
      >
        <strong>In development</strong> — deal values and conversion rates are placeholders until you set real numbers. Anything tagged
        “placeholder” is a starting assumption, not live data.
      </div>

      <div style={{ display: "grid", gap: "1.5rem", gridTemplateColumns: "minmax(280px, 360px) 1fr", alignItems: "start" }}>
        {/* Inputs */}
        <div style={{ ...card, display: "grid", gap: 14 }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12.5, color: "#475467" }}>
            Target name
            <input
              value={t.name}
              onChange={(e) => set({ name: e.target.value })}
              placeholder="e.g. Q3 SportsWeb One"
              style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid #d7dbe3", fontSize: 14 }}
            />
          </label>

          <div style={{ display: "flex", gap: 10 }}>
            <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12.5, color: "#475467", flex: 2 }}>
              Product
              <select value={t.product_key ?? ""} onChange={(e) => pickProduct(e.target.value)} style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid #d7dbe3", fontSize: 14 }}>
                {products.map((p) => (
                  <option key={p.key} value={p.key}>{p.name}</option>
                ))}
              </select>
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12.5, color: "#475467", flex: 1 }}>
              Period
              <select value={t.period} onChange={(e) => set({ period: e.target.value })} style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid #d7dbe3", fontSize: 14 }}>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="annual">Annual</option>
              </select>
            </label>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12.5, color: "#475467", flex: 1 }}>
              Revenue target ($)
              <input type="number" min={0} value={t.revenue_target} onChange={(e) => set({ revenue_target: Number(e.target.value) })} style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid #d7dbe3", fontSize: 14 }} />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12.5, color: "#475467", flex: 1 }}>
              Avg deal value ($){product?.is_placeholder && <em style={{ color: "#b45309", fontStyle: "normal", fontSize: 10.5 }}> · placeholder</em>}
              <input type="number" min={0} value={t.avg_deal_value} onChange={(e) => set({ avg_deal_value: Number(e.target.value) })} style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid #d7dbe3", fontSize: 14 }} />
            </label>
          </div>

          <div style={{ fontSize: 11.5, color: "#8a94a6", textTransform: "uppercase", letterSpacing: ".04em", marginTop: 4 }}>Conversion assumptions</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <RateField label="Close rate" value={t.close_rate} onChange={(v) => set({ close_rate: v })} />
            <RateField label="Demo show rate" value={t.show_rate} onChange={(v) => set({ show_rate: v })} />
            <RateField label="Conversation → booking" value={t.booking_rate} onChange={(v) => set({ booking_rate: v })} />
            <RateField label="Contact rate" value={t.contact_rate} onChange={(v) => set({ contact_rate: v })} />
            <RateField label="CTA conversion" value={t.cta_conversion_rate} onChange={(v) => set({ cta_conversion_rate: v })} />
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 4 }}>
            <button onClick={save} disabled={busy} className="sw-btn" style={{ background: "var(--accent, #2F6BFF)", color: "#fff", border: "none", borderRadius: 8, padding: "9px 16px", fontWeight: 600, cursor: "pointer" }}>
              {t.id ? "Update target" : "Save target"}
            </button>
            {t.id && (
              <button onClick={() => setT(DEFAULT)} style={{ background: "none", border: "none", color: "#667085", cursor: "pointer", fontSize: 13 }}>New</button>
            )}
            {msg && <span style={{ fontSize: 12.5, color: msg === "Saved." ? "#1f9d57" : "#b42318" }}>{msg}</span>}
          </div>
        </div>

        {/* Ladder */}
        <div style={{ display: "grid", gap: "1rem" }}>
          <div style={{ fontSize: 15, color: "#11161f", fontWeight: 600 }}>
            To win <strong>{fmt(ladder.wins)}</strong> {ladder.wins === 1 ? "deal" : "deals"} ({t.period}), the funnel needs:
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "stretch" }}>
            <Rung label="Wins" value={ladder.wins} />
            <Rung label="Presentations" value={ladder.presentations} />
            <Rung label="Demos booked" value={ladder.demos} />
            <Rung label="Conversations" value={ladder.conversations} />
            <Rung label="Contact attempts" value={ladder.contacts} />
            <Rung label="CTA views" value={ladder.ctaViews} />
          </div>
          <div style={{ ...card, fontSize: 14, color: "#475467", lineHeight: 1.6 }}>
            <strong style={{ color: "#11161f" }}>{fmt(ladder.wins)} sales</strong> = {fmt(ladder.presentations)} presentations = {fmt(ladder.demos)} demos booked ={" "}
            {fmt(ladder.conversations)} conversations = {fmt(ladder.contacts)} targeted contacts = <strong style={{ color: "#11161f" }}>{fmt(ladder.ctaViews)} CTA views</strong>.
          </div>

          {targets.length > 0 && (
            <div style={{ ...card }}>
              <div style={{ fontSize: 12, color: "#667085", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 10 }}>Saved targets</div>
              <div style={{ display: "grid", gap: 8 }}>
                {targets.map((s) => (
                  <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13.5 }}>
                    <button onClick={() => setT(s)} style={{ flex: 1, textAlign: "left", background: "none", border: "none", cursor: "pointer", color: "#11161f", fontWeight: 600 }}>
                      {s.name}
                    </button>
                    <span style={{ color: "#8a94a6", fontSize: 12.5 }}>${fmt(s.revenue_target)} · {s.period}</span>
                    <button onClick={() => remove(s.id)} aria-label="Delete" style={{ background: "none", border: "none", color: "#b42318", cursor: "pointer", fontSize: 13 }}>Remove</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
