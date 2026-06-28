import React, { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Download,
  FileText,
  Printer,
  RefreshCw,
  X,
} from "lucide-react";
import Mustache from "mustache";

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  templateHtml: string;
  masterHtml: string;
  baseContext: any;
  placeholders?: any[];
  onPrint: (html: string) => Promise<void>;
  onExportPdf: (html: string) => Promise<void>;
  isInline?: boolean;
  templateTestVerisi?: string;
}

export function DocumentPreviewModal({
  isOpen,
  onClose,
  title,
  templateHtml,
  masterHtml,
  baseContext,
  placeholders = [],
  onPrint,
  onExportPdf,
  isInline = false,
  templateTestVerisi = "",
}: DocumentPreviewModalProps): React.JSX.Element | null {
  const [overrideData, setOverrideData] = useState<Record<string, any>>({});
  const [activeTab, setActiveTab] = useState<"form" | "json">("form");
  const [overrideJson, setOverrideJson] = useState("{\n  \n}");
  const [jsonError, setJsonError] = useState("");
  const [previewHtml, setPreviewHtml] = useState("");
  const [isProcessingPrint, setIsProcessingPrint] = useState(false);
  const [isProcessingPdf, setIsProcessingPdf] = useState(false);

  const updatePreview = (contextData: any) => {
    try {
      const renderedContent = Mustache.render(templateHtml, contextData);
      const finalContext = { ...contextData, icerik: renderedContent };
      const finalHtml = Mustache.render(masterHtml, finalContext);
      setPreviewHtml(finalHtml);
    } catch (err: any) {
      console.error("Render error:", err);
    }
  };

  // Merge baseContext with templateTestVerisi if provided
  const mergedContext = React.useMemo(() => {
    let testData = {};
    if (templateTestVerisi) {
      try {
        testData = JSON.parse(templateTestVerisi);
      } catch (e) {
        console.error("Failed to parse template test verisi:", e);
      }
    }
    return { ...testData, ...baseContext };
  }, [baseContext, templateTestVerisi]);

  // Initialization: Format context to JSON on open
  useEffect(() => {
    if (isOpen) {
      setOverrideData({});
      // JSON tab'ı tam context ile başlat (tüm anahtarları göster)
      setOverrideJson(JSON.stringify(mergedContext, null, 2));
      setJsonError("");
      updatePreview(mergedContext);
    }
  }, [isOpen, mergedContext, templateHtml, masterHtml]);

  const handleFormChange = (key: string, value: any) => {
    const newData = { ...overrideData, [key]: value };
    setOverrideData(newData);
    setOverrideJson(JSON.stringify(newData, null, 2));

    const mergedContext = { ...baseContext, ...newData };
    updatePreview(mergedContext);
  };

  const handleJsonChange = (val: string) => {
    setOverrideJson(val);
    try {
      const parsedOverride = JSON.parse(val || "{}");
      setJsonError("");
      setOverrideData(parsedOverride);
      const mergedContext = { ...baseContext, ...parsedOverride };
      updatePreview(mergedContext);
    } catch (err: any) {
      setJsonError("Geçersiz JSON formatı: " + err.message);
    }
  };

  const handlePrint = async () => {
    if (jsonError && activeTab === "json") {
      alert("Geçersiz JSON yapılandırması varken çıktı alamazsınız.");
      return;
    }
    setIsProcessingPrint(true);
    try {
      await onPrint(previewHtml);
    } finally {
      setIsProcessingPrint(false);
    }
  };

  const handlePdf = async () => {
    if (jsonError && activeTab === "json") {
      alert("Geçersiz JSON yapılandırması varken PDF alamazsınız.");
      return;
    }
    setIsProcessingPdf(true);
    try {
      await onExportPdf(previewHtml);
    } finally {
      setIsProcessingPdf(false);
    }
  };

  if (!isOpen) return null;

  // Şablon ve Master HTML içerisinde gerçekten kullanılan değişkenleri tespit et
  const extractUsedVars = (html: string) => {
    const matches = Array.from(
      html.matchAll(/\{\{([#^\/]?)([a-zA-Z0-9_]+)\}\}/g),
    );
    return matches.map((m) => m[2]);
  };

  const usedVars = new Set([
    ...extractUsedVars(templateHtml || ""),
    ...extractUsedVars(masterHtml || ""),
  ]);

  // Orijinal bağlamdaki (mergedContext) verilerden SADECE şablonda kullanılan form alanlarını üret
  const formFields = Object.keys(mergedContext || {}).filter((k) =>
    k !== "icerik" && usedVars.has(k)
  );

  if (isInline) {
    return (
      <div className="bg-white dark:bg-slate-900 w-full h-[calc(100vh-180px)] rounded-2xl flex flex-col border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
        {/* HEADER */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all text-slate-600 dark:text-slate-400 mr-1"
              title="Geri Dön"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                {title} Önizleme
              </h2>
              <p className="text-xs text-slate-500">
                Form veya JSON üzerinden değişkenleri ezerek sonucu canlı
                görebilirsiniz.
              </p>
            </div>
          </div>
        </div>

        {/* BODY */}
        <div className="flex flex-1 overflow-hidden">
          {/* LEFT SIDEBAR - FORM / JSON EDITOR */}
          <div className="w-1/3 flex flex-col border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            {/* TABS */}
            <div className="flex p-2 gap-1 border-b border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-950/50">
              <button
                onClick={() => setActiveTab("form")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  activeTab === "form"
                    ? "bg-white dark:bg-slate-800 text-blue-600 shadow-sm border border-slate-200 dark:border-slate-700"
                    : "text-slate-500 hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
                }`}
              >
                Form Görünümü
              </button>
              <button
                onClick={() => setActiveTab("json")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  activeTab === "json"
                    ? "bg-white dark:bg-slate-800 text-blue-600 shadow-sm border border-slate-200 dark:border-slate-700"
                    : "text-slate-500 hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
                }`}
              >
                JSON (Gelişmiş)
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 relative flex flex-col">
              {activeTab === "form"
                ? (
                  <div className="flex flex-col gap-4">
                    {formFields.map((key) => {
                      const originalValue = mergedContext[key];
                      const value = overrideData[key] !== undefined
                        ? overrideData[key]
                        : originalValue;
                      const type = typeof originalValue;

                      const schemaDef = placeholders.find((p) =>
                        p.anahtar === key
                      ) || null;
                      const label = schemaDef ? schemaDef.etiket : key;
                      const effectiveType = schemaDef?.veri_tipi === "date"
                        ? "date"
                        : type;

                      if (effectiveType === "date") {
                        let dateVal = value || "";
                        if (typeof value === "string" && value.includes(".")) {
                          const parts = value.split(".");
                          if (parts.length === 3) {
                            dateVal = `${parts[2]}-${parts[1]}-${parts[0]}`;
                          }
                        }

                        return (
                          <div key={key} className="flex flex-col gap-1.5">
                            <div className="flex flex-col">
                              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                {label}
                              </label>
                              {schemaDef?.aciklama && (
                                <span className="text-xs text-slate-500">
                                  {schemaDef.aciklama}
                                </span>
                              )}
                            </div>
                            <input
                              type="date"
                              value={dateVal}
                              onChange={(e) => {
                                const d = e.target.value;
                                if (!d) {
                                  handleFormChange(key, "");
                                  return;
                                }
                                const parts = d.split("-");
                                if (parts.length === 3) {
                                  handleFormChange(
                                    key,
                                    `${parts[2]}.${parts[1]}.${parts[0]}`,
                                  );
                                } else {
                                  handleFormChange(key, d);
                                }
                              }}
                              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                            />
                          </div>
                        );
                      }

                      if (effectiveType === "boolean") {
                        return (
                          <div
                            key={key}
                            className="flex items-center justify-between"
                          >
                            <div className="flex flex-col">
                              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                {label}
                              </label>
                              {schemaDef?.aciklama && (
                                <span className="text-xs text-slate-500">
                                  {schemaDef.aciklama}
                                </span>
                              )}
                            </div>
                            <input
                              type="checkbox"
                              checked={!!value}
                              onChange={(e) =>
                                handleFormChange(key, e.target.checked)}
                              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                          </div>
                        );
                      }

                      if (type === "number") {
                        return (
                          <div key={key} className="flex flex-col gap-1.5">
                            <div className="flex flex-col">
                              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                {label}
                              </label>
                              {schemaDef?.aciklama && (
                                <span className="text-xs text-slate-500">
                                  {schemaDef.aciklama}
                                </span>
                              )}
                            </div>
                            <input
                              type="number"
                              value={value || 0}
                              onChange={(e) =>
                                handleFormChange(key, Number(e.target.value))}
                              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                            />
                          </div>
                        );
                      }

                      if (Array.isArray(originalValue) || type === "object") {
                        return (
                          <div key={key} className="flex flex-col gap-1.5">
                            <div className="flex flex-col">
                              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                {label}{" "}
                                <span className="text-xs font-normal text-slate-400">
                                  ({Array.isArray(originalValue)
                                    ? "Dizi"
                                    : "Nesne"})
                                </span>
                              </label>
                              {schemaDef?.aciklama && (
                                <span className="text-xs text-slate-500">
                                  {schemaDef.aciklama}
                                </span>
                              )}
                            </div>
                            <textarea
                              value={typeof value === "object"
                                ? JSON.stringify(value, null, 2)
                                : value}
                              onChange={(e) => {
                                try {
                                  const parsed = JSON.parse(
                                    e.target.value ||
                                      (Array.isArray(originalValue)
                                        ? "[]"
                                        : "{}"),
                                  );
                                  handleFormChange(key, parsed);
                                } catch (err) {
                                  handleFormChange(key, e.target.value);
                                }
                              }}
                              className="w-full p-2.5 h-24 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none"
                            />
                          </div>
                        );
                      }

                      return (
                        <div key={key} className="flex flex-col gap-1.5">
                          <div className="flex flex-col">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                              {label}
                            </label>
                            {schemaDef?.aciklama && (
                              <span className="text-xs text-slate-500">
                                {schemaDef.aciklama}
                              </span>
                            )}
                          </div>
                          <input
                            type="text"
                            value={value || ""}
                            onChange={(e) =>
                              handleFormChange(key, e.target.value)}
                            className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                          />
                        </div>
                      );
                    })}
                    {formFields.length === 0 && (
                      <div className="text-center text-sm text-slate-500 mt-10">
                        Bu şablonda otomatik algılanan bir değişken bulunamadı.
                      </div>
                    )}
                  </div>
                )
                : (
                  <>
                    <textarea
                      value={overrideJson}
                      onChange={(e) => handleJsonChange(e.target.value)}
                      className="flex-1 w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-955 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder='Örn: { "talepEdenPersonelAdi": "Yeni İsim" }'
                      spellCheck={false}
                    />
                    {jsonError && (
                      <div className="mt-3 p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/30 rounded-lg flex items-start gap-2 text-rose-600 dark:text-rose-400 text-xs">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>{jsonError}</span>
                      </div>
                    )}
                  </>
                )}
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500">
              İpucu: Buradaki değişiklikler sadece bu yazdırma işlemi için
              geçerlidir.
            </div>
          </div>

          {/* RIGHT SIDEBAR - PREVIEW */}
          <div className="flex-1 bg-slate-100 dark:bg-slate-950 relative">
            <iframe
              srcDoc={previewHtml}
              className="w-full h-full bg-white border-0"
              title="Print Preview"
              sandbox="allow-same-origin allow-scripts"
            />
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition-all text-sm"
          >
            İptal
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePdf}
              disabled={isProcessingPdf || isProcessingPrint || !!jsonError}
              className="px-6 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition-all flex items-center gap-2 disabled:opacity-50 text-sm shadow-sm"
            >
              {isProcessingPdf
                ? <RefreshCw className="w-4 h-4 animate-spin" />
                : <Download className="w-4 h-4" />}
              PDF Olarak Kaydet
            </button>
            <button
              onClick={handlePrint}
              disabled={isProcessingPrint || isProcessingPdf || !!jsonError}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all flex items-center gap-2 disabled:opacity-50 text-sm shadow-sm"
            >
              {isProcessingPrint
                ? <RefreshCw className="w-4 h-4 animate-spin" />
                : <Printer className="w-4 h-4" />}
              Yazdır
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div
        className="bg-white dark:bg-slate-900 w-full max-w-[90vw] h-[90vh] rounded-2xl shadow-2xl flex flex-col border border-slate-200 dark:border-slate-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                {title} Önizleme
              </h2>
              <p className="text-xs text-slate-500">
                Form veya JSON üzerinden değişkenleri ezerek sonucu canlı
                görebilirsiniz.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="flex flex-1 overflow-hidden">
          {/* LEFT SIDEBAR - FORM / JSON EDITOR */}
          <div className="w-1/3 flex flex-col border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            {/* TABS */}
            <div className="flex p-2 gap-1 border-b border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-950/50">
              <button
                onClick={() => setActiveTab("form")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  activeTab === "form"
                    ? "bg-white dark:bg-slate-800 text-blue-600 shadow-sm border border-slate-200 dark:border-slate-700"
                    : "text-slate-500 hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
                }`}
              >
                Form Görünümü
              </button>
              <button
                onClick={() => setActiveTab("json")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  activeTab === "json"
                    ? "bg-white dark:bg-slate-800 text-blue-600 shadow-sm border border-slate-200 dark:border-slate-700"
                    : "text-slate-500 hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
                }`}
              >
                JSON (Gelişmiş)
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 relative flex flex-col">
              {activeTab === "form"
                ? (
                  <div className="flex flex-col gap-4">
                    {formFields.map((key) => {
                      const originalValue = mergedContext[key];
                      const value = overrideData[key] !== undefined
                        ? overrideData[key]
                        : originalValue;
                      const type = typeof originalValue;

                      const schemaDef = placeholders.find((p) =>
                        p.anahtar === key
                      ) || null;
                      const label = schemaDef ? schemaDef.etiket : key;

                      // Schema-defined types take precedence over typeof for specific UI hints (like date)
                      const effectiveType = schemaDef?.veri_tipi === "date"
                        ? "date"
                        : type;

                      if (effectiveType === "date") {
                        // "14.06.2026" gibi TR formatındaki tarihleri YYYY-MM-DD formatına çevir, input type="date" desteklesin
                        let dateVal = value || "";
                        if (typeof value === "string" && value.includes(".")) {
                          const parts = value.split(".");
                          if (parts.length === 3) {
                            dateVal = `${parts[2]}-${parts[1]}-${parts[0]}`;
                          }
                        }

                        return (
                          <div key={key} className="flex flex-col gap-1.5">
                            <div className="flex flex-col">
                              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                {label}
                              </label>
                              {schemaDef?.aciklama && (
                                <span className="text-xs text-slate-500">
                                  {schemaDef.aciklama}
                                </span>
                              )}
                            </div>
                            <input
                              type="date"
                              value={dateVal}
                              onChange={(e) => {
                                // YYYY-MM-DD'den DD.MM.YYYY'ye geri çevir (şablon için)
                                const d = e.target.value;
                                if (!d) {
                                  handleFormChange(key, "");
                                  return;
                                }
                                const parts = d.split("-");
                                if (parts.length === 3) {
                                  handleFormChange(
                                    key,
                                    `${parts[2]}.${parts[1]}.${parts[0]}`,
                                  );
                                } else {
                                  handleFormChange(key, d);
                                }
                              }}
                              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                            />
                          </div>
                        );
                      }

                      if (effectiveType === "boolean") {
                        return (
                          <div
                            key={key}
                            className="flex items-center justify-between"
                          >
                            <div className="flex flex-col">
                              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                {label}
                              </label>
                              {schemaDef?.aciklama && (
                                <span className="text-xs text-slate-500">
                                  {schemaDef.aciklama}
                                </span>
                              )}
                            </div>
                            <input
                              type="checkbox"
                              checked={!!value}
                              onChange={(e) =>
                                handleFormChange(key, e.target.checked)}
                              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                          </div>
                        );
                      }

                      if (type === "number") {
                        return (
                          <div key={key} className="flex flex-col gap-1.5">
                            <div className="flex flex-col">
                              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                {label}
                              </label>
                              {schemaDef?.aciklama && (
                                <span className="text-xs text-slate-500">
                                  {schemaDef.aciklama}
                                </span>
                              )}
                            </div>
                            <input
                              type="number"
                              value={value || 0}
                              onChange={(e) =>
                                handleFormChange(key, Number(e.target.value))}
                              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                            />
                          </div>
                        );
                      }

                      if (Array.isArray(originalValue) || type === "object") {
                        return (
                          <div key={key} className="flex flex-col gap-1.5">
                            <div className="flex flex-col">
                              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                {label}{" "}
                                <span className="text-xs font-normal text-slate-400">
                                  ({Array.isArray(originalValue)
                                    ? "Dizi"
                                    : "Nesne"})
                                </span>
                              </label>
                              {schemaDef?.aciklama && (
                                <span className="text-xs text-slate-500">
                                  {schemaDef.aciklama}
                                </span>
                              )}
                            </div>
                            <textarea
                              value={typeof value === "object"
                                ? JSON.stringify(value, null, 2)
                                : value}
                              onChange={(e) => {
                                try {
                                  const parsed = JSON.parse(
                                    e.target.value ||
                                      (Array.isArray(originalValue)
                                        ? "[]"
                                        : "{}"),
                                  );
                                  handleFormChange(key, parsed);
                                } catch (err) {
                                  // Ignore parse errors while typing
                                  handleFormChange(key, e.target.value);
                                }
                              }}
                              className="w-full p-2.5 h-24 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none"
                            />
                          </div>
                        );
                      }

                      // Default to string / text input
                      return (
                        <div key={key} className="flex flex-col gap-1.5">
                          <div className="flex flex-col">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                              {label}
                            </label>
                            {schemaDef?.aciklama && (
                              <span className="text-xs text-slate-500">
                                {schemaDef.aciklama}
                              </span>
                            )}
                          </div>
                          <input
                            type="text"
                            value={value || ""}
                            onChange={(e) =>
                              handleFormChange(key, e.target.value)}
                            className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                          />
                        </div>
                      );
                    })}
                    {formFields.length === 0 && (
                      <div className="text-center text-sm text-slate-500 mt-10">
                        Bu şablonda otomatik algılanan bir değişken bulunamadı.
                      </div>
                    )}
                  </div>
                )
                : (
                  <>
                    <textarea
                      value={overrideJson}
                      onChange={(e) => handleJsonChange(e.target.value)}
                      className="flex-1 w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder='Örn: { "talepEdenPersonelAdi": "Yeni İsim" }'
                      spellCheck={false}
                    />
                    {jsonError && (
                      <div className="mt-3 p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/30 rounded-lg flex items-start gap-2 text-rose-600 dark:text-rose-400 text-xs">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>{jsonError}</span>
                      </div>
                    )}
                  </>
                )}
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500">
              İpucu: Buradaki değişiklikler sadece bu yazdırma işlemi için
              geçerlidir.
            </div>
          </div>

          {/* RIGHT SIDEBAR - PREVIEW */}
          <div className="flex-1 bg-slate-100 dark:bg-slate-950 relative">
            <iframe
              srcDoc={previewHtml}
              className="w-full h-full bg-white border-0"
              title="Print Preview"
              sandbox="allow-same-origin allow-scripts"
            />
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition-all text-sm"
          >
            İptal
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePdf}
              disabled={isProcessingPdf || isProcessingPrint || !!jsonError}
              className="px-6 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition-all flex items-center gap-2 disabled:opacity-50 text-sm shadow-sm"
            >
              {isProcessingPdf
                ? <RefreshCw className="w-4 h-4 animate-spin" />
                : <Download className="w-4 h-4" />}
              PDF Olarak Kaydet
            </button>
            <button
              onClick={handlePrint}
              disabled={isProcessingPrint || isProcessingPdf || !!jsonError}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all flex items-center gap-2 disabled:opacity-50 text-sm shadow-sm shadow-blue-600/20"
            >
              {isProcessingPrint
                ? <RefreshCw className="w-4 h-4 animate-spin" />
                : <Printer className="w-4 h-4" />}
              Yazdır
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
