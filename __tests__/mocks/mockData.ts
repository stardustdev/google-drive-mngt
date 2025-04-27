import { DriveFile, GoogleUser } from '../../client/src/lib/types';

// Mock Google user
export const mockUser: GoogleUser = {
  id: 'test-user-id-123',
  name: 'Test User',
  email: 'test.user@example.com',
  picture: 'https://example.com/test-user.jpg',
  accessToken: 'mock-access-token',
};

// Mock drive files
export const mockFiles: DriveFile[] = [
  {
    id: 'folder-1',
    name: 'Test Folder 1',
    mimeType: 'application/vnd.google-apps.folder',
    modifiedTime: '2023-01-01T12:00:00Z',
    parents: ['root'],
  },
  {
    id: 'folder-2',
    name: 'Test Folder 2',
    mimeType: 'application/vnd.google-apps.folder',
    modifiedTime: '2023-01-02T12:00:00Z',
    parents: ['root'],
  },
  {
    id: 'document-1',
    name: 'Test Document.docx',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    modifiedTime: '2023-01-03T12:00:00Z',
    size: '12345',
    parents: ['folder-1'],
  },
  {
    id: 'image-1',
    name: 'Test Image.jpg',
    mimeType: 'image/jpeg',
    modifiedTime: '2023-01-04T12:00:00Z',
    size: '54321',
    thumbnailLink: 'https://example.com/thumbnail.jpg',
    parents: ['folder-1'],
  },
  {
    id: 'pdf-1',
    name: 'Test PDF.pdf',
    mimeType: 'application/pdf',
    modifiedTime: '2023-01-05T12:00:00Z',
    size: '98765',
    parents: ['folder-2'],
  },
];

// Mock nested folder structure
export const mockNestedFolders: DriveFile[] = [
  {
    id: 'folder-parent',
    name: 'Parent Folder',
    mimeType: 'application/vnd.google-apps.folder',
    modifiedTime: '2023-01-01T12:00:00Z',
    parents: ['root'],
  },
  {
    id: 'folder-child',
    name: 'Child Folder',
    mimeType: 'application/vnd.google-apps.folder',
    modifiedTime: '2023-01-02T12:00:00Z',
    parents: ['folder-parent'],
  },
  {
    id: 'folder-grandchild',
    name: 'Grandchild Folder',
    mimeType: 'application/vnd.google-apps.folder',
    modifiedTime: '2023-01-03T12:00:00Z',
    parents: ['folder-child'],
  },
];

// Mock storage info
export const mockStorageInfo = {
  usage: 1073741824, // 1GB in bytes
  limit: 15 * 1073741824, // 15GB in bytes
  usageInDrive: 858993459, // ~0.8GB
  usageInTrash: 214748365, // ~0.2GB
};

// Mock file permissions
export const mockFilePermissions = [
  {
    id: 'permission-1',
    type: 'user',
    emailAddress: 'collaborator@example.com',
    role: 'reader',
  },
  {
    id: 'permission-2',
    type: 'user',
    emailAddress: 'editor@example.com',
    role: 'writer',
  },
];