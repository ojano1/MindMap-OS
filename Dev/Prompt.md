I’m developing a custom **Obsidian plugin called MindMap OS**, designed as a productivity framework that can evolve into a **Kickstarter product** and later a **D2C digital tool**. The plugin already compiles successfully, creates new tasks via command, and uses `main.ts` at the root with helpers in `src/core/` (`scaffold.ts`, `periodics.ts`, `router.ts`, `utils.ts`, `fm.ts`). It builds with **TypeScript + esbuild** and deploys directly into my Obsidian vault using `npm run deploy`.

The goal is to position **MindMap OS** as a **visual productivity operating system** — compatible with top productivity hacks and books, and a natural **enabler for systems thinkers** who prefer visuals, mind maps, and free-form linking instead of rigid Notion templates. The product is still flexible and can be tweaked for **Kickstarter appeal**, with future expansions like an **expense tracker**, **women’s health and fertility tracker**, and other life-management modules. Two streams will need to develop in parallel: **marketing** (story, visuals, Kickstarter positioning) and **production** (plugin refinement, features, and ecosystem).

I will give you these files to get you up to speed:
Folder structure
main.ts
manifest.ts
package.json
styles.css
from src/core:
fm.ts
periodics.ts
router.ts
scaffold.ts
utils.ts

This is our roadmap, and I need your help working on step 0.1

### MindMap OS – Roadmap

### Goals
- Serve visual thinkers with a map-first workflow  
- Work in plain Markdown, no lock-in  
- Ship small, stable releases  

### 0. Immediate Actions (v0.2)

#### 0.1 Unify dates to your local day
**Why**  
Daily notes and tokens drift if you use UTC  
**Do this**
- Add a `localISO()` helper in `src/core/utils.ts`
- Replace every `todayISO()` with `localISO()`
- Use `localISO()` in token `{{date}}`
**Done when**
- “Open Today” creates today’s note with the correct local date
- New notes show the correct created date

#### 0.2 Stop forced split panes
**Why**  
Every command opening a new pane is tiring  
**Do this**
- Change `app.workspace.getLeaf(true)` to `getLeaf(false)` everywhere  
**Done when**
- Files open in the same pane unless you change settings

#### 0.3 Make folder creation safe
**Why**  
Sync or quick clicks can cause “already exists” errors  
**Do this**
- In `ensureFolder()`, wrap `createFolder` with `try { ... } catch {}`  
- Keep creating the rest of the path even if one segment already exists  
**Done when**
- Running “Create Starter Structure” twice never errors

#### 0.4 Avoid unnecessary writes
**Why**  
Editing files on every command creates sync churn  
**Do this**
- In `writeOrReplace()`, read first if file exists
- Only write when content changed
- Always return the `TFile` you create or modify  
**Done when**
- Running “Open Today” twice doesn’t rewrite unchanged content

#### 0.5 Centralize tokens
**Why**  
Templates use tokens; keep logic in one place  
**Do this**
- Add in `utils.ts`:  
  - `localISO()`, `getISOWeek()`, `monthShort()`, `quarter()`  
  - `applyTokens(text, extraMap)` for replacing tokens  
- Use `applyTokens()` in `router.ts` and `scaffold.ts`  
**Done when**
- Templates and created notes show correct local and periodic tokens

#### 0.6 One creation path for all items
**Why**  
One function keeps format consistent  
**Do this**
- Remove custom task creator in `main.ts`
- For all types use `createTypedNote(app, kind, title)`  
**Done when**
- Every “New …” command produces uniform notes

#### 0.7 Make emoji in filenames a setting
**Why**  
Some sync tools fail on emoji filenames  
**Do this**
- Add `emojiInFilenames` setting (default On)
- Keep emoji in H1 always
- Remove emoji from filenames if setting Off  
**Done when**
- New files respect setting; old files stay unchanged

#### 0.8 Add a minimal Settings tab
**Why**  
Hardcoded paths block adoption  
**Do this**
- Add settings:  
  - Active folder `03 SaveBox/Active`
  - Templates folder `03 SaveBox/Templates`
  - Daily folder `02 Execution/1 Daily`
  - Open in new pane (Off)
  - Emoji in filenames (On)
