import React, { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ChevronDown,
  ChevronRight,
  ChevronUp,
  FolderOpen,
  Plus,
  Star,
  Trash2,
  FileText,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useWorkspaceStore } from "../../store/workspaceStore";
import { useSablonlar } from "../sablonlar/sablonlar.hooks";
import { subPagesMapping } from "../../constants/surecler";

// DB'den gelen route_path'e fallback: şablon adı bilinmiyorsa çıktı merkezine git
const FALLBACK_ROUTE = "/dosya/cikti-merkezi";

const parseStatusAndName = (
  name: string,
  description?: string | null,
): { status: string | null; cleanName: string } => {
  let status: string | null = null;
  let cleanName = name;

  const nameMatch = name.match(/^\[(.*?)\]\s*(.*)$/);
  if (nameMatch) {
    status = nameMatch[1].trim();
    cleanName = nameMatch[2].trim();
  } else if (description) {
    const descMatch = description.match(/^\[(.*?)\]/);
    if (descMatch) {
      status = descMatch[1].trim();
    }
  }

  return { status, cleanName };
};

const getStatusBadgeLightClass = (status: string): string => {
  const lower = status.toLowerCase();
  if (
    lower.includes("bakım") ||
    lower.includes("güncel") ||
    lower.includes("geliş") ||
    lower.includes("maint")
  ) {
    return "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-500/20";
  }
  if (
    lower.includes("aktif") ||
    lower.includes("hazır") ||
    lower.includes("tamam") ||
    lower.includes("ready") ||
    lower.includes("active")
  ) {
    return "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border border-green-500/20";
  }
  if (
    lower.includes("pasif") ||
    lower.includes("iptal") ||
    lower.includes("eski") ||
    lower.includes("disable") ||
    lower.includes("deprec")
  ) {
    return "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border border-red-500/20";
  }
  return "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-500/20";
};

