import { Request, Response } from 'express';
import { HttpResponse } from 'msw';
import fetchMock from 'jest-fetch-mock';
import { mockFiles, mockUser, mockStorageInfo, mockFilePermissions } from '../mocks/mockData';

// Mock the Google Drive service
jest.mock('../../server/services/googleDriveService', () => ({
  googleDriveService: {
    listFiles: jest.fn().mockResolvedValue(mockFiles),
    getFile: jest.fn().mockImplementation((user, fileId) => {
      const file = mockFiles.find(f => f.id === fileId);
      if (!file) {
        throw new Error('File not found');
      }
      return Promise.resolve(file);
    }),
    listFolderContents: jest.fn().mockImplementation((user, folderId) => {
      const files = mockFiles.filter(file => file.parents?.includes(folderId));
      return Promise.resolve(files);
    }),
    createFolder: jest.fn().mockResolvedValue({
      id: 'new-folder-id',
      name: 'New Folder',
      mimeType: 'application/vnd.google-apps.folder',
    }),
    uploadFile: jest.fn().mockResolvedValue({
      id: 'new-file-id',
      name: 'Uploaded File',
      mimeType: 'application/octet-stream',
    }),
    deleteFile: jest.fn().mockResolvedValue(undefined),
    moveFile: jest.fn().mockResolvedValue({
      id: 'moved-file-id',
      name: 'Moved File',
    }),
    searchFiles: jest.fn().mockImplementation((user, query) => {
      const files = mockFiles.filter(file => 
        file.name.toLowerCase().includes(query.toLowerCase())
      );
      return Promise.resolve(files);
    }),
    shareFile: jest.fn().mockResolvedValue({
      id: 'new-permission-id',
      type: 'user',
      emailAddress: 'newuser@example.com',
      role: 'reader',
    }),
    getFilePermissions: jest.fn().mockResolvedValue(mockFilePermissions),
    removeFilePermission: jest.fn().mockResolvedValue(undefined),
    getStorageUsage: jest.fn().mockResolvedValue(mockStorageInfo),
    downloadFile: jest.fn().mockResolvedValue({
      on: jest.fn(),
      pipe: jest.fn(),
    }),
  },
}));

// Mock Express request and response objects
const createMockReq = (params = {}, query = {}, body = {}, user = mockUser) => {
  return {
    params,
    query,
    body,
    user,
    session: { user },
    get: jest.fn(),
  } as unknown as Request;
};

const createMockRes = () => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    end: jest.fn().mockReturnThis(),
    setHeader: jest.fn().mockReturnThis(),
  } as unknown as Response;
  return res;
};

