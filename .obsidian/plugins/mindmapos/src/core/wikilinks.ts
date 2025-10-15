// src/core/wikilinks.ts
import { App, TFile, TAbstractFile, MarkdownView, normalizePath, parseYaml, stringifyYaml } from "obsidian";
import { localISO } from "./utils";

// Matches: "task - title", "task — title", or "task title" (any case)
const NAME_RE = /^(task|project|goal|area|habit|note)\s*(?:[-–—]\s*)?(.*)$/i;

type Kind = "task" | "project" | "goal" | "area" | "habit" | "note";

const LABELS: Record<Kind, [emoji: string, label: string]> = {
  task: ["📌", "Task"],
  project: ["🚀", "Project"],
  goal: ["🎯", "Goal"],
  area: ["🌱", "Area"],
  habit: ["🔄", "Habit"],
  note: ["✏️", "Note"],
};

function applyTokens(s: string, extra: Record<string, string> = {}) {
  const d = new Date();
  const dateLong = d.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
  const getISOWeek = (dd: Date) => {
    const dt = new Date(Date.UTC(dd.getFullYear(), dd.getMonth(), dd.getDate()));
    const day = dt.getUTCDay() || 7;
    dt.setUTCDate(dt.getUTCDate() + 4 - day);
    const start = new Date(Date.UTC(dt.getUTCFullYear(), 0, 1));
    return Math.ceil(((dt.getTime() - start.getTime()) / 86400000 + 1) / 7);
  };
  const map: Record<string, string> = {
    "{{date}}": localISO(d),
    "{{dateLong}}": dateLong,
    "{{year}}": String(d.getFullYear()),
    "{{monthShort}}": d.toLocaleString("en-US", { month: "short" }),
    "{{isoWeek}}": String(getISOWeek(d)),
    "{{quarter}}": String(Math.floor(d.getMonth() / 3) + 1),
    ...extra,
  };
  let out = s;
  for (const k in map) out = out.split(k).join(map[k]);
  return out;
}

function upsertDates(content: string, createdISO: string): string {
  const fmRe = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;
  const m = content.match(fmRe);
  if (m) {
    const data = (parseYaml(m[1]) ?? {}) as Record<string, any>;
    if (!data.created) data.created = createdISO;
    if (!("due" in data)) data.due = ""; // empty date key → date-type placeholder
    let yaml = stringifyYaml(data).trimEnd();
    yaml = yaml.replace(/^due:\s*(['"])?\1?$/m, "due: "); // keep empty
    const nl = m[0].includes("\r\n") ? "\r\n" : "\n";
    return content.replace(m[0], `---${nl}${yaml}${nl}---${nl}`);
  }
  return `---\ncreated: ${createdISO}\ndue: \n---\n` + content;
}

async function readTemplate(app: App, kind: Kind): Promise<string> {
  const [, label] = LABELS[kind];
  const primary = normalizePath(`03 SaveBox/Templates/${label} Template.md`);
  const f1 = app.vault.getAbstractFileByPath(primary);
  if (f1 instanceof TFile) return app.vault.read(f1);
  // minimal fallback
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

async function uniquePath(app: App, pathNoExt: string, ext = ".md") {
  let p = normalizePath(pathNoExt + ext);
  let n = 1;
  while (app.vault.getAbstractFileByPath(p)) {
    p = normalizePath(`${pathNoExt} (${n})${ext}`);
    n++;
  }
  return p;
}

function sanitizeFilename(s: string) {
  return s.replace(/[\\/:*?"<>|]/g, "").trim();
}

async function rewriteActiveLink(app: App, oldBase: string, newBase: string) {
  const md = app.workspace.getActiveViewOfType(MarkdownView);
  if (!md) return;
  const ed = md.editor;
  const text = ed.getValue();
  // Replace the exact wikilink [[oldBase]] or [[oldBase|...]]
  const escaped = oldBase.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
  const re = new RegExp(`\\[\\[${escaped}(\\|[^\\]]+)?\\]\\]`, "g");
  const next = text.replace(re, `[[${newBase}]]`);
  if (next !== text) {
    const cursor = ed.getCursor();
    ed.setValue(next);
    ed.setCursor(cursor);
  }
}

export function watchWikilinks(app: App) {
  console.log("MMOS wikilink watcher: ON");

  app.vault.on("create", async (file: TAbstractFile) => {
    try {
      if (!(file instanceof TFile)) return;
      if (file.extension.toLowerCase() !== "md") return;

      const base = file.basename.trim();
      const m = NAME_RE.exec(base);
      if (!m) return;

      const kind = m[1].toLowerCase() as Kind;
      const coreTitle = (m[2] || "").trim() || "Untitled";
      const [emoji, label] = LABELS[kind];

      // only route empty stubs created from wikilinks
      const content = await app.vault.read(file);
      if (content.trim().length > 0) return;

      // target path under Active
      const clean = sanitizeFilename(coreTitle);
      const targetNoExt = normalizePath(`03 SaveBox/Active/${emoji}${label} - ${clean}`);
      const targetPath = await uniquePath(app, targetNoExt, ".md");

      // 1) Rename the stub → preserves link resolution immediately
      await app.fileManager.renameFile(file, targetPath);

      // 2) Build body from template + tokens + frontmatter dates
      let body = await readTemplate(app, kind);
      body = applyTokens(body, {
        "{{title}}": `${emoji}${label} - ${clean}`,
        "{{kind}}": label,
        "{{emoji}}": emoji,
        "{{core}}": clean,
      });
      body = upsertDates(body, localISO());

      // 3) Write content into the renamed file
      await app.vault.modify(file, body);

      // 4) Rewrite the original [[...]] text in the active editor to pretty name
      await rewriteActiveLink(app, base, `${emoji}${label} - ${clean}`);

      console.log(`MMOS wikilink routed → ${kind} | ${clean}`);
    } catch (err) {
      console.error("MMOS wikilink routing error:", err);
    }
  });
}
