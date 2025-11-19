import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

export const uploadDataset = (file) => {
  const formData = new FormData();
  formData.append("file", file);

  return apiClient.post("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const processDataset = (payload) => apiClient.post("/process", payload);

export const downloadDataset = (fileId, config = {}) =>
  apiClient.get(`/download/${fileId}`, {
    responseType: "blob",
    ...config,
  });

export default {
  uploadDataset,
  processDataset,
  downloadDataset,
};