- Store in plugin data; use everywhere  
**Done when**
- Changing settings changes file locations and naming

#### 0.9 Add onunload
**Why**  
Prepares for timers and listeners later  
**Do this**
- Add `onunload()` with a console log  
**Done when**
- Disabling the plugin logs “MindMap OS unloaded”

### 1. v0.3 Templates, Periodics, and Review
- Use templates for all note types  
- Add Weekly, Monthly, Quarterly, Yearly notes  
- Add Daily and Weekly review commands listing open tasks  
- Run tokens for all templates  
**Goal**  
Fully functional creation and review loop

### 2. v0.4 Visual Map MVP
- Add “Open Map” command  
- Display Areas, Goals, Projects, Tasks as nodes  
- Click a node to open its file  
- Target: load 1000 notes under 300 ms, render 60 FPS with 200 nodes  
**Goal**  
Working visual map view inside Obsidian

### 3. v0.5 Framework Presets and API
- Add presets: GTD, PARA, OKRs, Bullet Journal  
- Each preset sets up folders and templates without overwriting existing files  
- Add `API.md` with:  
  - `itemCreated(kind, path)` event  
  - `createTypedNote(kind, title)`  
  - `openPeriod(period, date)`  
**Goal**  
Enable community modules and preset imports

### 4. v0.6 Kickstarter Build
- Add onboarding wizard (“Create Starter Structure”)  
- Add local telemetry toggle (off by default)  
- Record demo scenes showing a full workflow  
**Goal**  
Stable public alpha ready for Kickstarter demo

### Technical Debt
- Frontmatter updates overwrite arrays, improve merge logic  
- Locale hardcoded to `en-US`, add user format option  
- Fallback template path `99 Templates` not scaffolded, decide to add or remove  
- Add error notices around all file I/O

### QA Checklist
- Empty title creates “Untitled” safely  
- Duplicate creation auto-numbers filenames  
- Emoji toggle respected in filenames  
- Folder settings applied correctly  
- “Open Today” uses correct local date  
- Scaffold runs twice without errors  
- Weekly/Monthly/Quarterly/Yearly tokens render correctly

### Release Process
1. Update version in `package.json` and `manifest.json`  
2. Update `CHANGELOG.md`  
3. Tag release `vX.Y.Z`  
4. Run `npm run deploy`  
5. Test on desktop and mobile  

### Default Folders
- 03 SaveBox/Active  
- 03 SaveBox/Templates  
- 02 Execution/1 Daily  
- 02 Execution/2 Weekly  
- 02 Execution/3 Monthly  
- 02 Execution/4 Quarterly  
- 02 Execution/5 Yearly  
- 99 System  

### Tokens
- `{{date}}` → local date (YYYY-MM-DD)  
- `{{dateLong}}` → DD Mon YYYY  
- `{{year}}` → YYYY  
- `{{monthShort}}` → Jan–Dec  
- `{{isoWeek}}` → 1–53  
- `{{quarter}}` → 1–4  

### MindMap OS – Roadmap

### Goals
- Serve visual thinkers with a map-first workflow
- Work in plain Markdown, no lock-in
- Ship small, stable releases

### 0. Immediate Actions (v0.2)

#### 0.1 Wikilink creation routed by plugin
**Why**  
Typing links feels faster than running commands  
**Do this**
- Watch new empty files created from `[[...]]`
- Parse prefix, e.g., `task`, `project`, `goal`, `area`, `habit`, `note`
- Create the proper page in Active via `createTypedNote`
- Delete the empty stub
**Done when**
- `[[task - write brief]]` creates a Task in Active with the right title and template

#### 0.2 Page templating on create
**Why**  
Consistent structure saves time  
**Do this**
- Use templates from `03 SaveBox/Templates`
- Apply tokens with local date, week, month, quarter
- Keep emoji in H1, respect filename emoji setting
**Done when**
- New pages render from templates with correct tokens

