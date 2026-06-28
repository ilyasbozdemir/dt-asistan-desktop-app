import React, { useEffect, useState } from "react";
import { useWorkspaceStore } from "../../../store/workspaceStore";
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
import { cn } from "../../../utils/cn";
import { Modal } from "../../../components/ui/Modal";

interface SubScreenProps {
  title: string;
  icon: React.ElementType;
  description: string;
  children?: React.ReactNode;
}

export function SubScreen({
  title,
  icon: Icon,
  description,
  children,
}: SubScreenProps): React.JSX.Element {
  const { activeDosyaId } = useWorkspaceStore();
  const [activeDosya, setActiveDosya] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = `${title} - Doğrudan Temin`;
  }, [title]);

  useEffect(() => {
    if (!activeDosyaId) return;
    setLoading(true);
    window.electron.ipcRenderer
      .invoke(
        "db:query",
        "SELECT id, konu, temin_no FROM DATA_TeminDosyasi WHERE id = ?",
        [
          activeDosyaId,
        ],
      )
      .then((res) => {
        if (res.success && res.data.length > 0) {
          setActiveDosya(res.data[0]);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [activeDosyaId]);

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <Link
            to="/dosyalar"
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 transition-all shadow-sm"
            title="Dosyalara Dön"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
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
      </div>

      {/* ACTIVE DOSYA CONTEXT */}
      {!activeDosyaId && (
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
