import { apiRequest } from './api';

/**
 * Auth Service module for communication with backend authentication endpoints
 */
export const authService = {
  /**
   * Register a new user in the SQL database
   * @param {{ fullName: string, email: string, password: string }} userData
   * @returns {Promise<{ success: boolean, message: string, user: object }>}
   */
  async register(userData) {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        fullName: userData.fullName.trim(),
        email: userData.email.trim(),
        password: userData.password
      })
    });
  },

  /**
   * Check backend server health
   */
  async checkHealth() {
    return apiRequest('/auth/health', {
      method: 'GET'
    });
  }
};

export default authService;
