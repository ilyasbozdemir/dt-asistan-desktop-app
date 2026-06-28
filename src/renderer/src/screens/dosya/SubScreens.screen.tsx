/* eslint-disable react-refresh/only-export-components */
import React, { useEffect, useState } from "react";
import { useWorkspaceStore } from "../../store/workspaceStore";
import { Link } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  Check,
  Compass,
  Copy,
  CreditCard,
  Edit2,
  Eye,
  FileCheck,
  FileSpreadsheet,
  FileText,
  Layers,
  Package,
  Plus,
  Printer,
  Search,
  Trash2,
  TrendingUp,
  Upload,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { cn } from "../../utils/cn";
import { Modal } from "../../components/ui/Modal";

interface SubScreenProps {
  title: string;
  icon: React.ElementType;
  description: string;
  children?: React.ReactNode;
}

import { Star } from "lucide-react";

export function SubScreen(
  { title, icon: Icon, description, children }: SubScreenProps,
): React.JSX.Element {
  const { activeDosyaId, activeStarredDocs, setActiveStarredDocs } =
    useWorkspaceStore();
  const [activeDosya, setActiveDosya] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const isStarred = activeStarredDocs.includes(title);

  useEffect(() => {
    document.title = `${title} - Doğrudan Temin`;
  }, [title]);

  useEffect(() => {
    if (!activeDosyaId) return;
    setLoading(true);
    window.electron.ipcRenderer.invoke(
      "db:query",
      "SELECT id, konu, temin_no, starred_docs FROM DATA_TeminDosyasi WHERE id = ?",
      [activeDosyaId],
    ).then((res) => {
      if (res.success && res.data.length > 0) {
        setActiveDosya(res.data[0]);
        try {
          const docs = res.data[0].starred_docs
            ? JSON.parse(res.data[0].starred_docs)
            : [];
          setActiveStarredDocs(docs); // Sync to global store
        } catch (e) {}
      }
    }).finally(() => {
      setLoading(false);
    });
  }, [activeDosyaId, title, setActiveStarredDocs]);

  const toggleStar = async () => {
    if (!activeDosyaId) return;
    let newDocs = [...activeStarredDocs];
    if (isStarred) {
      newDocs = newDocs.filter((d) => d !== title);
    } else {
      newDocs.push(title);
    }
    setActiveStarredDocs(newDocs); // Instantly sync to global store

    await window.electron.ipcRenderer.invoke(
      "db:run",
      "UPDATE DATA_TeminDosyasi SET starred_docs = ? WHERE id = ?",
      [JSON.stringify(newDocs), activeDosyaId],
    );
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-855 dark:text-slate-100 flex items-center gap-2">
              <Icon className="w-7 h-7 text-blue-600" />
              {title}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-xs">
              {description}
            </p>
          </div>
        </div>

        {/* STAR TOGGLE BUTTON */}
        <button
          onClick={toggleStar}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl border font-bold text-sm transition-all shadow-sm",
            isStarred
              ? "bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800/50 text-amber-700 dark:text-amber-500 hover:bg-amber-100 dark:hover:bg-amber-900/50"
              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:text-amber-600 hover:border-amber-200 hover:bg-amber-50 dark:hover:bg-slate-800",
          )}
          title={isStarred ? "Kısayollardan Çıkar" : "Hızlı Erişime Ekle"}
        >
          <Star className={cn("w-5 h-5", isStarred && "fill-amber-500")} />
          <span className="hidden sm:inline-block">
            {isStarred ? "Hızlı Erişimde" : "Hızlı Erişime Ekle"}
          </span>
        </button>
      </div>

      {/* ACTIVE DOSYA CONTEXT */}
      {activeDosyaId
        ? (
          <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest block">
                  İLİŞKİLİ AKTİF ÇALIŞMA DOSYASI
                </span>
                {loading
                  ? (
                    <span className="text-xs text-slate-500 italic">
                      Yükleniyor...
                    </span>
                  )
                  : activeDosya
                  ? (
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                      {activeDosya.temin_no || "No Bekliyor"} —{" "}
                      {activeDosya.konu} (ID: #{activeDosya.id})
                    </h3>
                  )
                  : (
                    <span className="text-xs text-slate-500">
                      Dosya bulunamadı (#{activeDosyaId})
                    </span>
                  )}
              </div>
            </div>
            <Link
              to="/dosyalar"
              className="px-3.5 py-1.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-350 border border-slate-200 dark:border-slate-800 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors inline-block text-center cursor-pointer shrink-0 shadow-sm"
            >
              Dosyayı Değiştir
            </Link>
          </div>
        )
        : (
          <div className="bg-amber-50/50 dark:bg-amber-955/10 border border-amber-200 dark:border-amber-900/20 rounded-2xl p-4 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-400 font-semibold shadow-sm">
            <AlertCircle className="w-5 h-5 shrink-0 text-amber-600" />
            <div>
              Aktif bir doğrudan temin dosyası seçmediniz. Bu ekranda işlem
              yapabilmek için lütfen önce{" "}
              <Link
                to="/dosyalar"
                className="underline font-bold text-blue-600 dark:text-blue-400"
              >
                dosyalar listesinden
              </Link>{" "}
              bir dosya seçin.
            </div>
          </div>
        )}

      {/* CHILDREN VIEW */}
      {activeDosyaId && children}
    </div>
  );
}

// 1. MALZEME LİSTESİ SCREEN

export * from "./sub-screens/MalzemeListesi";
export * from "./sub-screens/IstekliFirmalar";
export * from "./sub-screens/YaklasikMaliyetCetveli";
export * from "./sub-screens/PiyasaArastirmaTutanagi";
export * from "./sub-screens/FiyatArastirmaKomisyonu";
export * from "./sub-screens/MuayeneKabulKomisyonu";
export * from "./sub-screens/FiyatArastirmaMuayeneKomisyonu";
export * from "./sub-screens/KomisyonAtamaOnayEki";
export * from "./sub-screens/LuzumMuzekkeresiBelgesi";
export * from "./sub-screens/LuzumOnayEki";
export * from "./sub-screens/LuzumTeslimTesellum";
export * from "./sub-screens/DogrudanTeminOnayBelgesi";
export * from "./sub-screens/IhaleOnayBelgesi";
export * from "./sub-screens/ButceSorgusu";
export * from "./sub-screens/HarcamaTalimati";
export * from "./sub-screens/HarcamaPusulasi";
export * from "./CiktiMerkezi.screen";
