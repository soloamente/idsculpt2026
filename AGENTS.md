## Learned User Preferences
- User expects explicit Planner vs Executor workflow, and uses `execute` to authorize direct implementation.
- User prefers fast, minimal UI fixes with immediate verification requests after each change.

## Learned Workspace Facts
- This repository is a monorepo rooted at `/home/adgv/Projects/idsculpt`.
- Conversation transcripts for memory mining are stored under `/home/adgv/.cursor/projects/home-adgv-Projects-idsculpt/agent-transcripts`.
- The web app does not use `next-themes` or a `ThemeProvider`; it does not toggle a `dark` class on `<html>` for global theme switching (shared UI such as toasts uses a fixed light theme where needed).
- Header nav and desktop contact styling follow section-driven contrast: blocks in `main` with both `id` and `data-header-text` (`light` or `dark`); `use-header-text-from-sections` picks which region sits under the fixed bar.
