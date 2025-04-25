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
    <div className="flex flex-col items-center justify-center h-80">
      <span className="material-icons text-muted-foreground text-6xl">{icon}</span>
      <h3 className="mt-4 text-xl font-medium text-foreground">No files found</h3>
      <p className="mt-2 text-muted-foreground">{message}</p>
      
      {onUploadClick && (
        <Button 
          onClick={onUploadClick}
          className="mt-4 flex items-center space-x-2 bg-google-blue hover:bg-blue-600 text-white"
        >
          <span className="material-icons">upload_file</span>
          <span>Upload a file</span>
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
