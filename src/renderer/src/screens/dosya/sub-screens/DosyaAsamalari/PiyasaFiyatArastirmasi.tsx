import React from "react";
import { PackageSearch } from "lucide-react";
import { SubScreen } from "../../SubScreens.screen";
import { DocumentPreviewModal } from "../../components/DocumentPreviewModal";
import { useDosyaAsamasiSablons } from "./useDosyaAsamasiSablons";
import { SurecBelgeleriPanel, KisayolBelgeleriPanel } from "./SablonPanelleri";

export function PiyasaFiyatArastirmasi(): React.JSX.Element {
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
            s.kategori === "2-piyasa-fiyat-arastirmasi" ||
            s.kategori === "2. Piyasa Fiyat Araştırması",
    );

    return (
        <SubScreen
            title="Teklifler & Piyasa Fiyat Araştırması"
            icon={PackageSearch}
            description="Teklifleri ve piyasa fiyat araştırması süreçlerini yönetin."
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
