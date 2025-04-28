import { FC, useState } from "react";
import Header from "@/components/Header";
import FileManager from "@/components/FileManager";

const Home: FC = () => {
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <main className="flex-1 flex flex-col">
        <Header toggleSidebar={toggleSidebar} />
        <div className="flex-1 flex w-full max-w-[80%] mx-auto">
          <FileManager />
        </div>
      </main>
    </div>
  );
};

export default Home;
