# OpenTUI Animation

OpenTUI animates mutable numeric properties with `Timeline`. A global timeline engine connects timeline updates to renderer frames (source: opentui-docs-animation-2026.md).

## Constructors

Construction and registration are separate behaviors (source: opentui-docs-animation-2026.md):

| API | Initial state | Registration |
|-----|--------------|--------------|
| `new Timeline(options?)` | Always paused, including `autoplay: true` | Not registered |
| `createTimeline(options?)` | Plays unless `autoplay` is `false` | Registers with `engine` |
| React/Solid `useTimeline(options?)` | Plays on mount unless `autoplay` is `false` | Registers on mount |

`new Timeline()` stores the `autoplay` option but does not act on it. Call `play()` and `engine.register()` yourself. `createTimeline()` calls `play()` before it registers the timeline. Framework hooks create the timeline during setup and play/register on mount (source: opentui-docs-animation-2026.md).

## Timeline options

| Field | Default | Behavior |
|-------|---------|----------|
| `duration` | `1000` | Timeline cutoff in milliseconds |
| `loop` | `false` | Restarts at cutoff only when exactly `true` |
| `autoplay` | `true` | Used by factory and framework mount handlers |
| `onComplete` | None | Runs when a non-looping timeline reaches cutoff |
| `onPause` | None | Runs on every `pause()` call |

`duration: 0` falls back to `1000` because the constructor uses a truthy fallback (source: opentui-docs-animation-2026.md).

## Adding animations

`add(target, properties, startTime?)` accepts one target or an array. Additional numeric keys in `properties` are animation end values. Non-numeric end values are ignored. When the item first becomes active, OpenTUI reads each matching top-level target property and captures the existing numeric value. Initial values stay captured across loops and `restart()` (source: opentui-docs-animation-2026.md).

Nested property paths, arrays, and object traversal are not supported. Animate top-level numeric properties only (source: opentui-docs-animation-2026.md).

## Animation options

| Field | Type | Behavior |
|-------|------|----------|
| `duration` | `number` | Item duration in ms (required) |
| `ease` | `EasingFunctions` | Named easing function (default `linear`) |
| `onUpdate` | `(animation: JSAnimation) => void` | Runs for each active update |
| `onComplete` | `() => void` | Runs after the final item cycle |
| `onStart` | `() => void` | Runs when the item first becomes active |
| `onLoop` | `() => void` | Runs when an intermediate cycle changes |
| `loop` | `boolean \| number` | Infinite for `true`, or a numeric cycle count |
| `loopDelay` | `number` | Delay after each cycle (default 0) |
| `alternate` | `boolean` | Reverses every odd cycle (default false) |
| `once` | `boolean` | Removes the item after completion (default false) |

(source: opentui-docs-animation-2026.md)

## Update callback

`onUpdate` receives a `JSAnimation` object with: `targets` (the normalized array after mutation), `deltaTime`, `progress` (eased forward progress before `alternate` reversal), and `currentTime`. Back and elastic easing can make `progress` less than 0 or greater than 1 (source: opentui-docs-animation-2026.md).

## Easing functions

Accepted names: `linear`, `inQuad`, `outQuad`, `inOutQuad`, `inExpo`, `outExpo`, `inOutSine`, `outBounce`, `outElastic`, `inBounce`, `inCirc`, `outCirc`, `inOutCirc`, `inBack`, `outBack`, `inOutBack`. Custom easing functions are not supported (source: opentui-docs-animation-2026.md).

## Scheduling

Use numeric start times in milliseconds. `call(callback, startTime?)` runs the callback once when timeline time reaches that point. A loop or restart resets the execution flag. `once(target, properties)` adds an animation at `currentTime` that removes itself after completion. Normal completed items remain in `items`; only `once` items auto-remove (source: opentui-docs-animation-2026.md).

Strings passed as start times currently all resolve to time 0. Use finite non-negative numbers (source: opentui-docs-animation-2026.md).

## Timeline methods

