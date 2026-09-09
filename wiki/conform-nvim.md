# conform.nvim

Lightweight formatter plugin for Neovim by stevearc. Runs external formatters on save with minimal diffs that preserve extmarks and folds. Requires Neovim 0.10+. (source: conform-nvim-readme-2026.md)

## Basic configuration

```lua
require("conform").setup({
  formatters_by_ft = {
    lua = { "stylua" },
    python = { "isort", "black" },
    javascript = { "prettierd", "prettier", stop_after_first = true },
  },
  format_on_save = {
    timeout_ms = 500,
    lsp_format = "fallback",
  },
})
```

(source: conform-nvim-readme-2026.md)

## Formatter execution order

By default, all formatters in a filetype list run sequentially (e.g., `isort` then `black`). Setting `stop_after_first = true` runs only the first available formatter. (source: conform-nvim-readme-2026.md)

## LSP format modes

The `lsp_format` option controls how LSP formatting interacts with external formatters:

- `"never"` -- skip LSP formatting
- `"fallback"` -- use LSP only when no external formatters are available
- `"prefer"` -- prioritize LSP over external formatters
- `"first"` -- run LSP before external formatters
- `"last"` -- run LSP after external formatters

(source: conform-nvim-readme-2026.md)

## Biome variants

Three built-in Biome formatters:

- `biome` -- formatting only
- `biome-check` -- formatting + linting + import sorting
- `biome-organize-imports` -- import sorting only

(source: conform-nvim-readme-2026.md)

## Biome + Prettier coexistence

Use `stop_after_first = true` to prefer Biome in projects that have it and fall back to Prettier elsewhere:

```lua
formatters_by_ft = {
  javascript = { "biome", "prettier", stop_after_first = true },
  typescript = { "biome", "prettier", stop_after_first = true },
}
```

This prevents both formatters from running on the same file, which would cause formatting conflicts due to the [[prettier-vs-biome|3-4% divergence]] between them. (source: conform-nvim-readme-2026.md)

## Biome v2 compatibility

Biome v2 changed how `stdin` works, breaking conform.nvim integration for some users. An alternative is to use Biome's LSP directly for formatting and add an autocmd for `source.fixAll.biome` on save:

```lua
vim.api.nvim_create_autocmd("LspAttach", {
  callback = function(args)
    local client = vim.lsp.get_client_by_id(args.data.client_id)
    if client and client.name == "biome" then
      vim.api.nvim_create_autocmd("BufWritePre", {
        group = vim.api.nvim_create_augroup("BiomeFixAll", { clear = true }),
        buffer = args.buf,
        callback = function()
          vim.lsp.buf.code_action({
            context = {
              only = { "source.fixAll.biome" },
              diagnostics = {},
            },
            apply = true,
          })
        end,
      })
    end
  end,
})
```

(source: willcodefor-biome-neovim-2026.md)

## Related pages

- [[prettier-vs-biome]]
- [[biome]]
