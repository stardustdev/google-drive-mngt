import { http, HttpResponse } from 'msw';
import { mockFiles, mockUser, mockStorageInfo, mockFilePermissions, mockNestedFolders } from './mockData';

// Define MSW handlers for mocking API responses
export const handlers = [
  // Auth endpoints
  http.get('/api/auth/user', () => {
    return HttpResponse.json(mockUser);
  }),

  // Files endpoints
  http.get('/api/drive/files', ({ request }) => {
    const url = new URL(request.url);
    const folderId = url.searchParams.get('folderId');
    
    if (folderId) {
      return HttpResponse.json(mockFiles.filter(file => file.parents?.includes(folderId)));
    }
    
    return HttpResponse.json(mockFiles.filter(file => file.parents?.includes('root')));
  }),

  http.get('/api/drive/files/:fileId', ({ params }) => {
    const { fileId } = params;
    const file = mockFiles.find(f => f.id === fileId) || mockNestedFolders.find(f => f.id === fileId);
    
    if (!file) {
      return new HttpResponse(null, { status: 404 });
    }
    
    return HttpResponse.json(file);
  }),

  http.post('/api/drive/files/upload', async () => {
    return HttpResponse.json({
      id: 'new-file-id',
      name: 'Uploaded File.txt',
      mimeType: 'text/plain',
      modifiedTime: new Date().toISOString(),
      size: '1024',
      parents: ['root'],
    });
  }),

  http.delete('/api/drive/files/:fileId', () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // Folders endpoints
  http.get('/api/drive/folders/:folderId/files', ({ params }) => {
    const { folderId } = params;
    return HttpResponse.json(mockFiles.filter(file => file.parents?.includes(folderId as string)));
  }),

  http.post('/api/drive/folders', async () => {
    return HttpResponse.json({
      id: 'new-folder-id',
      name: 'New Folder',
      mimeType: 'application/vnd.google-apps.folder',
      modifiedTime: new Date().toISOString(),
      parents: ['root'],
    });
  }),

  // File permissions
  http.get('/api/drive/permissions/:fileId', () => {
    return HttpResponse.json(mockFilePermissions);
  }),

  http.post('/api/drive/permissions/:fileId', async () => {
    return HttpResponse.json({
      id: 'new-permission-id',
      type: 'user',
      emailAddress: 'new.collaborator@example.com',
      role: 'reader',
    });
  }),

  // Storage info
  http.get('/api/drive/storage', () => {
    return HttpResponse.json(mockStorageInfo);
  }),

  // Move file
  http.patch('/api/drive/files/:fileId/move', () => {
    return HttpResponse.json({
      success: true,
    });
  }),

  // Search files
  http.get('/api/drive/search', ({ request }) => {
    const url = new URL(request.url);
    const query = url.searchParams.get('q');
    
    if (!query) {
      return HttpResponse.json([]);
    }
    
    const filteredFiles = mockFiles.filter(file => 
      file.name.toLowerCase().includes(query.toLowerCase())
    );
    
    return HttpResponse.json(filteredFiles);
  }),
];