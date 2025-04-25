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
    <div className="absolute right-0 mt-1 bg-white rounded-md shadow-lg py-1 w-48 z-10">
      <button 
        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        onClick={handleDownload}
      >
        <span className="material-icons mr-3 text-gray-500">download</span>
        Download
      </button>
      <a 
        href={file.webViewLink || "#"} 
        target="_blank" 
        rel="noopener noreferrer"
        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
      >
        <span className="material-icons mr-3 text-gray-500">open_in_new</span>
        Open in Drive
      </a>
      <div className="border-t border-gray-100"></div>
      <button 
        className="flex items-center w-full px-4 py-2 text-sm text-google-red hover:bg-gray-100"
        onClick={() => onAction('delete')}
      >
        <span className="material-icons mr-3 text-google-red">delete</span>
        Delete
      </button>
    </div>
  );
};

export default FileActionsMenu;
