# Biome Editor Integration

[[biome|Biome]] provides first-party extensions for VS Code, IntelliJ, and Zed. Community extensions exist for Vim, Neovim, and Sublime Text. (source: biomejs-getting-started-2026.md)

## VS Code

### Installation

Install from the [Visual Studio Code Marketplace](https://marketplace.visualstudio.com/items?itemName=biomejs.biome) or the Open VSX registry (for VSCodium, Cursor, and other derivatives). (source: biomejs-vscode-extension-2026.md)

### Setting as default formatter

The extension registers as a formatter for all supported file types. To make it the default, open a supported file and use the Command Palette: `Format Document With...` > `Configure Default Formatter` > select Biome. (source: biomejs-vscode-extension-2026.md)

### Features

**Formatting:** Supports whole-file and selection formatting via `Format Document` and `Format Selection` commands. Enable format-on-save with `editor.formatOnSave: true`. (source: biomejs-vscode-extension-2026.md)

**Code fixing:** Provides code fixes for diagnostics with safe fixes. Enable fix-on-save with:

```json
{
  "editor.codeActionsOnSave": {
    "source.fixAll.biome": "explicit"
  }
}
```

Unsafe fixes on save require making the rule's code fix safe in [[biome-configuration|configuration]]. (source: biomejs-vscode-extension-2026.md)

**Import sorting:** Enable with:

```json
{
  "editor.codeActionsOnSave": {
    "source.organizeImports.biome": "explicit"
  }
}
```

(source: biomejs-vscode-extension-2026.md)

### Settings reference

| Setting | Default | Scopes | Purpose |
|---------|---------|--------|---------|
| `biome.enabled` | `true` | global, workspace, folder | Controls whether the extension creates an LSP session |
| `biome.requireConfiguration` | `false` | global, workspace, folder | Only activate if `biome.json` is present |
| `biome.configurationPath` | `null` | global, workspace, folder | Path to a custom configuration file |
| `biome.inlineConfig` | - | - | Overrides disk-based config (e.g. disable a rule locally without changing biome.json) |
| `biome.gotoDefinition` | `false` | - | Enables go-to-definition navigation |
| `biome.lsp.bin` | `undefined` | global, workspace, folder | Custom binary path override |
| `biome.runFromTemporaryLocation` | `true` (Windows), `false` (others) | global, workspace, folder | Copy binary to temp location before running |
| `biome.suggestInstallingGlobally` | `true` | global, workspace, folder | Show suggestion popup when global install not found |
| `biome.lsp.trace.server` | `off` | global | LSP logging level (`off`, `messages`, `verbose`) |
| `biome.lsp.watcher.kind` | `null` | global, workspace, folder | File watcher strategy (`recommended`, `polling`, `none`) |
| `biome.lsp.watcher.pollingInterval` | `null` (default 2000ms) | global, workspace, folder | Polling interval when using `polling` watcher |

(source: biomejs-vscode-extension-2026.md)

### Multi-root workspaces

The extension automatically creates a separate Biome instance per workspace folder in multi-root workspaces. (source: biomejs-vscode-extension-2026.md)

### Migration from 2.x extension

After updating the extension: close the editor, kill all `biome` processes via the task manager, then reopen the editor. This destroys stale daemon connections that can cause incorrect formatting on save. (source: biomejs-vscode-extension-2026.md)

The `biome.lspBin` setting is deprecated in favor of `biome.lsp.bin`. The `biome.requireConfigFile` setting has been renamed to `biome.requireConfiguration` (the old name is no longer supported). (source: biomejs-vscode-extension-2026.md)

## Related pages

- [[biome]]
- [[biome-configuration]]
- [[biome-assist]]
