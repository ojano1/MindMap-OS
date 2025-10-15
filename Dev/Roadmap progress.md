## MindMap OS – Roadmap Progress (v0.2 Development)

### ✅ Completed

#### 0.1 Wikilink creation routed by plugin
- Typing `[[task - write brief]]` now creates a proper **Task** note in `03 SaveBox/Active`.
- Works case-insensitively and without dash (e.g. `[[task write brief]]`).
- Creates correct filename, title, emoji, and structure from template.
- Original link updates automatically to the formatted name (resolved purple link).
- Implemented by `src/core/wikilinks.ts`.

#### ✅ 0.2 Page templating on create (partial)
- Templates loaded dynamically from `03 SaveBox/Templates/`.
- If missing, plugin uses a minimal fallback template.
- Tokens replaced correctly (`{{date}}`, `{{title}}`, `{{core}}`, etc.).
- YAML fields (`created`, `due`, `status`, `done`) generated on create.
- `due` now defined as a **date property**, blank by default.
- Template files editable by user without breaking the plugin.

#### ✅ 0.4 Checkbox sync (frontmatter ↔ first checkbox)
- Implemented continuous two-way sync for Task, Project, and Goal notes.
- Changing `done:` in YAML updates first checkbox under "My Task / My Project / My Goal".
- Checking or unchecking the checkbox updates `done:` in YAML immediately.
- Sync runs automatically on modify, file-open, or rename.
- Manual command `MindMap OS: Toggle Done` flips both YAML and checkbox together.

---

### 🚧 In Progress

#### 0.2 Page templating on create (final phase)
- Remaining templates (Daily, Weekly, Monthly, etc.) pending.
- Will include auto token replacement for all periodic notes.
- Future step: support dashboard modules in Daily notes.

---

### 🔜 Next Targets

#### 0.3 Auto-built lists on each page
- Generate “Lists” block between `<!-- mmos:lists:start -->` and `<!-- mmos:lists:end -->`.
- Show related Tasks, Projects, Goals, etc. without Dataview.

#### 0.5 Local dates, no split panes, safe folders
- Replace all `getLeaf(true)` with `getLeaf(false)`.
- Wrap folder creation in try/catch to prevent sync errors.

---

### 🧭 Current Milestone Summary
| Feature | Status | Notes |
|----------|---------|-------|
| Wikilink routing | ✅ Done | Automatic creation and renaming works. |
| Page templating | ⚙️ Partial | Task/Project/Goal templates complete. Periodic next. |
| Checkbox sync | ✅ Done | Bi-directional YAML ↔ checkbox sync verified. |
| Safe folders | ⏳ Next | Will be handled under 0.5. |
| Tokens centralization | ⏳ Pending | To consolidate under `utils.ts`. |
| Settings tab | ⏳ Not started | Basic folder settings coming later. |

---

### 🔖 Version milestone
**v0.2 (in progress)**
- Core creation flow functional.
- Tasks, Projects, Goals templated.
- Frontmatter and checkbox sync stable.
- Next focus: Daily template integration and task summary block.

**v0.3 (planned)**
- Periodic note automation.
- Review and task collection.
- Refined token and folder settings.

---

*Progress snapshot updated after completion of 0.1, 0.2 (partial), and 0.4.*

## Roadmap Update — Git (iOS ↔ Windows) Compatibility

### New: 0.10 Git Compatibility Hardening
**Why**  
On iOS, enabling MindMap OS causes the Obsidian Git plugin to stop push/pull without errors.

**Hypotheses**
- Excessive file churn from watchers (rename-on-create, YAML writes).
- Emoji in filenames causing issues with Git or Working Copy on iOS.
- Modifying files during Git operations (index locked).
- CRLF/LF line-ending flips triggering noisy diffs.

**Do this**
- Add setting: **Pause during Git ops** (On).  
  - If `.git/index.lock` exists, suspend all writes and watchers.
- Add command: **MindMap OS: Pause/Resume** (global gate).
- Add setting: **Emoji in filenames** (default Off on mobile).
- Debounce all file writes ≥150–300 ms, coalesce multi-step writes.
- Respect “no-op writes”: read first, only write if content changed.
- Skip edits to files in `.git/`, `03 SaveBox/Templates/` while Git lock present.
- Normalize line endings to `\n` on write.
- Mobile mode (detect `app.isMobile`):  
  - Reduce watcher scope to Task/Project/Goal/Daily only.  
  - Disable alias rewrites and aggressive link renames.
- Log to console on block: `MMOS: Git lock detected, pausing writes`.

**Done when**
- On iOS, Git push/pull works with MindMap OS enabled.
- No “stuck” state after rename/template writes.
- Creating notes does not trigger endless diffs.

---

### Immediate Workarounds (today)
- Turn **Emoji in filenames** Off (temporary).  
- Use **MindMap OS: Pause** before Git sync on mobile, **Resume** after.
- Ensure your dev `node_modules` and source are **not** inside the vault.
- Confirm no `.git/index.lock` is lingering after failed syncs (delete if safe).

---

### Implementation notes (technical)
- Add a small gate:
  - `const paused = ref(false);`
  - File IO helpers early-return when `paused` or `gitLocked()`.
- `gitLocked()`:
  - `app.vault.adapter.exists('.git/index.lock')` → true/false.
- Wrap `vault.modify` and `processFrontMatter`:
  - Skip when paused or locked.
  - Compare old/new content, write only on diff.
- Watchers:
  - Debounce `modify`, `editor-change`, `resolved` 150–300 ms.
  - On mobile (`app.isMobile`), only watch current file and “My Task/Project/Goal” headers.

---

### QA (add to checklist)
- iOS Working Copy + Obsidian Git push/pull succeeds with plugin enabled.
- Create 20 Tasks, run Git status, commit, push on iOS, pull on Windows.
- Pull on iOS while MindMap OS is active, no hang.
- Toggle Pause/Resume, verify behavior.

---

### Placement in Roadmap
- **0.10 Git Compatibility Hardening** sits under v0.2 “Immediate Actions.”
- Ties to: **0.4 Avoid unnecessary writes**, **0.7 Settings tab**, **Emoji filename setting**.

