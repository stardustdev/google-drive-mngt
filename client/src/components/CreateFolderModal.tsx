import { useState } from "react";
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
  const { createFolder, isCreatingFolder } = useFiles(parentFolderId);
  const { toast } = useToast();

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
        description: `${folderName} has been created successfully`,
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create new folder</DialogTitle>
            <DialogDescription>
              Enter a name for your new folder.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="folderName" className="text-right">
                Name
              </Label>
              <Input
                id="folderName"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder="Untitled folder"
                className="col-span-3"
                autoFocus
              />
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
              {isSubmitting || isCreatingFolder ? 
                "Creating..." : 
                "Create folder"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};