# OpenTUI Keymap

`@opentui/keymap` is an independent, host-agnostic package for layered key bindings, commands, and key sequences (source: opentui-docs-keymap-2026.md).

## Three-step model

The system operates in three steps (source: opentui-docs-keymap-2026.md):

1. **Register**: Apps add commands, bindings, layers, tokens, and patterns.
2. **Dispatch**: The engine processes events through focus, conditions, and layer ordering.
3. **Query**: Apps read active commands and available next keys.

## When to use

Use Keymap when you need (source: opentui-docs-keymap-2026.md):

- Focus-scoped or priority-ordered layers
- User-configurable key bindings
- Multi-key sequences or leader keys
- Named commands for palettes and help
- One command model across Core, React, and Solid code

For simple app-wide input, direct `renderer.keyInput` listeners are sufficient. For component-local behavior, component key bindings work. Keymap is for complex scenarios involving layers, commands, discovery, and key sequences (source: opentui-docs-keyboard-2026.md).

## Framework integration

The package provides adapters for different environments (source: opentui-docs-keymap-2026.md):

- **OpenTUI adapter**: connects to terminal input via `CliRenderer`
- **HTML adapter**: connects to browser keyboard events
- **React integration**: supplies context and hooks
- **Solid integration**: supplies context, selectors, and hooks

## Layer architecture

Layers can be global or attached to specific targets, with priority-based execution. A key sequence stays pending until another key completes it, rejects it, or clears it, enabling dynamic shortcut displays (source: opentui-docs-keymap-2026.md).

## Registrations and cleanup

Keymap layer, token, parser, resolver, intercept, listener, and addon registrations return disposer functions. Keep each disposer for a registration that can outlive its component. Custom addons should return one disposer that releases their registrations in reverse dependency order (source: opentui-docs-lifecycle-2026.md).

The OpenTUI Keymap host observes renderer destruction and cleans its layers, listeners, and shared addon resources. Other hosts must publish their own destroy lifecycle (source: opentui-docs-lifecycle-2026.md).

## Testing

`@opentui/keymap/testing` does not require a renderer. `createTestKeymap({ defaultKeys })` supplies a fake host, root target, focus and parent traversal, press and release events, raw input, target destruction, and diagnostic capture (source: opentui-docs-testing-2026.md).

```typescript
import { createTestKeymap } from "@opentui/keymap/testing"

const harness = createTestKeymap({ defaultKeys: true })
const calls: string[] = []
try {
  harness.keymap.registerLayer({
    commands: [{ name: "save", run: () => calls.push("save") }],
    bindings: [{ key: "x", cmd: "save" }],
  })
  harness.host.press("x")
  console.log(calls)
} finally {
  harness.cleanup()
}
```

(source: opentui-docs-testing-2026.md)

## Related pages

- [[opentui]] (overview)
- [[opentui-keyboard]] (keyboard input handling)
- [[opentui-testing]] (test utilities)
- [[opentui-lifecycle]] (cleanup and destruction)
