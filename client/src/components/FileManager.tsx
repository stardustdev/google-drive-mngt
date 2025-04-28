import { FC, useState, useEffect } from "react";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import { useFiles } from "@/hooks/useFiles";
import FileCard from "./FileCard";
import FileTable from "./FileTable";
import LoadingState from "./LoadingState";
import EmptyState from "./EmptyState";
import ErrorState from "./ErrorState";
import UploadModal from "./UploadModal";
import DeleteModal from "./DeleteModal";
import { CreateFolderModal } from "./CreateFolderModal";
import { MoveFileModal } from "./MoveFileModal";
import { ShareFileModal } from "./ShareFileModal";
import { FilePreviewModal } from "./FilePreviewModal";
import { FolderNavigation } from "./FolderNavigation";
import { SearchFiles } from "./SearchFiles";
import { StorageUsage } from "./StorageUsage";
import { DriveFile } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  UploadCloud,
  FolderPlus,
  Grid,
  List,
  RefreshCw,
  FolderOpen,
  Eye,
} from "lucide-react";

const FileManager: FC = () => {
  const { user } = useGoogleAuth();
  const [currentFolderId, setCurrentFolderId] = useState<string | undefined>(
    undefined,
  );
  const { files, isLoading, isError, error, refetch } =
    useFiles(currentFolderId);

  // We'll use the StorageUsage component instead of fetching storage info here

  // Modal states
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [isMoveFileModalOpen, setIsMoveFileModalOpen] = useState(false);
  const [isShareFileModalOpen, setIsShareFileModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<DriveFile | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Handlers
  const handleNavigateToFolder = (folderId?: string) => {
    setCurrentFolderId(folderId);
  };

  const handleOpenUploadModal = () => {
    setIsUploadModalOpen(true);
  };

  const handleOpenCreateFolderModal = () => {
    setIsCreateFolderModalOpen(true);
  };

  const handleDeleteFile = (file: DriveFile) => {
    setSelectedFile(file);
    setIsDeleteModalOpen(true);
  };

  const handleMoveFile = (file: DriveFile) => {
    setSelectedFile(file);
    setIsMoveFileModalOpen(true);
  };

  const handleShareFile = (file: DriveFile) => {
    setSelectedFile(file);
    setIsShareFileModalOpen(true);
  };

  const handlePreviewFile = (file: DriveFile) => {
    // Don't allow preview for folders
    if (file.mimeType === "application/vnd.google-apps.folder") return;

    setSelectedFile(file);
    setIsPreviewModalOpen(true);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const handleFileAction = (action: string, file: DriveFile) => {
    switch (action) {
      case "delete":
        handleDeleteFile(file);
        break;
      case "move":
        handleMoveFile(file);
        break;
      case "share":
        handleShareFile(file);
        break;
      case "preview":
        handlePreviewFile(file);
        break;
      case "open-folder":
        if (file.mimeType === "application/vnd.google-apps.folder") {
          setCurrentFolderId(file.id);
        }
        break;
      default:
        break;
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Top Bar with Actions */}
      <div className="bg-background border-b border-border py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <h2 className="text-lg font-medium text-foreground">
            {currentFolderId ? "Folder Contents" : "My Files"}
          </h2>
          {files && (
            <div className="text-sm text-muted-foreground">
              ({files.length} items)
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1 btn-theme-primary"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw
              size={16}
              className={isRefreshing ? "animate-spin" : ""}
            />
            <span className="hidden md:inline">Refresh</span>
          </Button>

          <SearchFiles onFileAction={handleFileAction} />

          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1 btn-theme-primary"
            onClick={handleOpenCreateFolderModal}
          >
            <FolderPlus size={16} />
            <span className="hidden md:inline">New Folder</span>
          </Button>

          <Button
            variant="default"
            size="sm"
            className="flex items-center gap-1 btn-theme-filled"
            onClick={handleOpenUploadModal}
          >
            <UploadCloud size={16} />
            <span>Upload</span>
          </Button>

          <div className="hidden md:block">
            <Tabs
              defaultValue="list"
              value={viewMode}
              onValueChange={(value) => setViewMode(value as "list" | "grid")}
              className="w-[200px]"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="list" className="flex items-center gap-2">
                  <List size={15} />
                  <span>List</span>
                </TabsTrigger>
                <TabsTrigger value="grid" className="flex items-center gap-2">
                  <Grid size={15} />
                  <span>Grid</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Folder Navigation and Storage */}
      {user && (
        <div className="pt-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <FolderNavigation
              currentFolderId={currentFolderId}
              onNavigate={handleNavigateToFolder}
            />

            <div className="flex items-center justify-between gap-2">
              <div className="md:hidden">
                <Tabs
                  defaultValue="list"
                  value={viewMode}
                  onValueChange={(value) =>
                    setViewMode(value as "list" | "grid")
                  }
                  className="w-[160px]"
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger
                      value="list"
                      className="flex items-center gap-1"
                    >
                      <List size={14} />
                      <span>List</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="grid"
                      className="flex items-center gap-1"
                    >
                      <Grid size={14} />
                      <span>Grid</span>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <StorageUsage />
            </div>
          </div>
        </div>
      )}

      {/* File List Container */}
      <div className="flex-1 overflow-auto pt-4">
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
            message={
              currentFolderId
                ? "This folder is empty"
                : "Upload files to your Google Drive to see them here"
            }
            icon="folder_open"
            onUploadClick={handleOpenUploadModal}
          />
        ) : viewMode === "list" ? (
          <FileTable files={files || []} onAction={handleFileAction} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {files?.map((file) => (
              <FileCard key={file.id} file={file} onAction={handleFileAction} />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadComplete={() => refetch()}
        parentFolderId={currentFolderId}
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

      <CreateFolderModal
        isOpen={isCreateFolderModalOpen}
        onClose={() => setIsCreateFolderModalOpen(false)}
        parentFolderId={currentFolderId}
        onCreateComplete={() => refetch()}
      />

      <MoveFileModal
        isOpen={isMoveFileModalOpen}
        onClose={() => setIsMoveFileModalOpen(false)}
        file={selectedFile}
        onMoveComplete={() => {
          setIsMoveFileModalOpen(false);
          refetch();
        }}
      />

      <ShareFileModal
        isOpen={isShareFileModalOpen}
        onClose={() => setIsShareFileModalOpen(false)}
        file={selectedFile}
      />

      <FilePreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        file={selectedFile}
      />
    </div>
  );
};

export default FileManager;
