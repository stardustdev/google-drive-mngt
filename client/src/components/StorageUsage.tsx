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
    <div className="flex items-center gap-3 text-sm bg-background/60 p-2 rounded-md border border-border">
      <HardDrive size={18} className="text-primary" />
      <div className="flex flex-col">
        <div className="flex items-center gap-1 text-foreground">
          <span className="font-medium">{storageInfo.formattedUsage}</span>
          <span className="text-muted-foreground">of</span>
          <span className="font-medium">{storageInfo.formattedLimit}</span>
          <span className="text-muted-foreground">used</span>
          <span className="ml-1 text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
            {storageInfo.usagePercentage}%
          </span>
        </div>
        <Progress 
          value={storageInfo.usagePercentage} 
          className="h-1.5 w-full md:w-60 mt-1.5" 
        />
      </div>
    </div>
  );
};