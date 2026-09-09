# Ink

A React renderer for building interactive command-line applications. Uses Yoga (Facebook's Flexbox layout engine) for terminal layout with CSS-like styling (source: ink-github-readme-2026.md).

## Installation

```
npm install ink react
```

Scaffold a new project with `create-ink-app` (source: ink-github-readme-2026.md).

## Core components

(source: ink-github-readme-2026.md)

| Component | Purpose |
|-----------|---------|
| Text | Styled text (colors, bold, italic, underline, strikethrough, inverse) |
| Box | Flexbox layout container (equivalent to `<div style="display: flex">`) with width, height, padding, margin, flex direction |
| Newline | Line breaks |
| Spacer | Flexible spacing between elements |
| Static | Content rendered once, not re-rendered on updates |
| Transform | Modify component output via transformation functions |

## Hooks

(source: ink-github-readme-2026.md)

| Hook | Purpose |
|------|---------|
| useInput | Capture keyboard input |
| useApp | Access app lifecycle methods |
| useStdin / useStdout | Stream management |
| useWindowSize | Detect terminal dimensions |
| useFocus | Manage focus state |
| useAnimation | Create animated effects |

All React features (hooks, state, lifecycle) are supported since Ink is a full React renderer. React Devtools integration works with `DEV=true` (source: ink-github-readme-2026.md).

## Ink UI

A separate component library for pre-built widgets. Install: `npm install @inkjs/ui` (source: ink-ui-github-readme-2026.md).

**Input components**: TextInput (with autocomplete), EmailInput (domain autocomplete), PasswordInput (masked), ConfirmInput (Y/n) (source: ink-ui-github-readme-2026.md).

**Selection components**: Select (single choice, scrollable), MultiSelect (source: ink-ui-github-readme-2026.md).

**Feedback components**: Spinner, ProgressBar (0-100%), Badge (status indicators), StatusMessage, Alert (source: ink-ui-github-readme-2026.md).

**List components**: UnorderedList and OrderedList with nesting (source: ink-ui-github-readme-2026.md).

## Theming

Ink UI uses a React context-based theming system (source: ink-ui-github-readme-2026.md):

- Default theme with pre-configured styles
- `extendTheme()` to customize
- `ThemeProvider` context provider
- `useComponentTheme()` hook for access in custom components
- Themes consist of `styles` (appearance) and `config` (behavior) objects
- Style functions receive component props for conditional styling

## Production users

Claude Code (Anthropic), GitHub Copilot CLI, Shopify CLI, Cloudflare Wrangler, Gatsby, Prisma (source: ink-github-readme-2026.md).

## Related pages

- [[js-tui-landscape]]
- [[opentui]] (alternative TUI framework with React support)
