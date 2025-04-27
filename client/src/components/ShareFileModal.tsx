import { FC, useState } from "react";
import { DriveFile } from "@/lib/types";
import { useFileSharing } from "@/hooks/useFileSharing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, UserPlus, X, UserMinus, Check } from "lucide-react";

interface ShareFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: DriveFile | null;
}

export const ShareFileModal: FC<ShareFileModalProps> = ({
  isOpen,
  onClose,
  file,
}) => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"reader" | "writer" | "commenter">("reader");
  const [sendNotification, setSendNotification] = useState(true);
  const [activeTab, setActiveTab] = useState<"share" | "manage">("share");

  const {
    permissions,
    isLoadingPermissions,
    shareFile,
    isSharing,
    removePermission,
    isRemoving,
  } = useFileSharing(file?.id);

  const handleShare = () => {
    if (!file || !email) return;
    
    shareFile({
      fileId: file.id,
      emailAddress: email,
      role,
      sendNotification,
    }, {
      onSuccess: () => {
        setEmail("");
        setRole("reader");
      }
    });
  };

  const handleRemovePermission = (permissionId: string) => {
    removePermission(permissionId);
  };

  if (!file) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share "{file.name}"</DialogTitle>
          <DialogDescription>
            Share this {file.mimeType === "application/vnd.google-apps.folder" ? "folder" : "file"} with others and set their access level
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="share" value={activeTab} onValueChange={(value) => setActiveTab(value as "share" | "manage")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="share">Share</TabsTrigger>
            <TabsTrigger value="manage">Manage Access</TabsTrigger>
          </TabsList>
          
          <TabsContent value="share" className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="grid flex-1 gap-2">
                <Label htmlFor="email" className="sr-only">
                  Email
                </Label>
                <Input
                  id="email"
                  placeholder="Add people by email address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
              <Select value={role} onValueChange={(value) => setRole(value as "reader" | "writer" | "commenter")}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Permission" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reader">Viewer</SelectItem>
                  <SelectItem value="commenter">Commenter</SelectItem>
                  <SelectItem value="writer">Editor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="sendNotification"
                checked={sendNotification}
                onCheckedChange={(checked) => setSendNotification(checked as boolean)}
              />
              <label
                htmlFor="sendNotification"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Notify people
              </label>
            </div>
            
            <DialogFooter className="sm:justify-start">
              <Button
                type="submit"
                onClick={handleShare}
                disabled={!email || isSharing}
                className="flex items-center gap-2"
              >
                {isSharing ? (
                  <>Processing...</>
                ) : (
                  <>
                    <UserPlus size={16} />
                    Share
                  </>
                )}
              </Button>
            </DialogFooter>
          </TabsContent>
          
          <TabsContent value="manage" className="space-y-4">
            {isLoadingPermissions ? (
              <div className="text-center py-4">Loading permissions...</div>
            ) : permissions && Array.isArray(permissions) && permissions.length > 0 ? (
              <div className="space-y-2">
                {permissions.map((permission: any) => (
                  <div
                    key={permission.id}
                    className="flex items-center justify-between p-2 rounded-md bg-muted/50"
                  >
                    <div className="flex items-center gap-2">
                      <Mail size={16} className="text-muted-foreground" />
                      <span className="text-sm">{permission.emailAddress}</span>
                      <span className="text-xs text-muted-foreground capitalize">
                        ({permission.role})
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemovePermission(permission.id)}
                      disabled={isRemoving}
                    >
                      <UserMinus size={16} className="text-destructive" />
                      <span className="sr-only">Remove</span>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                This file is not shared with anyone
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};