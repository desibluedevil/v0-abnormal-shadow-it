/* scripts/codemod-colors.ts
   Usage:
   - Dry run:  pnpm tsx scripts/codemod-colors.ts
   - Apply:    pnpm tsx scripts/codemod-colors.ts --apply
*/

import fs from "fs"
import path from "path"

type MapFile = {
  hexToCssVar: Record<string, string>
  tailwindClassToTokenClass: Record<string, string>
}

const ROOT = process.cwd()
const MAP_PATH = path.join(ROOT, "codemod-color-map.json")
const INCLUDE_EXT = new Set([".ts", ".tsx", ".js", ".jsx", ".css", ".scss", ".mdx"])
const EXCLUDE_DIRS = new Set(["node_modules", ".next", "dist", "build", "public", ".vercel", ".git"])

const APPLY = process.argv.includes("--apply")

function loadMap(): MapFile {
  const raw = fs.readFileSync(MAP_PATH, "utf8")
  return JSON.parse(raw) as MapFile
}

function shouldVisitDir(dir: string) {
  const base = path.basename(dir)
  return !EXCLUDE_DIRS.has(base)
}

function listFiles(dir: string, acc: string[] = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const e of entries) {
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

function replaceAll(content: string, find: string | RegExp, replace: string) {
  return content.replace(find as any, replace)
}

function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function run() {
  const map = loadMap()

  const files = listFiles(ROOT)
  const report: any[] = []
  let totalReplacements = 0

  for (const file of files) {
    let content = fs.readFileSync(file, "utf8")
    const orig = content
    let fileReplacements = 0
    const changes: any[] = []

    // 1) Hex to CSS var (case-insensitive)
    for (const [hex, cssVar] of Object.entries(map.hexToCssVar)) {
      const re = new RegExp(escapeRegExp(hex), "ig")
      if (re.test(content)) {
        const before = (content.match(re) || []).length
        content = replaceAll(content, re, cssVar)
        fileReplacements += before
        changes.push({ type: "hex", hex, cssVar, count: before })
      }
    }

    // 2) Tailwind class replacements (exact substrings)
    for (const [tw, token] of Object.entries(map.tailwindClassToTokenClass)) {
      const re = new RegExp(`\\b${escapeRegExp(tw)}\\b`, "g")
      if (re.test(content)) {
        const before = (content.match(re) || []).length
        content = replaceAll(content, re, token)
        fileReplacements += before
        changes.push({ type: "class", from: tw, to: token, count: before })
      }
    }

    if (fileReplacements > 0) {
      totalReplacements += fileReplacements
      report.push({ file, replacements: fileReplacements, changes })
      if (APPLY) fs.writeFileSync(file, content, "utf8")
    }
  }

  // Write report
  const out = {
    apply: APPLY,
    totalFilesChanged: report.length,
    totalReplacements,
    details: report,
  }
  const outPath = path.join(ROOT, `codemod-report${APPLY ? "-applied" : "-dryrun"}.json`)
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2))
  console.log(
    `Codemod ${APPLY ? "APPLIED" : "DRY RUN"} — files changed: ${report.length}, replacements: ${totalReplacements}`,
  )
  console.log(`Report: ${outPath}`)
}

run()
