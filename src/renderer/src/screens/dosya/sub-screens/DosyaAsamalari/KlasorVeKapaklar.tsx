import React from "react";
import { FolderTree } from "lucide-react";
import { SubScreen } from "../../SubScreens.screen";
import { DocumentPreviewModal } from "../../components/DocumentPreviewModal";
import { useDosyaAsamasiSablons } from "./useDosyaAsamasiSablons";
import { SurecBelgeleriPanel, KisayolBelgeleriPanel } from "./SablonPanelleri";

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
                baseContext={previewData.snapshotContext || contextsByPath[previewData.processPath] || dosyaContext}
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
            title="Klasör & Kapaklar"
            icon={FolderTree}
            description="Klasör ve kapak hazırlama süreçlerini yönetin."
        >
            <SurecBelgeleriPanel
                stageSablons={stageSablons}
                ciktiLoading={ciktiLoading}
                sablonsExpanded={sablonsExpanded}
                setSablonsExpanded={setSablonsExpanded}
                onSablonClick={handleOpenPreviewForSablon}
            />

            <KisayolBelgeleriPanel
                activeStarredDocs={activeStarredDocs}
                sablons={sablons}
                ciktiLoading={ciktiLoading}
                onSablonClick={handleOpenPreviewForSablon}
            />

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Bu süreç henüz tasarım aşamasındadır.
                </p>
            </div>
        </SubScreen>
    );
}
