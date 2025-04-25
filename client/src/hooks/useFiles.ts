import { useQuery, useMutation, UseQueryResult } from "@tanstack/react-query";
import { DriveFile } from "@/lib/types";
import { queryClient } from "@/lib/queryClient";

// Interface for folder creation parameters
interface CreateFolderParams {
  name: string;
  parentId?: string;
}

// Interface for file movement parameters
interface MoveFileParams {
  fileId: string;
  targetFolderId: string;
  removeFromParents?: boolean;
}

export function useFiles(folderId?: string) {
  // Get files from the root or a specific folder
  const filesQuery: UseQueryResult<DriveFile[], Error> = useQuery<DriveFile[]>({
    queryKey: folderId ? ['/api/drive/folders', folderId, 'files'] : ['/api/drive/files'],
    queryFn: async () => {
      const url = folderId 
        ? `/api/drive/folders/${folderId}/files` 
        : '/api/drive/files';
        
      const response = await fetch(url, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Failed to fetch files (${response.status})`);
      }
      
      return response.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });

  // Search files
  const useSearchFiles = (query: string) => {
    return useQuery<DriveFile[], Error>({
      queryKey: ['/api/drive/search', query],
      queryFn: async () => {
        if (!query || query.trim() === '') {
          return [];
        }
      
        const response = await fetch(`/api/drive/search?q=${encodeURIComponent(query)}`, {
          credentials: 'include',
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || `Failed to search files (${response.status})`);
        }
        
        return response.json();
      },
      enabled: !!query && query.trim() !== '',
      staleTime: 1000 * 60 * 5, // 5 minutes
    });
  };

  // Delete file mutation
  const deleteFileMutation = useMutation({
    mutationFn: async (fileId: string) => {
      const response = await fetch(`/api/drive/files/${fileId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Failed to delete file (${response.status})`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate any folder-specific queries as well as the general files query
      if (folderId) {
        queryClient.invalidateQueries({ queryKey: ['/api/drive/folders', folderId, 'files'] });
      }
      queryClient.invalidateQueries({ queryKey: ['/api/drive/files'] });
    },
  });

  // Upload file mutation
  const uploadFileMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/drive/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Failed to upload file (${response.status})`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate any folder-specific queries as well as the general files query
      if (folderId) {
        queryClient.invalidateQueries({ queryKey: ['/api/drive/folders', folderId, 'files'] });
      }
      queryClient.invalidateQueries({ queryKey: ['/api/drive/files'] });
    },
  });
  
  // Create folder mutation
  const createFolderMutation = useMutation({
    mutationFn: async ({ name, parentId }: CreateFolderParams) => {
      const response = await fetch('/api/drive/folders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, parentId }),
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Failed to create folder (${response.status})`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate any folder-specific queries as well as the general files query
      if (folderId) {
        queryClient.invalidateQueries({ queryKey: ['/api/drive/folders', folderId, 'files'] });
      }
      queryClient.invalidateQueries({ queryKey: ['/api/drive/files'] });
    },
  });
  
  // Move file mutation
  const moveFileMutation = useMutation({
    mutationFn: async ({ fileId, targetFolderId, removeFromParents = false }: MoveFileParams) => {
      const response = await fetch(`/api/drive/files/${fileId}/move`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ targetFolderId, removeFromParents }),
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Failed to move file (${response.status})`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate affected folder queries and the general files query
      queryClient.invalidateQueries({ queryKey: ['/api/drive/folders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/drive/files'] });
    },
  });

  return {
    files: filesQuery.data,
    isLoading: filesQuery.isLoading,
    isError: filesQuery.isError,
    error: filesQuery.error,
    refetch: filesQuery.refetch,
    // File operations
    deleteFile: deleteFileMutation.mutateAsync,
    uploadFile: uploadFileMutation.mutateAsync,
    isDeletingFile: deleteFileMutation.isPending,
    isUploadingFile: uploadFileMutation.isPending,
    // Folder operations
    createFolder: createFolderMutation.mutateAsync,
    isCreatingFolder: createFolderMutation.isPending,
    // File movement
    moveFile: moveFileMutation.mutateAsync,
    isMovingFile: moveFileMutation.isPending,
    // Additional utility
    useSearchFiles,
  };
}
