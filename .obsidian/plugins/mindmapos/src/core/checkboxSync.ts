import { App, TFile, MarkdownView } from "obsidian";

/* ---------- helpers ---------- */
function escapeRx(s: string)      { return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
function debounce<T extends (...a: any[]) => any>(fn: T, wait: number) {
  let t: number | null = null as any;
  return (...args: Parameters<T>) => {
    if (t) window.clearTimeout(t);
    t = window.setTimeout(() => { t = null; fn(...args); }, wait);
  };
}

function findHeadingRange(src: string, name: string) {
  const re = new RegExp(`^#{1,6}\\s+${escapeRx(name)}\\s*$`, "gim");
  const m = re.exec(src);
  if (!m) return null;
  const start = m.index + m[0].length;
  const level = (m[0].match(/^#+/) || ["#"])[0].length;
  const next = new RegExp(`^#{1,${level}}\\s+`, "gim");
  next.lastIndex = start;
  const n = next.exec(src);
  return { start, end: n ? n.index : src.length };
}

const boxRe = /^[ \t>]*[-*]\s+\[( |x|X)\]\s.*$/gim;
function getFirstCheckbox(src: string, range: {start:number; end:number}) {
  const slice = src.slice(range.start, range.end);
  boxRe.lastIndex = 0;
  const m = boxRe.exec(slice);
  if (!m) return null;
  const absStart = range.start + m.index;
  const absEnd   = absStart + m[0].length;
  const checked  = /\[(x|X)\]/.test(m[0]);
  return { absStart, absEnd, line: m[0], checked };
}
function setChecked(line: string, v: boolean) {
  return line.replace(/\[(?: |x|X)\]/, v ? "[x]" : "[ ]");
}

// template/race guards
const SKIP_NEWFILE_MS = 2000;
function isTemplatePath(path: string) { return /(^|\/)(templates?|Templates?)(\/|$)/.test(path); }
function isTemplateFM(fm: any)       { return fm?.template === true || fm?.is_template === true || fm?.type === "template"; }
function hasTemplaterTags(text: string) { return /<%[\s\S]*?%>/.test(text); }
function isTooNew(file: TFile)       { const c = file?.stat?.ctime ?? 0; return Date.now() - c < SKIP_NEWFILE_MS; }

/* ---------- module ---------- */
export function registerCheckboxSync(app: App) {
  const writing = new Set<string>();

  const hideOwnNotices = app.vault.on("modify", (file) => {
    if (writing.has(file.path)) {
      // @ts-ignore private API on desktop, safe to guard
      if ((app as any)?.notifier?.hideAll) (app as any).notifier.hideAll();
    }
  });

  const getEditorInfo = (file: TFile) => {
    const md = app.workspace.getActiveViewOfType(MarkdownView);
    const isActive = !!md && (md as any).file?.path === file.path;
    const inEdit = isActive && md?.getMode() !== "preview";
    return { editor: md?.editor, inEdit };
  };

  const writeFM = async (file: TFile, patch: Record<string, any>) => {
    writing.add(file.path);
    try {
      await app.fileManager.processFrontMatter(file, (m) => {
        for (const k of Object.keys(patch)) m[k] = patch[k];
      });
    } finally { writing.delete(file.path); }
  };

  const replaceBody = async (file: TFile, src: string, start: number, end: number, replacement: string) => {
    const { editor, inEdit } = getEditorInfo(file);
    writing.add(file.path);
    try {
      if (inEdit && editor) {
        const from = editor.offsetToPos(start);
        const to   = editor.offsetToPos(end);
        await new Promise(requestAnimationFrame);
        editor.replaceRange(replacement, from, to);
      } else {
        const next = src.slice(0, start) + replacement + src.slice(end);
        if (next !== src) await app.vault.modify(file, next);
      }
    } finally { writing.delete(file.path); }
  };

  const syncActive = async () => {
    const file = app.workspace.getActiveFile();
    if (!file) return;
    if (isTemplatePath(file.path)) return;

    const cache = app.metadataCache.getFileCache(file) ?? {};
    const fm = cache.frontmatter ?? {};
    if (isTemplateFM(fm)) return;

    const { editor, inEdit } = getEditorInfo(file);
    const text = inEdit && editor ? editor.getValue() : await app.vault.read(file);
    if (!text) return;
    if (hasTemplaterTags(text)) return;

    // Only operate on Task/Project/Goal notes
    const isTarget = /^#{1,6}\s+My\s+(Task|Project|Goal)\s*$/im.test(text);
    if (!isTarget) return;
    if (isTooNew(file)) return;
    if (writing.has(file.path)) return;

    const scopes = [
      { heading: "My Task",    flag: "_task_sync_state" },
      { heading: "My Project", flag: "_project_sync_state" },
      { heading: "My Goal",    flag: "_goal_sync_state" }
    ];

    for (const scope of scopes) {
      const range = findHeadingRange(text, scope.heading);
      if (!range) continue;

      const box = getFirstCheckbox(text, range);
      if (!box) continue;

      const yamlDone  = typeof fm.done === "boolean" ? fm.done : null;
      const prevState = typeof fm[scope.flag] === "boolean" ? fm[scope.flag] : null;
      const boxNow = box.checked;

      // first run → adopt checkbox
      if (prevState === null) {
        await writeFM(file, { done: !!boxNow, [scope.flag]: !!boxNow });
        return;
      }

      const yamlChanged = yamlDone !== null && yamlDone !== prevState;
      const boxChanged  = boxNow !== prevState;

      if (boxChanged) {
        await writeFM(file, { done: !!boxNow, [scope.flag]: !!boxNow });
        return;
      }

      if (yamlChanged) {
        const newLine = setChecked(box.line, !!yamlDone);
        await replaceBody(file, text, box.absStart, box.absEnd, newLine);
        await writeFM(file, { [scope.flag]: !!yamlDone });
        return;
      }

      return; // already in sync for this scope
    }
  };

  const syncDebounced = debounce(syncActive, 150);

  // Events mirrored from your plugin
  app.workspace.on("file-open",            () => syncDebounced());
  app.workspace.on("active-leaf-change",   () => syncDebounced());
  app.workspace.on("layout-change",        () => syncDebounced());
  app.workspace.on("editor-change",        () => syncDebounced());
  app.metadataCache.on("changed",          () => syncDebounced());
  app.metadataCache.on("resolved",         () => syncDebounced());
  app.vault.on("modify",                   () => syncDebounced());
  app.vault.on("rename",                   () => syncDebounced());
  app.vault.on("create",                   () => syncDebounced());

  // keep notice hider registered
  // (no explicit unregister necessary, plugin unload clears listeners)
}

/* Optional command helper if you still want a manual toggle */
export async function toggleDone(app: App, file: TFile) {
  const cache = app.metadataCache.getFileCache(file) ?? {};
  const fm = cache.frontmatter ?? {};
  const want = !(typeof fm.done === "boolean" ? fm.done : false);

  // Flip YAML first
  await app.fileManager.processFrontMatter(file, (m) => { m.done = want; });

  // Then flip the first checkbox under any of the headings
  const text = await app.vault.read(file);
  const scopes = ["My Task", "My Project", "My Goal"];
  for (const h of scopes) {
    const r = findHeadingRange(text, h);
    if (!r) continue;
    const box = getFirstCheckbox(text, r);
    if (!box) continue;
    const newLine = setChecked(box.line, want);
    const next = text.slice(0, box.absStart) + newLine + text.slice(box.absEnd);
    if (next !== text) await app.vault.modify(file, next);
    break;
  }
}
