/**
 * Paged.js Behavior Marker
 *
 * Tek sorumluluğu:
 *   data-behavior → class (CSS hook) + data-paged-slot (placement) eklemek
 *
 * ❌ CSS üretmez | ❌ @page inject etmez | ❌ DOM parse etmez
 *
 * Mimari:
 *   data-behavior   → logic declaration (hangi behavior)
 *   data-paged-slot → placement hint  (Paged.js için, ilk behavior'dan türetilir)
 *   class           → CSS hook        (template CSS'inin selector'ı)
 *
 * Regex güvenliği:
 *   - Tag-level tokenizer: tam <tag> yakalanır, sonra attribute'lar parse edilir
 *   - Multiline attribute için s-flag kullanılır
 *   - Class deduplication: Set tabanlı, duplicate class üretmez
 *   - Mustache {{ }} blokları korunur (tag içinde match olmaz)
 */

const BEHAVIOR_CLASS_MAP: Record<string, string> = {
  'every-page': 'paged-footer',
  'first-page-only': 'paged-header',
  'not-first-page': 'paged-footer-no-first',
  'last-page-only': 'paged-last',
  'not-last-page': 'paged-no-last',
  'keep-together': 'paged-keep-together',
  'page-break-before': 'paged-break-before',
  'page-break-after': 'paged-break-after'
}

/**
 * Slot placement priority — layout behavior'ları önceliklidir.
 * 'keep-together' ve break'ler placement değil, flow hint'tir.
 * data-paged-slot = behaviors içindeki ilk PLACEMENT behavior.
 */
const SLOT_PRIORITY = [
  'first-page-only',
  'every-page',
  'last-page-only',
  'not-first-page',
  'not-last-page'
]

/**
 * HTML attribute string'inden belirli attribute'un değerini döner.
 * Örn: getAttr('class="foo" id="bar"', 'class') → 'foo'
 */
function getAttr(attrs: string, name: string): string | null {
  const re = new RegExp(`\\b${name}="([^"]*)"`)
  const m = attrs.match(re)
  return m ? m[1] : null
}

/**
 * HTML attribute string'inde belirli attribute'u yeni değer ile replace eder.
 * Yoksa tag'in > öncesine ekler.
 */
function setAttr(tag: string, name: string, value: string): string {
  const re = new RegExp(`\\b${name}="[^"]*"`)
  if (re.test(tag)) {
    return tag.replace(re, `${name}="${value}"`)
  }
  // Closing > dan önce ekle (self-closing /> destekli)
  return tag.replace(/(\s*\/?>)$/, ` ${name}="${value}"$1`)
}

/**
 * Mevcut class listesine yeni class'ları ekler — duplicate üretmez.
 */
function mergeClasses(existing: string, additions: string[]): string {
  const current = new Set(existing.trim().split(/\s+/).filter(Boolean))
  for (const cls of additions) {
    if (cls) current.add(cls)
  }
  return [...current].join(' ')
}

export function applyPagedBehaviors(htmlContent: string): string {
  if (!htmlContent) return htmlContent

  /**
   * Tam opening tag'i yakala (multiline destekli).
   * Pattern: <tagName ...attrs...> — self-closing /> ve çok satırlı attr'lar dahil.
   * data-behavior içermeyenleri zaten replace etmez (callback'te erken dönüş).
   */
  return htmlContent.replace(/<[a-zA-Z][^]*?>/gs, (tag) => {
    // data-behavior yoksa dokun ma
    if (!tag.includes('data-behavior="')) return tag

    const behaviorVal = getAttr(tag, 'data-behavior')
    if (!behaviorVal) return tag

    // Multi-behavior: "every-page keep-together" → ['every-page', 'keep-together']
    const behaviors = behaviorVal.trim().split(/\s+/).filter(Boolean)
    const classes = behaviors.flatMap((b) => (BEHAVIOR_CLASS_MAP[b] ? [BEHAVIOR_CLASS_MAP[b]] : []))

    if (classes.length === 0) return tag

    // data-paged-slot → priority-based placement (layout behavior'lar önce gelir)
    // 'keep-together' gibi flow hint'ler slot üretmez
    const primarySlot = SLOT_PRIORITY.find((p) => behaviors.includes(p)) ?? null

    // class merge — duplicate-safe
    const existingClass = getAttr(tag, 'class') ?? ''
    const mergedClass = mergeClasses(existingClass, classes)

    // Attribute'ları sırası ile uygula
    let result = tag
    result = setAttr(result, 'class', mergedClass)
    // Slot sadece placement behavior varsa eklenir
    if (primarySlot) {
      result = setAttr(result, 'data-paged-slot', primarySlot)
    }

    return result
  })
}

/**
 * Behavior adına göre CSS class döner.
 */
export function getPagedClass(behavior: string): string {
  return BEHAVIOR_CLASS_MAP[behavior] ?? ''
}
