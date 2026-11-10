import { writeFileSync, mkdirSync } from "node:fs";
import { categories, defaultSettings } from "../src/lib/taxonomy";
const literal = (s: string) => `'${s.replaceAll("'", "''")}'`;
mkdirSync("supabase", { recursive: true });
writeFileSync(
  "supabase/seed.sql",
  `-- Taxonomy and public settings only. No articles or authors.\ninsert into public.categories(slug,name,kind,description,icon,position,image,indexable) values\n${categories.map((c) => `(${[c.slug, c.name, c.kind, c.description, c.icon].map(literal).join(",")},${c.position},${c.image ? literal(c.image) : "null"},false)`).join(",\n")}\non conflict(slug) do nothing;\ninsert into public.site_settings(id,value) values('public',${literal(JSON.stringify(defaultSettings))}::jsonb) on conflict(id) do nothing;\n`,
);
