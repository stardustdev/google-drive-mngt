import { FC, useState, useRef, useEffect } from "react";
import { format } from "date-fns";
import FileTypeIcon from "./FileTypeIcon";
import FileActionsMenu from "./FileActionsMenu";
import { DriveFile } from "@/lib/types";

interface FileCardProps {
  file: DriveFile;
  onAction: (action: string, file: DriveFile) => void;
}

const FileCard: FC<FileCardProps> = ({ file, onAction }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Format the modified date
  const formattedDate = file.modifiedTime 
    ? format(new Date(file.modifiedTime), "MMM d, yyyy")
    : "Unknown date";
  
  // Determine if file is an image
  const isImage = file.mimeType?.startsWith("image/");
  
  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  const handleMenuToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Thumbnail Area */}
      <div className="h-40 bg-gray-50 flex items-center justify-center border-b p-4">
        {isImage && file.thumbnailLink ? (
          <img 
            src={file.thumbnailLink} 
            alt={`${file.name} thumbnail`} 
            className="max-h-full object-contain"
          />
        ) : (
          <FileTypeIcon mimeType={file.mimeType} size="large" />
        )}
      </div>
      
      {/* File Info */}
      <div className="p-3">
        <div className="flex items-start justify-between">
          <div className="overflow-hidden">
            <h3 className="font-medium truncate" title={file.name}>{file.name}</h3>
            <p className="text-sm text-gray-500 mt-1">Modified: {formattedDate}</p>
          </div>
          
          {/* File Actions */}
          <div className="relative" ref={menuRef}>
            <button 
              className="p-1.5 rounded-full hover:bg-google-gray"
              onClick={handleMenuToggle}
            >
              <span className="material-icons text-gray-500">more_vert</span>
            </button>
            
            {isMenuOpen && (
              <FileActionsMenu 
                file={file} 
                onAction={(action) => {
                  onAction(action, file);
                  setIsMenuOpen(false);
                }} 
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileCard;
