import { apiRequest } from "./queryClient";

/**
 * Upload a file to Google Drive
 * @param file The file to upload
 * @returns The uploaded file details
 */
export const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/drive/upload", {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Failed to upload file (${response.status})`);
  }

  return response.json();
};

/**
 * Download a file from Google Drive
 * @param fileId The ID of the file to download
 * @param fileName The name to use for the downloaded file
 */
export const downloadFile = async (fileId: string, fileName: string) => {
  try {
    // Create a hidden anchor element
    const link = document.createElement("a");
    link.href = `/api/drive/download/${fileId}`;
    link.download = fileName;
    link.style.display = "none";
    
    // Add to DOM, click it, and remove it
    document.body.appendChild(link);
    link.click();
    
    // Small delay before removing the element
    setTimeout(() => {
      document.body.removeChild(link);
    }, 100);
  } catch (error) {
    console.error("Error downloading file:", error);
    throw error;
  }
};

/**
 * Delete a file from Google Drive
 * @param fileId The ID of the file to delete
 */
export const deleteFile = async (fileId: string) => {
  await apiRequest("DELETE", `/api/drive/files/${fileId}`, undefined);
};

/**
 * Format file size in a human-readable format
 * @param bytes Size in bytes
 * @returns Formatted string (e.g., "1.5 MB")
 */
export const formatFileSize = (bytes?: number | string) => {
  if (!bytes) return "Unknown size";
  
  const numBytes = typeof bytes === "string" ? parseInt(bytes, 10) : bytes;
  
  if (numBytes === 0) return "0 Bytes";
  
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(numBytes) / Math.log(1024));
  
  return `${parseFloat((numBytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`;
};