export default function TaslakYoneticisi(): React.JSX.Element {
  const { data: sablonlar = [] } = useSablonlar();

  // Şablon adı → route_path eşleşmesi (tümü DB ve süreç tanımları)
  const routeMap = useMemo(() => {
    const map: Record<string, string> = {};

    // Statik süreç sayfaları
    subPagesMapping.forEach((p) => {
      map[p.name] = p.path;
    });

    // Dinamik şablonlar
    sablonlar.forEach((s) => {
      if (s.route_path) map[s.ad] = s.route_path;
    });
    return map;
  }, [sablonlar]);

  // Süreç Taslaklarını bulalım (TANIM_SurecTaslak)
  const { data: taslaklar = [], isLoading: taslaklarLoading } = useQuery({
    queryKey: ["surec_taslaklar"],
    queryFn: async () => {
      const res = await window.electron.ipcRenderer.invoke(
        "db:query",
        "SELECT * FROM TANIM_SurecTaslak WHERE aktif_mi = 1",
      );
      if (!res.success) return [];
      return res.data;
    },
  });

  // Şablonları kategorilerine göre grupla
  const groupedSablonlar = useMemo(() => {
    const groups: Record<string, typeof sablonlar> = {
      "1. İhtiyaç Tespiti & Başlangıç": [],
      "2. Piyasa Fiyat Araştırması": [],
      "3. Sipariş & Sözleşme": [],
      "4. Kabul & Ödeme İşlemleri": [],
      "5. Klasör & Kapaklar": [],
    };

    sablonlar.forEach((s) => {
      const cat = (s.kategori || "").toLowerCase();
      if (
        cat.includes("1") ||
        cat.includes("ihtiyac") ||
        cat.includes("başlangıç") ||
        cat.includes("baslangic")
      ) {
        groups["1. İhtiyaç Tespiti & Başlangıç"].push(s);
      } else if (
        cat.includes("2") ||
        cat.includes("fiyat") ||
        cat.includes("araştırma") ||
        cat.includes("arastirma") ||
        cat.includes("maliyet") ||
        cat.includes("piyasa")
      ) {
        groups["2. Piyasa Fiyat Araştırması"].push(s);
      } else if (
        cat.includes("3") ||
        cat.includes("sipariş") ||
        cat.includes("siparis") ||
        cat.includes("sözleşme") ||
        cat.includes("sozlesme") ||
        cat.includes("ihale") ||
        cat.includes("onay")
      ) {
        groups["3. Sipariş & Sözleşme"].push(s);
      } else if (
        cat.includes("4") ||
        cat.includes("kabul") ||
        cat.includes("ödeme") ||
        cat.includes("odeme") ||
        cat.includes("teslim")
      ) {
        groups["4. Kabul & Ödeme İşlemleri"].push(s);
      } else if (
        cat.includes("5") ||
        cat.includes("klasör") ||
        cat.includes("klasor") ||
        cat.includes("kapak")
      ) {
        groups["5. Klasör & Kapaklar"].push(s);
      } else {
        groups["1. İhtiyaç Tespiti & Başlangıç"].push(s);
      }
    });

    return groups;
  }, [sablonlar]);

  return (
    <div className="p-8 max-w-6xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-3">
            <Star className="w-8 h-8 text-amber-500 fill-amber-500" />
            Kısayol & Taslak Yönetimi
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm max-w-2xl">
            Sistemde tanımlı tüm doğrudan temin belgelerini ve süreç adımlarını kategori bazlı olarak buradan inceleyebilirsiniz.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sol Taraf: Kayıtlı Süreç Taslakları (TANIM_SurecTaslak) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-blue-500" />
              Sistem Süreç Taslakları
            </h3>

            {taslaklarLoading ? (
              <div className="text-center py-4 text-slate-500 text-xs">Yükleniyor...</div>
            ) : taslaklar.length === 0 ? (
              <div className="text-center py-4 text-slate-400 italic text-xs">Kayıtlı taslak bulunmuyor.</div>
            ) : (
              <div className="space-y-3">
                {taslaklar.map((taslak: any) => {
                  let orderedList: string[] = [];
                  try {
                    orderedList = JSON.parse(taslak.ordered_docs || "[]");
                  } catch {}

                  return (
                    <div
                      key={taslak.id}
                      className="border border-slate-100 dark:border-slate-800/80 p-3 rounded-xl bg-slate-50/50 dark:bg-slate-950/20"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                          {taslak.taslak_adi}
                        </span>
                        <span className="text-[9px] bg-slate-200 dark:bg-slate-850 px-1.5 py-0.5 rounded font-semibold text-slate-600 dark:text-slate-400">
                          {taslak.tur || "Genel"}
                        </span>
                      </div>
                      {orderedList.length > 0 && (
                        <div className="space-y-1 mt-2">
                          <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-bold">Aşama Belgeleri:</span>
                          <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto custom-scrollbar p-1">
                            {orderedList.map((doc: string, idx: number) => (
                              <span
                                key={idx}
                                className="text-[9px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded flex items-center gap-1"
                              >
                                <FileText className="w-2 h-2 text-slate-400" />
                                {doc}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Sağ Taraf: Tüm Süreç Belgeleri Listesi */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-base text-slate-800 dark:text-slate-200 mb-2">
              Süreç Adımları & Belgeler Listesi
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Aşağıda doğrudan temin sürecinde üretilen tüm resmi evraklar ve şablonlar aşama bazlı listelenmiştir. İlgili belgeye tıklayarak doğrudan o aşamanın ekranına veya Çıktı Merkezi&apos;ne gidebilirsiniz.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(groupedSablonlar).map(([stageName, list]) => (
                <div
                  key={stageName}
                  className="border border-slate-150 dark:border-slate-800/80 rounded-2xl p-4 bg-slate-50/50 dark:bg-slate-805/20 flex flex-col"
                >
                  <h4 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3 pb-2 border-b border-slate-200/50 dark:border-slate-800">
                    {stageName}
                  </h4>
                  <div className="space-y-1.5 flex-1">
                    {list.map((sablon) => {
                      const route = routeMap[sablon.ad] || FALLBACK_ROUTE;
                      const { status, cleanName } = parseStatusAndName(
                        sablon.ad,
                        sablon.aciklama,
                      );
                      return (
                        <Link
                          key={sablon.id}
                          to={route}
                          className="w-full flex items-center justify-between p-2 rounded-xl text-left text-xs font-bold transition-all border bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-850 cursor-pointer"
                        >
                          <div className="flex items-center gap-2 truncate flex-1 min-w-0 pr-2">
                            <span className="truncate">{cleanName}</span>
                            {status && (
                              <span
                                className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wide shrink-0 ${
                                  getStatusBadgeLightClass(status)
                                }`}
                              >
                                {status}
                              </span>
                            )}
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        </Link>
                      );
                    })}
                    {list.length === 0 && (
                      <span className="text-xs italic text-slate-400 block py-1">
                        Bu aşamada bağlı şablon bulunamadı.
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
