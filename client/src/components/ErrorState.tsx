import { FC } from "react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

const ErrorState: FC<ErrorStateProps> = ({ message, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center h-80">
      <span className="material-icons text-google-red text-6xl">error_outline</span>
      <h3 className="mt-4 text-xl font-medium">Something went wrong</h3>
      <p className="mt-2 text-gray-500">{message}</p>
      <Button 
        onClick={onRetry}
        className="mt-4 flex items-center space-x-2 bg-google-blue hover:bg-blue-600 text-white"
      >
        <span className="material-icons">refresh</span>
        <span>Try again</span>
      </Button>
    </div>
  );
};

export default ErrorState;
