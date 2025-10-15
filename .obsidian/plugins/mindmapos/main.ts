import { createTypedNote } from "./src/core/router";
import {
  App,
  Modal,
  Notice,
  Plugin,
  Setting,
  TFile,
  normalizePath,
} from "obsidian";
import { createStarterStructure } from "./src/core/scaffold";
import { openToday } from "./src/core/periodics";
import { localISO } from "./src/core/utils";


/* ---------- Utils ---------- */
function sanitizeFilename(s: string): string {
  return s.replace(/[\\/:*?"<>|]/g, "").trim();
}

async function ensureFolder(app: App, folder: string) {
  const parts = normalizePath(folder).split("/");
  let cur = "";
  for (const part of parts) {
    cur = cur ? `${cur}/${part}` : part;
    if (!app.vault.getAbstractFileByPath(cur)) {
      await app.vault.createFolder(cur);
    }
  }
}

async function uniquePath(app: App, baseNoExt: string, ext = ".md") {
  let p = normalizePath(`${baseNoExt}${ext}`);
  let n = 1;
  while (app.vault.getAbstractFileByPath(p)) {
    p = normalizePath(`${baseNoExt} (${n})${ext}`);
    n++;
  }
  return p;
}


/* ---------- Inline Task Creator ---------- */
async function createTaskInline(app: App, titleRaw: string) {
  const baseDir = "03 SaveBox/Active";
  await ensureFolder(app, baseDir);

  const title = sanitizeFilename(titleRaw) || "Untitled";
  const filenameNoExt = `${baseDir}/📌Task - ${title}`;
  const path = await uniquePath(app, filenameNoExt);

  const body = `---
status: Active
priority: Medium
done: false
duration_hours:
---

# 📌Task - ${title}

- [ ] 📌Task - ${title}

> created ${localISO()}
`;

  const file: TFile = await app.vault.create(path, body);
  await app.workspace.getLeaf(true).openFile(file);
  new Notice(`Task created: ${title}`);
}

/* ---------- Modal Prompt ---------- */
class TextPromptModal extends Modal {
  private value = "";
  constructor(
    app: App,
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

  onClose() {
    this.contentEl.empty();
  }
}

/* ---------- Plugin ---------- */
export default class MindMapOSPlugin extends Plugin {
  async onload() {
    // 1) Scaffold
    this.addCommand({
      id: "mindmapos-create-starter",
      name: "MindMap OS: Create Starter Structure",
      callback: async () => {
        await createStarterStructure(this.app);
        new Notice("Starter structure created.");
      },
    });

    // 2) New Task
    this.addCommand({
      id: "mindmapos-new-task",
      name: "MindMap OS: New Task",
      callback: async () => {
        new TextPromptModal(this.app, {
          title: "New Task",
          placeholder: "Enter task title",
          cta: "Create Task",
          onSubmit: async (title) => {
            await createTaskInline(this.app, title);
          },
        }).open();
      },
    });
	// New Project
this.addCommand({
  id: "mindmapos-new-project",
  name: "MindMap OS: New Project",
  callback: async () => {
    new TextPromptModal(this.app, {
      title: "New Project",
      placeholder: "Enter project title",
      cta: "Create Project",
      onSubmit: async (title) => {
        await createTypedNote(this.app, "project", title);
      },
    }).open();
  },
});

// New Goal
this.addCommand({
  id: "mindmapos-new-goal",
  name: "MindMap OS: New Goal",
  callback: async () => {
    new TextPromptModal(this.app, {
      title: "New Goal",
      placeholder: "Enter goal title",
      cta: "Create Goal",
      onSubmit: async (title) => {
        await createTypedNote(this.app, "goal", title);
      },
    }).open();
  },
});

// New Area
this.addCommand({
  id: "mindmapos-new-area",
  name: "MindMap OS: New Area",
  callback: async () => {
    new TextPromptModal(this.app, {
      title: "New Area",
      placeholder: "Enter area name",
      cta: "Create Area",
      onSubmit: async (title) => {
        await createTypedNote(this.app, "area", title);
      },
    }).open();
  },
});

// New Habit
this.addCommand({
  id: "mindmapos-new-habit",
  name: "MindMap OS: New Habit",
  callback: async () => {
    new TextPromptModal(this.app, {
      title: "New Habit",
      placeholder: "Enter habit name",
      cta: "Create Habit",
      onSubmit: async (title) => {
        await createTypedNote(this.app, "habit", title);
      },
    }).open();
  },
});

// New Note
this.addCommand({
  id: "mindmapos-new-note",
  name: "MindMap OS: New Note",
  callback: async () => {
    new TextPromptModal(this.app, {
      title: "New Note",
      placeholder: "Enter note title",
      cta: "Create Note",
      onSubmit: async (title) => {
        await createTypedNote(this.app, "note", title);
      },
    }).open();
  },
});


    // 3) Open Today
    this.addCommand({
      id: "mindmapos-open-today",
      name: "MindMap OS: Open Today",
      callback: async () => {
        const file = await openToday(this.app);
        if (file) await this.app.workspace.getLeaf(true).openFile(file);
      },
    });

    new Notice("MindMap OS loaded ✅");
  }
}
