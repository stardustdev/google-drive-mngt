import { renderHook, waitFor } from '@testing-library/react';
import { useFiles } from '../../client/src/hooks/useFiles';
import { mockFiles } from '../mocks/mockData';
import { createWrapper } from '../mocks/testUtils';
import { server } from '../mocks/server';
import { http, HttpResponse } from 'msw';

describe('useFiles Hook', () => {
  test('fetches files from root when no folderId is provided', async () => {
    const { result } = renderHook(() => useFiles(), {
      wrapper: createWrapper(),
    });
    
    // Initially, it should be in loading state
    expect(result.current.isLoading).toBe(true);
    
    // Wait for the query to complete
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    // Check if files were loaded
    expect(result.current.files).toHaveLength(mockFiles.filter(f => f.parents?.includes('root')).length);
  });

  test('fetches files from a specific folder when folderId is provided', async () => {
    const folderId = 'folder-1';
    
    const { result } = renderHook(() => useFiles(folderId), {
      wrapper: createWrapper(),
    });
    
    // Wait for the query to complete
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    // Check if files were loaded
    expect(result.current.files).toHaveLength(mockFiles.filter(f => f.parents?.includes(folderId)).length);
  });

  test('handles API error correctly', async () => {
    // Override default handler to simulate an error
    server.use(
      http.get('/api/drive/files', () => {
        return new HttpResponse(null, { status: 500 });
      })
    );
    
    const { result } = renderHook(() => useFiles(), {
      wrapper: createWrapper(),
    });
    
    // Wait for the query to complete
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    // Check if error state is correctly set
    expect(result.current.isError).toBe(true);
    expect(result.current.error).toBeTruthy();
  });

  test('create folder mutation works correctly', async () => {
    const { result } = renderHook(() => useFiles(), {
      wrapper: createWrapper(),
    });
    
    // Wait for the initial query to complete
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    // Execute the create folder mutation
    result.current.createFolder.mutate({ name: 'New Test Folder' });
    
    // Wait for the mutation to complete
    await waitFor(() => {
      expect(result.current.createFolder.isPending).toBe(false);
    });
    
    // Mutation should complete successfully
    expect(result.current.createFolder.isError).toBe(false);
  });

  test('delete file mutation works correctly', async () => {
    const { result } = renderHook(() => useFiles(), {
      wrapper: createWrapper(),
    });
    
    // Wait for the initial query to complete
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    // Execute the delete file mutation
    result.current.deleteFile.mutate('document-1');
    
    // Wait for the mutation to complete
    await waitFor(() => {
      expect(result.current.deleteFile.isPending).toBe(false);
    });
    
    // Mutation should complete successfully
    expect(result.current.deleteFile.isError).toBe(false);
  });

  test('move file mutation works correctly', async () => {
    const { result } = renderHook(() => useFiles(), {
      wrapper: createWrapper(),
    });
    
    // Wait for the initial query to complete
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    // Execute the move file mutation
    result.current.moveFile.mutate({
      fileId: 'document-1',
      targetFolderId: 'folder-2',
      removeFromParents: true,
    });
    
    // Wait for the mutation to complete
    await waitFor(() => {
      expect(result.current.moveFile.isPending).toBe(false);
    });
    
    // Mutation should complete successfully
    expect(result.current.moveFile.isError).toBe(false);
  });
});