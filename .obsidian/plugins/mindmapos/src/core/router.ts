import { App, Notice, TFile, TAbstractFile, normalizePath } from "obsidian";
import { ensureFolder, localISO } from "./utils";

/* ---------- helpers ---------- */
const rAll = (s: string, from: string, to: string) => s.split(from).join(to);
const dateLong = (d = new Date()) =>
  d.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });

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
type Kind = "task" | "project" | "goal" | "habit" | "note" | "area";

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

/* ---------- templates ---------- */
async function readTemplate(app: App, kind: Kind): Promise<string> {
  const primary = normalizePath(`03 SaveBox/Templates/${labelFor(kind)[1]} Template.md`);
  const f1 = app.vault.getAbstractFileByPath(primary);

  const fallback = normalizePath(`99 Templates/${labelFor(kind)[1]}.md`);
  const f2 = app.vault.getAbstractFileByPath(fallback);

  const file = (f1 ?? f2) as TAbstractFile | null;
  if (!file) return "";

  if (file instanceof TFile) {
    return await app.vault.read(file);
  }
  return "";
}

/* ---------- main API ---------- */
export async function createTypedNote(
  app: App,
  kind: Kind,
  core: string
): Promise<TFile> {
  const [emoji, label] = labelFor(kind);
  const baseDir = "03 SaveBox/Active";
  await ensureFolder(app, baseDir);

  const cleanCore = sanitizeFilename(core) || "Untitled";
  const filenameNoExt = `${baseDir}/${emoji}${label} - ${cleanCore}`;
  const path = await createUnique(app, filenameNoExt);

  let body = await readTemplate(app, kind);
  if (!body) {
    body = `---
status: Active
done: false
---

# ${emoji}${label} - ${cleanCore}

- [ ] ${emoji}${label} - ${cleanCore}

> created {{date}}
`;
  }

  body = applyTokens(body, {
    "{{title}}": `${emoji}${label} - ${cleanCore}`,
    "{{kind}}": label,
    "{{emoji}}": emoji,
    "{{core}}": cleanCore,
  });

  const file = await app.vault.create(path, body);
  await app.workspace.getLeaf(true).openFile(file);
  new Notice(`${label} created: ${cleanCore}`);
  return file;
}
