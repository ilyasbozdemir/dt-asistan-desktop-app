import React, { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useWorkspaceStore } from "../../../store/workspaceStore";
import { FileText, Package } from "lucide-react";
import { SubScreen } from "../SubScreens.screen";
import { useCiktiMerkeziData } from "../CiktiMerkezi.hooks";

import { useMalzemeListesi } from "./components/MalzemeListesi/useMalzemeListesi";
import { MalzemeEkleModal } from "./components/MalzemeListesi/MalzemeEkleModal";
import { MalzemeTablosu } from "./components/MalzemeListesi/MalzemeTablosu";
import { DocumentPreviewModal } from "../components/DocumentPreviewModal";

const normalizeForMatch = (str: string): string => {
  return str
    .toLocaleLowerCase("tr-TR")
    .toLowerCase()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]/g, "");
};

const BUTTON_COLORS = [
  "bg-violet-600 hover:bg-violet-700",
  "bg-emerald-600 hover:bg-emerald-700",
  "bg-indigo-600 hover:bg-indigo-700",
  "bg-sky-600 hover:bg-sky-700",
  "bg-slate-600 hover:bg-slate-700",
  "bg-blue-600 hover:bg-blue-700",
  "bg-pink-600 hover:bg-pink-700",
  "bg-teal-600 hover:bg-teal-700",
];

export function MalzemeListesi(): React.JSX.Element {
  const { activeDosyaId, activeStarredDocs } = useWorkspaceStore();
  const {
    sablons,
    loading: ciktiLoading,
    masterHtml,
    dosyaContext,
    placeholders,
    contextsByPath,
    personelListesi,
  } = useCiktiMerkeziData(activeDosyaId);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewData, setPreviewData] = useState<
    {
      title: string;
      templateHtml: string;
      processPath: string;
      templateTestVerisi?: string;
    } | null
  >(null);

  const state = useMalzemeListesi(activeDosyaId);

  const handleOpenPreviewForSablon = (sablon: any, title: string): void => {
    if (!masterHtml) {
      alert("Master şablon yüklenemedi, veriler bekleniyor.");
      return;
    }
    setPreviewData({
      title,
      templateHtml: sablon.icerik,
      processPath: sablon.route_path || "",
      templateTestVerisi: sablon.test_verisi || "",
    });
    setPreviewModalOpen(true);
  };

  const executePrint = async (html: string) => {
    await (window as any).electron.ipcRenderer.invoke("print-html", html, {
      silent: false,
    });
  };

  const executeExportPdf = async (html: string) => {
    await (window as any).electron.ipcRenderer.invoke(
      "export-pdf",
      html,
      null,
      previewData?.title || "Belge",
    );
  };

  if (previewData && previewModalOpen) {
    return (
      <DocumentPreviewModal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        title={previewData.title}
        templateHtml={previewData.templateHtml}
        masterHtml={masterHtml || ""}
        baseContext={contextsByPath[previewData.processPath] || dosyaContext}
        placeholders={placeholders}
        personelListesi={personelListesi}
        onPrint={executePrint}
        onExportPdf={executeExportPdf}
        isInline={true}
        templateTestVerisi={previewData.templateTestVerisi}
      />
    );
  }

  return (
    <SubScreen
      title="İhtiyaç Listesi"
      icon={Package}
      description="Dosya kapsamındaki malzeme, hizmet veya yapım işi ihtiyaçlarını listeleyin ve yönetin."
    >
      {activeStarredDocs && (
        <div className="flex flex-col mb-6 print:hidden animate-in fade-in duration-300 bg-slate-50/50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center justify-between w-full pb-2 mb-3 border-b border-slate-100 dark:border-slate-800/80">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Kısayol Belgeleri (Hızlı Erişim)
            </span>
            <Link
              to="/taslakyonetim"
              className="text-[10px] font-black text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1 transition-colors underline decoration-dotted"
            >
              Şablon Listesi ve Süreçler ↗
            </Link>
          </div>
          {activeStarredDocs.length === 0
            ? (
              <div className="text-xs text-slate-400 dark:text-slate-500 italic py-1">
                Henüz hızlı erişim belgesi seçilmemiş. Şablon Listesi ve
                Süreçler panelinden istediğiniz belgeleri yıldızlayarak buraya
                ekleyebilirsiniz.
              </div>
            )
            : (
              <div className="flex items-center gap-2 flex-wrap">
                {activeStarredDocs.map((docName, idx) => {
                  const sablon = sablons.find(
                    (s) =>
                      normalizeForMatch(s.ad) === normalizeForMatch(docName),
                  );
                  if (!sablon) return null;

                  let status: string | null = null;
                  let cleanName = docName;
                  const match = docName.match(/^\[(.*?)\]\s*(.*)$/);
                  if (match) {
                    status = match[1].trim();
                    cleanName = match[2].trim();
                  }

                  return (
                    <button
                      key={docName}
                      onClick={() =>
                        handleOpenPreviewForSablon(sablon, docName)}
                      disabled={ciktiLoading}
                      className={`px-4 py-2 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50 ${
                        BUTTON_COLORS[idx % BUTTON_COLORS.length]
                      }`}
                    >
                      <FileText className="w-4 h-4 shrink-0" />
                      <span>{cleanName}</span>
                      {status && (
                        <span className="px-1.5 py-0.5 bg-black/25 text-white rounded text-[9px] font-black uppercase tracking-wide shrink-0">
                          {status}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
        </div>
      )}

      <MalzemeEkleModal state={state} />
      <MalzemeTablosu state={state} />
    </SubScreen>
  );
}
