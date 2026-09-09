# OpenTUI Renderables and Layout

A renderable is an imperative node in OpenTUI's retained tree. It stores layout, visual state, children, event handlers, and native resources. Retained means the same objects stay in the tree between frames. Change their properties instead of rebuilding them (source: opentui-docs-renderables-2026.md).

## Creating and updating

Create a renderable with a render context. A `CliRenderer` implements that context (source: opentui-docs-renderables-2026.md).

```typescript
import { BoxRenderable, RGBA, TextRenderable, createCliRenderer } from "@opentui/core"

const renderer = await createCliRenderer()
const panel = new BoxRenderable(renderer, {
  id: "panel",
  width: 18,
  height: 3,
  paddingX: 1,
  border: true,
  borderColor: RGBA.defaultForeground(),
  backgroundColor: RGBA.fromIndex(243),
})
const status = new TextRenderable(renderer, {
  id: "status",
  content: "Waiting",
  fg: RGBA.defaultForeground(),
})

panel.add(status)
renderer.root.add(panel)
```

Setters such as `content`, `width`, `visible`, and `zIndex` request another render when their state changes (source: opentui-docs-renderables-2026.md).

## Tree membership

Each renderable has at most one parent. `add()` reparents an existing node when necessary, calling `remove()` on the old parent (source: opentui-docs-renderables-2026.md).

`add(child, index)` inserts at an index. `insertBefore(child, anchor)` inserts before a direct child. Both return the inserted index, or -1 when they cannot add the value (source: opentui-docs-renderables-2026.md).

Tree inspection methods (source: opentui-docs-renderables-2026.md):

- `getChildren()` -- returns a new array of direct children
- `getChildrenCount()` -- returns the direct-child count
- `getRenderable(id)` -- finds a direct child
- `findDescendantById(id)` -- searches descendants recursively

## Hiding vs detaching

`visible = false` sets the Yoga node to `display: none`. The node does not receive layout or render work while hidden. Hiding a focused node also blurs it. The child stays in the tree with the same parent (source: opentui-docs-renderables-2026.md).

`remove(child)` detaches a direct child without destroying it. The child's parent becomes null and the parent's child count decreases (source: opentui-docs-renderables-2026.md).

Neither operation destroys the renderable. Set `visible = true` to show a hidden child, or call `add()` to reattach a detached child (source: opentui-docs-renderables-2026.md).

## Destruction

`destroy()` is idempotent. It detaches the node, releases its frame buffer and Yoga node, removes listeners, and calls `destroySelf()`. It detaches direct children but does not destroy them. Use `destroyRecursively()` when the node owns the complete subtree (source: opentui-docs-renderables-2026.md).

Do not release final owned resources in `onRemove()`. Release them in `destroySelf()`, which runs only during destruction. Do not add a destroyed renderable to another parent (source: opentui-docs-renderables-2026.md).

## Layout system

OpenTUI uses Yoga to compute layout on a grid of terminal cells. A horizontal size is a count of terminal columns. A vertical size is a count of terminal rows (source: opentui-docs-layout-2026.md).

### Supported layout options

`RenderableOptions` supplies the shared layout values. `BoxOptions` adds gap values (source: opentui-docs-layout-2026.md):

| Group | Options | Accepted values | Default |
|-------|---------|-----------------|---------|
| Position | `position` | `"relative"` or `"absolute"` | `"relative"` |
| Edges | `top`, `right`, `bottom`, `left` | number, `"auto"`, or percentage | unset |
| Dimensions | `width`, `height` | number, `"auto"`, or percentage | `"auto"` |
| Limits | `minWidth`, `minHeight`, `maxWidth`, `maxHeight` | number or percentage | unset |
| Margin | `margin`, `marginX`, `marginY`, `marginTop`, `marginRight`, `marginBottom`, `marginLeft` | number, `"auto"`, or percentage | 0 |
| Padding | `padding`, `paddingX`, `paddingY`, `paddingTop`, `paddingRight`, `paddingBottom`, `paddingLeft` | number or percentage | 0 |
| Flex size | `flexGrow` | number | 0 |
| Flex size | `flexShrink` | number | 0 for initial numeric dimension, otherwise 1 |
| Flex size | `flexBasis` | number or `"auto"` | `"auto"` |
| Flow | `flexDirection` | `"column"`, `"column-reverse"`, `"row"`, `"row-reverse"` | `"column"` |
| Flow | `flexWrap` | `"no-wrap"`, `"wrap"`, `"wrap-reverse"` | `"no-wrap"` |
| Alignment | `alignItems` | Yoga align value | `"stretch"` |
| Alignment | `alignSelf` | Yoga align value | `"auto"` |
| Alignment | `justifyContent` | start, end, center, or space distribution | `"flex-start"` |
| Gaps (Box) | `gap`, `rowGap`, `columnGap` | number or percentage | 0 |
| Clipping | `overflow` | `"visible"`, `"hidden"`, or `"scroll"` | `"visible"` |

