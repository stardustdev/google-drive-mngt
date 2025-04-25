import { FC } from "react";

interface FileTypeIconProps {
  mimeType: string;
  size?: "small" | "medium" | "large";
}

const FileTypeIcon: FC<FileTypeIconProps> = ({ mimeType, size = "medium" }) => {
  // Determine icon and color based on mime type
  let icon = "description";
  let color = "text-google-blue";

  if (!mimeType) {
    return <span className={`material-icons ${color} ${getIconSize(size)}`}>{icon}</span>;
  }

  if (mimeType.startsWith("image/")) {
    icon = "image";
    color = "text-purple-500";
  } else if (mimeType.includes("spreadsheet") || mimeType.includes("excel") || mimeType.includes("csv")) {
    icon = "table_chart";
    color = "text-google-green";
  } else if (mimeType.includes("presentation") || mimeType.includes("powerpoint")) {
    icon = "slideshow";
    color = "text-google-yellow";
  } else if (mimeType.includes("pdf")) {
    icon = "picture_as_pdf";
    color = "text-google-red";
  } else if (mimeType.includes("folder")) {
    icon = "folder";
    color = "text-gray-500";
  } else if (mimeType.includes("video")) {
    icon = "videocam";
    color = "text-red-600";
  } else if (mimeType.includes("audio")) {
    icon = "audio_file";
    color = "text-orange-500";
  } else if (mimeType.includes("zip") || mimeType.includes("rar") || mimeType.includes("tar") || mimeType.includes("compressed")) {
    icon = "folder_zip";
    color = "text-gray-700";
  }

  return <span className={`material-icons ${color} ${getIconSize(size)}`}>{icon}</span>;
};

function getIconSize(size: string): string {
  switch (size) {
    case "small":
      return "text-2xl";
    case "medium":
      return "text-4xl";
    case "large":
      return "text-6xl";
    default:
      return "text-4xl";
  }
}

export default FileTypeIcon;
