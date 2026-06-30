import React, { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ChevronDown,
  ChevronLeft,
  ClipboardList,
  CreditCard,
  FileCheck,
  FolderTree,
  PackageSearch,
  Printer,
  Star,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useWorkspaceStore } from "../../store/workspaceStore";
import { useDosyalarHooks } from "../../screens/dosyalar/dosyalar.hooks";
import { subPagesMapping } from "../../constants/surecler";
import { APP_ROUTES } from "../../constants/routeConstants";

const parseStatusAndName = (
  name: string,
): { status: string | null; cleanName: string } => {
  let status: string | null = null;
  let cleanName = name;

  const nameMatch = name.match(/^\[(.*?)\]\s*(.*)$/);
  if (nameMatch) {
    status = nameMatch[1].trim();
    cleanName = nameMatch[2].trim();
  }

  return { status, cleanName };
};

const getStatusBadgeClass = (status: string): string => {
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

interface SubItem {
  name: string;
  path: string;
  icon: React.ElementType;
}

interface MenuItem {
  name: string;
  path?: string;
  icon: React.ElementType;
  children?: SubItem[];
  onClick?: () => void;
}

export function ActiveFileToolbar(): React.JSX.Element | null {
  const { activeDosyaId, setActiveDosyaId, activeStarredDocs } =
    useWorkspaceStore();
  const { dosyalar } = useDosyalarHooks();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const activeDosya = dosyalar.find((d) => d.id === activeDosyaId);

  // Fetch Alım Türü configs from DB
  const { data: dbAlimTurleri = [] } = useQuery<any[]>({
    queryKey: ["alim_turleri_list"],
    queryFn: async () => {
      const res = await window.electron.ipcRenderer.invoke(
        "db:query",
        "SELECT * FROM TANIM_AlimTuru WHERE aktif_mi = 1",
      );
      if (!res.success) return [];
      return res.data.map((d: any) => {
        let parsedBelgeler = [];
        try {
          parsedBelgeler = typeof d.belgeler === "string"
            ? JSON.parse(d.belgeler)
            : d.belgeler || [];
        } catch (e) {
          console.error(e);
        }
        return {
          id: d.id.toString(),
          ad: d.tur_adi,
          ikon: d.ikon,
          belgeler: parsedBelgeler,
          sablonId: d.sablon_id || "",
        };
      });
    },
  });

  const activeAlimTuru = activeDosya
    ? dbAlimTurleri.find((t) => {
      const fileTur = activeDosya.tur?.toLowerCase();
      const dbTur = t.ad?.toLowerCase() || "";
      if (fileTur === "mal" && dbTur.includes("mal")) return true;
      if (fileTur === "hizmet" && dbTur.includes("hizmet")) return true;
      if (
        fileTur === "yapim_isi" &&
        (dbTur.includes("yapım") || dbTur.includes("yapim"))
      ) {
        return true;
      }
      if (
        fileTur === "danismanlik" &&
        (dbTur.includes("danışmanlık") || dbTur.includes("danismanlik"))
      ) {
        return true;
      }
      return dbTur === fileTur;
    })
    : null;

  // Map sidebar item paths to required document keywords
  const documentPathMapping: Record<string, string[]> = {
    "/dosya/komisyon/fiyat-arastirma": ["Piyasa Fiyat Araştırması Tutanağı"],
    "/dosya/komisyon/muayene-kabul": [
      "Muayene Kabul ve Tespit Komisyonu Tutanağı",
      "Hizmet İşleri Kabul Tutanağı",
      "Yapım İşleri Kabul Tutanağı",
    ],
    "/dosya/komisyon/fiyat-muayene": [
      "Piyasa Fiyat Araştırması Tutanağı",
      "Muayene Kabul ve Tespit Komisyonu Tutanağı",
    ],
    "/dosya/komisyon/onay-eki": ["Onay Belgesi"],
    "/dosya/luzum/belge": ["Onay Belgesi"],
    "/dosya/luzum/onay-eki": ["Onay Belgesi"],
    "/dosya/luzum/teslim-tesellum": [
      "Muayene Kabul ve Tespit Komisyonu Tutanağı",
      "Hizmet İşleri Kabul Tutanağı",
      "Yapım İşleri Kabul Tutanağı",
    ],
    "/dosya/firmalar-maliyet/istekliler": ["Piyasa Fiyat Araştırması Tutanağı"],
    "/dosya/firmalar-maliyet/yaklasik": [
      "Yaklaşık Maliyet Hesap Cetveli",
      "Piyasa Fiyat Araştırması Tutanağı",
    ],
    "/dosya/firmalar-maliyet/tutanak": ["Piyasa Fiyat Araştırması Tutanağı"],
    "/dosya/onay/dt-onay": ["Onay Belgesi"],
    "/dosya/onay/ihale-onay": ["Onay Belgesi"],
    "/dosya/onay/butce-sorgu": ["Onay Belgesi"],
    "/dosya/harcama/talimat": ["Onay Belgesi", "Fatura / e-Arşiv Fatura"],
    "/dosya/harcama/pusula": ["Fatura / e-Arşiv Fatura"],
  };

  const { data: dbAsamalar = [] } = useQuery<any[]>({
    queryKey: ["sidebar_asamalar"],
    queryFn: async () => {
      const res = await window.electron.ipcRenderer.invoke(
        "db:query",
        "SELECT * FROM TANIM_Asama WHERE aktif_mi = 1 ORDER BY asama_sira ASC",
      );
      if (!res.success) return [];
      return res.data;
    },
  });

  const stagesToUse = dbAsamalar.length > 0 ? dbAsamalar : [
    { asama_sira: 1, asama_adi: "İhtiyaç Tespiti & Başlangıç" },
    { asama_sira: 2, asama_adi: "Piyasa Fiyat Araştırması" },
    { asama_sira: 3, asama_adi: "Sipariş & Sözleşme" },
    { asama_sira: 4, asama_adi: "Kabul & Ödeme İşlemleri" },
  ];

  const dynamicActiveItems: MenuItem[] = stagesToUse
    .map((asama) => {
      const stagePages = subPagesMapping.filter(
        (p) => p.stage === asama.asama_sira && !p.hideFromToolbar,
      );

      const filteredChildren = stagePages.filter((child) => {
        if (!activeAlimTuru) return true;
        const reqDocs = documentPathMapping[child.path];
        if (!reqDocs) return true;
        return reqDocs.some((docName) =>
          activeAlimTuru.belgeler.some((b: any) => {
            const documentName = typeof b === "string" ? b : b?.ad || "";
            return (
              documentName.toLowerCase().includes(docName.toLowerCase()) ||
              docName.toLowerCase().includes(documentName.toLowerCase())
            );
          })
        );
      });

      let IconComponent = FolderTree;
      if (asama.asama_sira === 1) IconComponent = FolderTree;
      else if (asama.asama_sira === 2) IconComponent = PackageSearch;
      else if (asama.asama_sira === 3) IconComponent = FileCheck;
      else if (asama.asama_sira === 4) IconComponent = CreditCard;

      return {
        name: `${asama.asama_sira}. ${asama.asama_adi}`,
        icon: IconComponent,
        children: filteredChildren,
      };
    })
    .filter((group) => group.children && group.children.length > 0);

  const searchParams = new URLSearchParams(window.location.search);
  const hashParams = new URLSearchParams(
    window.location.hash.split("?")[1] || "",
  );
  const isDosyaWindowMode = searchParams.get("mode") === "dosya_window" ||
    hashParams.get("mode") === "dosya_window";

  if (!activeDosyaId) return null;

  return (
    <div className="min-h-[3rem] py-1.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur shadow-sm border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center px-4 gap-2 shrink-0 z-40 relative">
      {!isDosyaWindowMode && (
        <button
          onClick={() => setActiveDosyaId(null)}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-700 rounded-md transition-colors mr-2"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Teminlere Dön
        </button>
      )}

      <div
        className="flex-1 flex items-center gap-2 flex-wrap"
        ref={dropdownRef}
      >
        {activeStarredDocs.length > 0 && (
          <div className="relative inline-block mr-2">
            <button
              onClick={() =>
                setOpenDropdown(
                  openDropdown === "hizli_erisim" ? null : "hizli_erisim",
                )}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                openDropdown === "hizli_erisim"
                  ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                  : "text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-900/20"
              }`}
            >
              <Star
                className={`w-3.5 h-3.5 ${
                  openDropdown === "hizli_erisim" ? "fill-current" : ""
                }`}
              />
              Hızlı Erişim
              <ChevronDown
                className={`w-3 h-3 transition-transform ${
                  openDropdown === "hizli_erisim" ? "rotate-180" : ""
                }`}
              />
            </button>

            {openDropdown === "hizli_erisim" && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-700/50 shadow-xl rounded-lg py-1 z-50">
                {activeStarredDocs.map((docName, idx) => {
                  const { status, cleanName } = parseStatusAndName(docName);
                  return (
                    <Link
                      key={idx}
                      to="/dosya/cikti-merkezi"
                      search={{ sablonAd: docName }}
                      onClick={() => setOpenDropdown(null)}
                      className="flex items-center justify-between px-3 py-2 text-xs text-slate-700 hover:bg-amber-50 hover:text-amber-700 dark:text-slate-300 dark:hover:bg-amber-900/30 dark:hover:text-amber-300"
                    >
                      <div className="flex items-center gap-2 truncate flex-1 min-w-0 pr-2">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
                        <span className="truncate">{cleanName}</span>
                      </div>
                      {status && (
                        <span
                          className={`px-1 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wide shrink-0 ${
                            getStatusBadgeClass(status)
                          }`}
                        >
                          {status}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}
        <div className="relative inline-block">
          <select
            title="Süreç Aşaması Git"
            onChange={(e) => {
              if (e.target.value) {
                window.location.hash = `#${e.target.value}`
              }
            }}
            value=""
            className="text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md px-3 py-1.5 text-slate-700 dark:text-slate-200 font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            <option value="">-- Süreç Aşamasına Git --</option>
            {stagesToUse.map((asama) => {
              let targetPath = "/dosyalar"

              if (asama.asama_sira === 1) {
                targetPath = APP_ROUTES.MALZEME_LISTESI
              } else if (asama.asama_sira === 2) {
                targetPath = APP_ROUTES.KOMISYON_FIYAT_ARASTIRMA
              } else if (asama.asama_sira === 3) {
                targetPath = APP_ROUTES.KOMISYON_ONAY_EKI
              } else if (asama.asama_sira === 4) {
                targetPath = APP_ROUTES.KOMISYON_MUAYENE_KABUL
              }

              return (
                <option key={asama.asama_sira} value={targetPath}>
                  {asama.asama_sira}. {asama.asama_adi}
                </option>
              )
            })}
            <option value="/dosya/cikti-merkezi">5. Klasör & Kapaklar (BETA)</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-700 pl-2">
        <Link
          to="/takip"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-900/50 rounded-md transition-colors"
        >
          <ClipboardList className="w-3.5 h-3.5" />
          Süreç & Durum
        </Link>
        <Link
          to="/cikti-merkezi"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300 dark:hover:bg-emerald-900/50 rounded-md transition-colors"
        >
          <Printer className="w-3.5 h-3.5" />
          Çıktı Merkezi
        </Link>
      </div>
    </div>
  );
}
