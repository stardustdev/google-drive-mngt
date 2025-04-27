import { FC, useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DriveFile } from "@/lib/types";
import { downloadFile } from "@/lib/fileUtils";
import { MIME_TYPE_ICONS } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Download, X, ExternalLink } from "lucide-react";

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
  const { toast } = useToast();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewContent, setPreviewContent] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && file) {
      setPreviewError(null);
      setPreviewContent(null);
      loadPreview();
    } else {
      // Clean up resources when modal closes
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, file]);

  const loadPreview = async () => {
    if (!file) return;
    
    setIsLoading(true);
    setPreviewError(null);
    
    try {
      // For Google Docs, Sheets, Slides, use the webViewLink directly
      if (
        file.mimeType === "application/vnd.google-apps.document" ||
        file.mimeType === "application/vnd.google-apps.spreadsheet" ||
        file.mimeType === "application/vnd.google-apps.presentation" ||
        file.mimeType === "application/vnd.google-apps.form"
      ) {
        setPreviewUrl(file.webViewLink || null);
        setIsLoading(false);
        return;
      }
      
      // For images, PDFs, text files, fetch and create an object URL
      if (isPreviewable(file.mimeType)) {
        const response = await fetch(`/api/drive/files/${file.id}/content`, {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error(`Failed to load file: ${response.statusText}`);
        }
        
        // For text files, display the content directly
        if (isTextFile(file.mimeType)) {
          const text = await response.text();
          setPreviewContent(text);
          setIsLoading(false);
          return;
        }
        
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
      } else {
        setPreviewError("This file type cannot be previewed");
      }
    } catch (error) {
      console.error("Error loading preview:", error);
      setPreviewError(error instanceof Error ? error.message : "Failed to load preview");
      toast({
        title: "Preview Error",
        description: "Could not load file preview",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!file) return;
    
    try {
      await downloadFile(file.id, file.name);
      toast({
        title: "Download Started",
        description: `${file.name} is being downloaded`
      });
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "Download Failed",
        description: "Could not download file",
        variant: "destructive"
      });
    }
  };
  
  const openInNewTab = () => {
    if (file?.webViewLink) {
      window.open(file.webViewLink, '_blank');
    }
  };

  const isPreviewable = (mimeType: string): boolean => {
    return (
      mimeType.startsWith("image/") ||
      mimeType === "application/pdf" ||
      isTextFile(mimeType) ||
      mimeType.startsWith("video/") ||
      mimeType.startsWith("audio/")
    );
  };
  
  const isTextFile = (mimeType: string): boolean => {
    return (
      mimeType === "text/plain" ||
      mimeType === "text/html" ||
      mimeType === "text/css" ||
      mimeType === "application/json" ||
      mimeType === "text/javascript" ||
      mimeType === "application/javascript" ||
      mimeType === "text/markdown" ||
      mimeType === "application/xml" ||
      mimeType === "text/csv"
    );
  };
  
  const getFileIcon = (mimeType: string) => {
    const iconInfo = MIME_TYPE_ICONS[mimeType] || MIME_TYPE_ICONS["default"];
    return iconInfo.icon;
  };
  
  const renderPreviewContent = () => {
    if (!file) return null;
    
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-80">
          <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading preview...</p>
        </div>
      );
    }
    
    if (previewError) {
      const fileIcon = getFileIcon(file.mimeType);
      return (
        <div className="flex flex-col items-center justify-center h-80">
          <div className="mb-6 text-6xl text-primary">
            <span className="material-icons" style={{ fontSize: '6rem' }}>{fileIcon}</span>
          </div>
          <p className="text-muted-foreground mb-2">{previewError}</p>
          <Button variant="outline" onClick={handleDownload} className="mt-4">
            <Download className="mr-2 h-4 w-4" /> Download Instead
          </Button>
        </div>
      );
    }
    
    // For Google Docs, Sheets, Slides, Form - display iframe with webViewLink
    if (
      file.mimeType === "application/vnd.google-apps.document" ||
      file.mimeType === "application/vnd.google-apps.spreadsheet" ||
      file.mimeType === "application/vnd.google-apps.presentation" ||
      file.mimeType === "application/vnd.google-apps.form"
    ) {
      return (
        <div className="relative w-full h-[60vh]">
          {previewUrl ? (
            <iframe 
              src={previewUrl}
              className="w-full h-full border-none" 
              title={file.name}
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Preview not available</p>
            </div>
          )}
        </div>
      );
    }
    
    // For text files
    if (isTextFile(file.mimeType) && previewContent !== null) {
      return (
        <div className="w-full h-[60vh] overflow-auto">
          <pre className="p-4 text-sm bg-muted/50 rounded-md w-full h-full overflow-auto whitespace-pre-wrap">
            {previewContent}
          </pre>
        </div>
      );
    }
    
    // For images
    if (file.mimeType.startsWith("image/") && previewUrl) {
      return (
        <div className="flex justify-center items-center max-h-[60vh] overflow-auto">
          <img 
            src={previewUrl} 
            alt={file.name} 
            className="max-w-full max-h-full object-contain"
          />
        </div>
      );
    }
    
    // For PDFs
    if (file.mimeType === "application/pdf" && previewUrl) {
      return (
        <div className="w-full h-[60vh]">
          <iframe
            src={previewUrl}
            className="w-full h-full border-none"
            title={file.name}
          />
        </div>
      );
    }
    
    // For videos
    if (file.mimeType.startsWith("video/") && previewUrl) {
      return (
        <div className="w-full max-h-[60vh] flex justify-center">
          <video
            src={previewUrl}
            controls
            className="max-w-full max-h-full"
          >
            Your browser does not support the video tag.
          </video>
        </div>
      );
    }
    
    // For audio
    if (file.mimeType.startsWith("audio/") && previewUrl) {
      return (
        <div className="w-full flex flex-col items-center justify-center py-8">
          <div className="text-6xl text-primary mb-6">
            <span className="material-icons" style={{ fontSize: '6rem' }}>music_note</span>
          </div>
          <p className="mb-4 font-medium">{file.name}</p>
          <audio
            src={previewUrl}
            controls
            className="w-full max-w-md"
          >
            Your browser does not support the audio tag.
          </audio>
        </div>
      );
    }
    
    // Default fallback
    return (
      <div className="flex flex-col items-center justify-center h-80">
        <div className="mb-6 text-6xl text-primary">
          <span className="material-icons" style={{ fontSize: '6rem' }}>{getFileIcon(file.mimeType)}</span>
        </div>
        <p className="text-muted-foreground mb-2">No preview available for this file type</p>
        <Button variant="outline" onClick={handleDownload} className="mt-4">
          <Download className="mr-2 h-4 w-4" /> Download Instead
        </Button>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full max-h-[90vh] flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="flex items-center space-x-2 truncate">
            {file && (
              <>
                <span className="material-icons text-primary mr-2">
                  {getFileIcon(file.mimeType)}
                </span>
                <span className="truncate">{file.name}</span>
              </>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto">
          {renderPreviewContent()}
        </div>
        
        <DialogFooter className="flex justify-between items-center border-t pt-4 mt-4">
          <div className="flex items-center text-sm text-muted-foreground">
            {file && <span>{file.mimeType}</span>}
          </div>
          <div className="flex space-x-2">
            {file?.webViewLink && !isTextFile(file.mimeType) && !file.mimeType.startsWith("image/") && (
              <Button variant="outline" onClick={openInNewTab}>
                <ExternalLink className="mr-2 h-4 w-4" /> Open in Google
              </Button>
            )}
            <Button variant="outline" onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" /> Download
            </Button>
            <Button variant="ghost" onClick={onClose}>
              <X className="mr-2 h-4 w-4" /> Close
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};