# OpenTUI Environment Variables

OpenTUI reads values from `process.env`. Bun loads `.env` automatically; with Node.js, use the shell or Node's environment-file support. Most registered values are parsed on first use and cached. Registered boolean values treat `true`, `1`, `on`, and `yes` as true without case sensitivity (source: opentui-docs-env-vars-2026.md).

## Stable configuration

| Variable | Type | Default | Read time | Purpose |
|----------|------|---------|-----------|---------|
| `XDG_CONFIG_HOME` | string | `""` | First config lookup | Base directory for user-specific config |
| `XDG_DATA_HOME` | string | `""` | First data lookup | Base directory for user-specific data |
| `OTUI_PALETTE_IDLE_TIMEOUT_MS` | number | `300` | First palette query | Silence in ms before palette fallback |
| `OPENTUI_FORCE_WCWIDTH` | presence | unset | Renderer creation | Use wcwidth for character width |
| `OPENTUI_FORCE_UNICODE` | presence | unset | Renderer creation | Force Mode 2026 Unicode support |
| `OPENTUI_FORCE_NOZWJ` | presence | unset | Renderer creation | Use the no_zwj width method |
| `OPENTUI_GRAPHICS` | string | unset, auto | Renderer creation | Control Kitty and Sixel detection |
| `OPENTUI_IMAGE_PROTOCOL` | string | `"auto"` | Renderer creation | Select auto/kitty/sixel/blocks |
| `OPENTUI_FORCE_EXPLICIT_WIDTH` | string | unset | Renderer creation | Force or disable explicit-width detection |
| `OPENTUI_NOTIFICATION_PROTOCOL` | string | unset, auto | Renderer creation | Override notification protocol |
| `OPENTUI_NOTIFICATIONS` | string | unset, enabled | Renderer creation | Disable notification detection |
| `OTUI_USE_CONSOLE` | boolean | `true` | Console activation | Enable global console.* capture |
| `OTUI_USE_ALTERNATE_SCREEN` | boolean | unset | Renderer creation | Override screenMode |
| `OTUI_OVERRIDE_STDOUT` | boolean | unset | Renderer creation | Override externalOutputMode |
| `CELL_ASPECT_RATIO` | number | computed | ThreeCliRenderer creation | Override Three.js cell aspect ratio |

`OPENTUI_FORCE_WCWIDTH`, `OPENTUI_FORCE_UNICODE`, and `OPENTUI_FORCE_NOZWJ` are native presence flags. Any value, including `0` or `false`, enables the override. Leave the variable unset to disable it (source: opentui-docs-env-vars-2026.md).

`OPENTUI_GRAPHICS` recognizes only lowercase `false` or `0` to disable graphics detection. `OPENTUI_IMAGE_PROTOCOL` is case-insensitive; invalid values keep `auto`. `OPENTUI_NOTIFICATION_PROTOCOL` accepts `osc9`, `osc777`, `osc99`, and `none` (source: opentui-docs-env-vars-2026.md).

## Diagnostics

| Variable | Type | Default | Read time | Purpose |
|----------|------|---------|-----------|---------|
| `OTUI_TS_STYLE_WARN` | string | `false` | First style lookup | Warn about missing Tree-sitter styles |
| `OTUI_DEBUG_FFI` | boolean | `false` | First FFI use | Enable FFI debug logging |
| `OTUI_TRACE_FFI` | boolean | `false` | First FFI use | Enable FFI tracing |
| `OTUI_SHOW_STATS` | boolean | `false` | Renderer creation | Show stats overlay at startup |
| `SHOW_CONSOLE` | boolean | `false` | Renderer creation | Open console overlay at startup |
| `OTUI_DUMP_CAPTURES` | boolean | `false` | Renderer exit handler | Dump captured stdout and console caches |
| `OTUI_NO_NATIVE_RENDER` | boolean | `false` | Renderer creation | Skip the Zig native frame renderer |

`OTUI_TS_STYLE_WARN` behaves like a presence string; any explicit nonempty value including `false` enables warnings. `OTUI_NO_NATIVE_RENDER` does not stop the render loop (source: opentui-docs-env-vars-2026.md).

## Build-time and startup

| Variable | Type | Default | Required timing | Purpose |
|----------|------|---------|----------------|---------|
| `OPENTUI_LIBC` | string | unset, glibc | Before first Core import | Select glibc or musl on Linux |
| `OTUI_ASSET_ROOT` | string | `""` | Before bundled Core executes | Relocate OpenTUI runtime assets |
| `OTUI_TREE_SITTER_WORKER_PATH` | string | `""` | Before first Tree-sitter worker | Override the parser worker entry |

On Linux, `OPENTUI_LIBC` unset or `glibc` selects glibc; `musl` selects musl; any other value throws. `OTUI_ASSET_ROOT` must be an absolute directory, and every requested asset must exist beneath it with no package-relative fallback (source: opentui-docs-env-vars-2026.md).

## Security-sensitive diagnostics

| Variable | Type | Default | Read time | Purpose |
|----------|------|---------|-----------|---------|
| `OTUI_DEBUG` | boolean | `false` | Renderer creation | Retain raw input sequences for debugging |
| `OTUI_STDIN_LOG` | string | `""` | Renderer creation | Write raw stdin byte stream to a file |
| `OTUI_GHOSTTY_LOG_LEVEL` | string | `""` | Native init | Forward scoped Ghostty logs |

`OTUI_STDIN_LOG` records stdin before parsing. The binary data can contain passwords and other sensitive input. Use only for short debugging sessions. `OTUI_GHOSTTY_LOG_LEVEL` accepts `error`, `warn`, `info`, or `debug` (source: opentui-docs-env-vars-2026.md).

## Remote sessions

A renderer with `remote: true` forwards no local environment keys to native terminal detection by default. Add only the required names to `forwardEnvKeys`. This prevents local terminal overrides from changing an unrelated remote terminal (source: opentui-docs-env-vars-2026.md).

## Related pages

- [[opentui]] (overview)
- [[opentui-renderer]] (renderer creation and configuration)
- [[opentui-lifecycle]] (cleanup and destruction)
