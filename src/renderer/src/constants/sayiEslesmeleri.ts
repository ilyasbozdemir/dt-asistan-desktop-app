const birler = ['', 'bir', 'iki', 'üç', 'dört', 'beş', 'altı', 'yedi', 'sekiz', 'dokuz']
const onlar = ['', 'on', 'yirmi', 'otuz', 'kırk', 'elli', 'altmış', 'yetmiş', 'seksen', 'doksan']
const binler = ['', 'bin', 'milyon', 'milyar', 'trilyon', 'katrilyon']

export function sayiyiYaziyaCevir(n: number): string {
  if (n === 0) return 'sıfır'
  if (n < 0) return 'eksi ' + sayiyiYaziyaCevir(Math.abs(n))

  let text = ''
  let temp = Math.floor(n)
  let groupIndex = 0

  while (temp > 0) {
    const groupValue = temp % 1000
    if (groupValue > 0) {
      let groupText = ''

      const yuzler = Math.floor(groupValue / 100)
      const onlarBasamagi = Math.floor((groupValue % 100) / 10)
      const birlerBasamagi = groupValue % 10

      if (yuzler > 0) {
        if (yuzler === 1) {
          groupText += 'yüz'
        } else {
          groupText += birler[yuzler] + ' yüz'
        }
      }

      if (onlarBasamagi > 0) {
        if (groupText) groupText += ' '
        groupText += onlar[onlarBasamagi]
      }

      if (birlerBasamagi > 0) {
        if (groupText) groupText += ' '
        groupText += birler[birlerBasamagi]
      }

      if (groupIndex === 1 && groupValue === 1) {
        groupText = 'bin'
      } else if (groupIndex > 0) {
        groupText += ' ' + binler[groupIndex]
      }

      text = groupText + (text ? ' ' + text : '')
    }
    temp = Math.floor(temp / 1000)
    groupIndex++
  }

  return text.trim()
}

export function paraYaziyaCevir(val: string | number): string {
  if (val === undefined || val === null || val === '') return ''

  let numStr = ''
  if (typeof val === 'number') {
    numStr = val.toFixed(2)
  } else {
    const cleaned = val.replace(/\./g, '').replace(/,/g, '.')
    const num = parseFloat(cleaned)
    if (isNaN(num)) return ''
    numStr = num.toFixed(2)
  }

  const parts = numStr.split('.')
  const lira = parseInt(parts[0], 10)
  const kurus = parseInt(parts[1], 10)

  let result = ''
  if (lira > 0) {
    result += sayiyiYaziyaCevir(lira) + ' TL'
  } else {
    result += 'sıfır TL'
  }

  if (kurus > 0) {
    result += ' ' + sayiyiYaziyaCevir(kurus) + ' Kr.'
  }

  return result.toUpperCase()
}

export const SAYI_YAZI_MAP: Record<number | string, string> = {}

for (let i = 1; i <= 100; i++) {
  SAYI_YAZI_MAP[i] = `${i} (${sayiyiYaziyaCevir(i)})`
}
