import { useState, useEffect } from "react";
import { useRouter, useSearch } from "@tanstack/react-router";
import { useWorkspaceStore } from "../../../../store/workspaceStore";
import { useCiktiMerkeziData } from "../../CiktiMerkezi.hooks";
import { useDocumentLogger } from "../../../../hooks/useDocumentLogger";

// -----------------------------------------------------------------------
// Sabitler – tüm dosya aşaması ekranları tarafından paylaşılır
// -----------------------------------------------------------------------

export const BUTTON_COLORS = [
    "bg-violet-600 hover:bg-violet-700",
    "bg-emerald-600 hover:bg-emerald-700",
    "bg-indigo-600 hover:bg-indigo-700",
    "bg-sky-600 hover:bg-sky-700",
    "bg-slate-600 hover:bg-slate-700",
    "bg-blue-600 hover:bg-blue-700",
    "bg-pink-600 hover:bg-pink-700",
    "bg-teal-600 hover:bg-teal-700",
];

export const CATEGORY_LABELS: Record<string, string> = {
    "1-ihtiyac-tespiti-ve-baslangic": "Hazırlık & İhtiyaç",
    "2-piyasa-fiyat-arastirmasi": "Teklifler & Piyasa",
    "3-siparis-ve-sozlesme": "Sipariş & Sözleşme",
    "4-kabul-ve-odeme-islemleri": "Kabul & Ödeme",
    "5-klasor-ve-kapaklar": "Klasör & Kapak",
};

export const normalizeForMatch = (str: string): string =>
    str
        .toLocaleLowerCase("tr-TR")
        .toLowerCase()
        .replace(/ğ/g, "g")
        .replace(/ü/g, "u")
        .replace(/ş/g, "s")
        .replace(/ı/g, "i")
        .replace(/ö/g, "o")
        .replace(/ç/g, "c")
        .replace(/[^a-z0-9]/g, "");

// -----------------------------------------------------------------------
// Hook – şablon önizleme mantığı
// -----------------------------------------------------------------------

export interface PreviewData {
    title: string;
    templateHtml: string;
    processPath: string;
    templateTestVerisi?: string;
    sablonId?: number;
    snapshotContext?: any;
}

export const checkIsSablonDisabled = (cleanName: string, dosyaContext: any): boolean => {
    if (!dosyaContext) return false;

    if (
        cleanName.toLowerCase().includes("i̇htiyaç listesi") ||
        cleanName.toLowerCase().includes("lüzum müzekkeresi")
    ) {
        if (!dosyaContext.malzemeler || dosyaContext.malzemeler.length === 0) {
            return true;
        }
    }

    // İleride buraya diğer şablonlar için de kurallar eklenecek
    return false;
};

