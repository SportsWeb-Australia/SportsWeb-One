export type FieldType = "text" | "textarea" | "date" | "datetime" | "select" | "url" | "number";

export interface Field {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: string[];
  help?: string;
}

export interface ResourceDef {
  key: string;
  label: string;
  table: string;
  order: { col: string; asc: boolean };
  listColumns: { name: string; label: string }[];
  fields: Field[];
  /** Field whose value seeds an auto-slug when slug is left blank. */
  slugFrom?: string;
  defaults: Record<string, unknown>;
}

const STATUS: Field = {
  name: "status",
  label: "Status",
  type: "select",
  options: ["published", "draft"],
  required: true,
};

export const RESOURCES: ResourceDef[] = [
  {
    key: "news",
    label: "News",
    table: "news",
    order: { col: "published_at", asc: false },
    slugFrom: "title",
    listColumns: [
      { name: "title", label: "Title" },
      { name: "status", label: "Status" },
      { name: "published_at", label: "Published" },
    ],
    defaults: { status: "published" },
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "slug", label: "Slug", type: "text", help: "Leave blank to auto-generate." },
      { name: "summary", label: "Summary", type: "textarea", help: "Shown on cards." },
      { name: "content", label: "Content", type: "textarea", help: "Full article (HTML allowed)." },
      { name: "published_at", label: "Publish date", type: "datetime" },
      STATUS,
    ],
  },
  {
    key: "events",
    label: "Events",
    table: "events",
    order: { col: "event_date", asc: true },
    slugFrom: "title",
    listColumns: [
      { name: "title", label: "Title" },
      { name: "event_date", label: "Date" },
      { name: "status", label: "Status" },
    ],
    defaults: { status: "published" },
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "slug", label: "Slug", type: "text", help: "Leave blank to auto-generate." },
      { name: "event_date", label: "Date & time", type: "datetime", required: true },
      { name: "location", label: "Location", type: "text" },
      { name: "description", label: "Description", type: "textarea" },
      STATUS,
    ],
  },
  {
    key: "sponsors",
    label: "Sponsors",
    table: "sponsors",
    order: { col: "display_order", asc: true },
    listColumns: [
      { name: "name", label: "Name" },
      { name: "sponsor_level", label: "Level" },
      { name: "status", label: "Status" },
    ],
    defaults: { status: "published", sponsor_level: "gold", display_order: 0 },
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "website_url", label: "Website", type: "url" },
      {
        name: "sponsor_level",
        label: "Level",
        type: "select",
        options: ["platinum", "gold", "silver"],
        required: true,
      },
      { name: "display_order", label: "Order", type: "number", help: "Lower shows first." },
      STATUS,
    ],
  },
  {
    key: "teams",
    label: "Teams",
    table: "teams",
    order: { col: "display_order", asc: true },
    slugFrom: "name",
    listColumns: [
      { name: "name", label: "Team" },
      { name: "grade", label: "Grade" },
      { name: "status", label: "Status" },
    ],
    defaults: { status: "published", display_order: 0 },
    fields: [
      { name: "name", label: "Team name", type: "text", required: true },
      { name: "slug", label: "Slug", type: "text", help: "Leave blank to auto-generate." },
      { name: "age_group", label: "Age group", type: "text" },
      {
        name: "gender",
        label: "Gender",
        type: "select",
        options: ["Men", "Women", "Mixed"],
      },
      { name: "grade", label: "Grade / division", type: "text" },
      { name: "coach_name", label: "Coach", type: "text" },
      { name: "training_details", label: "Training", type: "text" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "display_order", label: "Order", type: "number" },
      STATUS,
    ],
  },
];

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
