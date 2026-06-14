import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export interface LimitDonemKaydi {
  id?: number
  donem_kodu: string
  baslangic_tarihi: string
  bitis_tarihi: string
  buyuksehir_limit: number
  diger_limit: number
  kaynak?: string
}

// Yeni eklenen dönemin mevcut dönemlerle tarih olarak çakışıp çakışmadığını kontrol eder
export function cakisanDonemBul(yeniDonem: LimitDonemKaydi, mevcutDonemler: LimitDonemKaydi[]): LimitDonemKaydi | null {
  const yeniBas = new Date(yeniDonem.baslangic_tarihi).getTime()
  const yeniBit = new Date(yeniDonem.bitis_tarihi).getTime()

  for (const mevcut of mevcutDonemler) {
    if (yeniDonem.id && mevcut.id === yeniDonem.id) continue // Kendi güncelleniyorsa atla
    const mevcutBas = new Date(mevcut.baslangic_tarihi).getTime()
    const mevcutBit = new Date(mevcut.bitis_tarihi).getTime()

    // Çakışma mantığı: Biri diğerinin içine giriyorsa
    if (yeniBas <= mevcutBit && yeniBit >= mevcutBas) {
      return mevcut
    }
  }
  return null
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useKikLimitDonemleri() {
  const queryClient = useQueryClient()

  // Dönem listesini çek
  const { data: donemler = [], isLoading } = useQuery<LimitDonemKaydi[]>({
    queryKey: ['kikLimitDonemleri'],
    queryFn: async (): Promise<LimitDonemKaydi[]> => {
      const res = await window.electron.ipcRenderer.invoke(
        'db:query',
        'SELECT * FROM TANIM_KikLimitDonemleri ORDER BY donem_kodu DESC'
      )
      if (!res.success) throw new Error(res.error)
      return res.data
    }
  })

  // Yeni dönem ekle
  const addMutation = useMutation({
    mutationFn: async (input: { donem_kodu: string; baslangic_tarihi: string; bitis_tarihi: string; buyuksehir_limit: number; diger_limit: number }): Promise<any> => {
      const donem: LimitDonemKaydi = {
        donem_kodu: input.donem_kodu,
        baslangic_tarihi: input.baslangic_tarihi,
        bitis_tarihi: input.bitis_tarihi,
        buyuksehir_limit: input.buyuksehir_limit,
        diger_limit: input.diger_limit
      }

      if (!donem.baslangic_tarihi || !donem.bitis_tarihi) {
        throw new Error('Başlangıç ve bitiş tarihi girilmelidir.')
      }

      if (donem.baslangic_tarihi > donem.bitis_tarihi) {
        throw new Error('Başlangıç tarihi bitiş tarihinden büyük olamaz.')
      }

      const cakisan = cakisanDonemBul(donem, donemler)
      if (cakisan) {
        throw new Error(
          `"${input.donem_kodu}" dönemi için girilen tarih aralığı (${donem.baslangic_tarihi} - ${donem.bitis_tarihi}), ` +
          `"${cakisan.donem_kodu}" dönemi (${cakisan.baslangic_tarihi} - ${cakisan.bitis_tarihi}) ile çakışıyor.`
        )
      }

      if (!donem.buyuksehir_limit || donem.buyuksehir_limit <= 0) {
        throw new Error("Büyükşehir limiti 0'dan büyük olmalıdır.")
      }
      if (!donem.diger_limit || donem.diger_limit <= 0) {
        throw new Error("Diğer İdareler limiti 0'dan büyük olmalıdır.")
      }

      const res = await window.electron.ipcRenderer.invoke(
        'db:run',
        `INSERT INTO TANIM_KikLimitDonemleri (donem_kodu, baslangic_tarihi, bitis_tarihi, buyuksehir_limit, diger_limit, kaynak) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [donem.donem_kodu, donem.baslangic_tarihi, donem.bitis_tarihi, donem.buyuksehir_limit, donem.diger_limit, 'Kullanıcı Ekledi']
      )
      if (!res.success) throw new Error(res.error)
      return res
    },
    onSuccess: (): void => { queryClient.invalidateQueries({ queryKey: ['kikLimitDonemleri'] }) }
  })

  // Sil
  const deleteMutation = useMutation({
    mutationFn: async (id: number): Promise<any> => {
      const res = await window.electron.ipcRenderer.invoke(
        'db:run',
        'DELETE FROM TANIM_KikLimitDonemleri WHERE id = ?',
        [id]
      )
      if (!res.success) throw new Error(res.error)
      return res
    },
    onSuccess: (): void => { queryClient.invalidateQueries({ queryKey: ['kikLimitDonemleri'] }) }
  })

  // Tarihe göre aktif dönemi getir (örn: "2026-06-15" string yyyy-MM-dd veya Date objesi)
  const getAktifDonem = (tarih?: string | Date): LimitDonemKaydi | null => {
    if (donemler.length === 0) return null
    
    let islemTarihi: Date
    if (!tarih) {
      islemTarihi = new Date()
    } else if (typeof tarih === 'string') {
      islemTarihi = new Date(tarih)
    } else {
      islemTarihi = tarih
    }

    const tTime = islemTarihi.getTime()
    for (const d of donemler) {
      const bas = new Date(d.baslangic_tarihi).getTime()
      const bit = new Date(d.bitis_tarihi).getTime()
      const bitKapsam = bit + 24 * 60 * 60 * 1000 - 1 // Gece 23:59:59.999

      if (tTime >= bas && tTime <= bitKapsam) {
        return d
      }
    }
    return null
  }

  // Kritik hata kontrolü: "Dönem Tanımsız Mı?"
  const donemTanimsizMi = (tarih?: string | Date): boolean => {
    return getAktifDonem(tarih) === null
  }

  // Erken Uyarı Kontrolü (22-31 Ocak arası)
  const yaklasanDonemUyarisiGosterilsinMi = (): boolean => {
    const today = new Date()
    const month = today.getMonth() + 1 // 1-12
    const day = today.getDate()

    if (month === 1 && day >= 22 && day <= 31) {
      // Belki yeni dönemi çoktan eklediler mi diye kontrol edelim?
      const nextYear = (today.getFullYear() + 1).toString()
      const hasNextPeriod = donemler.some((d) => d.donem_kodu === nextYear)
      if (!hasNextPeriod) {
        return true
      }
    }
    return false
  }

  return {
    donemler,
    isLoading,
    addMutation,
    deleteMutation,
    getAktifDonem,
    donemTanimsizMi,
    yaklasanDonemUyarisiGosterilsinMi
  }
}
