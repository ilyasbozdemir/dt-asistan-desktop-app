import React, { useState, useEffect } from 'react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { useSettingsStore } from '../../store/settingsStore'
import { User, Shield, KeyRound, Eye, EyeOff, Save } from 'lucide-react'

export default function ProfilScreen(): React.JSX.Element {
  const { loadSettings: reloadSettingsStore } = useSettingsStore()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Profile States
  const [adminName, setAdminName] = useState('')
  const [adminTitle, setAdminTitle] = useState('')
  const [adminUsername, setAdminUsername] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [ekapUsername, setEkapUsername] = useState('')
  const [ekapPassword, setEkapPassword] = useState('')
  const [institutionLogo, setInstitutionLogo] = useState<string | null>(null)

  // Toggle Visibility States
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    async function loadData(): Promise<void> {
      try {
        const settings = await window.electron.ipcRenderer.invoke('db:get-settings')
        setAdminName(settings.adminName || 'Sistem Yöneticisi')
        setAdminTitle(settings.adminTitle || 'Destek Sorumlusu')
        setAdminUsername(settings.adminUsername || 'admin')
        setAdminPassword(settings.adminPassword || '')
        setEkapUsername(settings.ekapUsername || '')
        setEkapPassword(settings.ekapPassword || '')
        setInstitutionLogo(settings.institutionLogo || null)
      } catch (error) {
        console.error('Profil bilgileri yüklenemedi:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const handleSave = async (): Promise<void> => {
    setSaving(true)
    try {
      const dataToSave = {
        adminName,
        adminTitle,
        adminUsername,
        adminPassword,
        ekapUsername,
        ekapPassword
      }
      await window.electron.ipcRenderer.invoke('db:save-settings', dataToSave)
      await reloadSettingsStore()
      alert('Profil ve kullanıcı ayarları başarıyla kaydedildi.')
    } catch {
      alert('Ayarlar kaydedilirken hata oluştu!')
    } finally {
      setSaving(false)
    }
  }

  const getInitials = (name: string): string => {
    if (!name) return 'SY'
    return name
      .split(' ')
      .map((n) => n[0])
      .filter(Boolean)
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px] text-slate-500">
        Yükleniyor...
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl mx-auto flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto max-h-full">
      <div className="flex justify-between items-end border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3 text-slate-850 dark:text-slate-100">
            <User className="w-8 h-8 text-blue-605" />
            Kullanıcı Profili ve Güvenlik
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
            Giriş kimlik bilgilerinizi, sistem yöneticisi unvanını ve EKAP entegrasyon şifrelerini
            yönetin.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sol Kolon - Avatar Kartı */}
        <div className="md:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center justify-between min-h-[320px]">
          <div className="flex flex-col items-center w-full">
            <div className="w-24 h-24 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center text-slate-700 dark:text-slate-200 text-3xl font-bold shadow-md mb-4 overflow-hidden border-2 border-slate-200 dark:border-slate-700">
              {institutionLogo ? (
                <img
                  src={institutionLogo}
                  alt="Logo"
                  className="w-full h-full object-contain p-1"
                />
              ) : (
                getInitials(adminName)
              )}
            </div>
            <h2
              className="text-lg font-bold text-slate-850 dark:text-slate-100 truncate w-full px-2"
              title={adminName}
            >
              {adminName}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider font-semibold">
              {adminTitle || 'Destek Sorumlusu'}
            </p>
          </div>

          <div className="w-full bg-slate-50 dark:bg-slate-950/30 rounded-xl p-3 border border-slate-100 dark:border-slate-850/50 mt-6 text-left space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Kullanıcı Adı:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {adminUsername}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Yetki Seviyesi:</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Shield className="w-3 h-3" /> Kurum Admini
              </span>
            </div>
          </div>
        </div>

        {/* Sağ Kolon - Giriş Bilgileri Formu */}
        <div className="md:col-span-2 space-y-6">
          {/* Giriş Bilgileri Paneli */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-2">
              <KeyRound className="w-4 h-4 text-blue-605" /> Giriş Yetki Bilgileri
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Yönetici Adı Soyadı
                </label>
                <Input
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  placeholder="Örn: İlyas Bozdemir"
                  className="bg-slate-55 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Makam / Unvan
                </label>
                <Input
                  value={adminTitle}
                  onChange={(e) => setAdminTitle(e.target.value)}
                  placeholder="Örn: Muhasebe Müdürü"
                  className="bg-slate-55 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Giriş Kullanıcı Adı
                </label>
                <Input
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  placeholder="admin"
                  className="bg-slate-55 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Giriş Parolası
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="••••••••"
                    className="bg-slate-55 dark:bg-slate-950 border-slate-200 dark:border-slate-800 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* EKAP Bilgileri Paneli */}

          {/*
  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-2">
              <Lock className="w-4 h-4 text-blue-605" /> EKAP Entegrasyon Bilgileri
            </h3>
            <p className="text-[11px] text-slate-500 leading-normal mb-2">
              Doğrudan temin süreçlerinde otomatik sorgulamalar ve veri entegrasyonu için EKAP
              kimlik bilgilerinizi tanımlayabilirsiniz (Zorunlu değildir).
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  EKAP Kullanıcı Adı
                </label>
                <Input
                  value={ekapUsername}
                  onChange={(e) => setEkapUsername(e.target.value)}
                  placeholder="EKAP Kullanıcı Adı"
                  className="bg-slate-55 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  EKAP Parola
                </label>
                <div className="relative">
                  <Input
                    type={showEkapPassword ? 'text' : 'password'}
                    value={ekapPassword}
                    onChange={(e) => setEkapPassword(e.target.value)}
                    placeholder="••••••••"
                    className="bg-slate-55 dark:bg-slate-950 border-slate-200 dark:border-slate-800 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEkapPassword(!showEkapPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    {showEkapPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
  */}
        </div>
      </div>

      {/* Kaydet Butonu */}
      <div className="flex justify-end border-t border-slate-100 dark:border-slate-800 pt-4 mt-2">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2 px-5 text-sm font-semibold transition-all shadow-md shadow-blue-500/10"
        >
          <Save className="w-4 h-4" /> Değişiklikleri Kaydet
        </Button>
      </div>
    </div>
  )
}