Yoga align values: `"auto"`, `"flex-start"`, `"center"`, `"flex-end"`, `"stretch"`, `"baseline"`, `"space-between"`, `"space-around"`, `"space-evenly"` (source: opentui-docs-layout-2026.md).

`justifyContent` accepts the same start, center, end, and three space-distribution values. It does not accept `"auto"`, `"stretch"`, or `"baseline"` (source: opentui-docs-layout-2026.md).

### Additional layout properties

`zIndex` changes sibling render and hit-test order without changing layout order. `translateX` and `translateY` move drawing and hit bounds without changing the Yoga result. `opacity` applies to the node and its descendants. `overflow: "hidden"` or `"scroll"` clips rendering and mouse hit bounds (source: opentui-docs-renderables-2026.md).

### Automatic and intrinsic size

An `"auto"` dimension lets Yoga derive size from children or a renderable's measure function. Text and editor renderables supply native measure targets. `wrapMode: "word"` and `"char"` can increase measured height under a width constraint (source: opentui-docs-layout-2026.md).

A percentage dimension resolves against the parent's corresponding size. If that parent lacks a definite size, the result can differ from browser layout assumptions. Min and max dimensions constrain the result. Padding and borders consume space inside the computed box (source: opentui-docs-layout-2026.md).

### Relative and absolute positioning

Relative children take part in flex layout. Their edge values offset the Yoga position. Absolute children do not consume space in normal flex flow. Their edges position them against the containing layout box. Absolute text uses its intrinsic measure without the relative child's at-most clamp; set a width when you need predictable wrapping (source: opentui-docs-layout-2026.md).

### Cell rounding

Yoga uses a point scale factor of 1. It rounds computed edges to whole terminal cells while preserving the layout total. Percentage and flex calculations can produce fractions before this step, so adjacent children can receive different rounded widths. Renderable getters expose computed integer geometry after a layout pass. OpenTUI clamps exposed `width` and `height` to at least one cell (source: opentui-docs-layout-2026.md).

### Resize behavior

A terminal resize keeps the same renderable instances. The renderer resizes its root and runs Yoga again with the new column and row counts. Computed `x`, `y`, `width`, and `height` can all change. Buffered renderables resize their frame buffers before `onResize(width, height)` runs. Custom streams must call `renderer.resize(columns, rows)`. Local `process.stdout` sessions use `SIGWINCH` automatically (source: opentui-docs-layout-2026.md).

### Common layout failures

(source: opentui-docs-layout-2026.md)

- A numeric initial `width` or `height` sets the default `flexShrink` to 0. Set `flexShrink` when the node must contract.
- An absolute child does not increase its parent's automatic size.
- A percentage needs a useful parent size.
- `overflow: "scroll"` clips like a Yoga overflow mode, but it does not add scroll state. Use [[opentui-components|ScrollBox]].
- Gap options belong to Box, not every renderable class.
- `visible = false` removes a renderable from layout.
- Text can contain fewer graphemes than cells or more UTF-16 units than cells.

## Related pages

- [[opentui]] -- Overview
- [[opentui-renderer]] -- Renderer creation and lifecycle
- [[opentui-components]] -- Built-in component catalog
- [[opentui-input]] -- Interaction, focus, selection
- [[opentui-styling]] -- Colors and text styling
