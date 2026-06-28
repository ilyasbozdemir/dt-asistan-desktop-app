export class TurkishNLP {
  private static vowels = 'aıoueiöüAIOUEİÖÜ'
  private static hardConsonants = 'fstkçşhpFSTKÇŞHP'
  private static softConsonantsMap: Record<string, string> = {
    p: 'b',
    ç: 'c',
    t: 'd',
    k: 'ğ',
    P: 'B',
    Ç: 'C',
    T: 'D',
    K: 'Ğ'
  }

  public static getLastVowel(word: string): string {
    for (let i = word.length - 1; i >= 0; i--) {
      if (this.vowels.includes(word[i])) {
        return word[i].toLowerCase()
      }
    }
    return 'a' // varsayılan
  }

  public static endsWithVowel(word: string): boolean {
    if (word.length === 0) return false
    return this.vowels.includes(word[word.length - 1])
  }

  public static endsWithHardConsonant(word: string): boolean {
    if (word.length === 0) return false
    return this.hardConsonants.includes(word[word.length - 1])
  }

  public static getITypeVowel(vowel: string): string {
    if (['a', 'ı'].includes(vowel)) return 'ı'
    if (['e', 'i'].includes(vowel)) return 'i'
    if (['o', 'u'].includes(vowel)) return 'u'
    if (['ö', 'ü'].includes(vowel)) return 'ü'
    return 'i'
  }

  public static getATypeVowel(vowel: string): string {
    if (['a', 'ı', 'o', 'u'].includes(vowel)) return 'a'
    return 'e'
  }

  public static addGenitive(word: string, isProperNoun: boolean = false): string {
    if (!word) return ''
    const lastVowel = this.getLastVowel(word)
    const iType = this.getITypeVowel(lastVowel)
    const suffix = this.endsWithVowel(word) ? `n${iType}n` : `${iType}n`
    return isProperNoun ? `${word}'${suffix}` : `${word}${suffix}`
  }

  public static addDative(word: string, isProperNoun: boolean = false): string {
    if (!word) return ''
    const lastVowel = this.getLastVowel(word)
    const aType = this.getATypeVowel(lastVowel)
    let mutatedWord = word

    // Ünsüz yumuşaması (Özel isim değilse)
    if (!isProperNoun && !this.endsWithVowel(word)) {
      const lastChar = word[word.length - 1]
      if (this.softConsonantsMap[lastChar]) {
        mutatedWord = word.slice(0, -1) + this.softConsonantsMap[lastChar]
      }
    }

    const suffix = this.endsWithVowel(word) ? `y${aType}` : `${aType}`
    return isProperNoun ? `${word}'${suffix}` : `${mutatedWord}${suffix}`
  }

  public static addAccusative(word: string, isProperNoun: boolean = false): string {
    if (!word) return ''
    const lastVowel = this.getLastVowel(word)
    const iType = this.getITypeVowel(lastVowel)
    let mutatedWord = word

    if (!isProperNoun && !this.endsWithVowel(word)) {
      const lastChar = word[word.length - 1]
      if (this.softConsonantsMap[lastChar]) {
        mutatedWord = word.slice(0, -1) + this.softConsonantsMap[lastChar]
      }
    }

    const suffix = this.endsWithVowel(word) ? `y${iType}` : `${iType}`
    return isProperNoun ? `${word}'${suffix}` : `${mutatedWord}${suffix}`
  }

  public static addLocative(word: string, isProperNoun: boolean = false): string {
    if (!word) return ''
    const lastVowel = this.getLastVowel(word)
    const aType = this.getATypeVowel(lastVowel)
    const dChar = this.endsWithHardConsonant(word) ? 't' : 'd'
    const suffix = `${dChar}${aType}`
    return isProperNoun ? `${word}'${suffix}` : `${word}${suffix}`
  }

  public static addAblative(word: string, isProperNoun: boolean = false): string {
    if (!word) return ''
    const locative = this.addLocative(word, isProperNoun)
    return `${locative}n`
  }

  public static addPossessive1P(word: string, isProperNoun: boolean = false): string {
    if (!word) return ''
    const lastVowel = this.getLastVowel(word)
    const iType = this.getITypeVowel(lastVowel)
    let mutatedWord = word

    if (!isProperNoun && !this.endsWithVowel(word)) {
      const lastChar = word[word.length - 1]
      if (this.softConsonantsMap[lastChar]) {
        mutatedWord = word.slice(0, -1) + this.softConsonantsMap[lastChar]
      }
    }

    const suffix = this.endsWithVowel(word) ? `m${iType}z` : `${iType}m${iType}z`
    return isProperNoun ? `${word}'${suffix}` : `${mutatedWord}${suffix}`
  }

  public static addPossessive3S(word: string, isProperNoun: boolean = false): string {
    if (!word) return ''
    const lastVowel = this.getLastVowel(word)
    const iType = this.getITypeVowel(lastVowel)
    let mutatedWord = word

    if (!isProperNoun && !this.endsWithVowel(word)) {
      const lastChar = word[word.length - 1]
      if (this.softConsonantsMap[lastChar]) {
        mutatedWord = word.slice(0, -1) + this.softConsonantsMap[lastChar]
      }
    }

    const suffix = this.endsWithVowel(word) ? `s${iType}` : `${iType}`
    return isProperNoun ? `${word}'${suffix}` : `${mutatedWord}${suffix}`
  }
}
