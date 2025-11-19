const imputationOptions = [
  { value: "auto", label: "Auto detect" },
  { value: "mean", label: "Mean" },
  { value: "median", label: "Median" },
  { value: "mode", label: "Mode" },
  { value: "drop", label: "Drop column" },
];

const encodingOptions = [
  { value: "auto", label: "Auto detect" },
  { value: "label", label: "Label Encode" },
  { value: "onehot", label: "One-hot Encode" },
];

const ColumnConfigurator = ({ column, config, onChange }) => {
  const isNumeric = column.dtype.includes("float") || column.dtype.includes("int");
  const isDate = column.dtype.includes("datetime");
  const encodingDisabled = isNumeric || isDate;

  const handleChange = (field, value) => {
    onChange(column.column, { ...config, [field]: value });
  };

  return (
    <div className="rounded-2xl border border-white/5 bg-white/5 p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-white">{column.column}</p>
          <p className="text-xs uppercase tracking-wide text-slate-400">{column.dtype}</p>
        </div>
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-300">
          {column.missing_pct}% missing
        </span>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-xs text-slate-400">
        <div>
          <dt className="uppercase tracking-wide">Unique</dt>
          <dd className="text-base font-semibold text-slate-100">{column.unique}</dd>
        </div>
        <div>
          <dt className="uppercase tracking-wide">Suggestion</dt>
          <dd className="text-base font-semibold text-accent">{column.suggested_imputation || "Auto"}</dd>
        </div>
      </dl>

      <div className="mt-5 space-y-3">
        <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400">
          Imputation Strategy
          <select
            className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900/40 px-3 py-2 text-sm text-white outline-none focus:border-accent"
            value={config.imputation}
            onChange={(event) => handleChange("imputation", event.target.value)}
          >
            {imputationOptions.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400">
          Encoding Strategy
          <select
            className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900/40 px-3 py-2 text-sm text-white outline-none focus:border-accent disabled:opacity-50"
            value={config.encoding}
            onChange={(event) => handleChange("encoding", event.target.value)}
            disabled={encodingDisabled}
          >
            {encodingOptions.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
};

export default ColumnConfigurator;

