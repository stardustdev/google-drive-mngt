import { renderHook, waitFor } from '@testing-library/react';
import { useFileSharing } from '../../client/src/hooks/useFileSharing';
import { mockFilePermissions } from '../mocks/mockData';
import { createWrapper } from '../mocks/testUtils';
import { server } from '../mocks/server';
import { http, HttpResponse } from 'msw';

describe('useFileSharing Hook', () => {
  const fileId = 'document-1';
  
  test('fetches file permissions when fileId is provided', async () => {
    const { result } = renderHook(() => useFileSharing(fileId), {
      wrapper: createWrapper(),
    });
    
    // Initially, it should be in loading state
    expect(result.current.isLoading).toBe(true);
    
    // Wait for the query to complete
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    // Check if permissions were loaded
    expect(result.current.permissions).toEqual(mockFilePermissions);
  });

  test('does not fetch permissions when fileId is not provided', async () => {
    const { result } = renderHook(() => useFileSharing(), {
      wrapper: createWrapper(),
    });
    
    // Wait for a potential query to complete
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    // Permissions should be undefined
    expect(result.current.permissions).toBeUndefined();
  });

  test('handles API error correctly', async () => {
    // Override default handler to simulate an error
    server.use(
      http.get('/api/drive/permissions/:fileId', () => {
        return new HttpResponse(null, { status: 500 });
      })
    );
    
    const { result } = renderHook(() => useFileSharing(fileId), {
      wrapper: createWrapper(),
    });
    
    // Wait for the query to complete
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    // Check if error state is correctly set
    expect(result.current.isError).toBe(true);
  });

  test('share with user mutation works correctly', async () => {
    const { result } = renderHook(() => useFileSharing(fileId), {
      wrapper: createWrapper(),
    });
    
    // Wait for the initial query to complete
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    // Execute the share with user mutation
    result.current.shareWithUser.mutate({
      fileId,
      emailAddress: 'new.user@example.com',
      role: 'reader',
      sendNotification: true,
    });
    
    // Wait for the mutation to complete
    await waitFor(() => {
      expect(result.current.shareWithUser.isPending).toBe(false);
    });
    
    // Mutation should complete successfully
    expect(result.current.shareWithUser.isError).toBe(false);
  });

  test('remove permission mutation works correctly', async () => {
    const { result } = renderHook(() => useFileSharing(fileId), {
      wrapper: createWrapper(),
    });
    
    // Wait for the initial query to complete
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    // Execute the remove permission mutation
    result.current.removePermission.mutate({
      fileId,
      permissionId: 'permission-1',
    });
    
    // Wait for the mutation to complete
    await waitFor(() => {
      expect(result.current.removePermission.isPending).toBe(false);
    });
    
    // Mutation should complete successfully
    expect(result.current.removePermission.isError).toBe(false);
  });

  test('refetchPermissions function refreshes permissions data', async () => {
    const { result } = renderHook(() => useFileSharing(fileId), {
      wrapper: createWrapper(),
    });
    
    // Wait for the initial query to complete
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    // Call refetchPermissions
    result.current.refetchPermissions();
    
    // Should go back to loading state briefly
    expect(result.current.isLoading).toBe(true);
    
    // Wait for the query to complete again
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    // Data should be refreshed
    expect(result.current.permissions).toEqual(mockFilePermissions);
  });
});