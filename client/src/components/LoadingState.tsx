import { FC } from "react";

const LoadingState: FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-80">
      <div className="w-12 h-12 border-t-2 border-b-2 border-google-blue rounded-full animate-spin"></div>
      <p className="mt-4 text-gray-500">Loading your files...</p>
    </div>
  );
};

export default LoadingState;
