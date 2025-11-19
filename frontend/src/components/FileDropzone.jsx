import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

const FileDropzone = ({ onFileSelect, selectedFile, isUploading }) => {
  const handleDrop = useCallback(
    (acceptedFiles) => {
      if (acceptedFiles?.length) {
        onFileSelect(acceptedFiles[0]);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    multiple: false,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.ms-excel": [".xls", ".xlsx"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
    },
  });

  return (
    <div
      {...getRootProps()}
      className={`rounded-2xl border-2 border-dashed p-8 transition ${
        isDragActive ? "border-accent bg-accent/10" : "border-white/10 bg-white/5"
      }`}
    >
      <input {...getInputProps()} />
      <div className="text-center">
        <p className="text-lg font-semibold text-slate-100">Drag & drop your dataset</p>
        <p className="text-sm text-slate-400 mt-2">CSV or Excel files up to 25 MB</p>
        <button
          type="button"
          className="mt-6 rounded-full bg-accent px-5 py-2 text-sm font-semibold text-slate-900 shadow-soft hover:bg-accentDark"
          disabled={isUploading}
        >
          {selectedFile ? "Replace file" : "Browse files"}
        </button>
        {selectedFile && (
          <p className="mt-4 text-sm text-slate-300">
            Selected: <span className="font-medium">{selectedFile.name}</span>
          </p>
        )}
      </div>
    </div>
  );
};

export default FileDropzone;

