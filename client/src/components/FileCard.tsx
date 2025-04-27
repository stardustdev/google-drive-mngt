import { FC, useState, useRef, useEffect } from "react";
import { format } from "date-fns";
import FileTypeIcon from "./FileTypeIcon";
import FileActionsMenu from "./FileActionsMenu";
import { DriveFile } from "@/lib/types";
import { formatFileSize } from "@/lib/fileUtils";

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
  
  // Format the file size
  const formattedSize = formatFileSize(file.size);
  
  // Determine if file is an image or folder
  const isImage = file.mimeType?.startsWith("image/");
  const isFolder = file.mimeType === "application/vnd.google-apps.folder";
  
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
  
  const handleCardClick = () => {
    if (isFolder) {
      onAction('open-folder', file);
    }
  };
  
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isFolder) {
      onAction('open-folder', file);
    } else {
      onAction('preview', file);
    }
  };
  
  return (
    <div 
      className={`bg-card rounded-lg border border-border overflow-hidden hover:shadow-md transition-all hover:border-primary ${isFolder ? 'cursor-pointer' : 'cursor-pointer'}`}
      onClick={handleCardClick}
      onDoubleClick={handleDoubleClick}
    >
      {/* Thumbnail Area */}
      <div className="h-40 bg-muted flex items-center justify-center border-b border-border p-4">
        {isImage && file.thumbnailLink ? (
          <img 
            src={file.thumbnailLink} 
            alt={`${file.name} thumbnail`} 
            className="max-h-full object-contain"
          />
        ) : (
          <div className={`${isFolder ? 'text-primary' : ''}`}>
            <FileTypeIcon mimeType={file.mimeType} size="large" />
          </div>
        )}
      </div>
      
      {/* File Info */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="overflow-hidden">
            <h3 className="font-medium truncate text-foreground" title={file.name}>
              {isFolder && (
                <span className="material-icons mr-1 text-primary align-text-bottom" style={{ fontSize: '1.1rem' }}>
                  folder
                </span>
              )}
              {file.name}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">Modified: {formattedDate}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isFolder ? 'Folder' : formattedSize}
            </p>
          </div>
          
          {/* File Actions */}
          <div className="relative" ref={menuRef}>
            <button 
              className="p-1.5 rounded-full hover:bg-accent hover:text-accent-foreground transition-colors btn-theme-primary"
              onClick={handleMenuToggle}
            >
              <span className="material-icons">more_vert</span>
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
