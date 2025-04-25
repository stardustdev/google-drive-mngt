// Google Drive API constants
export const GOOGLE_API_BASE_URL = "https://www.googleapis.com/drive/v3";

// Mime type mappings
export const MIME_TYPE_ICONS: Record<string, { icon: string; color: string }> = {
  // Documents
  "application/pdf": { icon: "picture_as_pdf", color: "text-google-red" },
  "application/msword": { icon: "description", color: "text-google-blue" },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": { 
    icon: "description", 
    color: "text-google-blue" 
  },
  
  // Spreadsheets
  "application/vnd.ms-excel": { icon: "table_chart", color: "text-google-green" },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": { 
    icon: "table_chart", 
    color: "text-google-green" 
  },
  "application/vnd.google-apps.spreadsheet": { icon: "table_chart", color: "text-google-green" },
  
  // Presentations
  "application/vnd.ms-powerpoint": { icon: "slideshow", color: "text-google-yellow" },
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": { 
    icon: "slideshow", 
    color: "text-google-yellow" 
  },
  "application/vnd.google-apps.presentation": { icon: "slideshow", color: "text-google-yellow" },
  
  // Google specific
  "application/vnd.google-apps.document": { icon: "description", color: "text-google-blue" },
  "application/vnd.google-apps.folder": { icon: "folder", color: "text-gray-500" },
  
  // Archives
  "application/zip": { icon: "folder_zip", color: "text-gray-700" },
  "application/x-rar-compressed": { icon: "folder_zip", color: "text-gray-700" },
  
  // Default
  "default": { icon: "description", color: "text-gray-500" }
};
