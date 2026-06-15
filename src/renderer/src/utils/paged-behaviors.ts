/**
 * Paged.js Behavior Sistemi Önişlemcisi
 * HTML içindeki data-behavior ve data-slot niteliklerini tarar, Paged.js uyumlu dinamik CSS üretir.
 */
export function applyPagedBehaviors(htmlContent: string): string {
  if (!htmlContent) return htmlContent

  const parser = new DOMParser()
  const doc = parser.parseFromString(htmlContent, 'text/html')

  const behaviors = doc.querySelectorAll('[data-behavior]')
  if (behaviors.length === 0) {
    // Behavior yoksa direkt HTML'i döndür (yine de standart HTML yapısına kavuşmuş olur)
    return doc.documentElement.outerHTML
  }

  let styleRules = ''

  behaviors.forEach((el) => {
    const behavior = el.getAttribute('data-behavior')
    const slot = el.getAttribute('data-slot') || 'bottom-center'

    if (behavior === 'page-break-before') {
      ;(el as HTMLElement).style.breakBefore = 'page'
      return
    }
    if (behavior === 'page-break-after') {
      ;(el as HTMLElement).style.breakAfter = 'page'
      return
    }
    if (behavior === 'keep-together') {
      ;(el as HTMLElement).style.breakInside = 'avoid'
      return
    }

    // Deterministik class adı: data-behavior ve data-slot bazlı
    const slug = `b-${behavior}-${slot}`
    el.classList.add(slug)

    // Position: running kuralı (Sadece bir kez eklemek yeterli ama tekrarlansa da CSS'te sorun olmaz)
    styleRules += `.${slug} { position: running(${slug}); width: 100%; }\n`

    // Davranışa göre @page kuralları
    switch (behavior) {
      case 'every-page':
        styleRules += `@page { @${slot} { content: element(${slug}); } }\n`
        break
      case 'first-page-only':
        styleRules += `@page:first { @${slot} { content: element(${slug}); } }\n`
        break
      case 'last-page-only':
        styleRules += `@page:nth(last) { @${slot} { content: element(${slug}); } }\n`
        break
      case 'not-first-page':
        styleRules += `@page { @${slot} { content: element(${slug}); } }\n`
        styleRules += `@page:first { @${slot} { content: none; } }\n`
        break
      case 'not-last-page':
        styleRules += `@page { @${slot} { content: element(${slug}); } }\n`
        styleRules += `@page:nth(last) { @${slot} { content: none; } }\n`
        break
    }
  })

  if (styleRules) {
    const styleEl = doc.createElement('style')
    styleEl.textContent = styleRules
    doc.head.appendChild(styleEl)
  }

  return doc.documentElement.outerHTML
}