#### 0.3 Auto-built lists on each page (no on-page JS)
**Why**  
Users want related items without writing queries  
**Do this**
- On create, and on command, write a “Lists” block to the page
- Build lists from backlinks and type detection
- Project shows related Tasks, Goal shows related Projects, Area shows related Goals, Daily shows Tasks mentioned today
- Wrap the block with `<!-- mmos:lists:start -->` and `<!-- mmos:lists:end -->`
**Done when**
- Pages show related links as plain Markdown, refreshed by the plugin

#### 0.4 Checkbox sync (frontmatter ↔ first checkbox)
**Why**  
One truth source for completion  
**Do this**
- On modify, if the first checkbox under H1 changes, update `done` in frontmatter
- Provide a command to toggle Done, which updates both places
- Prevent loops with a small in-memory guard
**Done when**
- Toggling either side keeps the other in sync

#### 0.5 Local dates, no split panes, safe folders
**Why**  
Reduce friction and drift  
**Do this**
- Use `localISO()` everywhere for `{{date}}`
- Replace `getLeaf(true)` with `getLeaf(false)` by default
- Wrap `createFolder` in try/catch in `ensureFolder`
**Done when**
- Correct date around midnight, no split spam, no folder race errors

#### 0.6 Centralize tokens and creation path
**Why**  
Less drift, easier changes  
**Do this**
- Keep `applyTokens()` and date helpers in `utils.ts`
- Route all creation through `createTypedNote`
**Done when**
- All new pages share the same logic

#### 0.7 Minimal settings tab
**Why**  
Let users set folders and behavior  
**Do this**
- Settings: Active folder, Templates folder, Daily folder, Open in new pane, Emoji in filenames
- Load on start, save on change
**Done when**
- New files respect changed settings

### v0.2 Release Gate
- Wikilink creation produces templated pages in Active
- Lists block appears and rebuilds on command
- Checkbox and frontmatter stay in sync
- No split spam, safe folders, correct local dates
- Settings persist across restarts

### 1. v0.3 Templates, Periodics, and Review
- Finalize templates for Area, Goal, Project, Task, Habit, Note, Daily, Weekly, Monthly, Quarterly, Yearly
- Add Open Week, Month, Quarter, Year commands
- Add Daily Review and Weekly Review commands that insert actionable lists
- Keep lists as plain Markdown, support Dataview if installed without requiring it
**Goal**  
A full creation and review loop

### 2. v0.4 Visual Map MVP
- “Open Map” view showing Areas, Goals, Projects, Tasks from Active
- Build edges from wiki links and optional frontmatter refs
- Click node to open file, pan and zoom
- Target: data pass under 300 ms for 1k files, smooth render with 200 nodes
**Goal**  
A readable map that opens notes fast

### 3. v0.5 Framework Presets and API
- Presets: GTD, PARA, OKRs, Bullet Journal
- Importer creates folders and templates without overwriting user files
- Public API: `itemCreated(kind, path)`, `createTypedNote(kind, title)`, `openPeriod(period, date)`
**Goal**  
Faster setup and room for modules

### 4. v0.6 Kickstarter Build
- Onboarding wizard: choose folders, emoji setting, preset
- Local-only telemetry toggle, off by default
- Stable demo scenes for the campaign video
**Goal**  
Confident public alpha for Kickstarter

### Technical Debt
- Frontmatter merging for arrays and objects
- Date locale option beyond `en-US`
- Decide on `99 Templates` fallback, scaffold or remove
- Notices and error handling for file I/O

### QA Checklist
- Empty title creates “Untitled” safely
- Rapid duplicates auto-number correctly
- Emoji filename toggle works
- Folder settings apply to new files
- “Open Today” uses the correct local date
- Scaffold runs twice without errors
- Week/Month/Quarter/Year commands create the right pages
- Lists block rebuilds without duplicates

### Release Process
1. Update versions in `package.json` and `manifest.json`
2. Update `CHANGELOG.md`
3. Tag `vX.Y.Z`
4. `npm run deploy`
5. Test on desktop and mobileW


