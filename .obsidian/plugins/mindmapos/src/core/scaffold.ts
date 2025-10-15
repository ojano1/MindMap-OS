import { App, Notice } from "obsidian";
import { ensureFolder, writeIfMissing } from "./utils";

/** ---------- Template bodies ---------- */
const TPL = {
  area: `---\nstatus: Active\npriority: Medium\n---\n# 🌱Area - Example\n\n### ✍️Description\n- \n`,
  goal: `---\nstatus: Active\npriority: Medium\ndone: false\n---\n# 🎯Goal - Example\n- [ ] 🎯Goal - Example\n`,
  project: `---\nstatus: Active\npriority: Medium\ndone: false\n---\n# 🚀Project - Example\n- [ ] 🚀Project - Example\n`,
  task: `---\nstatus: Active\npriority: Medium\ndone: false\nduration_hours:\n---\n# 📌Task - Example\n- [ ] 📌Task - Example\n`,
  habit: `---\nstatus: Active\n---\n# 🔁Habit - Example\n\n### ✍️Log\n- [ ] 🔁Habit - Example {{date}}\n`,
  note: `---\ncreated: {{date}}\nnote_type: note\nstatus: Active\n---\n# ✏️Note - Example\n- \n`,
  daily: `# {{dateLong}}\n\n### ✍️Fleeting Notes\n- \n`,
  weekly: `# 📅 Week {{isoWeek}} {{year}}\n\n> Assign due dates to tasks tagged with this week.\n`,
  monthly: `# 📅 {{monthShort}} {{year}}\n\n> Tag projects/tasks with #{{monthShort}}.\n`,
  quarterly: `# 📅 Q{{quarter}} {{year}}\n\n> Tag projects with #Q{{quarter}}.\n`,
  yearly: `# 📅 Year {{year}}\n\n> Tag goals with #Y{{year}} and projects with #Q1..#Q4.\n`,
};

export async function createStarterStructure(app: App) {
  // 1) Folders
  const folders = [
    "01 Definition",
    "02 Execution/1 Daily",
    "02 Execution/2 Weekly",
    "02 Execution/3 Monthly",
    "02 Execution/4 Quarterly",
    "02 Execution/5 Yearly",
    "03 SaveBox/Active",
    "03 SaveBox/Archive",
    "03 SaveBox/Attachment",
    "03 SaveBox/Scripts",
    "03 SaveBox/Templates",
    "04 Output",
    "99 System",
  ];
  for (const f of folders) await ensureFolder(app, f);

  // 2) Starter notes
  await writeIfMissing(
    app,
    "Welcome.md",
    "# 👋 Welcome to MindMap OS\n\nRun **Command Palette → MindMap OS: Create Starter Structure** any time."
  );
  await writeIfMissing(
    app,
    "01 Definition/🏁 Start Here.md",
    "## Start Here\n\nFollow the steps to define Areas → Goals → Projects."
  );
  await writeIfMissing(
    app,
    "01 Definition/🧠 Mind Map.md",
    "## Mind Map\n\nLink Areas, Goals, Projects here."
  );
  await writeIfMissing(
    app,
    "02 Execution/🔍 Read Me First.md",
    "## Execution Flow\n\nYear → Quarter → Month → Week → Day. Assign tags and due dates."
  );
  await writeIfMissing(app, "04 Output/Untitled.md", "# Output\n\nExport or publish here.");

  // 3) Templates
  await writeIfMissing(app, "03 SaveBox/Templates/Area Template.md", TPL.area);
  await writeIfMissing(app, "03 SaveBox/Templates/Goal Template.md", TPL.goal);
  await writeIfMissing(app, "03 SaveBox/Templates/Project Template.md", TPL.project);
  await writeIfMissing(app, "03 SaveBox/Templates/Task Template.md", TPL.task);
  await writeIfMissing(app, "03 SaveBox/Templates/Habit Template.md", TPL.habit);
  await writeIfMissing(app, "03 SaveBox/Templates/Note Template.md", TPL.note);
  await writeIfMissing(app, "03 SaveBox/Templates/Daily Template.md", TPL.daily);
  await writeIfMissing(app, "03 SaveBox/Templates/Weekly Template.md", TPL.weekly);
  await writeIfMissing(app, "03 SaveBox/Templates/Monthly Template.md", TPL.monthly);
  await writeIfMissing(app, "03 SaveBox/Templates/Quarterly Template.md", TPL.quarterly);
  await writeIfMissing(app, "03 SaveBox/Templates/Yearly Template.md", TPL.yearly);

  // 4) Seeds
  await writeIfMissing(app, "03 SaveBox/Active/🌱Area - Life.md", "---\nstatus: Active\n---\n# 🌱Area - Life\n");
  await writeIfMissing(
    app,
    "03 SaveBox/Active/🎯Goal - Launch v1.md",
    "---\nstatus: Active\ndone: false\n---\n# 🎯Goal - Launch v1\n- [ ] 🎯Goal - Launch v1\n"
  );
  await writeIfMissing(
    app,
    "03 SaveBox/Active/🚀Project - Landing Page.md",
    "---\nstatus: Active\ndone: false\n---\n# 🚀Project - Landing Page\n- [ ] 🚀Project - Landing Page\n"
  );
  await writeIfMissing(
    app,
    "03 SaveBox/Active/📌Task - Draft copy.md",
    "---\ndone: false\n---\n# 📌Task - Draft copy\n- [ ] 📌Task - Draft copy\n"
  );

  // 5) System home
  await writeIfMissing(
    app,
    "99 System/Home.md",
    [
      "# Welcome to MindMap OS",
      "",
      "- Run: **MindMap OS → Create Starter Structure**",
      "- Try: **MindMap OS → New Goal / Project / Task**",
      "- Try: **MindMap OS → Open Today**",
      "",
    ].join("\n")
  );

  new Notice("✅ MindMap OS: starter structure updated.");
}
