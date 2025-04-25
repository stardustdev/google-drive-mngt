import { FC } from "react";
import { Link, useLocation } from "wouter";
import { useFiles } from "@/hooks/useFiles";

const Sidebar: FC = () => {
  const [location] = useLocation();
  const { files } = useFiles();
  
  // Calculate storage usage - in a real app this would come from the API
  const storageUsed = "3.2 GB";
  const storageTotal = "15 GB";
  const storagePercentage = 45; // percentage used
  
  const navItems = [
    { 
      label: "My Files", 
      icon: "folder", 
      path: "/", 
      active: location === "/" 
    },
    { 
      label: "Upload", 
      icon: "cloud_upload", 
      path: "/upload", 
      active: location === "/upload" 
    },
    { 
      label: "Recent", 
      icon: "history", 
      path: "/recent", 
      active: location === "/recent" 
    },
    { 
      label: "Trash", 
      icon: "delete", 
      path: "/trash", 
      active: location === "/trash" 
    },
  ];

  return (
    <aside className="w-64 bg-background border-r border-border hidden md:flex flex-col h-screen">
      <div className="p-4 flex items-center space-x-3 border-b border-border">
        <img 
          src="https://www.gstatic.com/images/branding/product/1x/drive_48dp.png" 
          alt="Google Drive logo" 
          className="w-8 h-8" 
        />
        <h1 className="text-xl font-medium text-foreground">Drive Manager</h1>
      </div>
      
      <nav className="p-2 flex-grow">
        <ul>
          {navItems.map((item) => (
            <li key={item.path}>
              <Link href={item.path}>
                <a className={`flex items-center space-x-3 p-3 rounded-md text-foreground ${
                  item.active 
                    ? "bg-google-blue/10 text-google-blue" 
                    : "hover:bg-muted"
                }`}>
                  <span className="material-icons">{item.icon}</span>
                  <span>{item.label}</span>
                </a>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-border mt-auto">
        <div className="text-sm text-muted-foreground">
          <div className="mb-1">Storage</div>
          <div className="w-full bg-muted rounded-full h-2.5">
            <div 
              className="bg-google-blue h-2.5 rounded-full" 
              style={{ width: `${storagePercentage}%` }}
            ></div>
          </div>
          <div className="mt-1">{storageUsed} of {storageTotal} used</div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
