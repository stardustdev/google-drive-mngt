import { mockUser } from '../mocks/mockData';
import fetchMock from 'jest-fetch-mock';

// Mock the global fetch
fetchMock.enableMocks();

describe('Google Auth Service', () => {
  // Import the auth service after mocks are set up
  let googleAuthService: any;
  
  beforeAll(() => {
    // Import the auth service after all mocks are set up
    googleAuthService = require('../../server/services/googleAuthService').googleAuthService;
  });
  
  beforeEach(() => {
    fetchMock.resetMocks();
    jest.clearAllMocks();
  });

  describe('handleAuthCallback', () => {
    test('processes OAuth callback data correctly', async () => {
      const accessToken = 'test-access-token';
      const refreshToken = 'test-refresh-token';
      const profile = {
        id: 'test-user-id',
        displayName: 'Test User',
        emails: [{ value: 'test.user@example.com' }],
        photos: [{ value: 'https://example.com/photo.jpg' }],
      };
      
      const result = await googleAuthService.handleAuthCallback(
        accessToken,
        refreshToken,
        profile
      );
      
      expect(result).toEqual(expect.objectContaining({
        id: profile.id,
        name: profile.displayName,
        email: profile.emails[0].value,
        picture: profile.photos[0].value,
        accessToken,
        refreshToken,
      }));
    });
    
    test('handles missing profile data gracefully', async () => {
      const accessToken = 'test-access-token';
      const refreshToken = 'test-refresh-token';
      const profile = {
        id: 'test-user-id',
        displayName: 'Test User',
        // Missing emails and photos
      };
      
      const result = await googleAuthService.handleAuthCallback(
        accessToken,
        refreshToken,
        profile
      );
      
      expect(result).toEqual(expect.objectContaining({
        id: profile.id,
        name: profile.displayName,
        // Should have default or empty values for missing data
        email: '',
        picture: '',
        accessToken,
        refreshToken,
      }));
    });
  });

  describe('refreshTokenIfNeeded', () => {
    test('returns user unchanged if token is not expired', async () => {
      // Create a user with a token that's not expired
      const user = {
        ...mockUser,
        expiry_date: Date.now() + 3600 * 1000, // 1 hour in the future
      };
      
      const result = await googleAuthService.refreshTokenIfNeeded(user);
      
      expect(result).toEqual(user);
      expect(fetchMock).not.toHaveBeenCalled();
    });
    
    test('refreshes token if it is expired', async () => {
      // Create a user with an expired token
      const user = {
        ...mockUser,
        expiry_date: Date.now() - 3600 * 1000, // 1 hour in the past
        refreshToken: 'test-refresh-token',
      };
      
      // Mock successful token refresh response
      fetchMock.mockResponseOnce(JSON.stringify({
        access_token: 'new-access-token',
        expires_in: 3600,
      }));
      
      const result = await googleAuthService.refreshTokenIfNeeded(user);
      
      // Should have called the token endpoint
      expect(fetchMock).toHaveBeenCalled();
      
      // Should return updated user with new token
      expect(result).toEqual(expect.objectContaining({
        ...user,
        accessToken: 'new-access-token',
        expiry_date: expect.any(Number),
      }));
    });
    
    test('handles refresh token error gracefully', async () => {
      // Create a user with an expired token
      const user = {
        ...mockUser,
        expiry_date: Date.now() - 3600 * 1000, // 1 hour in the past
        refreshToken: 'test-refresh-token',
      };
      
      // Mock unsuccessful token refresh response
      fetchMock.mockRejectOnce(new Error('Token refresh failed'));
      
      // Should throw an error when refresh fails
      await expect(googleAuthService.refreshTokenIfNeeded(user))
        .rejects.toThrow('Token refresh failed');
    });
  });
});