import React from "react";
import { Package } from "lucide-react";
import { SubScreen } from "../../SubScreens.screen";
import { DocumentPreviewModal } from "../../components/DocumentPreviewModal";
import { useDosyaAsamasiSablons } from "./useDosyaAsamasiSablons";
import { SurecBelgeleriPanel, KisayolBelgeleriPanel } from "./SablonPanelleri";
import { useMalzemeListesi } from "../components/MalzemeListesi/useMalzemeListesi";
import { MalzemeEkleModal } from "../components/MalzemeListesi/MalzemeEkleModal";
import { MalzemeTablosu } from "../components/MalzemeListesi/MalzemeTablosu";

export function HazirlikVeIhtiyac(): React.JSX.Element {
    const {
        activeDosyaId,
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
        isSablonDisabled,
    } = useDosyaAsamasiSablons();

    const state = useMalzemeListesi(activeDosyaId);

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
            s.kategori === "1-ihtiyac-tespiti-ve-baslangic" ||
            s.kategori === "1. İhtiyaç Tespiti & Başlangıç",
    );

    return (
        <SubScreen
            title="Hazırlık ve İhtiyaç"
            icon={Package}
            description="Dosya kapsamındaki malzeme, hizmet veya yapım işi ihtiyaçlarını listeleyin ve yönetin."
        >
            <SurecBelgeleriPanel
                stageSablons={stageSablons}
                ciktiLoading={ciktiLoading}
                sablonsExpanded={sablonsExpanded}
                setSablonsExpanded={setSablonsExpanded}
                onSablonClick={handleOpenPreviewForSablon}
                isSablonDisabled={isSablonDisabled}
            />

            <KisayolBelgeleriPanel
                activeStarredDocs={activeStarredDocs}
                sablons={sablons}
                ciktiLoading={ciktiLoading}
                onSablonClick={handleOpenPreviewForSablon}
                isSablonDisabled={isSablonDisabled}
            />

            <MalzemeEkleModal state={state} />
            <MalzemeTablosu state={state} />
        </SubScreen>
    );
}
