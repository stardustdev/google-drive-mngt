import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface StorageInfo {
  usage: number;
  limit: number;
  usageInDrive: number;
  usageInTrash: number;
  formattedUsage: string;
  formattedLimit: string;
  usagePercentage: number;
}

export function useStorageInfo() {
  const { 
    data: storageInfo, 
    isLoading, 
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['storage-info'],
    queryFn: async () => {
      const data = await apiRequest('GET', '/api/drive/storage');
      return data as unknown as StorageInfo;
    },
    retry: 1,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    storageInfo,
    isLoading,
    isError,
    error,
    refetch
  };
}