### MindMap OS – Core vs Pro code plan

#### Goals
- One repo. Two builds.
- Core = stable workflow backbone.
- Pro = visualization, automation, presets.

---

### Repo layout
/src  
/core  
utils.ts  
fm.ts  
router.ts  
scaffold.ts  
periodics.ts  
tokens.ts  
createTypedNote.ts  
/features  
/lists # Pro  
index.ts  
/map # Pro  
index.ts  
/presets # Pro  
index.ts  
/checkboxSync # Pro  
index.ts  
/settings  
settings.ts  
main.ts


The plugin should first **work perfectly inside Obsidian**, with clean note creation, proper tokens, safe writes, and stable behavior.  
The roadmap section **0.1–0.7** is exactly the right set.

Right now, fix these before building new features:

- ✅ Local date (`localISO`)
    
- 🔜 Safe folder creation (0.5)
    
- 🔜 Prevent split panes (0.5)
    
- 🔜 Avoid redundant file writes (0.4)
    
- 🔜 Centralize all tokens (0.6)
    
- 🔜 One note-creation path (0.6)
    
- 🔜 Minimal settings tab (0.7)
    

Once those work, you have a reliable foundation.


