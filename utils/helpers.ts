export function genId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`
}

export function nowIso() {
  return new Date().toISOString()
}

export function textMatch(haystack: string, needle: string) {
  return haystack.toLowerCase().includes(needle.toLowerCase())
}

export function toWeekLabel(d: Date) {
  const year = d.getUTCFullYear()
  const week = Math.ceil((d.getUTCDate() + (d.getUTCDay() || 7)) / 7)
  return `${year}-W${String(week).padStart(2, "0")}`
}
