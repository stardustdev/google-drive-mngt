import { FC, useState } from "react";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DriveFile } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { deleteFile } from "@/lib/fileUtils";

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: DriveFile | null;
  onDeleteComplete: () => void;
}

const DeleteModal: FC<DeleteModalProps> = ({ 
  isOpen, 
  onClose, 
  file, 
  onDeleteComplete 
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!file) return;
    
    setIsDeleting(true);
    try {
      await deleteFile(file.id);
      toast({
        title: "File deleted",
        description: `${file.name} has been deleted successfully`,
      });
      onDeleteComplete();
    } catch (error) {
      toast({
        title: "Deletion failed",
        description: (error as Error)?.message || "Failed to delete file",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (!file) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete file?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{file.name}"? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-google-red hover:bg-red-600"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteModal;
