### MindMap OS – Roadmap

### Goals
- Serve visual thinkers with a map-first workflow
- Work in plain Markdown, no lock-in
- Ship small, stable releases

### 0. Immediate Actions (v0.2)

#### 0.1 Wikilink creation routed by plugin
*Why*  
Typing links feels faster than running commands  
*Do this*
- Watch new empty files created from [[...]]
- Parse prefix, e.g., task, project, goal, area, habit, note
- Create the proper page in Active via createTypedNote
- Delete the empty stub
*Done when*
- [[task - write brief]] creates a Task in Active with the right title and template

#### 0.2 Page templating on create
*Why*  
Consistent structure saves time  
*Do this*
- Use templates from 03 SaveBox/Templates
- Apply tokens with local date, week, month, quarter
- Keep emoji in H1, respect filename emoji setting
*Done when*
- New pages render from templates with correct tokens

#### 0.3 Auto-built lists on each page (no on-page JS)
*Why*  
Users want related items without writing queries  
*Do this*
- On create, and on command, write a “Lists” block to the page
- Build lists from backlinks and type detection
- Project shows related Tasks, Goal shows related Projects, Area shows related Goals, Daily shows Tasks mentioned today
- Wrap the block with <!-- mmos:lists:start --> and <!-- mmos:lists:end -->
*Done when*
- Pages show related links as plain Markdown, refreshed by the plugin

#### 0.4 Checkbox sync (frontmatter ↔ first checkbox)
*Why*  
One truth source for completion  
*Do this*
- On modify, if the first checkbox under H1 changes, update done in frontmatter
- Provide a command to toggle Done, which updates both places
- Prevent loops with a small in-memory guard
*Done when*
- Toggling either side keeps the other in sync

#### 0.5 Local dates, no split panes, safe folders
*Why*  
Reduce friction and drift  
*Do this*
- Use localISO() everywhere for {{date}}
- Replace getLeaf(true) with getLeaf(false) by default
- Wrap createFolder in try/catch in ensureFolder
*Done when*
- Correct date around midnight, no split spam, no folder race errors

#### 0.6 Centralize tokens and creation path
*Why*  
Less drift, easier changes  
*Do this*
- Keep applyTokens() and date helpers in utils.ts
- Route all creation through createTypedNote
*Done when*
- All new pages share the same logic

#### 0.7 Minimal settings tab
*Why*  
Let users set folders and behavior  
*Do this*
- Settings: Active folder, Templates folder, Daily folder, Open in new pane, Emoji in filenames
- Load on start, save on change
*Done when*
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
*Goal*  
A full creation and review loop

### 2. v0.4 Visual Map MVP
- “Open Map” view showing Areas, Goals, Projects, Tasks from Active
- Build edges from wiki links and optional frontmatter refs
- Click node to open file, pan and zoom
- Target: data pass under 300 ms for 1k files, smooth render with 200 nodes
*Goal*  
A readable map that opens notes fast

### 3. v0.5 Framework Presets and API
- Presets: GTD, PARA, OKRs, Bullet Journal
- Importer creates folders and templates without overwriting user files
- Public API: itemCreated(kind, path), createTypedNote(kind, title), openPeriod(period, date)
*Goal*  
Faster setup and room for modules

### 4. v0.6 Kickstarter Build
- Onboarding wizard: choose folders, emoji setting, preset
- Local-only telemetry toggle, off by default
- Stable demo scenes for the campaign video
*Goal*  
Confident public alpha for Kickstarter

### Technical Debt
- Frontmatter merging for arrays and objects
- Date locale option beyond en-US
- Decide on 99 Templates fallback, scaffold or remove
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
1. Update versions in package.json and manifest.json
2. Update CHANGELOG.md
3. Tag vX.Y.Z
4. npm run deploy
5. Test on desktop and mobile