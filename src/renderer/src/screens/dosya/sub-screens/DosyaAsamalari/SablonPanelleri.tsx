import React from "react";
import { Link } from "@tanstack/react-router";
import { FileText, ChevronDown, ChevronUp } from "lucide-react";
import {
    BUTTON_COLORS,
    CATEGORY_LABELS,
    normalizeForMatch,
} from "./useDosyaAsamasiSablons";

// -----------------------------------------------------------------------
// SurecBelgeleriPanel
// -----------------------------------------------------------------------

interface SurecBelgeleriPanelProps {
    stageSablons: any[];
    ciktiLoading: boolean;
    sablonsExpanded: boolean;
    setSablonsExpanded: (v: boolean) => void;
    onSablonClick: (sablon: any, title: string) => void;
    isSablonDisabled?: (cleanName: string) => boolean;
}

export function SurecBelgeleriPanel({
    stageSablons,
    ciktiLoading,
    sablonsExpanded,
    setSablonsExpanded,
    onSablonClick,
    isSablonDisabled,
}: SurecBelgeleriPanelProps): React.JSX.Element | null {
    if (stageSablons.length === 0) return null;

    return (
        <div className="flex flex-col mb-6 print:hidden animate-in fade-in duration-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
            <div
                onClick={() => setSablonsExpanded(!sablonsExpanded)}
                className="flex items-center justify-between w-full pb-2 mb-3 border-b border-slate-100 dark:border-slate-800/80 cursor-pointer select-none"
            >
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    Süreç Belgeleri (Bu Aşamada Üretilecekler)
                </span>
                {sablonsExpanded
                    ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                    : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
            </div>
            {sablonsExpanded && (
                <div className="flex items-center gap-2 flex-wrap">
                    {stageSablons.map((sablon, idx) => {
                        let status: string | null = null;
                        let cleanName = sablon.ad;
                        const match = sablon.ad.match(/^\[(.*?)\]\s*(.*)$/);
                        if (match) {
                            status = match[1].trim();
                            cleanName = match[2].trim();
                        }

                        return (
                            <button
                                key={sablon.id || sablon.ad}
                                onClick={() => onSablonClick(sablon, sablon.ad)}
                                disabled={ciktiLoading || (isSablonDisabled && isSablonDisabled(cleanName))}
                                className={`px-4 py-2 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm ${ciktiLoading || (isSablonDisabled && isSablonDisabled(cleanName)) ? 'opacity-40 cursor-not-allowed grayscale' : 'cursor-pointer'} ${BUTTON_COLORS[idx % BUTTON_COLORS.length]}`}
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
    );
}

// -----------------------------------------------------------------------
// KisayolBelgeleriPanel
// -----------------------------------------------------------------------

interface KisayolBelgeleriPanelProps {
    activeStarredDocs: string[] | null | undefined;
    sablons: any[];
    ciktiLoading: boolean;
    onSablonClick: (sablon: any, title: string) => void;
    isSablonDisabled?: (cleanName: string) => boolean;
}

export function KisayolBelgeleriPanel({
    activeStarredDocs,
    sablons,
    ciktiLoading,
    onSablonClick,
    isSablonDisabled,
}: KisayolBelgeleriPanelProps): React.JSX.Element | null {
    if (!activeStarredDocs) return null;

    return (
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
                        Süreçler panelinden istediğiniz belgeleri yıldızlayarak
                        buraya ekleyebilirsiniz.
                    </div>
                )
                : (
                    <div className="flex items-center gap-2 flex-wrap">
                        {activeStarredDocs.map((docName, idx) => {
                            const sablon = sablons.find(
                                (s) =>
                                    normalizeForMatch(s.ad) ===
                                        normalizeForMatch(docName),
                            );
                            if (!sablon) return null;

                            let status: string | null = null;
                            let cleanName = docName;
                            const match = docName.match(/^\[(.*?)\]\s*(.*)$/);
                            if (match) {
                                status = match[1].trim();
                                cleanName = match[2].trim();
                            }

                            const stageLabel = sablon.kategori
                                ? CATEGORY_LABELS[sablon.kategori]
                                : null;

                            return (
                                <button
                                    key={docName}
                                    onClick={() => onSablonClick(sablon, docName)}
                                    disabled={ciktiLoading || (isSablonDisabled && isSablonDisabled(cleanName))}
                                    className={`px-4 py-2 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm ${ciktiLoading || (isSablonDisabled && isSablonDisabled(cleanName)) ? 'opacity-40 cursor-not-allowed grayscale' : 'cursor-pointer'} ${BUTTON_COLORS[idx % BUTTON_COLORS.length]}`}
                                >
                                    <FileText className="w-4 h-4 shrink-0" />
                                    <span>{cleanName}</span>
                                    {status && (
                                        <span className="px-1.5 py-0.5 bg-black/25 text-white rounded text-[9px] font-black uppercase tracking-wide shrink-0">
                                            {status}
                                        </span>
                                    )}
                                    {stageLabel && (
                                        <span className="px-1.5 py-0.5 bg-white/20 text-white rounded text-[9px] font-black uppercase tracking-wide shrink-0">
                                            {stageLabel}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                )}
        </div>
    );
}
