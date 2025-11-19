import { createContext, useContext, useMemo, useState } from "react";

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [uploadMeta, setUploadMeta] = useState(null);
  const [columnPreferences, setColumnPreferences] = useState({});
  const [processingResult, setProcessingResult] = useState(null);

  const resetWorkflow = () => {
    setUploadMeta(null);
    setColumnPreferences({});
    setProcessingResult(null);
  };

  const value = useMemo(
    () => ({
      uploadMeta,
      setUploadMeta,
      fileId: uploadMeta?.file_id ?? null,
      columnPreferences,
      setColumnPreferences,
      processingResult,
      setProcessingResult,
      resetWorkflow,
    }),
    [uploadMeta, columnPreferences, processingResult]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useAppContext must be used within AppProvider");
  }
  return ctx;
};