| Method | Behavior |
|--------|----------|
| `add(target, properties, startTime = 0)` | Add a numeric animation, return `this` |
| `once(target, properties)` | Add a removable animation at `currentTime`, return `this` |
| `call(callback, startTime = 0)` | Add a scheduled callback, return `this` |
| `sync(timeline, startTime = 0)` | Give this timeline control of one child |
| `play()` | Start or resume; a completed timeline restarts |
| `pause()` | Pause this timeline and all synced children |
| `restart()` | Set time to zero, reset item flags, start playback |
| `resetItems()` | Reset item and child flags without changing time or play state |
| `update(deltaTime)` | Evaluate synced children, items, loops, and completion |

`pause()` invokes `onPause` even when already paused. `play()` on a completed non-looping timeline calls `restart()`. `play()` on a paused incomplete timeline keeps `currentTime` (source: opentui-docs-animation-2026.md).

## Syncing child timelines

`parent.sync(child, startTime)` starts the child when the parent reaches that time. Later parent updates pass their full delta to the child. Parent loops reset and restart child scheduling. A parent pause pauses children that already started (source: opentui-docs-animation-2026.md).

One timeline can be synced only once; a second claim throws `Error("Timeline already synced")`. The engine skips a registered timeline when `synced` is `true` (source: opentui-docs-animation-2026.md).

Known limitation: `update()` evaluates synced children before checking whether the parent is playing. A paused parent can start a future child when a manual update crosses its start time (source: opentui-docs-animation-2026.md).

## Global engine

`engine` is one process-global scheduler. It can attach to one `CliRenderer` at a time (source: opentui-docs-animation-2026.md).

| Method | Behavior |
|--------|----------|
| `attach(renderer)` | Detach prior renderer, install frame callback |
| `detach()` | Remove frame callback, drop engine-owned live state |
| `register(timeline)` | Add timeline and watch its state |
| `unregister(timeline)` | Remove timeline and state listener |
| `clear()` | Unregister all timelines |
| `update(deltaTime)` | Update every registered unsynced timeline |

Attach the renderer before `createTimeline()` or `play()`. The engine requests live rendering when any registered, unsynced timeline is playing and incomplete. `createTimeline()` never unregisters its result. `engine.clear()` affects every owner, so do not use it for component cleanup (source: opentui-docs-animation-2026.md).

## Cleanup

The canonical Core cleanup sequence (source: opentui-docs-animation-2026.md):

1. `timeline.pause()`
2. `engine.unregister(timeline)`
3. `engine.detach()` (only if this owner attached the renderer)
4. Destroy the renderer through normal [[opentui-lifecycle]]

Do not call `renderer.requestLive()` or `renderer.dropLive()` for a registered timeline. The engine balances its own live request (source: opentui-docs-animation-2026.md).

## Framework mapping

| API | Setup | Cleanup |
|-----|-------|---------|
| Core `new Timeline()` | Application registers and plays | Application pauses and unregisters |
| Core `createTimeline()` | Factory registers and plays | Application pauses and unregisters |
| React `useTimeline()` | Mount effect registers and plays | Effect cleanup pauses and unregisters |
| Solid `useTimeline()` | Mount handler registers and plays | Cleanup pauses and unregisters |

React `createRoot(renderer).render(...)` attaches the engine. Solid `render(...)` and `testRender(...)` also attach it. Both hooks treat options as setup-time data; later changes do not reconfigure the timeline (source: opentui-docs-animation-2026.md).

## Limitations

Timeline supports top-level numeric interpolation only. It does not interpolate colors, strings, units, nested paths, or keyframe arrays. No spring or physics solver. No seek, item removal, unsync, per-item pause, or public reverse method. Use `alternate` for per-cycle reversal. Use application state and a new timeline for unsupported scheduling changes (source: opentui-docs-animation-2026.md).

## Related pages

- [[opentui]] (overview)
- [[opentui-renderer]] (renderer creation and frame scheduling)
- [[opentui-lifecycle]] (cleanup and destruction)
- [[opentui-react]] (React bindings)
- [[opentui-solid]] (Solid bindings)
