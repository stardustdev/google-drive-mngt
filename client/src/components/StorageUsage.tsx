import React from 'react';
import { useStorageInfo } from '@/hooks/useStorageInfo';
import { Progress } from '@/components/ui/progress';
import { HardDrive } from 'lucide-react';

interface StorageUsageProps {
  compact?: boolean;
}

export const StorageUsage: React.FC<StorageUsageProps> = ({ compact = false }) => {
  const { storageInfo, isLoading } = useStorageInfo();
  
  if (isLoading || !storageInfo) {
    return null;
  }
  
  if (compact) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <HardDrive size={16} className="text-primary" />
        <div>
          <span>{storageInfo.usagePercentage}%</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <HardDrive size={16} className="text-primary" />
      <div className="flex flex-col">
        <div className="flex items-center gap-1">
          <span>{storageInfo.formattedUsage}</span>
          <span>of</span>
          <span>{storageInfo.formattedLimit}</span>
          <span>used</span>
          <span>({storageInfo.usagePercentage}%)</span>
        </div>
        <Progress 
          value={storageInfo.usagePercentage} 
          className="h-1.5 w-full md:w-48" 
        />
      </div>
    </div>
  );
};