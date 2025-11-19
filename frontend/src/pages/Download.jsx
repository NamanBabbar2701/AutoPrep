import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { downloadDataset } from "../api/index.js";
import OperationSummary from "../components/OperationSummary.jsx";
import { useAppContext } from "../context/AppContext.jsx";

const DownloadPage = () => {
  const navigate = useNavigate();
  const { fileId, processingResult, resetWorkflow } = useAppContext();
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!processingResult) {
      navigate("/", { replace: true });
    }
  }, [processingResult, navigate]);

  const handleDownload = async () => {
    if (!fileId) return;
    setIsDownloading(true);
    setError("");
    try {
      const response = await downloadDataset(fileId);
      const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = blobUrl;
      link.setAttribute("download", `${fileId}_clean.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      const message = err?.response?.data?.detail || "Download failed. Please try again.";
      setError(message);
    } finally {
      setIsDownloading(false);
    }
  };

  if (!processingResult) return null;

  return (
    <section>
      <header className="mb-8 text-center">
        <p className="text-sm uppercase tracking-[0.4em] text-accent">Step 3 · Download</p>
        <h2 className="mt-2 text-3xl font-semibold text-white">Your dataset is cleaned and ready</h2>
        <p className="mt-2 text-slate-400">AutoPrep applied scaling, encoding, imputation, and outlier removal.</p>
      </header>

      <div className="rounded-3xl border border-white/5 bg-white/5 p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-400">Final shape</p>
            <p className="text-3xl font-semibold text-white">
              {processingResult.rows} rows · {processingResult.columns} columns
            </p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleDownload}
              disabled={isDownloading}
              className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-slate-900 shadow-soft disabled:opacity-50"
            >
              {isDownloading ? "Preparing..." : "Download clean dataset"}
            </button>
            <button
              type="button"
              onClick={() => {
                resetWorkflow();
                navigate("/");
              }}
              className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white"
            >
              Start over
            </button>
          </div>
        </div>
        {error && <p className="mt-4 text-sm text-rose-400">{error}</p>}
      </div>

      <div className="mt-10">
        <OperationSummary operations={processingResult.operations} />
      </div>
    </section>
  );
};

export default DownloadPage;

