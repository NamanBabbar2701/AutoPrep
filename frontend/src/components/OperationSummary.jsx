const OperationSummary = ({ operations }) => {
  if (!operations) return null;

  const metrics = [
    { label: "Dropped Columns", value: operations.dropped_columns?.length ?? 0 },
    { label: "Scaled Columns", value: operations.scaled_columns?.length ?? 0 },
    { label: "Duplicate Rows Removed", value: operations.duplicates_removed ?? 0 },
    { label: "Outliers Removed", value: operations.outliers_removed ?? 0 },
  ];

  return (
    <section className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        {metrics.map(({ label, value }) => (
          <div key={label} className="rounded-2xl border border-white/5 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
            <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-white/5 bg-white/5 p-6">
        <h3 className="text-lg font-semibold text-white">Imputations</h3>
        <div className="mt-4 grid gap-2 text-sm text-slate-300">
          {Object.entries(operations.imputations || {}).length === 0 && <p className="text-slate-500">No imputations applied.</p>}
          {Object.entries(operations.imputations || {}).map(([column, strategy]) => (
            <div key={column} className="flex items-center justify-between">
              <span>{column}</span>
              <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">{strategy}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-white/5 bg-white/5 p-6">
        <h3 className="text-lg font-semibold text-white">Encodings</h3>
        <div className="mt-4 grid gap-2 text-sm text-slate-300">
          {Object.entries(operations.encodings || {}).length === 0 && <p className="text-slate-500">No encoding applied.</p>}
          {Object.entries(operations.encodings || {}).map(([column, strategy]) => (
            <div key={column} className="flex items-center justify-between">
              <span>{column}</span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white">{strategy}</span>
            </div>
          ))}
        </div>
      </div>

      {operations.date_columns?.length ? (
        <div className="rounded-2xl border border-white/5 bg-white/5 p-6">
          <h3 className="text-lg font-semibold text-white">Date Features</h3>
          <p className="mt-2 text-sm text-slate-300">Converted columns: {operations.date_columns.join(", ")}</p>
        </div>
      ) : null}
    </section>
  );
};

export default OperationSummary;

