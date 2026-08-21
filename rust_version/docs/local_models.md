# Local model comparison

Last updated: 2026-08-20

Hardware baseline: Apple M2 Pro, 16GB unified memory.

## Models that fit in 16GB

| Model | Params | Disk/RAM | Context | Strengths | Weaknesses |
|---|---|---|---|---|---|
| gemma4:12b | 12B | 7.6GB | 256K | Newest gen, large context, strong code | Multimodal features unused for this project |
| qwen3:14b | 14B | 9.3GB | 40K | Strong code generation, thinking mode | Leaves less headroom (~7GB free) |
| qwen3:8b | 8B | 5.2GB | 40K | Fast inference, good code, thinking mode | Smaller than 12-14B options |
| gemma4:e4b | ~4B (edge) | 9.6GB | 128K | Optimized for on-device speed | Trades quality for speed |
| gemma3:12b | 12B | 8.1GB | 128K | Well-tested, proven | One generation behind gemma4 |
| deepseek-r1:14b | 14B | ~9GB | 128K | Step-by-step reasoning | Distilled, not category-leading at this size |
| deepseek-r1:8b | 8B | ~5GB | 128K | Reasoning focus, small footprint | Distilled from larger model |
| llama3.2:3b | 3B | 2.0GB | 128K | Tiny, very fast | Weakest quality of the group |

## Notes

- All default Ollama tags are quantized (typically Q4_K_M). Sizes reflect quantized weights.
- On Apple Silicon, models load fully into unified memory. Disk size ~ RAM usage.
- Specify alternate quantizations via tag, e.g. `qwen3:8b-q8_0` (higher quality, larger).
- MoE models (deepseek-v3/v4, 284B+) require full param loading despite sparse activation. Too large for 16GB.

## Current project model

Configured in `rust_version/.env` as `STAYSHARP_MODEL`. Currently set to `llama3.2`.
