/**
 * Paged.js Behavior Compiler (FINAL)
 *
 * ✔ class merge (safe)
 * ✔ multi-behavior support
 * ✔ data-paged-slot (primary only)
 * ✔ no DOMParser
 * ✔ no CSS injection
 * ✔ SSR-safe string transform
 */

const BEHAVIOR_CLASS_MAP: Record<string, string> = {
  'every-page': 'paged-footer',
  'first-page-only': 'paged-header',
  'not-first-page': 'paged-footer-no-first',
  'last-page-only': 'paged-last',
  'not-last-page': 'paged-no-last',
  'keep-together': 'paged-keep-together',
  'page-break-before': 'paged-break-before',
  'page-break-after': 'paged-break-after',
}

/**
 * HTML attribute helpers
 */
function getAttr(tag: string, attr: string): string | null {
  const escaped = attr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = tag.match(new RegExp(`${escaped}="([^"]*)"`))
  return match ? match[1] : null
}

function setAttr(tag: string, attr: string, value: string): string {
  const escaped = attr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  if (new RegExp(`${escaped}="`).test(tag)) {
    return tag.replace(new RegExp(`${escaped}="[^"]*"`), `${attr}="${value}"`)
  }
  return tag.replace('>', ` ${attr}="${value}">`)
}

function mergeClasses(existing: string, incoming: string[]): string {
  const set = new Set([
    ...existing.split(/\s+/).filter(Boolean),
    ...incoming,
  ])
  return Array.from(set).join(' ')
}

export function applyPagedBehaviors(htmlContent: string): string {
  if (!htmlContent) return htmlContent

  const regex = /<[^>]+data-behavior="([^"]+)"[^>]*>/g

  let match: RegExpExecArray | null
  let result = htmlContent

  while ((match = regex.exec(result)) !== null) {
    const fullMatch = match[0]
    const behaviors = match[1].trim().split(/\s+/)

    const classes = behaviors
      .map((b) => BEHAVIOR_CLASS_MAP[b])
      .filter(Boolean) as string[]

    const primarySlot = behaviors[0] ?? null

    let updated = fullMatch

    if (primarySlot) {
      updated = setAttr(updated, 'data-paged-slot', primarySlot)
    }

    const existingClass = getAttr(updated, 'class')
    const merged = mergeClasses(existingClass ?? '', classes)
    updated = setAttr(updated, 'class', merged)

    result = result.replace(fullMatch, updated)
  }

  return result
}

export function getPagedClass(behavior: string): string {
  return BEHAVIOR_CLASS_MAP[behavior] ?? ''
}
