import { App, TFile, normalizePath } from "obsidian";

export async function updateFrontmatter(
  app: App,
  filePath: string,
  patch: Record<string, any>
) {
  const p = normalizePath(filePath);
  const f = app.vault.getAbstractFileByPath(p);
  if (!(f instanceof TFile)) return;
  await app.fileManager.processFrontMatter(f, (fm) => {
    Object.assign(fm, patch);
  });
}