describe('API Routes', () => {
  // Import routes after mocks are set up
  let routes: any;
  
  beforeAll(() => {
    fetchMock.enableMocks();
    // Import the routes module after all mocks are set up
    routes = require('../../server/routes');
  });
  
  beforeEach(() => {
    fetchMock.resetMocks();
    jest.clearAllMocks();
  });

  describe('GET /api/drive/files', () => {
    test('returns all files when no folderId is provided', async () => {
      const req = createMockReq();
      const res = createMockRes();
      
      await routes.handleGetFiles(req, res);
      
      expect(res.json).toHaveBeenCalledWith(mockFiles);
    });
    
    test('returns files from a specific folder when folderId is provided', async () => {
      const req = createMockReq({}, { folderId: 'folder-1' });
      const res = createMockRes();
      
      await routes.handleGetFiles(req, res);
      
      const { googleDriveService } = require('../../server/services/googleDriveService');
      expect(googleDriveService.listFolderContents).toHaveBeenCalledWith(mockUser, 'folder-1');
    });
    
    test('handles errors correctly', async () => {
      const { googleDriveService } = require('../../server/services/googleDriveService');
      googleDriveService.listFiles.mockRejectedValueOnce(new Error('API error'));
      
      const req = createMockReq();
      const res = createMockRes();
      
      await routes.handleGetFiles(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.any(String),
      }));
    });
  });

  describe('GET /api/drive/files/:fileId', () => {
    test('returns file details for a valid file ID', async () => {
      const req = createMockReq({ fileId: 'document-1' });
      const res = createMockRes();
      
      await routes.handleGetFile(req, res);
      
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        id: 'document-1',
      }));
    });
    
    test('returns 404 for non-existent file ID', async () => {
      const { googleDriveService } = require('../../server/services/googleDriveService');
      googleDriveService.getFile.mockRejectedValueOnce(new Error('File not found'));
      
      const req = createMockReq({ fileId: 'non-existent-id' });
      const res = createMockRes();
      
      await routes.handleGetFile(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('POST /api/drive/folders', () => {
    test('creates a new folder', async () => {
      const req = createMockReq({}, {}, { name: 'New Test Folder' });
      const res = createMockRes();
      
      await routes.handleCreateFolder(req, res);
      
      const { googleDriveService } = require('../../server/services/googleDriveService');
      expect(googleDriveService.createFolder).toHaveBeenCalledWith(mockUser, 'New Test Folder', undefined);
      expect(res.status).toHaveBeenCalledWith(201);
    });
    
    test('creates a folder in a parent folder when parentId is provided', async () => {
      const req = createMockReq({}, {}, { name: 'New Test Folder', parentId: 'parent-folder-id' });
      const res = createMockRes();
      
      await routes.handleCreateFolder(req, res);
      
      const { googleDriveService } = require('../../server/services/googleDriveService');
      expect(googleDriveService.createFolder).toHaveBeenCalledWith(mockUser, 'New Test Folder', 'parent-folder-id');
    });
  });

  describe('GET /api/drive/search', () => {
    test('searches for files matching the query', async () => {
      const req = createMockReq({}, { q: 'Document' });
      const res = createMockRes();
      
      await routes.handleSearchFiles(req, res);
      
      const { googleDriveService } = require('../../server/services/googleDriveService');
      expect(googleDriveService.searchFiles).toHaveBeenCalledWith(mockUser, 'Document');
    });
    
    test('returns 400 if no query is provided', async () => {
      const req = createMockReq();
      const res = createMockRes();
      
      await routes.handleSearchFiles(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('GET /api/drive/storage', () => {
    test('returns storage usage information', async () => {
      const req = createMockReq();
      const res = createMockRes();
      
      await routes.handleGetStorageUsage(req, res);
      
      expect(res.json).toHaveBeenCalledWith(mockStorageInfo);
    });
  });

  describe('PATCH /api/drive/files/:fileId/move', () => {
    test('moves a file to a new folder', async () => {
      const req = createMockReq(
        { fileId: 'document-1' },
        {},
        { targetFolderId: 'folder-2', removeFromParents: true }
      );
      const res = createMockRes();
      
      await routes.handleMoveFile(req, res);
      
      const { googleDriveService } = require('../../server/services/googleDriveService');
      expect(googleDriveService.moveFile).toHaveBeenCalledWith(
        mockUser, 'document-1', 'folder-2', true
      );
    });
  });

  describe('POST /api/drive/permissions/:fileId', () => {
    test('shares a file with a user', async () => {
      const req = createMockReq(
        { fileId: 'document-1' },
        {},
        { emailAddress: 'newuser@example.com', role: 'reader', sendNotification: true }
      );
      const res = createMockRes();
      
      await routes.handleShareFile(req, res);
      
      const { googleDriveService } = require('../../server/services/googleDriveService');
      expect(googleDriveService.shareFile).toHaveBeenCalledWith(
        mockUser, 'document-1', 'newuser@example.com', 'reader', true
      );
    });
    
    test('returns 400 if required fields are missing', async () => {
      const req = createMockReq(
        { fileId: 'document-1' },
        {},
        {}
      );
      const res = createMockRes();
      
      await routes.handleShareFile(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
});