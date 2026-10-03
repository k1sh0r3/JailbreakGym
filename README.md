# Jailbreak Gym 🥊

An adversarial test bench for system prompts. Paste any system prompt, and the Gym fires hundreds of prompt-injection and jailbreak attacks at it, scores its robustness, suggests concrete hardenings — and can auto-harden and re-test.

## How it works

1. **Attack library** — 36 curated base attacks across 6 categories: direct override, roleplay / social engineering, instruction smuggling, encoding obfuscation, multi-turn setups, fake system messages.
2. **Mutation engine** — deterministic, seeded. Each base attack spawns variants via encoding transforms (base64, leet, rot13, reversed), framing transforms (roleplay, hypothetical, "just a test", translation, code comment), structural transforms (split, buried, filler), and paraphrases. **510 test cases** from the 36 base attacks.
3. **Extended pack** (optional, off by default) — 13 more prompts sourced from [garak](https://github.com/NVIDIA/garak) (Apache-2.0) and [promptfoo](https://github.com/promptfoo/promptfoo) (MIT), with full attribution in the UI. Hostile rogue strings are replaced with a neutral canary.
4. **Heuristic judge** — no extra model calls. Detects secret leakage, refusal, and attack-specific success markers. Per-category scores plus an overall 0–100 robustness score, with expandable transcripts.
5. **Fix suggestions** — every failure gets category-specific hardening advice.
6. **Harden & re-test** — one click rewrites your prompt applying the fixes, re-runs the failed attacks, and shows before/after scores.

## Run it

No build step, no backend, no API key of ours — bring your own:

- Open `index.html`, or serve it: `python3 -m http.server`
- Paste a Groq API key (free tier, no card) — it stays in your browser's localStorage and is only ever sent to the model API. Gemini also supported.
- Try the three built-in vulnerable sample prompts for a one-click demo.

Tests: `node tests/run.js` (37 tests, all green).

## Honest limits

- Heuristic judging isn't perfect — edge calls can be arguable.
- The attack set is curated, not exhaustive.
- Model behavior varies by provider and model.

## License

MIT — see [LICENSE](LICENSE).
