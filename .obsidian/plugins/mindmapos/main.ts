import { Plugin, Notice, Modal, Setting } from "obsidian";
import { createTypedNote } from "./src/core/router";
import { createStarterStructure } from "./src/core/scaffold";
import { openToday } from "./src/core/periodics";
import { watchWikilinks } from "./src/core/wikilinks";
import { registerCheckboxSync, toggleDone } from "./src/core/checkboxSync";

/* ---------- Simple input modal ---------- */
class TextPromptModal extends Modal {
  private value = "";
  constructor(
    app: any,
    private opts: {
      title: string;
      placeholder?: string;
      cta?: string;
      onSubmit: (value: string) => void;
    }
  ) {
    super(app);
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h3", { text: this.opts.title });

    let inputEl: HTMLInputElement | null = null;

    new Setting(contentEl)
      .addText((t) => {
        inputEl = t.inputEl;
        t.setPlaceholder(this.opts.placeholder ?? "").onChange((v) => {
          this.value = v;
        });
        setTimeout(() => inputEl?.focus(), 0);
      })
      .addButton((b) => {
        b.setCta()
          .setButtonText(this.opts.cta ?? "Create")
          .onClick(() => {
            const v = this.value.trim();
            if (!v) return;
            this.close();
            this.opts.onSubmit(v);
          });
      });

    contentEl.onkeydown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        const v = this.value.trim();
        if (!v) return;
        this.close();
        this.opts.onSubmit(v);
      }
    };
  }
  onClose() { this.contentEl.empty(); }
}

/* ---------- Plugin ---------- */
export default class MindMapOS extends Plugin {
  async onload() {
    // Watchers
    watchWikilinks(this.app);
    registerCheckboxSync(this.app);

    this.addCommand({
      id: "mindmapos-toggle-done",
      name: "MindMap OS: Toggle Done",
      callback: async () => {
        const f = this.app.workspace.getActiveFile();
        if (!f) return new Notice("No active file.");
        await toggleDone(this.app, f);
      },
    }); 

    // New item commands (route through createTypedNote)
    const newCmd = (kind: "task" | "project" | "goal" | "area" | "habit" | "note", label: string) => {
      this.addCommand({
        id: `mindmapos-new-${kind}`,
        name: `MindMap OS: New ${label}`,
        callback: () => {
          new TextPromptModal(this.app, {
            title: `New ${label}`,
            placeholder: `Enter ${label.toLowerCase()} title`,
            cta: `Create ${label}`,
            onSubmit: async (title) => { await createTypedNote(this.app, kind, title); },
          }).open();
        },
      });
    };
    newCmd("task", "Task");
    newCmd("project", "Project");
    newCmd("goal", "Goal");
    newCmd("area", "Area");
    newCmd("habit", "Habit");
    newCmd("note", "Note");

    // Toggle Done (frontmatter ↔ first checkbox)
    this.addCommand({
      id: "mindmapos-toggle-done",
      name: "MindMap OS: Toggle Done",
      callback: async () => {
        const f = this.app.workspace.getActiveFile();
        if (!f) return new Notice("No active file.");
        await toggleDone(this.app, f);
      },
    });

    // Open Today
    this.addCommand({
      id: "mindmapos-open-today",
      name: "MindMap OS: Open Today",
      callback: async () => {
        const file = await openToday(this.app);
        if (file) await this.app.workspace.getLeaf(false).openFile(file);
      },
    });

    new Notice("MindMap OS loaded ✅");
  }

  onunload() {
    console.log("MindMap OS unloaded");
  }
}
