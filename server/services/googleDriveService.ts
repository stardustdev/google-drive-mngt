import axios from "axios";
import { GoogleUser, DriveFile } from "../types/google";
import { googleAuthService } from "./googleAuthService";
import stream from "stream";

class GoogleDriveService {
  private readonly API_BASE_URL = "https://www.googleapis.com/drive/v3";
  private readonly FOLDER_MIME_TYPE = "application/vnd.google-apps.folder";

  /**
   * List files from the user's Google Drive
   * @param user The authenticated user
   * @returns List of files
   */
  async listFiles(user: GoogleUser): Promise<DriveFile[]> {
    try {
      // Ensure the token is fresh
      const freshUser = await googleAuthService.refreshTokenIfNeeded(user);

      // Get all files that aren't trashed
      const query = "trashed=false";
      
      const response = await axios.get(`${this.API_BASE_URL}/files`, {
        headers: {
          Authorization: `Bearer ${freshUser.accessToken}`,
        },
        params: {
          q: query,
          fields: "files(id, name, mimeType, iconLink, thumbnailLink, webViewLink, modifiedTime, size, parents)",
          orderBy: "folder,name",
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
   * @param parentFolderId Optional parent folder ID
   * @returns The created file details
   */
  async uploadFile(user: GoogleUser, file: any, parentFolderId?: string): Promise<DriveFile> {
    try {
      const freshUser = await googleAuthService.refreshTokenIfNeeded(user);

      // Create a metadata object for the file
      const metadata: any = {
        name: file.name,
        mimeType: file.mimetype,
      };
      
      // If parent folder ID is provided, add it to the metadata
      if (parentFolderId) {
        metadata.parents = [parentFolderId];
      }
      
      // Create a readable stream from the file buffer
      const fileStream = new stream.PassThrough();
      fileStream.end(file.data);
      
      // Create a simple multipart boundary
      const boundary = '-------' + Date.now();
      const delimiter = "\r\n--" + boundary + "\r\n";
      const closeDelimiter = "\r\n--" + boundary + "--";
      
      // Create multipart request body
      const multipartRequestBody =
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        'Content-Type: ' + file.mimetype + '\r\n\r\n';
      
      // Create a buffer from the start part
      const startBuffer = Buffer.from(multipartRequestBody, 'utf8');
      
      // Create a buffer for the end delimiter
      const endBuffer = Buffer.from(closeDelimiter, 'utf8');
      
      // Concatenate buffers for the entire request body
      const requestBody = Buffer.concat([
        startBuffer,
        file.data,
        endBuffer
      ]);
      
      // Upload the file with metadata
      const response = await axios.post(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
        requestBody,
        {
          headers: {
            'Authorization': `Bearer ${freshUser.accessToken}`,
            'Content-Type': `multipart/related; boundary=${boundary}`,
            'Content-Length': requestBody.length
          }
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

  /**
   * Create a new folder in Google Drive
   * @param user The authenticated user
   * @param folderName Name of the folder to create
   * @param parentId Optional parent folder ID
   * @returns The created folder details
   */
  async createFolder(
    user: GoogleUser, 
    folderName: string, 
    parentId?: string
  ): Promise<DriveFile> {
    try {
      const freshUser = await googleAuthService.refreshTokenIfNeeded(user);
      
      const folderMetadata: any = {
        name: folderName,
        mimeType: this.FOLDER_MIME_TYPE,
      };
      
      // Add to specified parent folder if provided
      if (parentId) {
        folderMetadata.parents = [parentId];
      }
      
      const response = await axios.post(
        `${this.API_BASE_URL}/files`,
        folderMetadata,
        {
          headers: {
            Authorization: `Bearer ${freshUser.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error("Error creating folder:", error);
      throw error;
    }
  }

  /**
   * List files within a specific folder
   * @param user The authenticated user
   * @param folderId ID of the folder to list contents from
   * @returns List of files in the folder
   */
  async listFolderContents(user: GoogleUser, folderId: string): Promise<DriveFile[]> {
    try {
      const freshUser = await googleAuthService.refreshTokenIfNeeded(user);
      
      const query = `'${folderId}' in parents and trashed=false`;
      
      const response = await axios.get(`${this.API_BASE_URL}/files`, {
        headers: {
          Authorization: `Bearer ${freshUser.accessToken}`,
        },
        params: {
          q: query,
          fields: "files(id, name, mimeType, iconLink, thumbnailLink, webViewLink, modifiedTime, size, parents)",
          orderBy: "folder,name",
          pageSize: 100,
        },
      });
      
      return response.data.files || [];
    } catch (error) {
      console.error("Error listing folder contents:", error);
      throw error;
    }
  }

  /**
   * Move a file to a different folder
   * @param user The authenticated user
   * @param fileId ID of the file to move
   * @param targetFolderId ID of the destination folder
   * @param removeFromParents Whether to remove the file from its current parent folders
   * @returns Updated file details
   */
  async moveFile(
    user: GoogleUser, 
    fileId: string, 
    targetFolderId: string,
    removeFromParents: boolean = false
  ): Promise<DriveFile> {
    try {
      const freshUser = await googleAuthService.refreshTokenIfNeeded(user);
      
      const addParents = targetFolderId;
      let url = `${this.API_BASE_URL}/files/${fileId}?addParents=${addParents}`;
      
      if (removeFromParents) {
        // Get current parents
        const file = await this.getFile(user, fileId);
        url += '&removeParents=root';
      }
      
      const response = await axios.patch(
        url,
        {}, // Empty body for this request
        {
          headers: {
            Authorization: `Bearer ${freshUser.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error("Error moving file:", error);
      throw error;
    }
  }

  /**
   * Search for files by name
   * @param user The authenticated user
   * @param query Search query
   * @returns List of files matching the search
   */
  async searchFiles(user: GoogleUser, query: string): Promise<DriveFile[]> {
    try {
      const freshUser = await googleAuthService.refreshTokenIfNeeded(user);
      
      // Escape special characters in the query
      const escapedQuery = query.replace(/[\\'"]/g, "\\$&");
      const searchQuery = `name contains '${escapedQuery}' and trashed=false`;
      
      const response = await axios.get(`${this.API_BASE_URL}/files`, {
        headers: {
          Authorization: `Bearer ${freshUser.accessToken}`,
        },
        params: {
          q: searchQuery,
          fields: "files(id, name, mimeType, iconLink, thumbnailLink, webViewLink, modifiedTime, size, parents)",
          orderBy: "folder,name",
          pageSize: 30,
        },
      });
      
      return response.data.files || [];
    } catch (error) {
      console.error("Error searching files:", error);
      throw error;
    }
  }
}

export const googleDriveService = new GoogleDriveService();
