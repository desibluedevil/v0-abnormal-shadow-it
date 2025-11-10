/* scripts/codemod-inline-styles.ts
   Wave-2 Codemod: Replace inline style hex colors & known shadows with token CSS vars.
   Usage:
     pnpm tsx scripts/codemod-inline-styles.ts          # dry run (report only)
     pnpm tsx scripts/codemod-inline-styles.ts --apply  # write changes
*/

import fs from "fs"
import path from "path"

type MapFile = {
  hexToCssVar: Record<string, string>
  tailwindClassToTokenClass?: Record<string, string>
  shadowToVar?: Record<string, string> // optional: map shadow strings to var(--elevation-*)
  stringToCssVar?: Record<string, string> // optional: map arbitrary strings to CSS vars
}

const ROOT = process.cwd()
const MAP_PATH = path.join(ROOT, "codemod-color-map.json")
const INCLUDE_EXT = new Set([".ts", ".tsx", ".js", ".jsx", ".mdx", ".css", ".scss"])
const EXCLUDE_DIRS = new Set(["node_modules", ".next", "dist", "build", "public", ".vercel", ".git"])
const APPLY = process.argv.includes("--apply")

function safeRead(p: string) {
  try {
    return fs.readFileSync(p, "utf8")
  } catch {
    return ""
  }
}
function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}
function replaceAll(content: string, find: RegExp, replace: string) {
  return content.replace(find, replace)
}
function shouldVisitDir(dir: string) {
  return !EXCLUDE_DIRS.has(path.basename(dir))
}
function listFiles(dir: string, acc: string[] = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) {
      if (shouldVisitDir(p)) listFiles(p, acc)
    } else {
      const ext = path.extname(p)
      if (INCLUDE_EXT.has(ext)) acc.push(p)
    }
  }
  return acc
}

function loadMap(): MapFile {
  const raw = safeRead(MAP_PATH)
  if (!raw) {
    throw new Error(`Missing ${MAP_PATH}. Please ensure codemod-color-map.json exists at repo root.`)
  }
  const parsed = JSON.parse(raw) as MapFile
  // Provide sensible defaults for shadows if not present
  if (!parsed.shadowToVar) {
    parsed.shadowToVar = {
      "0 1px 2px rgba(2,6,23,0.6)": "var(--elevation-1)",
      "0 6px 24px rgba(2,6,23,0.5)": "var(--elevation-2)",
    }
  }
  return parsed
}

/**
 * Replace inline style values:
 *  - React/JSX: style={{ color: '#ef4444', backgroundColor: "#0f1720" }}
 *  - HTML/MDX:  style="color:#ef4444; background-color:#0f1720"
 *  - Known box-shadows: map to var(--elevation-*)
 * We do conservative text replacements inside style contexts and general strings.
 */
function run() {
  const map = loadMap()
  const files = listFiles(ROOT)
  const report: any[] = []
  let totalReplacements = 0

  // Build regexes for hex and shadow mappings
  const hexEntries = Object.entries(map.hexToCssVar || {})
  const shadowEntries = Object.entries(map.shadowToVar || {})
  const stringEntries = Object.entries(map.stringToCssVar || {})

  // Patterns to find style blocks quickly (best-effort)
  const styleObjectPattern = /style=\{\{([\s\S]*?)\}\}/g // React style object
  const styleAttrPattern = /style=(["'`])([\s\S]*?)\1/g // HTML/MDX style attr

  for (const file of files) {
    let content = safeRead(file)
    if (!content) continue

    let fileReplacements = 0
    const changes: any[] = []

    const beforeContent = content

    // 1) Replace hex values globally inside files (first pass), but we'll also count
    for (const [hex, cssVar] of hexEntries) {
      const re = new RegExp(escapeRegExp(hex), "ig")
      if (re.test(content)) {
        const count = (content.match(re) || []).length
        content = replaceAll(content, re, cssVar)
        if (count > 0) {
          fileReplacements += count
          changes.push({ type: "hex-inline", from: hex, to: cssVar, count })
        }
      }
    }

    // 2) Shadow strings → elevation vars (applies anywhere, including style strings)
    for (const [shadow, tok] of shadowEntries) {
      const re = new RegExp(escapeRegExp(shadow), "g")
      if (re.test(content)) {
        const count = (content.match(re) || []).length
        content = replaceAll(content, re, tok)
        if (count > 0) {
          fileReplacements += count
          changes.push({ type: "shadow-inline", from: shadow, to: tok, count })
        }
      }
    }

    // 3) Arbitrary string to CSS var replacements (optional)
    for (const [needle, cssVar] of stringEntries) {
      const re = new RegExp(escapeRegExp(needle), "g")
      if (re.test(content)) {
        const count = (content.match(re) || []).length
        content = replaceAll(content, re, cssVar)
        if (count > 0) {
          fileReplacements += count
          changes.push({ type: "string-inline", from: needle, to: cssVar, count })
        }
      }
    }

    // 4) (Optional) normalize whitespace inside style objects/attrs (cosmetic)
    //    Keep minimal to avoid formatting churn; your formatter will handle style.

    // Finalize
    if (fileReplacements > 0) {
      totalReplacements += fileReplacements
      report.push({ file, replacements: fileReplacements, changes })
      if (APPLY) fs.writeFileSync(file, content, "utf8")
    }
  }

  const out = {
    apply: APPLY,
    totalFilesChanged: report.length,
    totalReplacements,
    details: report,
  }
  const outPath = path.join(ROOT, `codemod-inline-report${APPLY ? "-applied" : "-dryrun"}.json`)
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2))
  console.log(
    `Inline Codemod ${APPLY ? "APPLIED" : "DRY RUN"} — files changed: ${report.length}, replacements: ${totalReplacements}`,
  )
  console.log(`Report: ${outPath}`)
}

run()
