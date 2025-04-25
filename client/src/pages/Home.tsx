import { FC, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import FileManager from "@/components/FileManager";

const Home: FC = () => {
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar (hidden on mobile) */}
      <Sidebar />
      
      {/* Mobile sidebar (conditionally shown) */}
      {isSidebarVisible && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div 
            className="fixed inset-0 bg-black/50"
            onClick={toggleSidebar}
          ></div>
          <div className="fixed inset-y-0 left-0 w-64 bg-background border-r border-border">
            <Sidebar />
          </div>
        </div>
      )}
      
      {/* Main content */}
      <main className="flex-1 flex flex-col">
        <Header toggleSidebar={toggleSidebar} />
        <FileManager />
      </main>
    </div>
  );
};

export default Home;
