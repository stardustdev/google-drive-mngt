import { useState, useEffect } from "react";
import { useFiles } from "@/hooks/useFiles";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Folder, Loader2 } from "lucide-react";

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  parentFolderId?: string;
  onCreateComplete: () => void;
}

export const CreateFolderModal = ({
  isOpen,
  onClose,
  parentFolderId,
  onCreateComplete,
}: CreateFolderModalProps) => {
  const [folderName, setFolderName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [parentFolderName, setParentFolderName] = useState<string | null>(null);
  const { createFolder, isCreatingFolder } = useFiles(parentFolderId);
  const { toast } = useToast();

  // Reset the folder name when the modal opens
  useEffect(() => {
    if (isOpen) {
      setFolderName("");
    }
  }, [isOpen]);

  // Fetch parent folder name if we have an ID
  useEffect(() => {
    if (parentFolderId) {
      const fetchParentFolder = async () => {
        try {
          const response = await fetch(`/api/drive/files/${parentFolderId}`, {
            credentials: 'include',
          });
          
          if (response.ok) {
            const folderData = await response.json();
            setParentFolderName(folderData.name);
          }
        } catch (error) {
          console.error("Error fetching parent folder:", error);
          setParentFolderName(null);
        }
      };
      
      fetchParentFolder();
    } else {
      setParentFolderName(null);
    }
  }, [parentFolderId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!folderName.trim()) {
      toast({
        title: "Folder name required",
        description: "Please enter a name for your folder",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      await createFolder({
        name: folderName.trim(),
        parentId: parentFolderId,
      });
      
      toast({
        title: "Folder created",
        description: `"${folderName}" has been created successfully`,
      });
      
      setFolderName("");
      onCreateComplete();
      onClose();
    } catch (error) {
      console.error("Error creating folder:", error);
      toast({
        title: "Failed to create folder",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Submit on Enter
    if (e.key === 'Enter' && folderName.trim()) {
      handleSubmit(e as any);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create new folder</DialogTitle>
            <DialogDescription>
              Enter a name for your new folder
              {parentFolderName && (
                <> in <span className="font-medium text-foreground">{parentFolderName}</span></>
              )}
              .
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-6">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 rounded-md">
                  <Folder className="h-7 w-7 text-blue-500" />
                </div>
              </div>
              <div className="flex-grow">
                <Input
                  id="folderName"
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Untitled folder"
                  className="w-full"
                  autoFocus
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isCreatingFolder || !folderName.trim()}
            >
              {isSubmitting || isCreatingFolder ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create folder"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};