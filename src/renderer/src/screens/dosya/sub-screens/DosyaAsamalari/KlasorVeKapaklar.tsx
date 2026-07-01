import React from "react";
import { FolderTree } from "lucide-react";
import { SubScreen } from "../../SubScreens.screen";
import { DocumentPreviewModal } from "../../components/DocumentPreviewModal";
import { useDosyaAsamasiSablons } from "./useDosyaAsamasiSablons";
import { KisayolBelgeleriPanel, SurecBelgeleriPanel } from "./SablonPanelleri";

export function KlasorVeKapaklar(): React.JSX.Element {
    const {
        activeStarredDocs,
        sablons,
        ciktiLoading,
        masterHtml,
        dosyaContext,
        placeholders,
        contextsByPath,
        personelListesi,
        previewModalOpen,
        setPreviewModalOpen,
        sablonsExpanded,
        setSablonsExpanded,
        previewData,
        handleOpenPreviewForSablon,
        executePrint,
        executeExportPdf,
        refreshSnapshot,
        saveSnapshot,
    } = useDosyaAsamasiSablons();

    if (previewData && previewModalOpen) {
        return (
            <DocumentPreviewModal
                isOpen={previewModalOpen}
                onClose={() => setPreviewModalOpen(false)}
                title={previewData.title}
                templateHtml={previewData.templateHtml}
                masterHtml={masterHtml || ""}
                baseContext={previewData.snapshotContext ||
                    contextsByPath[previewData.processPath] || dosyaContext}
                placeholders={placeholders}
                personelListesi={personelListesi}
                onPrint={executePrint}
                onExportPdf={executeExportPdf}
                isInline={true}
                templateTestVerisi={previewData.templateTestVerisi}
                onRefreshSnapshot={refreshSnapshot}
                onSaveSnapshot={saveSnapshot}
            />
        );
    }

    const stageSablons = sablons.filter(
        (s) =>
            s.kategori === "5-klasor-ve-kapaklar" ||
            s.kategori === "5. Klasör & Kapaklar",
    );

    return (
        <SubScreen
            title="Klasör & Kapaklar (BETA)"
            icon={FolderTree}
            description="Klasör ve kapak hazırlama süreçlerini yönetin."
        >
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm flex flex-col items-center justify-center text-center py-16">
                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-2xl flex items-center justify-center mb-4">
                    <FolderTree className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">
                    Klasör Sırtlıkları ve Kapaklar Çok Yakında!
                </h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-lg mb-6">
                    Bu bölüm şu anda yapım aşamasındadır (BETA). Klasör
                    sırtlıkları, ihale klasörü kapakları ve ayraçları için
                    şablon mekanizmaları yakında burada aktif olacaktır.
                </p>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-bold text-xs rounded-lg">
                    Sürüm: 1.0.0-beta.21
                </div>
            </div>
        </SubScreen>
    );
}
