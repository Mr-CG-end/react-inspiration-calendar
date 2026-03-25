---
name: code-review
description: Review code changes for react-inspiration-calendar with a component-library mindset. Use when asked to review a PR, inspect a diff, assess implementation quality, or verify that code matches this project's API, packaging, styling, date-handling, and documentation expectations.
---

# Code Review

Review changes as a senior reviewer for a React component library, not as a checklist runner.

Prioritize correctness, regression risk, API stability, and maintainability. Treat project conventions as defaults, not absolute laws, unless a rule protects a real user-facing or build-facing contract.

## Review Priorities

Apply this order when judging changes:

1. Correctness and regressions
2. Public API stability
3. Build and packaging integrity
4. Date-handling correctness
5. Styling isolation and theme consistency
6. Code clarity and maintainability
7. Documentation and test alignment

Do not block a change for style preferences when behavior is correct and the tradeoff is justified.

## Gather Context

Before reviewing, inspect the smallest relevant set of files needed to understand the change:

- changed source files
- `docs/api-design.md` when public behavior changes
- `docs/architecture.md` when structure, exports, build, or packaging changes
- `docs/requirements.md` when scope or feature expectations are unclear
- `package.json`, build config, and entrypoints when release artifacts are affected

Use the current repository state as ground truth. If docs and code disagree, call out the mismatch explicitly instead of assuming docs are current.

When a change affects file placement, module ownership, import direction, or structure, review it against the module-boundary rules in `docs/architecture.md`.

## Severity Model

Use these labels consistently:

- `blocking`: likely bug, regression, broken package contract, broken build, or misleading API
- `important`: non-blocking but should usually be fixed before release
- `suggestion`: improvement with lower risk or mainly maintainability value

Only mark an issue as `blocking` when you can explain the concrete user or maintainer impact.

## Core Checks

Review along these dimensions, but adapt them to the change instead of mechanically scoring every box.

### 1. Correctness

Check for:

- broken logic
- unsafe assumptions
- missing edge-case handling
- state bugs and stale data flows
- regressions introduced by refactors

### 2. Public API and Library Boundaries

Check for:

- accidental public exports
- API signatures drifting from `docs/api-design.md`
- internal implementation details leaking into the package surface
- app-only behavior being introduced into library code
- violations of the module placement or dependency-direction rules in `docs/architecture.md`

Project defaults:

- prefer named exports for public APIs
- route public exports through `src/index.ts`
- keep the package consumable without project-specific runtime assumptions

Allow justified exceptions if they are deliberate and documented.

### 3. Date Handling

This project is date-sensitive. Pay extra attention to:

- local-date matching versus UTC behavior
- `YYYY-MM-DD` formatting logic
- use of `toISOString()` where local dates are required
- examples or tests that use `new Date('YYYY-MM-DD')` and may shift by timezone
- consistency between component behavior and documented date conventions

### 4. Async and State Safety

Check for:

- loading, success, and error transitions
- race conditions during fast prop or date changes
- effect cleanup when asynchronous work can outlive the component
- error handling that is appropriate for a reusable library

Do not require a specific pattern such as a `cancelled` flag if another approach is equally safe.

### 5. Styling and Theming

Check for:

- style leakage into host apps
- divergence from the intended theming model
- theme implementations that duplicate shared logic unnecessarily
- unnecessary coupling to Tailwind or app-level global styles

Project default:

- prefer CSS Modules for library-owned styles

Allow exceptions for justified cases such as SVG attributes, CSS variables, or narrowly scoped inline dynamic values.

### 6. Packaging and Build Contracts

When packaging is touched, verify:

- export map correctness
- peer dependency placement for `react` and `react-dom`
- artifact expectations for the chosen release format
- whether style entrypoints remain importable
- whether build config still matches the package contract

Do not assume both ESM and CJS are always required. Review against the project's documented release target.

### 7. Maintainability

Check for:

- code that is hard to extend or test
- brittle abstractions
- unnecessary indirection
- file growth that hurts readability
- comments that explain intent where the logic is non-obvious

Treat file length, prop placement, and naming conventions as heuristics, not automatic failures.

### 8. Documentation and Tests

Check whether changes should update:

- `docs/api-design.md`
- `docs/architecture.md`
- README usage examples
- tests, fixtures, or demo coverage

Call out missing validation when behavior changed but no verification was added.

## Project-Specific Defaults

Use these as review anchors for this repository:

- library-first architecture, not app-first architecture
- local timezone semantics for content matching and date formatting
- minimal public API surface
- style isolation from host applications
- graceful handling of async failures in reusable components

## Output Style

Lead with findings, ordered by severity. Keep summaries brief.

Use this structure:

```markdown
## Findings

1. [blocking] Short title
   Why it matters, where it occurs, and what behavior can break.

2. [important] Short title
   Why it matters.

## Open Questions

- Any ambiguity that prevents a confident judgment.

## Change Summary

- Optional short recap only after findings.
```

If there are no findings, say that explicitly and mention any residual risk or testing gap.