export function useDosyaAsamasiSablons() {
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

    const { logDocument } = useDocumentLogger();

    const [previewModalOpen, setPreviewModalOpen] = useState(false);
    const [sablonsExpanded, setSablonsExpanded] = useState(false);
    const [previewData, setPreviewData] = useState<PreviewData | null>(null);
    const router = useRouter();
    
    // Tanstack Router'dan arama parametresini reaktif olarak al
    const searchParams: any = useSearch({ strict: false });
    const sablonAd = searchParams?.sablonAd;

    // Snapshot'ı DB'den yükleyen veya ilk kez oluşturup kaydeden yardımcı fonksiyon
    const loadOrCreateSnapshot = async (sablonId: number, baseCtx: any) => {
        try {
            const snapshotRes = await (window as any).electron.ipcRenderer.invoke(
                'db:query',
                'SELECT veri_json FROM DATA_DosyaSablonVeri WHERE temin_dosya_id = ? AND sablon_id = ?',
                [activeDosyaId, sablonId]
            );
            if (snapshotRes.success && snapshotRes.data.length > 0) {
                return JSON.parse(snapshotRes.data[0].veri_json);
            } else {
                // Kayıt yoksa, anlık veriyi snapshot olarak kaydet
                await (window as any).electron.ipcRenderer.invoke(
                    'db:run',
                    'INSERT OR REPLACE INTO DATA_DosyaSablonVeri (temin_dosya_id, sablon_id, veri_json) VALUES (?, ?, ?)',
                    [activeDosyaId, sablonId, JSON.stringify(baseCtx)]
                );
                return baseCtx;
            }
        } catch (e) {
            console.error("Snapshot error:", e);
            return baseCtx;
        }
    };

    // URL'deki sablonAd parametresini dinle ve varsa modalı aç
    useEffect(() => {
        if (!masterHtml || sablons.length === 0 || !sablonAd || !activeDosyaId || !dosyaContext) return;

        const loadFromUrl = async () => {
            // Şablon adından durumu temizleyip eşleştir
            const cleanSablonAd = sablonAd.replace(/^\[.*?\]\s*/, "");
            
            const targetSablon = sablons.find((s: any) => {
                const cleanSName = s.ad.replace(/^\[.*?\]\s*/, "");
                return cleanSName === cleanSablonAd || s.ad === sablonAd;
            });

            if (targetSablon) {
                const title = targetSablon.ad.replace(/^\[.*?\]\s*/, "");
                const processPath = targetSablon.route_path || targetSablon.dosya_adi || "";
                const currentCtx = contextsByPath[processPath] || dosyaContext;
                
                const snapshotCtx = await loadOrCreateSnapshot(targetSablon.id, currentCtx);

                setPreviewData({
                    sablonId: targetSablon.id,
                    title,
                    templateHtml: targetSablon.icerik,
                    processPath,
                    templateTestVerisi: targetSablon.test_verisi || "",
                    snapshotContext: snapshotCtx
                });
                setPreviewModalOpen(true);
            }
        };

        loadFromUrl();
        
    }, [masterHtml, sablons, sablonAd, activeDosyaId, dosyaContext]);

    const handleOpenPreviewForSablon = async (sablon: any, title: string) => {
        if (!masterHtml) {
            alert("Master şablon yüklenemedi, veriler bekleniyor.");
            return;
        }
        
        const processPath = sablon.route_path || sablon.dosya_adi || "";
        const currentCtx = contextsByPath[processPath] || dosyaContext;
        const snapshotCtx = await loadOrCreateSnapshot(sablon.id, currentCtx);

        setPreviewData({
            sablonId: sablon.id,
            title,
            templateHtml: sablon.icerik,
            processPath,
            templateTestVerisi: sablon.test_verisi || "",
            snapshotContext: snapshotCtx
        });
        setPreviewModalOpen(true);
    };

    const refreshSnapshot = async () => {
        if (!previewData?.sablonId || !activeDosyaId) return;
        const currentCtx = contextsByPath[previewData.processPath] || dosyaContext;
        try {
            await (window as any).electron.ipcRenderer.invoke(
                'db:run',
                'INSERT OR REPLACE INTO DATA_DosyaSablonVeri (temin_dosya_id, sablon_id, veri_json) VALUES (?, ?, ?)',
                [activeDosyaId, previewData.sablonId, JSON.stringify(currentCtx)]
            );
            setPreviewData({
                ...previewData,
                snapshotContext: currentCtx
            });
            alert("Veriler güncel dosya bilgileriyle yenilendi!");
        } catch (e) {
            console.error("Refresh snapshot error:", e);
            alert("Veriler yenilenirken hata oluştu.");
        }
    };

    const saveSnapshot = async (overrideData: any) => {
        if (!previewData?.sablonId || !activeDosyaId) return;
        const currentCtx = previewData.snapshotContext || contextsByPath[previewData.processPath] || dosyaContext;
        const mergedCtx = { ...currentCtx, ...overrideData };
        try {
            await (window as any).electron.ipcRenderer.invoke(
                'db:run',
                'INSERT OR REPLACE INTO DATA_DosyaSablonVeri (temin_dosya_id, sablon_id, veri_json) VALUES (?, ?, ?)',
                [activeDosyaId, previewData.sablonId, JSON.stringify(mergedCtx)]
            );
            setPreviewData({
                ...previewData,
                snapshotContext: mergedCtx
            });
            alert("Değişiklikler başarıyla kaydedildi!");
        } catch (e) {
            console.error("Save snapshot error:", e);
            alert("Kaydedilirken hata oluştu.");
        }
    };

    const executePrint = async (html: string) => {
        await (window as any).electron.ipcRenderer.invoke("print-html", html, {
            silent: false,
        });
        if (previewData?.title) {
            await logDocument(previewData.title, "Yazdırıldı");
        }
    };

    const executeExportPdf = async (html: string, filenameTitle?: string) => {
        const titleForFile = filenameTitle || previewData?.title || "Belge";
        const filename = `${titleForFile}.pdf`;
        await (window as any).electron.ipcRenderer.invoke(
            "export-pdf",
            html,
            null,
            titleForFile,
        );
        if (previewData?.title) {
            await logDocument(previewData.title, filename);
        }
    };

    const isSablonDisabled = (cleanName: string): boolean => {
        return checkIsSablonDisabled(cleanName, dosyaContext);
    };

    return {
        // workspace & cikti verileri
        activeDosyaId,
        activeStarredDocs,
        sablons,
        ciktiLoading,
        masterHtml,
        dosyaContext,
        placeholders,
        contextsByPath,
        personelListesi,
        // UI state
        previewModalOpen,
        setPreviewModalOpen,
        sablonsExpanded,
        setSablonsExpanded,
        previewData,
        // işlemler
        handleOpenPreviewForSablon,
        executePrint,
        executeExportPdf,
        refreshSnapshot,
        saveSnapshot,
        isSablonDisabled,
    };
}
