import { useEffect, useState } from "react";
import { useFiles } from "@/hooks/useFiles";
import { DriveFile } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ChevronRight, Home, Folder } from "lucide-react";

interface FolderNavigationProps {
  currentFolderId?: string;
  onNavigate: (folderId?: string) => void;
}

interface BreadcrumbItem {
  id: string;
  name: string;
}

export const FolderNavigation = ({
  currentFolderId,
  onNavigate,
}: FolderNavigationProps) => {
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!currentFolderId) {
      setBreadcrumbs([]);
      return;
    }

    // Function to fetch folder details
    const fetchFolderDetails = async (folderId: string) => {
      try {
        setIsLoading(true);
        
        const response = await fetch(`/api/drive/files/${folderId}`, {
          credentials: 'include',
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch folder details (${response.status})`);
        }
        
        const folder: DriveFile = await response.json();
        
        if (folder.mimeType === "application/vnd.google-apps.folder") {
          return folder;
        } else {
          throw new Error("Not a folder");
        }
      } catch (error) {
        console.error("Error fetching folder details:", error);
        toast({
          title: "Error",
          description: "Could not load folder details",
          variant: "destructive",
        });
        return null;
      } finally {
        setIsLoading(false);
      }
    };

    // Function to build breadcrumb path
    const buildBreadcrumbs = async () => {
      const folder = await fetchFolderDetails(currentFolderId);
      if (folder) {
        setBreadcrumbs([{ id: folder.id, name: folder.name }]);
      }
    };

    buildBreadcrumbs();
  }, [currentFolderId, toast]);

  const handleNavigateToRoot = () => {
    onNavigate(undefined);
  };

  return (
    <div className="flex items-center p-2 bg-background/60 rounded-md border mb-4 overflow-x-auto">
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center gap-1"
        onClick={handleNavigateToRoot}
        disabled={isLoading}
      >
        <Home size={16} />
        <span>Home</span>
      </Button>
      
      {breadcrumbs.length > 0 && (
        <>
          <ChevronRight size={16} className="mx-1 text-muted-foreground" />
          <div className="flex items-center">
            <Folder size={16} className="mr-1" />
            <span>{breadcrumbs[0]?.name}</span>
          </div>
        </>
      )}
    </div>
  );
};