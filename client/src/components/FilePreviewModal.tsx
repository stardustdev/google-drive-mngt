import { FC, useState, useEffect } from "react";
import { DriveFile } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { formatFileSize } from "@/lib/fileUtils";
import FileTypeIcon from "./FileTypeIcon";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface FilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: DriveFile | null;
}

export const FilePreviewModal: FC<FilePreviewModalProps> = ({
  isOpen,
  onClose,
  file
}) => {
  const [previewContent, setPreviewContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Clear states when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setPreviewContent(null);
      setError(null);
    }
  }, [isOpen]);

  // Fetch preview content when file changes
  useEffect(() => {
    async function fetchPreviewContent() {
      if (!file || !isOpen) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Skip preview for certain files that can't be previewed as text
        const skipPreviewTypes = [
          'application/vnd.google-apps.folder',
          'application/zip',
          'application/x-rar-compressed',
          'application/x-tar',
          'application/x-7z-compressed',
          'application/x-gzip',
          'application/x-bzip2',
          'application/x-java-archive',
          'application/x-executable',
          'application/vnd.android.package-archive',
          'application/octet-stream',
          'application/x-msdownload',
          'application/x-msdos-program',
        ];
        
        // Skip large files (> 2MB)
        const fileSizeInMB = file.size ? parseInt(file.size) / (1024 * 1024) : 0;
        if (fileSizeInMB > 2) {
          setError("File is too large to preview. Please download the file instead.");
          setIsLoading(false);
          return;
        }
        
        if (skipPreviewTypes.includes(file.mimeType)) {
          setError("This file type cannot be previewed. Please download the file instead.");
          setIsLoading(false);
          return;
        }
        
        // Fetch the file content
        const response = await fetch(`/api/drive/files/${file.id}/content`);
        
        if (!response.ok) {
          throw new Error("Failed to load file content");
        }
        
        // For images, we'll display the image directly
        if (file.mimeType.startsWith('image/')) {
          const blob = await response.blob();
          const imageUrl = URL.createObjectURL(blob);
          setPreviewContent(imageUrl);
        } else {
          // For text files, we'll display the text content
          const content = await response.text();
          setPreviewContent(content);
        }
      } catch (err) {
        console.error("Error fetching preview:", err);
        setError("Failed to load file preview. Please try again later.");
        toast({
          title: "Error",
          description: "Failed to load file preview",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchPreviewContent();
  }, [file, isOpen, toast]);
  
  if (!file) return null;
  
  const isImage = file.mimeType.startsWith('image/');
  const isText = file.mimeType.startsWith('text/') || 
                file.mimeType.includes('json') || 
                file.mimeType.includes('xml') || 
                file.mimeType.includes('javascript') || 
                file.mimeType.includes('css') || 
                file.mimeType.includes('html');
  const isPdf = file.mimeType === 'application/pdf';
  const isVideo = file.mimeType.startsWith('video/');
  const isAudio = file.mimeType.startsWith('audio/');
  
  const formattedDate = file.modifiedTime 
    ? format(new Date(file.modifiedTime), "MMMM d, yyyy h:mm a")
    : "Unknown date";
  
  const formattedSize = formatFileSize(file.size);
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl w-full h-[80vh] flex flex-col p-0">
        <DialogHeader className="p-4 border-b">
          <div className="flex items-center space-x-3">
            <FileTypeIcon mimeType={file.mimeType} size="medium" />
            <div>
              <DialogTitle className="text-lg font-semibold text-foreground">{file.name}</DialogTitle>
              <div className="text-xs mt-1 text-muted-foreground">
                {formattedSize} • Modified: {formattedDate}
              </div>
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto p-0 bg-muted/30">
          {isLoading ? (
            <div className="flex items-center justify-center w-full h-full">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="mt-2 text-sm text-muted-foreground">Loading preview...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center w-full h-full">
              <div className="text-center p-6 max-w-md">
                <div className="text-destructive mb-2">
                  <span className="material-icons text-4xl">error_outline</span>
                </div>
                <p className="text-destructive font-medium">{error}</p>
                <p className="mt-4 text-sm text-muted-foreground">
                  Try downloading the file to view its contents.
                </p>
                <div className="mt-6">
                  <a 
                    href={`/api/drive/files/${file.id}/download?filename=${encodeURIComponent(file.name)}`}
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
                    download={file.name}
                  >
                    Download File
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <>
              {isImage && previewContent && (
                <div className="flex items-center justify-center w-full h-full p-4">
                  <img 
                    src={previewContent} 
                    alt={file.name} 
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              )}
              
              {isText && previewContent && (
                <pre className="p-4 text-sm overflow-auto font-mono bg-card w-full h-full whitespace-pre-wrap">
                  {previewContent}
                </pre>
              )}
              
              {isPdf && (
                <div className="w-full h-full">
                  <iframe 
                    src={`/api/drive/files/${file.id}/content`}
                    className="w-full h-full border-0"
                    title={file.name}
                  />
                </div>
              )}
              
              {isVideo && (
                <div className="flex items-center justify-center w-full h-full bg-black">
                  <video 
                    controls 
                    className="max-w-full max-h-full"
                    src={`/api/drive/files/${file.id}/content`}
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              )}
              
              {isAudio && (
                <div className="flex items-center justify-center w-full h-full p-8">
                  <div className="w-full max-w-lg">
                    <div className="mb-8 text-center">
                      <FileTypeIcon mimeType={file.mimeType} size="large" />
                      <h3 className="mt-4 text-lg font-medium">{file.name}</h3>
                    </div>
                    <audio 
                      controls 
                      className="w-full"
                      src={`/api/drive/files/${file.id}/content`}
                    >
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                </div>
              )}
              
              {!isImage && !isText && !isPdf && !isVideo && !isAudio && (
                <div className="flex items-center justify-center w-full h-full">
                  <div className="text-center p-6 max-w-md">
                    <FileTypeIcon mimeType={file.mimeType} size="large" />
                    <p className="mt-4 text-sm text-muted-foreground">
                      Preview not available for this file type.
                    </p>
                    <div className="mt-6">
                      <a 
                        href={`/api/drive/files/${file.id}/download?filename=${encodeURIComponent(file.name)}`}
                        className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
                        download={file.name}
                      >
                        Download File
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        
        <div className="p-3 border-t flex justify-end">
          <div className="space-x-2">
            <a 
              href={`/api/drive/files/${file.id}/download?filename=${encodeURIComponent(file.name)}`}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-primary hover:text-primary-foreground hover:bg-primary border border-border rounded-md transition-colors"
              download={file.name}
            >
              <span className="material-icons mr-2 text-sm">download</span>
              Download
            </a>
            
            <a 
              href={file.webViewLink || "#"} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-primary hover:text-primary-foreground hover:bg-primary border border-border rounded-md transition-colors"
            >
              <span className="material-icons mr-2 text-sm">open_in_new</span>
              Open in Drive
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};