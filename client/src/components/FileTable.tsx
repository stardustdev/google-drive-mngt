import { FC, useState, useRef, useEffect } from "react";
import { format } from "date-fns";
import FileTypeIcon from "./FileTypeIcon";
import FileActionsMenu from "./FileActionsMenu";
import { DriveFile } from "@/lib/types";
import { formatFileSize } from "@/lib/fileUtils";

interface FileTableProps {
  files: DriveFile[];
  onAction: (action: string, file: DriveFile) => void;
}

const FileTable: FC<FileTableProps> = ({ files, onAction }) => {
  return (
    <div className="w-full overflow-auto rounded-md border border-border">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-muted/50 border-b border-border">
            <th className="py-3 px-4 text-left text-sm font-medium text-foreground">Name</th>
            <th className="py-3 px-4 text-left text-sm font-medium text-foreground">Modified</th>
            <th className="py-3 px-4 text-left text-sm font-medium text-foreground">Size</th>
            <th className="py-3 px-4 text-right text-sm font-medium text-foreground w-[60px]">Actions</th>
          </tr>
        </thead>
        <tbody>
          {files.map((file) => (
            <FileTableRow key={file.id} file={file} onAction={onAction} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

interface FileTableRowProps {
  file: DriveFile;
  onAction: (action: string, file: DriveFile) => void;
}

const FileTableRow: FC<FileTableRowProps> = ({ file, onAction }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Format the modified date
  const formattedDate = file.modifiedTime 
    ? format(new Date(file.modifiedTime), "MMM d, yyyy")
    : "Unknown date";
  
  // Format the file size
  const formattedSize = formatFileSize(file.size);
  
  // Determine if file is a folder
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
  
  const handleRowClick = () => {
    if (isFolder) {
      onAction('open-folder', file);
    }
  };
  
  return (
    <tr 
      className={`border-b border-border hover:bg-muted/30 ${isFolder ? 'cursor-pointer' : ''}`}
      onClick={handleRowClick}
    >
      <td className="py-3 px-4">
        <div className="flex items-center space-x-3">
          <div className={isFolder ? 'text-primary' : ''}>
            <FileTypeIcon mimeType={file.mimeType} size="small" />
          </div>
          <span className="font-medium truncate max-w-[300px] inline-block" title={file.name}>
            {file.name}
          </span>
        </div>
      </td>
      <td className="py-3 px-4 text-sm text-muted-foreground">{formattedDate}</td>
      <td className="py-3 px-4 text-sm text-muted-foreground">{isFolder ? '-' : formattedSize}</td>
      <td className="py-3 px-4 text-right">
        <div className="relative inline-block" ref={menuRef}>
          <button 
            className="p-1.5 rounded-full hover:bg-accent hover:text-accent-foreground transition-colors btn-theme-primary"
            onClick={handleMenuToggle}
          >
            <span className="material-icons text-lg">more_vert</span>
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
      </td>
    </tr>
  );
};

export default FileTable;