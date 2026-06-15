import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/auth";
import { slugify, type Field, type ResourceDef } from "./resources";

type Row = Record<string, unknown> & { id?: string };

function toInputDateTime(value: unknown): string {
  if (!value) return "";
  const d = new Date(value as string);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function fromInputDateTime(value: string): string | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

export function ResourceManager({ resource }: { resource: ResourceDef }) {
  const { membership } = useAuth();
  const clubId = membership?.clubId;

  const [rows, setRows] = useState<Row[]>([]);
  const [editing, setEditing] = useState<Row | "new" | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!supabase || !clubId) return;
    setError(null);
    const { data, error: e } = await supabase
      .from(resource.table)
      .select("*")
      .eq("club_id", clubId)
      .order(resource.order.col, { ascending: resource.order.asc });
    if (e) setError(e.message);
    else setRows((data as Row[]) ?? []);
  }, [clubId, resource]);

  useEffect(() => {
    setEditing(null);
    load();
  }, [load]);

  const openNew = () => {
    const v: Record<string, string> = {};
    for (const f of resource.fields) {
      const d = resource.defaults[f.name];
      v[f.name] = d != null ? String(d) : "";
    }
    setValues(v);
    setEditing("new");
  };

  const openEdit = (row: Row) => {
    const v: Record<string, string> = {};
    for (const f of resource.fields) {
      const raw = row[f.name];
      v[f.name] = f.type === "datetime" ? toInputDateTime(raw) : raw != null ? String(raw) : "";
    }
    setValues(v);
    setEditing(row);
  };

  const save = async () => {
    if (!supabase || !clubId) return;
    setBusy(true);
    setError(null);
    const payload: Record<string, unknown> = { club_id: clubId };
    for (const f of resource.fields) {
      const val = values[f.name] ?? "";
      if (f.type === "datetime") payload[f.name] = fromInputDateTime(val);
      else if (f.type === "number") payload[f.name] = val === "" ? null : Number(val);
      else payload[f.name] = val === "" ? null : val;
    }
    if (resource.slugFrom && (!payload.slug || payload.slug === "")) {
      payload.slug = slugify(String(values[resource.slugFrom] ?? ""));
    }

    const isNew = editing === "new";
    const query = isNew
      ? supabase.from(resource.table).insert(payload)
      : supabase.from(resource.table).update(payload).eq("id", (editing as Row).id).eq("club_id", clubId);

    const { error: e } = await query;
    setBusy(false);
    if (e) {
      setError(e.message);
      return;
    }
    setEditing(null);
    load();
  };

  const remove = async (row: Row) => {
    if (!supabase || !clubId || !row.id) return;
    if (!window.confirm("Delete this item? This can't be undone.")) return;
    const { error: e } = await supabase
      .from(resource.table)
      .delete()
      .eq("id", row.id)
      .eq("club_id", clubId);
    if (e) setError(e.message);
    else load();
  };

  if (editing !== null) {
    return (
      <div className="sw-admin-panel">
        <div className="sw-admin-formhead">
          <h2>{editing === "new" ? `New ${resource.label.replace(/s$/, "")}` : `Edit ${resource.label.replace(/s$/, "")}`}</h2>
          <button className="sw-btn sw-btn--ghost" onClick={() => setEditing(null)}>
            Cancel
          </button>
        </div>
        {error && <p className="sw-admin-error">{error}</p>}
        <div className="sw-admin-form">
          {resource.fields.map((f) => (
            <FieldInput key={f.name} field={f} value={values[f.name] ?? ""} onChange={(v) => setValues((s) => ({ ...s, [f.name]: v }))} />
          ))}
        </div>
        <button className="sw-btn" onClick={save} disabled={busy}>
          {busy ? "Saving…" : "Save"}
        </button>
      </div>
    );
  }

  return (
    <div className="sw-admin-panel">
      <div className="sw-admin-formhead">
        <h2>{resource.label}</h2>
        <button className="sw-btn" onClick={openNew}>
          New {resource.label.replace(/s$/, "")}
        </button>
      </div>
      {error && <p className="sw-admin-error">{error}</p>}
      {rows.length === 0 ? (
        <p className="sw-admin-empty">Nothing here yet. Create your first {resource.label.toLowerCase().replace(/s$/, "")}.</p>
      ) : (
        <table className="sw-table sw-admin-table">
          <thead>
            <tr>
              {resource.listColumns.map((c) => (
                <th key={c.name}>{c.label}</th>
              ))}
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={String(row.id)}>
                {resource.listColumns.map((c) => (
                  <td key={c.name}>{formatCell(row[c.name])}</td>
                ))}
                <td className="sw-admin-rowactions">
                  <button onClick={() => openEdit(row)}>Edit</button>
                  <button className="danger" onClick={() => remove(row)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function formatCell(v: unknown): string {
  if (v == null) return "—";
  const s = String(v);
  // Tidy ISO timestamps in list view.
  if (/^\d{4}-\d{2}-\d{2}T/.test(s)) {
    const d = new Date(s);
    if (!Number.isNaN(d.getTime())) return d.toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
  }
  return s;
}

function FieldInput({ field, value, onChange }: { field: Field; value: string; onChange: (v: string) => void }) {
  const common = { id: field.name, value, onChange: (e: { target: { value: string } }) => onChange(e.target.value) };
  return (
    <label className="sw-admin-field">
      <span>
        {field.label}
        {field.required && <i aria-hidden="true"> *</i>}
      </span>
      {field.type === "textarea" ? (
        <textarea rows={4} {...common} />
      ) : field.type === "select" ? (
        <select {...common}>
          {field.options?.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={field.type === "datetime" ? "datetime-local" : field.type === "number" ? "number" : field.type === "url" ? "url" : "text"}
          {...common}
        />
      )}
      {field.help && <small>{field.help}</small>}
    </label>
  );
}
