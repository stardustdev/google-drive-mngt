import { useState, useEffect } from "react";
import { useFiles } from "@/hooks/useFiles";
import { DriveFile } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, X } from "lucide-react";
import FileCard from "@/components/FileCard";
import EmptyState from "@/components/EmptyState";

interface SearchFilesProps {
  onFileAction: (action: string, file: DriveFile) => void;
}

export const SearchFiles = ({ onFileAction }: SearchFilesProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  
  const { useSearchFiles } = useFiles();
  const { data: searchResults, isLoading, error } = useSearchFiles(debouncedQuery);

  // Debounce search input to avoid excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setDebouncedQuery("");
  };

  const handleFileAction = (action: string, file: DriveFile) => {
    onFileAction(action, file);
    if (action === "delete" || action === "download") {
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1 btn-theme-primary">
          <Search className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Search Files</DialogTitle>
          <DialogDescription>
            Search for files across your Google Drive
          </DialogDescription>
        </DialogHeader>
        
        <div className="relative">
          <Input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={handleInputChange}
            className="pr-10"
            autoFocus
          />
          {searchQuery && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-0 top-0"
              onClick={handleClearSearch}
            >
              <X size={16} />
            </Button>
          )}
        </div>
        
        <div className="mt-4 flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="space-y-4">
              {Array(3).fill(0).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-4 w-[150px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center p-4 text-red-500">
              Error: Could not search files
            </div>
          ) : searchResults && searchResults.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {searchResults.map((file) => (
                <FileCard
                  key={file.id}
                  file={file}
                  onAction={(action) => handleFileAction(action, file)}
                />
              ))}
            </div>
          ) : debouncedQuery ? (
            <div className="text-center p-8">
              <EmptyState
                message="No files match your search"
                icon="search"
              />
            </div>
          ) : (
            <div className="text-center p-8 text-muted-foreground">
              Enter a search term to find files
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};