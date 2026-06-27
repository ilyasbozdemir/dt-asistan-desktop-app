import React, { useState } from "react";
import { useWorkspaceStore } from "../../../store/workspaceStore";
import { AlertCircle, Package, Printer } from "lucide-react";
import { SubScreen } from "../SubScreens.screen";
import { useCiktiMerkeziData } from "../CiktiMerkezi.hooks";
import Mustache from "mustache";

import { useMalzemeListesi } from "./components/MalzemeListesi/useMalzemeListesi";
import { MalzemeEkleModal } from "./components/MalzemeListesi/MalzemeEkleModal";
import { MalzemeTablosu } from "./components/MalzemeListesi/MalzemeTablosu";

export function MalzemeListesi(): React.JSX.Element {
  const { activeDosyaId } = useWorkspaceStore();
  const {
    sablons,
    loading: ciktiLoading,
    masterHtml,
    dosyaContext,
  } = useCiktiMerkeziData(activeDosyaId);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const state = useMalzemeListesi(activeDosyaId);

  const handlePrintTemplate = async () => {
    try {
      setIsPrinting(true);
      const settingsRes = await (window as any).electron.ipcRenderer.invoke(
        "db:get-settings",
      );
      const processPath = "/dosya/malzemeler/liste";
      const sablonIdStr = settingsRes
        ? settingsRes[`MAPPING_${processPath}_SABLON_ID`]
        : null;

      if (!sablonIdStr) {
        alert(
          "Lütfen Şablon & Kategori Yönetimi bölümünden bu süreç için bir şablon bağlayınız.",
        );
        return;
      }

      const selectedSablon = sablons.find((s) =>
        s.id.toString() === sablonIdStr
      );
      if (!selectedSablon) {
        alert(
          "Bağlı şablon bulunamadı veya silinmiş. Lütfen Şablon & Kategori Yönetimi bölümünden kontrol ediniz.",
        );
        return;
      }

      if (!masterHtml) {
        alert("Master şablon yüklenemedi, veriler bekleniyor.");
        return;
      }

      // Context ile override verilerini birleştir
      let finalContext = { ...dosyaContext };
      if (settingsRes[`MAPPING_${processPath}_JSON_OVERRIDE`]) {
        try {
          const overrideData = JSON.parse(
            settingsRes[`MAPPING_${processPath}_JSON_OVERRIDE`],
          );
          finalContext = { ...finalContext, ...overrideData };
        } catch (e) {
          console.error("JSON Override parse hatası:", e);
        }
      }

      // İhtiyaç listesi şablonunu context ile işle
      const renderedContent = Mustache.render(
        selectedSablon.icerik,
        finalContext,
      );
      // İşlenmiş şablonu master HTML içerisine göm
      finalContext.icerik = renderedContent;
      const finalHtml = Mustache.render(masterHtml, finalContext);

      await (window as any).electron.ipcRenderer.invoke(
        "print-html",
        finalHtml,
        { silent: false },
      );
    } catch (error: any) {
      alert("Yazdırma sırasında bir hata oluştu: " + error.message);
    } finally {
      setIsPrinting(false);
    }
  };

  const handleExportPdf = async (): Promise<void> => {
    try {
      setIsExportingPdf(true);
      const settingsRes = await (window as any).electron.ipcRenderer.invoke(
        "db:get-settings",
      );
      const processPath = "/dosya/malzemeler/liste";
      const sablonIdStr = settingsRes
        ? settingsRes[`MAPPING_${processPath}_SABLON_ID`]
        : null;

      if (!sablonIdStr) {
        alert(
          "Lütfen Şablon & Kategori Yönetimi bölümünden bu süreç için bir şablon bağlayınız.",
        );
        return;
      }

      const selectedSablon = sablons.find((s) =>
        s.id.toString() === sablonIdStr
      );
      if (!selectedSablon) {
        alert(
          "Bağlı şablon bulunamadı veya silinmiş. Lütfen Şablon & Kategori Yönetimi bölümünden kontrol ediniz.",
        );
        return;
      }

      if (!masterHtml) {
        alert("Master şablon yüklenemedi, veriler bekleniyor.");
        return;
      }

      let finalContext = { ...dosyaContext };
      if (settingsRes[`MAPPING_${processPath}_JSON_OVERRIDE`]) {
        try {
          const overrideData = JSON.parse(
            settingsRes[`MAPPING_${processPath}_JSON_OVERRIDE`],
          );
          finalContext = { ...finalContext, ...overrideData };
        } catch (e) {
          console.error("JSON Override parse hatası:", e);
        }
      }

      const renderedContent = Mustache.render(
        selectedSablon.icerik,
        finalContext,
      );
      finalContext.icerik = renderedContent;
      const finalHtml = Mustache.render(masterHtml, finalContext);

      await (window as any).electron.ipcRenderer.invoke(
        "export-pdf",
        finalHtml,
        null,
        `İhtiyaç Listesi`,
      );
      alert("PDF başarıyla kaydedildi.");
    } catch (error: any) {
      alert("PDF kaydetme sırasında bir hata oluştu: " + error.message);
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <SubScreen
      title="İhtiyaç Listesi"
      icon={Package}
      description="Dosya kapsamındaki malzeme, hizmet veya yapım işi ihtiyaçlarını listeleyin ve yönetin."
    >
      <div className="flex justify-end mb-4 print:hidden">
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportPdf}
            disabled={isExportingPdf || ciktiLoading}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
          >
            {isExportingPdf
              ? <AlertCircle className="w-4 h-4 animate-spin" />
              : <Printer className="w-4 h-4" />}
            PDF
          </button>
          <button
            onClick={handlePrintTemplate}
            disabled={isPrinting || ciktiLoading}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
          >
            {isPrinting
              ? <AlertCircle className="w-4 h-4 animate-spin" />
              : <Printer className="w-4 h-4" />}
            Yazdır
          </button>
        </div>
      </div>

      <MalzemeEkleModal state={state} />
      <MalzemeTablosu state={state} />
    </SubScreen>
  );
}
