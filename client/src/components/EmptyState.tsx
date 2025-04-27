import { FC } from "react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  message: string;
  icon?: string;
  onUploadClick?: () => void;
}

const EmptyState: FC<EmptyStateProps> = ({ 
  message, 
  icon = "folder_open", 
  onUploadClick 
}) => {
  return (
    <div className="flex flex-col items-center justify-center h-80 bg-background/50 rounded-lg border border-border/50 p-8">
      <span className="material-icons text-primary text-6xl opacity-80">{icon}</span>
      <h3 className="mt-4 text-xl font-medium text-foreground">No files found</h3>
      <p className="mt-2 text-center text-muted-foreground max-w-md">{message}</p>
      
      {onUploadClick && (
        <Button 
          onClick={onUploadClick}
          className="mt-6 flex items-center space-x-2 btn-theme-filled"
        >
          <span className="material-icons">upload_file</span>
          <span>Upload a file</span>
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
