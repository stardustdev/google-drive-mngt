import { FC, useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { uploadFile } from "@/lib/fileUtils";
import { Folder } from "lucide-react";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete: () => void;
  parentFolderId?: string;
}

interface SelectedFile {
  file: File;
  id: string;
}

interface FolderInfo {
  id: string;
  name: string;
}

const UploadModal: FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onUploadComplete,
  parentFolderId,
}) => {
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [parentFolder, setParentFolder] = useState<FolderInfo | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Fetch parent folder info if we have an ID
  useEffect(() => {
    if (parentFolderId && isOpen) {
      const fetchFolderInfo = async () => {
        try {
          const response = await fetch(`/api/drive/files/${parentFolderId}`, {
            credentials: "include",
          });

          if (response.ok) {
            const folder = await response.json();
            setParentFolder({
              id: folder.id,
              name: folder.name,
            });
          }
        } catch (error) {
          console.error("Error fetching folder info:", error);
        }
      };

      fetchFolderInfo();
    } else {
      setParentFolder(null);
    }
  }, [parentFolderId, isOpen]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files).map((file) => ({
        file,
        id: crypto.randomUUID(),
      }));
      setSelectedFiles([...selectedFiles, ...newFiles]);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = (id: string) => {
    setSelectedFiles(selectedFiles.filter((f) => f.id !== id));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setProgress(0);

    try {
      const totalFiles = selectedFiles.length;
      let completedFiles = 0;

      for (const selectedFile of selectedFiles) {
        // Pass the parent folder ID if available
        await uploadFile(selectedFile.file, parentFolderId);
        completedFiles++;
        setProgress(Math.round((completedFiles / totalFiles) * 100));
      }

      const locationText = parentFolder ? ` to ${parentFolder.name}` : "";

      toast({
        title: "Upload complete",
        description: `Successfully uploaded ${totalFiles} file${totalFiles !== 1 ? "s" : ""}${locationText}`,
      });

      onUploadComplete();
      handleClose();
    } catch (error) {
      toast({
        title: "Upload failed",
        description: (error as Error)?.message || "Failed to upload files",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (!isUploading) {
      setSelectedFiles([]);
      setProgress(0);
      onClose();
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload files</DialogTitle>
          {parentFolder && (
            <DialogDescription className="flex items-center gap-2 mt-1 text-sm">
              <Folder className="h-4 w-4" />
              <span>
                Uploading to:{" "}
                <span className="font-medium">{parentFolder.name}</span>
              </span>
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="py-4">
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const files = Array.from(e.dataTransfer.files).map((file) => ({
                file,
                id: crypto.randomUUID(),
              }));
              setSelectedFiles([...selectedFiles, ...files]);
            }}
          >
            <span className="material-icons text-5xl text-gray-400 mb-2">
              cloud_upload
            </span>
            <h4 className="font-medium mb-1">Drag files here</h4>
            <p className="text-sm text-gray-500 mb-4">
              or click to browse files
            </p>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
              multiple
            />
            <Button
              onClick={handleBrowseClick}
              variant="default"
              className="btn-theme-primary"
            >
              Browse Files
            </Button>
          </div>

          {selectedFiles.length > 0 && (
            <div className="mt-4 space-y-3">
              <h5 className="font-medium text-sm">Selected Files</h5>
              {selectedFiles.map((selectedFile) => (
                <div
                  key={selectedFile.id}
                  className="flex items-center justify-between bg-gray-50 p-3 rounded-md"
                >
                  <div className="flex items-center overflow-hidden">
                    <span className="material-icons text-google-blue mr-3">
                      description
                    </span>
                    <div className="overflow-hidden">
                      <div
                        className="font-medium text-sm truncate"
                        title={selectedFile.file.name}
                      >
                        {selectedFile.file.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatFileSize(selectedFile.file.size)}
                      </div>
                    </div>
                  </div>
                  <button
                    className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                    onClick={() => handleRemoveFile(selectedFile.id)}
                    disabled={isUploading}
                  >
                    <span className="material-icons">close</span>
                  </button>
                </div>
              ))}
            </div>
          )}

          {isUploading && (
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Uploading...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between sm:justify-between">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={selectedFiles.length === 0 || isUploading}
            className="btn-theme-primary"
          >
            {isUploading ? "Uploading..." : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UploadModal;
