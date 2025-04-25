import { useQuery, useMutation } from "@tanstack/react-query";
import { DriveFile } from "@/lib/types";
import { queryClient } from "@/lib/queryClient";

export function useFiles() {
  const { 
    data: files, 
    isLoading, 
    isError, 
    error,
    refetch 
  } = useQuery<DriveFile[]>({
    queryKey: ['/api/drive/files'],
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });

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
      queryClient.invalidateQueries({ queryKey: ['/api/drive/files'] });
    },
  });

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
      queryClient.invalidateQueries({ queryKey: ['/api/drive/files'] });
    },
  });

  return {
    files,
    isLoading,
    isError,
    error,
    refetch,
    deleteFile: deleteFileMutation.mutateAsync,
    uploadFile: uploadFileMutation.mutateAsync,
    isDeletingFile: deleteFileMutation.isPending,
    isUploadingFile: uploadFileMutation.isPending,
  };
}
