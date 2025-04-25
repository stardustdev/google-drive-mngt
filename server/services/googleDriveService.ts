import axios from "axios";
import { GoogleUser, DriveFile } from "../types/google";
import { googleAuthService } from "./googleAuthService";
import stream from "stream";

class GoogleDriveService {
  private readonly API_BASE_URL = "https://www.googleapis.com/drive/v3";

  /**
   * List files from the user's Google Drive
   * @param user The authenticated user
   * @returns List of files
   */
  async listFiles(user: GoogleUser): Promise<DriveFile[]> {
    try {
      // Ensure the token is fresh
      const freshUser = await googleAuthService.refreshTokenIfNeeded(user);

      const response = await axios.get(`${this.API_BASE_URL}/files`, {
        headers: {
          Authorization: `Bearer ${freshUser.accessToken}`,
        },
        params: {
          fields: "files(id, name, mimeType, iconLink, thumbnailLink, webViewLink, modifiedTime, size)",
          orderBy: "modifiedTime desc",
          pageSize: 100,
        },
      });

      return response.data.files || [];
    } catch (error) {
      console.error("Error listing files:", error);
      throw error;
    }
  }

  /**
   * Get detailed information about a specific file
   * @param user The authenticated user
   * @param fileId The ID of the file to retrieve
   * @returns File details
   */
  async getFile(user: GoogleUser, fileId: string): Promise<DriveFile> {
    try {
      const freshUser = await googleAuthService.refreshTokenIfNeeded(user);

      const response = await axios.get(`${this.API_BASE_URL}/files/${fileId}`, {
        headers: {
          Authorization: `Bearer ${freshUser.accessToken}`,
        },
        params: {
          fields: "id, name, mimeType, iconLink, thumbnailLink, webViewLink, modifiedTime, size",
        },
      });

      return response.data;
    } catch (error) {
      console.error("Error getting file:", error);
      throw error;
    }
  }

  /**
   * Upload a file to the user's Google Drive
   * @param user The authenticated user
   * @param file The file to upload
   * @returns The created file details
   */
  async uploadFile(user: GoogleUser, file: any): Promise<DriveFile> {
    try {
      const freshUser = await googleAuthService.refreshTokenIfNeeded(user);

      // First create the file metadata
      const fileMetadata = {
        name: file.name,
        mimeType: file.mimetype,
      };

      // Create a readable stream from the file buffer
      const fileStream = new stream.PassThrough();
      fileStream.end(file.data);

      // Upload the file with metadata
      const response = await axios.post(
        `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart`,
        {
          metadata: fileMetadata,
          media: fileStream,
        },
        {
          headers: {
            Authorization: `Bearer ${freshUser.accessToken}`,
            "Content-Type": "multipart/related",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  }

  /**
   * Download a file from Google Drive
   * @param user The authenticated user
   * @param fileId The ID of the file to download
   * @returns A readable stream of the file
   */
  async downloadFile(user: GoogleUser, fileId: string): Promise<stream.Readable> {
    try {
      const freshUser = await googleAuthService.refreshTokenIfNeeded(user);

      const response = await axios.get(
        `${this.API_BASE_URL}/files/${fileId}?alt=media`,
        {
          headers: {
            Authorization: `Bearer ${freshUser.accessToken}`,
          },
          responseType: "stream",
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error downloading file:", error);
      throw error;
    }
  }

  /**
   * Delete a file from Google Drive
   * @param user The authenticated user
   * @param fileId The ID of the file to delete
   * @returns void
   */
  async deleteFile(user: GoogleUser, fileId: string): Promise<void> {
    try {
      const freshUser = await googleAuthService.refreshTokenIfNeeded(user);

      await axios.delete(`${this.API_BASE_URL}/files/${fileId}`, {
        headers: {
          Authorization: `Bearer ${freshUser.accessToken}`,
        },
      });
    } catch (error) {
      console.error("Error deleting file:", error);
      throw error;
    }
  }
}

export const googleDriveService = new GoogleDriveService();
