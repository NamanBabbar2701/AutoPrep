import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { uploadDataset } from "../api/index.js";
import FileDropzone from "../components/FileDropzone.jsx";
import DatasetSummary from "../components/DatasetSummary.jsx";
import { useAppContext } from "../context/AppContext.jsx";

const UploadPage = () => {
  const navigate = useNavigate();
  const { setUploadMeta, resetWorkflow } = useAppContext();
  const [selectedFile, setSelectedFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    setAnalysis(null);
    setError("");
    resetWorkflow();
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setError("");
    try {
      const { data } = await uploadDataset(selectedFile);
      setAnalysis(data);
      setUploadMeta(data);
    } catch (err) {
      const message = err?.response?.data?.detail || "Upload failed. Please try again.";
      setError(message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="relative">
      <div className="gradient-ring" />
      <div className="relative z-10">
        <section className="rounded-3xl border border-white/5 bg-gradient-to-br from-slate-950/90 to-slate-900/70 p-8 shadow-soft">
          <header>
            <p className="text-sm uppercase tracking-[0.4em] text-accent">AutoPrep</p>
            <h1 className="mt-4 text-4xl font-semibold text-white">Automated data preprocessing in minutes</h1>
            <p className="mt-3 max-w-2xl text-slate-400">
              Upload your raw dataset and let AutoPrep detect missing values, fix data types, encode, scale, and prepare a clean dataset ready for modeling.
            </p>
          </header>

          <div className="mt-10 grid gap-8 lg:grid-cols-2">
            <div>
              <FileDropzone onFileSelect={handleFileSelect} selectedFile={selectedFile} isUploading={isUploading} />
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={!selectedFile || isUploading}
                  className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 disabled:opacity-40"
                >
                  {isUploading ? "Analyzing..." : "Analyze dataset"}
                </button>
                {analysis && (
                  <button
                    type="button"
                    onClick={() => navigate("/process")}
                    className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white hover:border-accent"
                  >
                    Proceed to preprocessing
                  </button>
                )}
              </div>
              {error && <p className="mt-4 text-sm text-rose-400">{error}</p>}
            </div>

            <div>
              {analysis ? (
                <>
                  <DatasetSummary meta={analysis} />
                  <div className="mt-8 rounded-2xl border border-white/5 bg-white/5 p-6">
                    <h3 className="text-lg font-semibold text-white">Column insights</h3>
                    <div className="mt-4 space-y-3 text-sm text-slate-300 max-h-64 overflow-y-auto pr-2">
                      {analysis.column_analysis.map((column) => (
                        <div key={column.column} className="flex items-center justify-between rounded-xl border border-white/5 bg-slate-950/40 px-4 py-3">
                          <div>
                            <p className="font-semibold text-white">{column.column}</p>
                            <p className="text-xs uppercase tracking-wide text-slate-500">{column.dtype}</p>
                          </div>
                          <div className="text-right text-xs">
                            <p>Missing: {column.missing_pct}%</p>
                            <p>Encode: {column.suggested_encoding || "Auto"}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-white/5 bg-white/5 p-8 text-center text-slate-500">
                  <p className="text-lg font-medium text-slate-300">Upload a dataset to see instant insights.</p>
                  <p className="mt-2 text-sm">AutoPrep highlights missing values, dtypes, and quick suggestions.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default UploadPage;

