### 2. Future split strategy — Core vs Pro

Keep one codebase, use feature flags or a simple build-time flag to exclude paid modules.

| Area                                  | MindMap OS Core (Free)                  | MindMap OS Pro (Paid) |
| ------------------------------------- | --------------------------------------- | --------------------- |
| Base note creation                    | ✅ All types (task, project, goal, etc.) | ✅                     |
| Token replacement                     | ✅                                       | ✅                     |
| Safe folders & local dates            | ✅                                       | ✅                     |
| Settings tab                          | ✅                                       | ✅                     |
| Periodic notes (daily, weekly)        | ✅                                       | ✅                     |
| Visual map view (nodes + links)       | 🚫                                      | ✅                     |
| Presets (GTD, PARA, OKRs)             | 🚫                                      | ✅                     |
| Lists block (related tasks/projects)  | 🚫 (manual)                             | ✅ (auto build)        |
| Checkbox sync                         | 🚫                                      | ✅                     |
| Onboarding wizard                     | 🚫                                      | ✅                     |
| API hooks (`itemCreated`, etc.)       | 🚫                                      | ✅                     |
| Telemetry + analytics (local/offline) | 🚫                                      | ✅                     |

Core = workflow backbone.  
Pro = automation, visualization, and user experience polish.
