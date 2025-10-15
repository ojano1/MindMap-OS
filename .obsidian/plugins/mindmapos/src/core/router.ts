// src/core/router.ts
import {
  App,
  Notice,
  TFile,
  TAbstractFile,
  normalizePath,
  parseYaml,
  stringifyYaml,
} from "obsidian";
import { ensureFolder, localISO } from "./utils";

/* ---------- helpers ---------- */
const rAll = (s: string, from: string, to: string) => s.split(from).join(to);
const dateLong = (d = new Date()) =>
  d.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

function getISOWeek(d: Date) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

function sanitizeFilename(s: string) {
  return s.replace(/[\\/:*?"<>|]/g, "").trim();
}

async function createUnique(app: App, pathNoExt: string, ext = ".md") {
  let path = normalizePath(pathNoExt + ext);
  let n = 1;
  while (app.vault.getAbstractFileByPath(path)) {
    path = normalizePath(`${pathNoExt} (${n})${ext}`);
    n++;
  }
  return path;
}

function applyTokens(s: string, extra: Record<string, string> = {}) {
  const d = new Date();
  const map: Record<string, string> = {
    "{{date}}": localISO(d),
    "{{dateLong}}": dateLong(d),
    "{{year}}": String(d.getFullYear()),
    "{{monthShort}}": d.toLocaleString("en-US", { month: "short" }),
    "{{isoWeek}}": String(getISOWeek(d)),
    "{{quarter}}": String(Math.floor(d.getMonth() / 3) + 1),
    ...extra,
  };
  let out = s;
  for (const k in map) out = rAll(out, k, map[k]);
  return out;
}

/* ---------- types/labels ---------- */
export type Kind = "task" | "project" | "goal" | "habit" | "note" | "area";
export const KINDS: ReadonlyArray<Kind> = [
  "task",
  "project",
  "goal",
  "habit",
  "note",
  "area",
] as const;

function labelFor(kind: Kind): [string, string] {
  const map: Record<Kind, [string, string]> = {
    task: ["📌", "Task"],
    project: ["🚀", "Project"],
    goal: ["🎯", "Goal"],
    habit: ["🔄", "Habit"],
    note: ["✏️", "Note"],
    area: ["🌱", "Area"],
  };
  return map[kind];
}

/* ---------- template loaders ---------- */
async function readTemplate(app: App, kind: Kind): Promise<string> {
  const [, label] = labelFor(kind);

  const primary = normalizePath(`03 SaveBox/Templates/${label} Template.md`);
  const f1 = app.vault.getAbstractFileByPath(primary);

  const fallback = normalizePath(`99 Templates/${label}.md`);
  const f2 = app.vault.getAbstractFileByPath(fallback);

  const file = (f1 ?? f2) as TAbstractFile | null;
  if (file && file instanceof TFile) {
    return await app.vault.read(file);
  }

  // minimal fallback (no on-page created line)
  return `---
created: {{date}}
due: 
status: Active
done: false
---

# {{emoji}}{{label}} - {{core}}

- [ ] {{emoji}}{{label}} - {{core}}
`;
}

/* ---------- YAML upserts ---------- */
function upsertDatesFrontmatter(content: string, createdISO: string): string {
  const fmRe = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;
  const m = content.match(fmRe);

  if (m) {
    const data = (parseYaml(m[1]) ?? {}) as Record<string, any>;
    if (!data.created) data.created = createdISO;
    if (!("due" in data)) data.due = ""; // empty date field, shows date picker

    let yaml = stringifyYaml(data).trimEnd();
    yaml = yaml.replace(/^due:\s*(['"])?\1?$/m, "due: "); // keep empty key

    const nl = m[0].includes("\r\n") ? "\r\n" : "\n";
    return content.replace(m[0], `---${nl}${yaml}${nl}---${nl}`);
  }

  return `---\ncreated: ${createdISO}\ndue: \n---\n` + content;
}

function upsertAliases(content: string, add: string[]): string {
  if (!add || add.length === 0) return content;

  const fmRe = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;
  const m = content.match(fmRe);

  if (!m) {
    const yaml = stringifyYaml({ aliases: Array.from(new Set(add)) }).trimEnd();
    return `---\n${yaml}\n---\n` + content;
  }

  const data = (parseYaml(m[1]) ?? {}) as Record<string, any>;
  const current = Array.isArray(data.aliases)
    ? data.aliases
    : data.aliases
    ? [data.aliases]
    : [];
  const merged = Array.from(new Set([...current, ...add].filter(Boolean)));
  if (merged.length === 0) return content;

  data.aliases = merged;
  const nl = m[0].includes("\r\n") ? "\r\n" : "\n";
  const yaml = stringifyYaml(data).trimEnd();
  return content.replace(m[0], `---${nl}${yaml}${nl}---${nl}`);
}

/* ---------- main API ---------- */
export async function createTypedNote(
  app: App,
  kind: Kind,
  core: string,
  opts?: { aliases?: string[] }
): Promise<TFile> {
  const [emoji, label] = labelFor(kind);

  const baseDir = "03 SaveBox/Active";
  await ensureFolder(app, baseDir);

  const cleanCore = sanitizeFilename(core) || "Untitled";
  const filenameNoExt = `${baseDir}/${emoji}${label} - ${cleanCore}`;
  const path = await createUnique(app, filenameNoExt);

  let body = await readTemplate(app, kind);

  body = applyTokens(body, {
    "{{title}}": `${emoji}${label} - ${cleanCore}`,
    "{{kind}}": label,
    "{{emoji}}": emoji,
    "{{core}}": cleanCore,
  });

  // frontmatter dates
  body = upsertDatesFrontmatter(body, localISO());

  // aliases
  if (opts?.aliases?.length) {
    body = upsertAliases(body, opts.aliases);
  }

  const file = await app.vault.create(path, body);

  // same pane by default
  await app.workspace.getLeaf(false).openFile(file);

  new Notice(`${label} created: ${cleanCore}`);
  return file;
}
