const SummaryTile = ({ label, value, highlight }) => (
  <div className="rounded-xl border border-white/5 bg-white/5 p-4 shadow-soft">
    <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
    <p className={`mt-2 text-2xl font-semibold ${highlight ? "text-accent" : "text-slate-100"}`}>{value}</p>
  </div>
);

const DatasetSummary = ({ meta }) => {
  if (!meta) return null;
  const { rows, columns, missing_summary: missingSummary, dtypes } = meta;

  return (
    <section className="mt-10">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryTile label="Rows" value={rows?.toLocaleString() ?? "-"} highlight />
        <SummaryTile label="Columns" value={columns ?? "-"} highlight />
        <SummaryTile label="Numerical Columns" value={Object.values(dtypes || {}).filter((dtype) => dtype.includes("float") || dtype.includes("int")).length} />
        <SummaryTile label="Categorical Columns" value={Object.values(dtypes || {}).filter((dtype) => dtype.includes("object") || dtype.includes("category")).length} />
      </div>

      <div className="mt-8 rounded-2xl border border-white/5 bg-white/5 p-6">
        <h3 className="text-lg font-semibold text-white">Missing Values Snapshot</h3>
        <p className="text-sm text-slate-400">Columns with highest missing percentages</p>
        <div className="mt-4 space-y-2">
          {Object.entries(missingSummary || {})
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([column, count]) => (
              <div key={column} className="flex items-center justify-between text-sm text-slate-300">
                <span>{column}</span>
                <span className="text-right text-slate-400">{count} missing</span>
              </div>
            ))}
          {!missingSummary && <p className="text-sm text-slate-400">No missing values detected.</p>}
        </div>
      </div>
    </section>
  );
};

export default DatasetSummary;

