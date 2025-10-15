import { App, TAbstractFile, TFile, normalizePath } from "obsidian";

export const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));

export function pathExists(app: App, path: string): TAbstractFile | null {
  const p = normalizePath(path);
  return app.vault.getAbstractFileByPath(p) ?? null;
}

export async function ensureFolder(app: App, folder: string) {
  const parts = normalizePath(folder).split("/");
  let cur = "";
  for (const part of parts) {
    cur = cur ? `${cur}/${part}` : part;
    if (!app.vault.getAbstractFileByPath(cur)) {
      await app.vault.createFolder(cur);
    }
  }
}

export async function writeIfMissing(app: App, path: string, content: string) {
  const p = normalizePath(path);
  const existing = pathExists(app, p);
  if (!existing) {
    await ensureFolder(app, p.split("/").slice(0, -1).join("/"));
    await app.vault.create(p, content);
  }
}

export async function writeOrReplace(app: App, path: string, content: string) {
  const p = normalizePath(path);
  const existing = pathExists(app, p);
  if (!existing) {
    await ensureFolder(app, p.split("/").slice(0, -1).join("/"));
    return app.vault.create(p, content);
  }
  if (existing instanceof TFile) {
    return app.vault.modify(existing, content);
  }
}
