import { useEffect, useState } from "react";
import { useFiles } from "@/hooks/useFiles";
import { DriveFile } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ChevronRight, Home, Folder } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
      }
    };

    // Function to build the full breadcrumb path recursively
    const buildBreadcrumbPath = async (folderId: string, path: BreadcrumbItem[] = []) => {
      const folder = await fetchFolderDetails(folderId);
      
      if (!folder) return path;
      
      // Add current folder to the beginning of the path
      const updatedPath = [{ id: folder.id, name: folder.name }, ...path];
      
      // If the folder has a parent, recursively build the path
      if (folder.parents && folder.parents.length > 0) {
        // Check if it's not the root folder ("My Drive" folder is usually the root)
        const parentId = folder.parents[0];
        
        // If we detect a loop (perhaps due to API peculiarities), stop recursion
        if (path.some(item => item.id === parentId)) {
          return updatedPath;
        }
        
        return await buildBreadcrumbPath(parentId, updatedPath);
      }
      
      return updatedPath;
    };

    // Function to build breadcrumb path
    const buildBreadcrumbs = async () => {
      setIsLoading(true);
      
      try {
        const crumbs = await buildBreadcrumbPath(currentFolderId);
        setBreadcrumbs(crumbs);
      } catch (error) {
        console.error("Error building breadcrumbs:", error);
        toast({
          title: "Error",
          description: "Could not build folder path",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    buildBreadcrumbs();
  }, [currentFolderId, toast]);

  const handleNavigateToRoot = () => {
    onNavigate(undefined);
  };

  const handleNavigateToFolder = (folderId: string) => {
    onNavigate(folderId);
  };

  return (
    <div className="flex items-center p-2 bg-background/60 rounded-md border overflow-x-auto">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-1 shrink-0 btn-theme-primary"
              onClick={handleNavigateToRoot}
              disabled={isLoading}
            >
              <Home size={16} />
              <span>My Drive</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Return to root folder</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      {breadcrumbs.length > 0 && breadcrumbs.map((item, index) => (
        <div key={item.id} className="flex items-center">
          <ChevronRight size={16} className="mx-1 text-muted-foreground shrink-0" />
          <Button
            variant="ghost"
            size="sm"
            className={`flex items-center gap-1 p-1 h-auto shrink-0 ${
              index === breadcrumbs.length - 1 
                ? "font-medium text-foreground" 
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => handleNavigateToFolder(item.id)}
            disabled={isLoading}
          >
            <Folder size={16} className="mr-1 text-blue-500 shrink-0" />
            <span className="truncate max-w-[150px]" title={item.name}>
              {item.name}
            </span>
          </Button>
        </div>
      ))}
      
      {isLoading && (
        <div className="ml-2 text-xs text-muted-foreground animate-pulse">
          Loading path...
        </div>
      )}
    </div>
  );
};