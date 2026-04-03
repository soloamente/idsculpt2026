---
date: 2026-03-31
topic: improve-responsiveness
---

# Improve Responsiveness

## What We're Building
We are improving perceived responsiveness for the core web experience first, centered on three priorities: smooth scrolling with Lenis, in-view motion polish, and stronger responsive behavior across device sizes.

This is a targeted first phase focused on high-impact surfaces (`home`, `header`, and key visible sections) rather than an immediate full-app sweep. The goal is to quickly elevate perceived quality while establishing reusable implementation patterns for later rollout.

## Why This Approach
We considered three paths: a targeted core-surface pass, a single app-wide sweep, and a full mobile-first rebuild. We chose the targeted pass because it gives the fastest feel improvement with lower regression risk in the current branch state.

The selected approach keeps scope controlled while still producing visible upgrades where users notice them most. It also creates a clear reference pattern for a second-phase expansion.

## Key Decisions
- Scope priority: Improve responsiveness on core surfaces first (`home`, `header`, primary sections), then expand.
- Scroll behavior: Add Lenis for smooth scrolling feel.
- Motion pattern: Use in-view animations with `motion/react`.
- Responsive target: Full responsive sweep from phone through desktop.
- Success criteria: Feel-first validation (subjective smoothness and responsiveness), not benchmark-first targets.
- Motion accessibility in phase one: Keep full motion enabled for now.

## Resolved Questions
- Which area matters most? Focused request: smooth scrolling, in-view animation, and mobile responsiveness.
- Animation import style? User selected `motion/react`.
- Primary success signal? User selected subjective feel.
- Device target range? User selected full responsive sweep.
- Reduced-motion behavior now? User selected not to apply reduced-motion constraints in this phase.
- Preferred implementation approach? User selected targeted polish first.

## Open Questions
- None for brainstorming phase.

## Next Steps
-> `/workflows:plan` to create the implementation plan and execution sequence.
