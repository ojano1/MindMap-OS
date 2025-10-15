import { App, TFile, normalizePath } from "obsidian";
import { writeOrReplace, ensureFolder } from "./utils";

function fmt(d: Date, opts: Intl.DateTimeFormatOptions) {
  return d.toLocaleDateString("en-US", opts);
}
function dateHeader(d = new Date()) {
  return fmt(d, { day: "2-digit", month: "short", year: "numeric" });
}
function dailyPath(d = new Date()) {
  // Put dailies under your Execution stack (matches scaffold)
  const folder = "02 Execution/1 Daily";
  const name = `${dateHeader(d)}.md`;
  return normalizePath(`${folder}/${name}`);
}

export async function openToday(app: App): Promise<TFile> {
  const path = dailyPath();
  await ensureFolder(app, path.split("/").slice(0, -1).join("/"));
  const content = `# ${dateHeader()}

### ✍️ Fleeting Notes
- 
`;
  await writeOrReplace(app, path, content);

  const f = app.vault.getAbstractFileByPath(path);
  if (f && f instanceof TFile) {
    await app.workspace.getLeaf(true).openFile(f);
    return f;
  }
  throw new Error("Failed to create/open today's note.");
}
