# Clack

Stylish interactive prompts for JavaScript CLIs, split into two packages: @clack/core (unstyled primitives) and @clack/prompts (pre-built styled components) (source: clack-core-docs-2026.md, clack-prompts-docs-2026.md).

## @clack/core

Low-level primitives for building custom prompt UIs. Install: `npm install @clack/core` (source: clack-core-docs-2026.md).

### Architecture

All prompts inherit from a base `Prompt` class providing custom rendering, input management, state tracking, event emission, validation, and abort signal integration. The package organizes into `prompts/` (base implementations) and `utils/` (helpers) (source: clack-core-docs-2026.md).

### Prompt types

TextPrompt, SelectPrompt, ConfirmPrompt, PasswordPrompt, MultiSelectPrompt, GroupMultiSelectPrompt, SelectKeyPrompt, AutocompletePrompt, DatePrompt, and multi-line input (source: clack-core-docs-2026.md).

### Events

Four primary events: `value` (on changes), `submit` (on completion), `validating` (during async validation), `cancel` (on user interruption) (source: clack-core-docs-2026.md).

### Customization

Extend the base `Prompt` class to create specialized prompts with custom rendering logic. `updateSettings()` configures global behavior: navigation key aliases, guide line visibility, and internationalized messages (source: clack-core-docs-2026.md).

## @clack/prompts

Pre-built production-ready prompt components. Install: `npm install @clack/prompts` (source: clack-prompts-docs-2026.md).

### Common options

All prompts accept `withGuide` (border visibility), `signal` (AbortController for programmatic cancellation including timeouts via `AbortSignal.timeout(ms)`), and custom `input`/`output` streams (source: clack-prompts-docs-2026.md).

### Text input

- **text**: single-line with validation, placeholder, default/initial values, async validation with "Validating..." state
- **password**: masked input, configurable mask character, `clearOnError`
- **multiline**: multi-line, Enter twice to submit, optional submit button

(source: clack-prompts-docs-2026.md)

### Selection

- **select**: single choice with keyboard navigation, disabled options (strikethrough), hints, `maxItems`
- **multiselect**: Space to toggle, configurable instructions
- **selectKey**: press option keys (single characters) instead of arrow navigation
- **autocomplete**: text input with searchable option filtering, Tab completion, dynamic option getters (synchronous)
- **autocompleteMultiselect**: autocomplete with multiple selection
- **path**: file/directory browser, Tab to descend, directory-only filtering
- **date**: interactive picker navigating year/month/day segments, `minDate`/`maxDate`
- **groupMultiselect**: options in labeled groups, `selectableGroups` to toggle entire groups
- **confirm**: Y/n with customizable labels, optional vertical layout

(source: clack-prompts-docs-2026.md)

### Utilities

- **group()**: sequences multiple prompts, collects answers into one object, each prompt receives prior results
- **tasks()**: orchestrates async operations sequentially with title and completion messages
- **intro/outro/cancel**: session management display
- **isCancel()**: detect cancelled prompts
- **spinner**: loading indicator (dots or timer mode), start/message/stop/cancel/error/clear
- **progress**: progress bar (light/heavy/block styles)
- **note**: bordered box for displaying information
- **box**: customizable bordered container
- **taskLog**: collapsible log output with line limit and grouping
- **log**: semantic logging (message/info/warn/error/success/step)
- **stream**: multi-line log output supporting readable streams, async generators, arrays

(source: clack-prompts-docs-2026.md)

### Validation

Return `undefined` to accept, string or Error for rejection. Async validators show "Validating..." state. Standard Schema validators also supported (source: clack-prompts-docs-2026.md).

### Internationalization

`updateSettings()` customizes global messages and date formatting via BCP 47 language tags (source: clack-prompts-docs-2026.md).

## Related pages

- [[js-tui-landscape]]
- [[node-raw-terminal-input]] (lower-level input handling)
