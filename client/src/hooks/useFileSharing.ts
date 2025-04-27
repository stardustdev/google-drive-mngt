import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ShareFileParams {
  fileId: string;
  emailAddress: string;
  role?: 'reader' | 'writer' | 'commenter';
  sendNotification?: boolean;
}

interface Permission {
  id: string;
  emailAddress: string;
  role: string;
  type: string;
}

export function useFileSharing(fileId?: string) {
  const { toast } = useToast();

  // Get file permissions
  const { 
    data: permissions, 
    isLoading: isLoadingPermissions,
    isError: isPermissionsError,
    error: permissionsError,
    refetch: refetchPermissions
  } = useQuery({
    queryKey: ['permissions', fileId],
    queryFn: async () => {
      if (!fileId) return [];
      return apiRequest('GET', `/api/drive/permissions/${fileId}`);
    },
    enabled: !!fileId,
  });

  // Share file with user
  const { 
    mutate: shareFile,
    isPending: isSharing, 
  } = useMutation({
    mutationFn: async ({ fileId, emailAddress, role = 'reader', sendNotification = true }: ShareFileParams) => {
      const response = await apiRequest(
        'POST', 
        `/api/drive/share`,
        { fileId, emailAddress, role, sendNotification }
      );
      return response;
    },
    onSuccess: () => {
      toast({
        title: "File shared",
        description: "The file has been shared successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['permissions', fileId] });
    },
    onError: (error: Error) => {
      toast({
        title: "Sharing failed",
        description: error.message || "Failed to share the file",
        variant: "destructive",
      });
    },
  });

  // Remove permission
  const { 
    mutate: removePermission, 
    isPending: isRemoving 
  } = useMutation({
    mutationFn: async (permissionId: string) => {
      if (!fileId) throw new Error("File ID is required");
      return apiRequest(
        'DELETE', 
        `/api/drive/permissions/${fileId}/${permissionId}`
      );
    },
    onSuccess: () => {
      toast({
        title: "Permission removed",
        description: "The user's access to this file has been removed",
      });
      queryClient.invalidateQueries({ queryKey: ['permissions', fileId] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error removing permission",
        description: error.message || "Failed to remove the user's access",
        variant: "destructive",
      });
    },
  });

  return {
    permissions,
    isLoadingPermissions,
    isPermissionsError,
    permissionsError,
    refetchPermissions,
    shareFile,
    isSharing,
    removePermission,
    isRemoving
  };
}