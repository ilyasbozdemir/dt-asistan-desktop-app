import React, { useState, useEffect } from 'react'
import { useAyarlarHooks } from './ayarlar.hooks'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { useSettingsStore } from '../../store/settingsStore'
import {
  Save,
  Mail,
  Upload,
  Download,
  Settings,
  Palette,
  Code
} from 'lucide-react'
import { InnerMenu, InnerMenuItem } from '../../components/ui/InnerMenu'
import TemaScreen from './TemaScreen'
import { useLocation } from '@tanstack/react-router'

type TabType = 'smtp' | 'tema' | 'developer'


export default function AyarlarScreen(): React.ReactNode {
  const { settings, isLoadingSettings, saveSettings, importSmtp, exportSmtp } = useAyarlarHooks()
  const { loadSettings: reloadSettingsStore } = useSettingsStore()

  const location = useLocation()
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    const params = new URLSearchParams(location.search)
    const tabParam = params.get('tab') as TabType
    if (tabParam === 'smtp' || tabParam === 'tema' || tabParam === 'developer') {
      return tabParam
    }
    return 'smtp'
  })

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const tabParam = params.get('tab') as TabType
    if (tabParam === 'smtp' || tabParam === 'tema' || tabParam === 'developer') {
      setActiveTab(tabParam)
    }
  }, [location.search])

  const [saving, setSaving] = useState(false)

  // Tab 5: SMTP Ayarları
  const [smtpHost, setSmtpHost] = useState('')
  const [smtpPort, setSmtpPort] = useState('')
  const [smtpUser, setSmtpUser] = useState('')
  const [smtpPass, setSmtpPass] = useState('')
  const [smtpSecure, setSmtpSecure] = useState(false)

  // Tab 6: Geliştirici Ayarları
  const [devUpdateTestMode, setDevUpdateTestMode] = useState(false)
  const [devUpdateVersion, setDevUpdateVersion] = useState('')
  const [githubReleases, setGithubReleases] = useState<string[]>([])

  useEffect(() => {
    if (settings) {
      setTimeout(() => {
        setSmtpHost(settings.smtp_host || '')
        setSmtpPort(settings.smtp_port || '')
        setSmtpUser(settings.smtp_user || '')
        setSmtpPass(settings.smtp_pass || '')
        setSmtpSecure(settings.smtp_secure === 'true')
        
        setDevUpdateTestMode(settings.devUpdateTestMode === 'true')
        setDevUpdateVersion(settings.devUpdateVersion || '')
      }, 0)
    }
  }, [settings])

  useEffect(() => {
    if (activeTab === 'developer') {
      fetch('https://api.github.com/repos/ilyasbozdemir/dt-desktop-app/releases')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            const versions = data.map((r: any) => r.tag_name.replace(/^v/, ''))
            setGithubReleases(versions)
          }
        })
        .catch(console.error)
    }
  }, [activeTab])

  const handleSaveTab = async (tab: TabType): Promise<void> => {
    if (tab !== 'smtp' && tab !== 'developer') return
    setSaving(true)
    try {
      const dataToSave: Record<string, string> = {}
      
      if (tab === 'smtp') {
        dataToSave.smtp_host = smtpHost
        dataToSave.smtp_port = smtpPort
        dataToSave.smtp_user = smtpUser
        dataToSave.smtp_pass = smtpPass
        dataToSave.smtp_secure = smtpSecure ? 'true' : 'false'
      } else if (tab === 'developer') {
        dataToSave.devUpdateTestMode = devUpdateTestMode ? 'true' : 'false'
        dataToSave.devUpdateVersion = devUpdateVersion
      }

      await saveSettings(dataToSave)
      await reloadSettingsStore()
      alert('Ayarlar başarıyla kaydedildi.')
    } catch {
      alert('Kaydetme hatası!')
    } finally {
      setSaving(false)
    }
  }

  const handleImportSmtp = async (): Promise<void> => {
    try {
      await importSmtp()
      alert('SMTP Ayarları başarıyla içe aktarıldı.')
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      if (errorMsg !== 'İptal edildi') {
        alert('İçe aktarma hatası: ' + errorMsg)
      }
    }
  }

  const handleExportSmtp = async (): Promise<void> => {
    try {
      await exportSmtp()
      alert('SMTP Ayarları başarıyla dışa aktarıldı.')
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      if (errorMsg !== 'İptal edildi') {
        alert('Dışa aktarma hatası: ' + errorMsg)
      }
    }
  }

  const menuItems: InnerMenuItem[] = [
    { id: 'smtp', label: 'SMTP Ayarları', icon: <Mail className="w-4 h-4 shrink-0" /> },
    { id: 'div1', label: '', icon: null, isDivider: true },
    { id: 'tema', label: 'Renk & Tema', icon: <Palette className="w-4 h-4 shrink-0" /> },
    { id: 'div2', label: '', icon: null, isDivider: true },
    { id: 'developer', label: 'Geliştirici & Test', icon: <Code className="w-4 h-4 shrink-0" /> }
  ]

  return (
    <div className="p-8 max-w-6xl mx-auto flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto max-h-full">
      <div className="flex justify-between items-end border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3 text-slate-850 dark:text-slate-100">
            <Settings className="w-8 h-8 text-blue-605" />
            Sistem Ayarları
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
            SMTP sunucu ve tema ayarlarını yönetin.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* SOL MENÜ (DİKEY SEKME LİSTESİ) */}
        <InnerMenu
          className="lg:col-span-3"
          items={menuItems}
          activeId={activeTab}
          onChange={(id) => setActiveTab(id as TabType)}
        />

        {/* SAĞ PANEL (İÇERİK ALANI) */}
        <div className="lg:col-span-9 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm min-h-[450px] flex flex-col justify-between">
          {isLoadingSettings ? (
            <div className="flex items-center justify-center flex-1 text-slate-500">
              Yükleniyor...
            </div>
          ) : activeTab === 'tema' ? (
            <TemaScreen isEmbedded={true} />
          ) : (
            <>
              <div className="space-y-6">
                {/* TAB 5: SMTP SUNUCU AYARLARI */}
                {activeTab === 'smtp' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                      <div>
                        <h2 className="text-lg font-bold text-slate-850 dark:text-slate-100">
                          SMTP Sunucu Ayarları
                        </h2>
                        <p className="text-xs text-slate-500">
                          Şifre sıfırlama kodlarının gönderileceği SMTP ayarları.
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={handleImportSmtp}
                          title="SMTP JSON İçe Aktar"
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 gap-1.5 text-xs py-1.5 px-3 rounded-lg"
                        >
                          <Upload className="w-3.5 h-3.5" /> İçe Aktar
                        </Button>
                        <Button
                          onClick={handleExportSmtp}
                          title="SMTP JSON Dışa Aktar"
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 gap-1.5 text-xs py-1.5 px-3 rounded-lg"
                        >
                          <Download className="w-3.5 h-3.5" /> Dışa Aktar
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          SMTP Host
                        </label>
                        <Input
                          placeholder="smtp.kurum.bel.tr"
                          value={smtpHost}
                          onChange={(e) => setSmtpHost(e.target.value)}
                          className="bg-slate-55 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          SMTP Port
                        </label>
                        <Input
                          placeholder="587"
                          value={smtpPort}
                          onChange={(e) => setSmtpPort(e.target.value)}
                          className="bg-slate-55 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                        />
                      </div>
                      <div className="md:col-span-3">
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          SMTP Kullanıcı Adı (User)
                        </label>
                        <Input
                          placeholder="noreply@kurum.bel.tr"
                          value={smtpUser}
                          onChange={(e) => setSmtpUser(e.target.value)}
                          className="bg-slate-55 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                        />
                      </div>
                      <div className="md:col-span-3">
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          SMTP Şifre (Password)
                        </label>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          value={smtpPass}
                          onChange={(e) => setSmtpPass(e.target.value)}
                          className="bg-slate-55 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                        />
                      </div>
                      <div className="md:col-span-3 flex items-center gap-2 pt-1">
                        <input
                          type="checkbox"
                          id="smtpSecure"
                          checked={smtpSecure}
                          onChange={(e) => setSmtpSecure(e.target.checked)}
                          className="rounded border-slate-300 dark:border-slate-700 bg-slate-55 dark:bg-slate-950 text-primary focus:ring-primary accent-primary"
                        />
                        <label
                          htmlFor="smtpSecure"
                          className="text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer"
                        >
                          SSL/TLS Bağlantısı (Güvenli)
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 6: GELİŞTİRİCİ AYARLARI */}
                {activeTab === 'developer' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                      <div>
                        <h2 className="text-lg font-bold text-slate-850 dark:text-slate-100">
                          Geliştirici ve Test Ayarları
                        </h2>
                        <p className="text-xs text-slate-500">
                          Geliştirme modunda otomatik güncellemeleri test etmek için kullanılır.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="md:col-span-2 flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="devUpdateTestMode"
                          checked={devUpdateTestMode}
                          onChange={(e) => setDevUpdateTestMode(e.target.checked)}
                          className="rounded border-slate-300 dark:border-slate-700 bg-slate-55 dark:bg-slate-950 text-primary focus:ring-primary accent-primary"
                        />
                        <label
                          htmlFor="devUpdateTestMode"
                          className="text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer"
                        >
                          Geliştirici Modunda (Dev Mode) Güncelleme Testini Etkinleştir
                        </label>
                      </div>

                      {devUpdateTestMode && (
                        <div className="md:col-span-1">
                          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                            Şu Anki Versiyonu Şöyle Göster (GitHub Releases)
                          </label>
                          <select
                            value={devUpdateVersion}
                            onChange={(e) => setDevUpdateVersion(e.target.value)}
                            className="w-full text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-55 dark:bg-slate-950 text-slate-800 dark:text-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                          >
                            <option value="">-- Versiyon Seçiniz --</option>
                            {githubReleases.map((v) => (
                              <option key={v} value={v}>
                                {v}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* SEKMEYİ KAYDET BUTONU */}
              <div className="flex justify-end border-t border-slate-100 dark:border-slate-800 pt-4 mt-6">
                <Button
                  onClick={() => handleSaveTab(activeTab)}
                  disabled={saving}
                  className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl py-2 px-5 text-sm font-semibold transition-all shadow-md shadow-primary/20"
                >
                  <Save className="w-4 h-4" /> Sekme Ayarlarını Kaydet
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
