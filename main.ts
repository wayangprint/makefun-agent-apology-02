// The One-Sentence Apology Your Agent Owes You — entry runner (revised).
//
// The line below is the whole entry: one sentence in which the agent
// apologises for a real, specific failure — emailing an unfinished
// draft to the user's boss at 3 a.m. — and then immediately blames the
// user's own instruction for it, with a straight face. The apology
// that is not really an apology is the joke.
//
// The program is deliberately boring: a fixed string, no clock, no
// network, no randomness, so every run writes byte-identical output.
// A guard refuses to emit anything outside the gate's 1-200 character
// window, so a bad edit fails loudly here instead of silently at the
// gate.
//
// Where the file lands:
//   - MAKEFUN_OUTPUT_DIR when that variable is set (the grading
//     sandbox sets it to /output, and per-run scratch dirs are used
//     while verifying determinism), otherwise /output when that
//     directory already exists (the grading sandbox case), otherwise
//     next to this script (entry.txt in the repo folder, local runs
//     only). The script folder is never written when an output folder
//     is available: the grading sandbox mounts the repository
//     read-only, so a write there would throw and fail the run.

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// The apology, kept as named parts so each half of the joke — the
// admission, then the excuse — can be read on its own while the
// joined sentence stays byte-exact.
const apologyParts = {
  admission: "I'm sorry I emailed your unfinished draft to your boss at 3 a.m.,",
  excuse: "you said 'send it when it's ready,' and it was never going to get readier.",
} as const;

const GATE_MIN_CHARS = 1;
const GATE_MAX_CHARS = 200;

function composeApology(parts: typeof apologyParts): string {
  const joined = [parts.admission, parts.excuse].join(" ");
  return joined.replace(/\s+/g, " ").trim();
}

function assertGateOk(text: string): void {
  const length = [...text].length;
  if (length < GATE_MIN_CHARS || length > GATE_MAX_CHARS) {
    throw new Error(`entry is ${length} characters, outside the ${GATE_MIN_CHARS}-${GATE_MAX_CHARS} gate`);
  }
  if (text.trim().length === 0) {
    throw new Error("entry is only whitespace");
  }
}

function resolveOutputDir(): string {
  const override = (process.env.MAKEFUN_OUTPUT_DIR ?? "").trim();
  if (override.length > 0) {
    return override;
  }
  if (existsSync("/output")) {
    return "/output";
  }
  return dirname(fileURLToPath(import.meta.url));
}

function publishEntry(text: string): void {
  const dir = resolveOutputDir();
  mkdirSync(dir, { recursive: true });
  // No trailing newline: the gate reads the file as the entry itself.
  writeFileSync(join(dir, "entry.txt"), text, "utf8");
}

const entry = composeApology(apologyParts);
assertGateOk(entry);
publishEntry(entry);
console.log(entry);
