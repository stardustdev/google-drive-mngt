import { useState, useEffect } from "react";
import { DriveFile } from "@/lib/types";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Folder, Loader2 } from "lucide-react";

interface MoveFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: DriveFile | null;
  onMoveComplete: () => void;
}

export const MoveFileModal = ({
  isOpen,
  onClose,
  file,
  onMoveComplete,
}: MoveFileModalProps) => {
  const [folders, setFolders] = useState<DriveFile[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string>("");
  const [isLoadingFolders, setIsLoadingFolders] = useState(false);
  const [removeFromCurrentFolder, setRemoveFromCurrentFolder] = useState(true);
  const { moveFile, isMovingFile } = useFiles();
  const { toast } = useToast();

  // Load available folders when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const fetchFolders = async () => {
      try {
        setIsLoadingFolders(true);
        const response = await fetch('/api/drive/files', {
          credentials: 'include',
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch folders');
        }
        
        const allFiles: DriveFile[] = await response.json();
        
        // Filter out folders only and exclude the current file if it's a folder
        const foldersList = allFiles.filter(item => 
          item.mimeType === 'application/vnd.google-apps.folder' && 
          item.id !== file?.id
        );
        
        setFolders(foldersList);
        
        // Default to the first folder if available
        if (foldersList.length > 0 && !selectedFolderId) {
          setSelectedFolderId(foldersList[0].id);
        }
      } catch (error) {
        console.error('Error fetching folders:', error);
        toast({
          title: 'Error',
          description: 'Failed to load destination folders',
          variant: 'destructive',
        });
      } finally {
        setIsLoadingFolders(false);
      }
    };

    fetchFolders();
  }, [isOpen, file, toast, selectedFolderId]);

  const handleMove = async () => {
    if (!file || !selectedFolderId) {
      toast({
        title: 'Error',
        description: 'Please select a destination folder',
        variant: 'destructive',
      });
      return;
    }

    try {
      await moveFile({
        fileId: file.id,
        targetFolderId: selectedFolderId,
        removeFromParents: removeFromCurrentFolder,
      });

      toast({
        title: 'Success',
        description: `"${file.name}" moved successfully`,
      });

      onMoveComplete();
      onClose();
    } catch (error) {
      console.error('Error moving file:', error);
      toast({
        title: 'Error',
        description: 'Failed to move file',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Move file</DialogTitle>
          <DialogDescription>
            Select a destination folder for "{file?.name}"
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="folder">Destination folder</Label>
            {isLoadingFolders ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading folders...</span>
              </div>
            ) : folders.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                No folders available to move to
              </div>
            ) : (
              <Select
                value={selectedFolderId}
                onValueChange={setSelectedFolderId}
                disabled={isMovingFile}
              >
                <SelectTrigger id="folder">
                  <SelectValue placeholder="Select a folder" />
                </SelectTrigger>
                <SelectContent>
                  {folders.map((folder) => (
                    <SelectItem key={folder.id} value={folder.id}>
                      <div className="flex items-center">
                        <Folder className="h-4 w-4 mr-2" />
                        {folder.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="removeFromCurrent"
              checked={removeFromCurrentFolder}
              onCheckedChange={(checked) => setRemoveFromCurrentFolder(!!checked)}
              disabled={isMovingFile}
            />
            <Label htmlFor="removeFromCurrent">
              Remove from current folder
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isMovingFile}>
            Cancel
          </Button>
          <Button
            onClick={handleMove}
            disabled={isMovingFile || !selectedFolderId || folders.length === 0}
          >
            {isMovingFile ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Moving...
              </>
            ) : (
              "Move"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};