import { FC } from "react";
import { DriveFile } from "@/lib/types";
import { downloadFile } from "@/lib/fileUtils";
import { useToast } from "@/hooks/use-toast";

interface FileActionsMenuProps {
  file: DriveFile;
  onAction: (action: string) => void;
}

const FileActionsMenu: FC<FileActionsMenuProps> = ({ file, onAction }) => {
  const { toast } = useToast();
  const isFolder = file.mimeType === "application/vnd.google-apps.folder";

  const handleDownload = async () => {
    try {
      await downloadFile(file.id, file.name);
      onAction('download');
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Failed to download the file",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="absolute right-0 mt-1 bg-card rounded-md shadow-lg py-1 w-48 z-10 border border-border transform -translate-x-full">
      {isFolder ? (
        <button 
          className="flex items-center w-full px-4 py-2 text-sm text-foreground hover:bg-muted"
          onClick={() => onAction('open-folder')}
        >
          <span className="material-icons mr-3 text-muted-foreground">folder_open</span>
          Open Folder
        </button>
      ) : (
        <button 
          className="flex items-center w-full px-4 py-2 text-sm text-foreground hover:bg-muted"
          onClick={handleDownload}
        >
          <span className="material-icons mr-3 text-muted-foreground">download</span>
          Download
        </button>
      )}
      
      <a 
        href={file.webViewLink || "#"} 
        target="_blank" 
        rel="noopener noreferrer"
        className="flex items-center px-4 py-2 text-sm text-foreground hover:bg-muted"
      >
        <span className="material-icons mr-3 text-muted-foreground">open_in_new</span>
        Open in Drive
      </a>
      
      <button 
        className="flex items-center w-full px-4 py-2 text-sm text-foreground hover:bg-muted"
        onClick={() => onAction('share')}
      >
        <span className="material-icons mr-3 text-muted-foreground">share</span>
        Share
      </button>
      
      <button 
        className="flex items-center w-full px-4 py-2 text-sm text-foreground hover:bg-muted"
        onClick={() => onAction('move')}
      >
        <span className="material-icons mr-3 text-muted-foreground">drive_file_move</span>
        Move
      </button>
      
      <div className="border-t border-border"></div>
      
      <button 
        className="flex items-center w-full px-4 py-2 text-sm text-google-red hover:bg-muted"
        onClick={() => onAction('delete')}
      >
        <span className="material-icons mr-3 text-google-red">delete</span>
        Delete
      </button>
    </div>
  );
};

export default FileActionsMenu;
