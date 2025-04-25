import { FC, useState } from "react";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import { useFiles } from "@/hooks/useFiles";
import FileCard from "./FileCard";
import LoadingState from "./LoadingState";
import EmptyState from "./EmptyState";
import ErrorState from "./ErrorState";
import UploadModal from "./UploadModal";
import DeleteModal from "./DeleteModal";
import { DriveFile } from "@/lib/types";

const FileManager: FC = () => {
  const { user } = useGoogleAuth();
  const { files, isLoading, isError, error, refetch } = useFiles();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<DriveFile | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const handleOpenUploadModal = () => {
    setIsUploadModalOpen(true);
  };

  const handleDeleteFile = (file: DriveFile) => {
    setSelectedFile(file);
    setIsDeleteModalOpen(true);
  };

  const handleFileAction = (action: string, file: DriveFile) => {
    switch (action) {
      case 'delete':
        handleDeleteFile(file);
        break;
      default:
        break;
    }
  };

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      {/* Tabs and Actions */}
      <div className="bg-background border-b border-border px-4 md:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <h2 className="text-lg font-medium text-foreground">My Files</h2>
          {files && <div className="text-sm text-muted-foreground">({files.length} items)</div>}
        </div>
        
        <div className="flex items-center space-x-2">
          <button 
            onClick={handleOpenUploadModal}
            className="flex items-center space-x-2 bg-google-blue hover:bg-blue-600 text-white px-4 py-2 rounded-md"
          >
            <span className="material-icons">upload_file</span>
            <span>Upload</span>
          </button>
          
          <div className="hidden md:flex items-center space-x-1">
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-full text-foreground ${viewMode === 'list' ? 'bg-muted' : 'hover:bg-muted/50'}`}
            >
              <span className="material-icons">view_list</span>
            </button>
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-full text-foreground ${viewMode === 'grid' ? 'bg-muted' : 'hover:bg-muted/50'}`}
            >
              <span className="material-icons">grid_view</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* File List Container */}
      <div className="flex-1 overflow-auto p-4 md:p-8">
        {isLoading ? (
          <LoadingState />
        ) : isError ? (
          <ErrorState 
            message={(error as Error)?.message || "Failed to load files"} 
            onRetry={refetch} 
          />
        ) : !user ? (
          <EmptyState 
            message="Please login to view your files" 
            icon="account_circle"
          />
        ) : files?.length === 0 ? (
          <EmptyState 
            message="Upload files to your Google Drive to see them here" 
            icon="folder_open"
            onUploadClick={handleOpenUploadModal}
          />
        ) : (
          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4`}>
            {files?.map((file) => (
              <FileCard 
                key={file.id} 
                file={file} 
                onAction={handleFileAction} 
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <UploadModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
        onUploadComplete={() => refetch()}
      />

      <DeleteModal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
        file={selectedFile} 
        onDeleteComplete={() => {
          setIsDeleteModalOpen(false);
          refetch();
        }}
      />
    </div>
  );
};

export default FileManager;
