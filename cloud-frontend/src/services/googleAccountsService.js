import { apiRequest } from './api';

/**
 * Google Accounts & Drive Service
 * Interacts directly with the backend Spring Boot endpoints for multi-drive aggregation.
 */

export const googleAccountsService = {
  /**
   * Fetch connected Google accounts for the currently logged-in user
   * @returns {Promise<Array>}
   */
  async getConnectedAccounts() {
    try {
      const data = await apiRequest('/accounts');
      return Array.isArray(data) ? data : [];
    } catch (e) {
      console.warn('Could not load connected accounts from backend:', e.message);
      return [];
    }
  },

  /**
   * Check if backend Google OAuth 2.0 is configured
   * @returns {Promise<{ configured: boolean, provider: string, message: string }>}
   */
  async checkOAuthStatus() {
    return apiRequest('/oauth/google/status');
  },

  /**
   * Get the Google OAuth consent authorization URL for the user
   * @param {string} accountType 'personal' | 'workspace' | 'edu'
   * @returns {Promise<{ url: string }>}
   */
  async getAuthorizeUrl(accountType = 'personal') {
    return apiRequest(`/oauth/google/authorize-url?accountType=${encodeURIComponent(accountType)}`);
  },

  /**
   * Fetch real files from connected Google Drive(s)
   * @param {{ accountId?: string, search?: string, starred?: boolean, trashed?: boolean }} params
   * @returns {Promise<Array>}
   */
  async getDriveFiles(params = {}) {
    const query = new URLSearchParams();
    if (params.accountId && params.accountId !== 'all') {
      query.append('accountId', params.accountId);
    }
    if (params.search) {
      query.append('search', params.search);
    }
    if (params.starred !== undefined) {
      query.append('starred', params.starred);
    }
    if (params.trashed !== undefined) {
      query.append('trashed', params.trashed);
    }

    const qs = query.toString();
    try {
      const data = await apiRequest(`/drive/files${qs ? `?${qs}` : ''}`);
      return {
        files: Array.isArray(data) ? data : [],
        apiDisabled: false
      };
    } catch (e) {
      if (e.data?.error === 'SERVICE_DISABLED') {
        return {
          files: [],
          apiDisabled: true,
          needsReauth: false,
          activationUrl: e.data.activationUrl || 'https://console.developers.google.com/apis/api/drive.googleapis.com/overview?project=703955159949',
          message: e.data.message
        };
      }
      if (e.data?.error === 'NEEDS_REAUTH' || e.data?.needsReauth) {
        return {
          files: [],
          apiDisabled: false,
          needsReauth: true,
          message: e.data.message || 'Google Drive access permission is required to read your files.'
        };
      }
      console.warn('Could not load drive files from backend:', e.message);
      return {
        files: [],
        apiDisabled: false,
        needsReauth: false
      };
    }
  },

  /**
   * Upload a file directly to the selected connected Google Drive account
   * @param {File} file 
   * @param {number|string} accountId 
   * @param {Function} [onProgress] Callback with percentage (0 to 100)
   * @param {string} [folderId] Optional parent folder ID
   * @returns {Promise<Object>} The uploaded DriveFileDto
   */
  uploadFile(file, accountId, onProgress = () => {}, folderId = null) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
      xhr.open('POST', `${API_BASE_URL}/drive/upload`);

      const token = localStorage.getItem('token');
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      };

      xhr.onload = () => {
        try {
          const response = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(response);
          } else {
            const err = new Error(response.message || response.error || 'Upload failed');
            err.data = response;
            reject(err);
          }
        } catch (e) {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve({ message: 'Success' });
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        }
      };

      xhr.onerror = () => {
        reject(new Error('Network error during file upload to Google Drive.'));
      };

      const formData = new FormData();
      formData.append('file', file);
      if (accountId) {
        const cleanId = typeof accountId === 'string' ? accountId.replace('google-', '') : accountId;
        formData.append('accountId', cleanId);
      }
      if (folderId) {
        formData.append('folderId', folderId);
      }

      xhr.send(formData);
    });
  },

  /**
   * Create a new folder directly in the selected Google Drive account
   * @param {string} name 
   * @param {number|string} accountId 
   * @param {string} [parentFolderId]
   * @returns {Promise<Object>}
   */
  async createFolder(name, accountId, parentFolderId = null) {
    const cleanId = typeof accountId === 'string' ? accountId.replace('google-', '') : accountId;
    return apiRequest('/drive/folders', {
      method: 'POST',
      body: JSON.stringify({
        name,
        accountId: cleanId,
        parentFolderId
      })
    });
  },

  /**
   * Unlink a connected Google Drive account
   * @param {number|string} accountId
   */
  async unlinkAccount(accountId) {
    return apiRequest(`/accounts/${accountId}`, {
      method: 'DELETE'
    });
  }
};

export default googleAccountsService;
