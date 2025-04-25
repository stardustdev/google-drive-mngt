import { GoogleUser } from "../types/google";

class GoogleAuthService {
  /**
   * Handle authentication callback from Google OAuth
   * @param accessToken The access token from Google
   * @param refreshToken The refresh token from Google
   * @param profile The user profile from Google
   * @returns The user object to be stored in session
   */
  async handleAuthCallback(
    accessToken: string,
    refreshToken: string,
    profile: any
  ): Promise<GoogleUser> {
    try {
      const email = profile.emails && profile.emails[0]?.value;
      const picture = profile.photos && profile.photos[0]?.value;
      
      return {
        id: profile.id,
        email: email || "",
        name: profile.displayName || "",
        picture: picture || "",
        accessToken,
        refreshToken,
        expiry_date: Date.now() + 3600 * 1000, // 1 hour from now
      };
    } catch (error) {
      console.error("Error handling auth callback:", error);
      throw error;
    }
  }

  /**
   * Refresh the access token if it's expired
   * @param user The user object from session
   * @returns Updated user with fresh tokens
   */
  async refreshTokenIfNeeded(user: GoogleUser): Promise<GoogleUser> {
    // For a real implementation, we would check if the token is expired
    // and use the refresh token to get a new access token
    
    if (!user.refreshToken) {
      throw new Error("No refresh token available");
    }

    // Check if token is expired (expiry_date is in the past)
    if (user.expiry_date < Date.now()) {
      try {
        // In a real implementation, we would call the Google API to refresh the token
        // For now just throwing an error that should be handled by the client
        throw new Error("Token expired, please re-authenticate");
      } catch (error) {
        console.error("Error refreshing token:", error);
        throw error;
      }
    }

    return user;
  }
}

export const googleAuthService = new GoogleAuthService();
