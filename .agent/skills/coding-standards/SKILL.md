---
name: coding-standards
description: Follow the coding standards for react-inspiration-calendar when generating or modifying code. Use for implementation work in this React + TypeScript component library so changes stay consistent with public API docs, library packaging, local-date handling, styling isolation, and maintainable project conventions.
---

# Coding Standards

Use these standards when changing code in this repository.

Treat them as an ordered set of defaults. Preserve correctness and package contracts first. Prefer consistency second. Style preferences come last.

## Priority Order

When rules compete, use this order:

1. Correct behavior
2. Public API stability
3. Build and package integrity
4. Date-handling correctness
5. Accessibility and usability
6. Maintainability
7. Style consistency

If you break a lower-priority convention to satisfy a higher-priority one, make that tradeoff explicit in code comments or the change summary when needed.

## Source of Truth

Before changing public behavior, check the relevant docs:

- `docs/api-design.md` for API contracts
- `docs/architecture.md` for structure, exports, and packaging intent
- `docs/requirements.md` for feature scope

If code and docs disagree, do not silently choose one. Either align both or call out the mismatch.

For module placement, dependency direction, and file-splitting decisions, follow `docs/architecture.md` as the primary rule source.

## Library Boundaries

This repository is moving toward a reusable component library. Code should reflect that.

Prefer:

- reusable components over app-specific flows
- explicit public entrypoints
- host-app-safe styling
- behavior that works without project-local runtime assumptions

Avoid:

- leaking internal helpers into public exports
- coupling library code to dev-only UI or app-only state
- assuming a specific host CSS stack unless the package contract says so

## TypeScript

Prefer:

- concrete types over `any`
- `unknown` when a value is intentionally untrusted
- `interface` for object-shaped public contracts
- `type` for unions, mapped types, and utility composition
- explicit return types on exported non-component functions
- `export type` for type-only exports

Avoid:

- `any` unless there is no practical alternative
- type assertions without a clear reason
- accidental widening of public API types

If you must use `any` or `as`, keep the scope narrow and leave a short comment when the reason is not obvious.

## Components

Project defaults:

- prefer named exports for reusable components
- prefer plain function components over `React.FC`
- destructure props when it improves readability
- use early returns for major conditional branches
- return `null` for intentionally non-rendering states such as `visible === false`

These are defaults, not absolute bans. If another form is clearer in a specific file, prefer clarity.

Keep components focused. If a file grows enough that behavior, rendering, and data orchestration become hard to read, split it.

## State and Effects

Prefer:

- local state for local concerns
- explicit loading, success, and error paths for async work
- effect cleanup when asynchronous work or subscriptions can outlive the render that created them
- race-safe patterns when data depends on rapidly changing props like dates

Do not rely on one mandatory cancellation pattern. Use the simplest safe pattern for the code at hand.

## Date Handling

This project has a strict rule here because timezone bugs are easy to ship.

Prefer:

- local-date operations when matching or formatting calendar content
- `getFullYear()`, `getMonth()`, and `getDate()` for local date formatting
- `new Date(year, monthIndex, day)` in examples and tests when a local calendar date is intended

Avoid:

- `toISOString()` for local-date matching or API paths that expect local dates
- `new Date('YYYY-MM-DD')` when the code intends a local calendar day

If UTC behavior is intentional, document that clearly.

## Styling

Project default:

- use CSS Modules for library-owned styles

Prefer:

- theme tokens or CSS variables for shared visual values
- scoped class names over global selectors
- inline styles only for narrowly scoped dynamic values, especially in SVG

Avoid:

- leaking global styles into host apps
- coupling library rendering to Tailwind utility classes in published components
- scattering hard-coded colors and spacing values when they represent reusable theme decisions

Do not force CSS Modules into places where inline SVG attributes or CSS variables are the cleaner solution.

## Errors and Logging

Prefer:

- graceful failure modes in reusable library code
- error messages that are actionable for maintainers
- logs only when they are deliberate and useful

Avoid:

- stray debug logging
- throwing uncaught errors from normal library control flow when a fallback is available

Not every error should be swallowed. If the caller must know, surface it through an explicit API or state model.

## Comments and Documentation

Prefer comments that explain:

- why the code is written this way
- non-obvious library or browser constraints
- date or packaging caveats

Avoid comments that just restate the code.

Update docs when changing:

- public props or exports
- build artifacts or package entrypoints
- date semantics
- theming behavior

## Testing and Validation

When behavior changes, add or update the most relevant validation available:

- typecheck
- build verification
- targeted tests
- demo/manual verification for visual behavior

Do not treat unchanged tests as proof when the package contract changed.

## Review Heuristics

Use these conventions as heuristics during implementation and self-review:

- keep public APIs explicit
- keep internal helpers internal
- prefer small, composable units when complexity rises
- prefer readability over cleverness
- prefer project consistency unless there is a good local reason not to

If you need to violate a convention, do it intentionally and in the smallest possible scope.
