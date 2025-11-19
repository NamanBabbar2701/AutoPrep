import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { processDataset } from "../api/index.js";
import ColumnConfigurator from "../components/ColumnConfigurator.jsx";
import DatasetSummary from "../components/DatasetSummary.jsx";
import { useAppContext } from "../context/AppContext.jsx";

const ProcessPage = () => {
  const navigate = useNavigate();
  const { uploadMeta, fileId, columnPreferences, setColumnPreferences, setProcessingResult } = useAppContext();
  const [localPrefs, setLocalPrefs] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!uploadMeta) {
      navigate("/", { replace: true });
      return;
    }

    const nextPrefs = {};
    uploadMeta?.column_analysis?.forEach((column) => {
      nextPrefs[column.column] =
        columnPreferences[column.column] || {
          imputation: column.suggested_imputation ?? "auto",
          encoding: column.suggested_encoding ?? "auto",
        };
    });
    setLocalPrefs(nextPrefs);
  }, [uploadMeta, columnPreferences, navigate]);

  const columnList = useMemo(() => uploadMeta?.column_analysis ?? [], [uploadMeta]);

  const handleConfigChange = (column, updated) => {
    setLocalPrefs((prev) => ({
      ...prev,
      [column]: updated,
    }));
  };

  const handleProcess = async () => {
    if (!fileId) return;
    setIsProcessing(true);
    setError("");

    const preferencesPayload = {
      imputation: {},
      encoding: {},
      drop_columns: [],
    };

    Object.entries(localPrefs).forEach(([column, config]) => {
      if (config?.imputation && config.imputation !== "auto") {
        if (config.imputation === "drop") {
          preferencesPayload.drop_columns.push(column);
        } else {
          preferencesPayload.imputation[column] = config.imputation;
        }
      }
      if (config?.encoding && config.encoding !== "auto") {
        preferencesPayload.encoding[column] = config.encoding;
      }
    });

    const hasCustomPrefs =
      preferencesPayload.drop_columns.length ||
      Object.keys(preferencesPayload.imputation).length ||
      Object.keys(preferencesPayload.encoding).length;

    const payload = hasCustomPrefs
      ? {
          file_id: fileId,
          preferences: preferencesPayload,
        }
      : { file_id: fileId };

    try {
      const { data } = await processDataset(payload);
      setColumnPreferences(localPrefs);
      setProcessingResult(data);
      navigate("/download");
    } catch (err) {
      const message = err?.response?.data?.detail || "Processing failed. Please try again.";
      setError(message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!uploadMeta) {
    return null;
  }

  return (
    <section>
      <header className="mb-8">
        <p className="text-sm uppercase tracking-[0.4em] text-accent">Step 2 · Configure</p>
        <h2 className="mt-2 text-3xl font-semibold text-white">Fine-tune preprocessing strategies</h2>
        <p className="mt-2 max-w-3xl text-slate-400">
          AutoPrep suggested defaults for each column. Adjust imputation, encoding, or drop features entirely.
        </p>
      </header>

      <DatasetSummary meta={uploadMeta} />

      <div className="mt-10 grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-3">
          {columnList.map((column) => (
            <ColumnConfigurator key={column.column} column={column} config={localPrefs[column.column] || { imputation: "auto", encoding: "auto" }} onChange={handleConfigChange} />
          ))}
        </div>

        <aside className="rounded-3xl border border-white/5 bg-white/5 p-6 sticky top-4 self-start">
          <h3 className="text-lg font-semibold text-white">Processing Summary</h3>
          <ul className="mt-4 space-y-2 text-sm text-slate-300">
            <li>• {columnList.length} columns detected</li>
            <li>• {Object.values(localPrefs).filter((config) => config?.imputation === "drop").length} columns scheduled to drop</li>
            <li>• {Object.values(localPrefs).filter((config) => config?.encoding && config.encoding !== "auto").length} custom encoding overrides</li>
          </ul>

          <button
            type="button"
            onClick={handleProcess}
            disabled={isProcessing}
            className="mt-6 w-full rounded-full bg-accent px-6 py-3 text-sm font-semibold text-slate-900 shadow-soft disabled:opacity-50"
          >
            {isProcessing ? "Processing..." : "Start processing"}
          </button>

          {error && <p className="mt-4 text-sm text-rose-400">{error}</p>}
        </aside>
      </div>
    </section>
  );
};

export default ProcessPage;

