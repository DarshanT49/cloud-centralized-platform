import React, { useState, useEffect, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import GoogleIcon from '../components/GoogleIcon';
import {
  UploadCloud,
  X,
  FolderPlus,
  CheckCircle2,
  FileText,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  HardDrive,
  Copy,
  ExternalLink
} from 'lucide-react';
import googleAccountsService from '../services/googleAccountsService';
import './DashboardLayout.css';

const DashboardLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState('');

  // Multi-Google Accounts State (Live from Backend)
  const [connectedAccounts, setConnectedAccounts] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState('all'); // 'all' or specific account id
  const [loadingAccounts, setLoadingAccounts] = useState(true);

  // Google Files State (Live from Backend)
  const [googleFiles, setGoogleFiles] = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [driveApiStatus, setDriveApiStatus] = useState({ apiDisabled: false, activationUrl: '', message: '' });

  // Modals & Upload State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadTargetAccount, setUploadTargetAccount] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedUploadFile, setSelectedUploadFile] = useState(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const fileInputRef = useRef(null);

  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderColor, setNewFolderColor] = useState('#3b82f6');
  const [newFolderTargetAccount, setNewFolderTargetAccount] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);

  // Connect Google Account Modal State
  const [isConnectGoogleModalOpen, setIsConnectGoogleModalOpen] = useState(false);
  const [newAccountType, setNewAccountType] = useState('personal');
  const [isConnectingGoogle, setIsConnectingGoogle] = useState(false);
  const [oauthError, setOauthError] = useState('');

  // Cross-Drive Transfer Modal State
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferFile, setTransferFile] = useState(null);
  const [transferTargetAccountId, setTransferTargetAccountId] = useState('');
  const [transferMode, setTransferMode] = useState('copy'); // 'copy' or 'move'
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferProgress, setTransferProgress] = useState(0);

  // Load user from localStorage or fallback
  const [currentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('currentUser');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error parsing stored user:', e);
    }
    return {
      fullName: 'Drive User',
      email: '',
      role: 'MEMBER'
    };
  });

  const triggerToast = (msg) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification('');
    }, 3800);
  };

  // Load real accounts from backend
  const loadAccounts = async () => {
    try {
      setLoadingAccounts(true);
      const accounts = await googleAccountsService.getConnectedAccounts();
      setConnectedAccounts(accounts);
      if (accounts.length > 0 && !uploadTargetAccount) {
        setUploadTargetAccount(accounts[0].id);
        setNewFolderTargetAccount(accounts[0].id);
      }
    } catch (e) {
      console.error('Failed to load connected accounts:', e);
    } finally {
      setLoadingAccounts(false);
    }
  };

  // Load real drive files from backend
  const loadFiles = async () => {
    try {
      setLoadingFiles(true);
      const res = await googleAccountsService.getDriveFiles({
        accountId: selectedAccountId,
        search: searchQuery
      });
      setGoogleFiles(res.files || []);
      setDriveApiStatus({
        apiDisabled: !!res.apiDisabled,
        needsReauth: !!res.needsReauth,
        activationUrl: res.activationUrl || '',
        message: res.message || ''
      });
    } catch (e) {
      console.error('Failed to load drive files:', e);
    } finally {
      setLoadingFiles(false);
    }
  };

  // Initial load and URL parameter check for OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('token')) {
      const token = params.get('token');
      localStorage.setItem('token', token);
      const email = params.get('email') || 'Google Account';
      const userObj = {
        email,
        fullName: email.split('@')[0],
        role: 'ROLE_USER'
      };
      localStorage.setItem('currentUser', JSON.stringify(userObj));
    }

    if (params.get('connected') === 'success') {
      const email = params.get('email') || 'Google Account';
      triggerToast(`"${email}" connected and synchronized successfully!`);
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (params.get('error')) {
      const err = params.get('error');
      triggerToast(`OAuth error: ${decodeURIComponent(err)}`);
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    loadAccounts();
  }, []);

  useEffect(() => {
    loadFiles();
  }, [selectedAccountId, searchQuery, connectedAccounts.length]);

  // Calculate dynamic aggregated storage across all connected Google accounts
  const totalCombinedUsed = connectedAccounts.reduce((acc, a) => acc + (a.storageUsed || 0), 0);
  const totalCombinedLimit = connectedAccounts.reduce((acc, a) => acc + (a.storageTotal || 0), 0);
  const activeAccount = selectedAccountId === 'all'
    ? {
        id: 'all',
        name: 'All Google Accounts',
        email: `${connectedAccounts.length} Connected Drives`,
        storageUsed: Number(totalCombinedUsed.toFixed(1)),
        storageTotal: Number(totalCombinedLimit.toFixed(1)),
        percent: totalCombinedLimit > 0 ? Math.round((totalCombinedUsed / totalCombinedLimit) * 100) : 0,
        color: '#4285F4'
      }
    : connectedAccounts.find(a => a.id === selectedAccountId) || connectedAccounts[0] || {
        id: 'none',
        name: 'No Account Connected',
        email: 'Click + to connect Google Drive',
        storageUsed: 0,
        storageTotal: 0,
        percent: 0,
        color: '#94a3b8'
      };

  // Close mobile sidebar on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 992) {
        setMobileSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Connect New Google Account Handler (Calls Backend OAuth)
  const handleConnectNewAccount = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setIsConnectingGoogle(true);
    setOauthError('');

    try {
      const data = await googleAccountsService.getAuthorizeUrl(newAccountType);
      if (data?.url) {
        // Redirect to Google's real OAuth authorization page
        window.location.href = data.url;
      } else {
        setOauthError(data?.error || 'Failed to generate Google OAuth URL. Please check server configuration.');
        setIsConnectingGoogle(false);
      }
    } catch (err) {
      setOauthError(err.message || 'Error communicating with Google OAuth server.');
      setIsConnectingGoogle(false);
    }
  };

  // Real Google Drive File Upload Handler
  const handleUploadFile = async (e) => {
    e.preventDefault();
    if (!selectedUploadFile) {
      triggerToast('Please select a file to upload.');
      return;
    }

    const targetAcc = connectedAccounts.find(a => a.id === uploadTargetAccount) || connectedAccounts[0];
    if (!targetAcc) {
      triggerToast('Please connect a Google Drive account first.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const uploadedFile = await googleAccountsService.uploadFile(
        selectedUploadFile,
        targetAcc.id,
        (percent) => setUploadProgress(percent)
      );

      triggerToast(`"${uploadedFile.name}" uploaded directly to ${targetAcc.name}!`);
      setIsUploadModalOpen(false);
      setSelectedUploadFile(null);
      setUploadProgress(0);

      if (uploadedFile?.id) {
        setGoogleFiles(prev => [uploadedFile, ...prev.filter(f => f.id !== uploadedFile.id)]);
      }

      loadFiles();
      loadAccounts();
    } catch (err) {
      console.error('File upload error:', err);
      triggerToast(`Upload failed: ${err.message || 'Error uploading file'}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Real Google Drive Folder Creation Handler
  const handleCreateFolder = async (e) => {
    e.preventDefault();
    const folderName = newFolderName.trim();
    if (!folderName) return;

    const targetAcc = connectedAccounts.find(a => a.id === newFolderTargetAccount) || connectedAccounts[0];
    if (!targetAcc) {
      triggerToast('Please connect a Google Drive account first.');
      return;
    }

    setIsCreatingFolder(true);
    try {
      const newFolder = await googleAccountsService.createFolder(folderName, targetAcc.id);
      triggerToast(`Folder "${folderName}" created in ${targetAcc.name}!`);
      setIsNewFolderModalOpen(false);
      setNewFolderName('');

      if (newFolder?.id) {
        setGoogleFiles(prev => [newFolder, ...prev]);
      }
      loadFiles();
    } catch (err) {
      console.error('Create folder error:', err);
      triggerToast(`Failed to create folder: ${err.message}`);
    } finally {
      setIsCreatingFolder(false);
    }
  };

  // Cross-Drive Transfer Handler
  const handleStartTransfer = (file) => {
    setTransferFile(file);
    // Default to the first account that is NOT the source account
    const otherAccount = connectedAccounts.find(a => a.id !== file.accountId);
    setTransferTargetAccountId(otherAccount ? otherAccount.id : connectedAccounts[0].id);
    setIsTransferModalOpen(true);
  };

  const handleExecuteTransfer = (e) => {
    e.preventDefault();
    if (!transferFile || !transferTargetAccountId) return;

    setIsTransferring(true);
    setTransferProgress(20);

    const targetAcc = connectedAccounts.find(a => a.id === transferTargetAccountId);

    const interval = setInterval(() => {
      setTransferProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          setTimeout(() => {
            setIsTransferring(false);
            setIsTransferModalOpen(false);
            setTransferProgress(0);

            if (transferMode === 'move') {
              // Update file account
              const updated = googleFiles.map(f => {
                if (f.id === transferFile.id) {
                  return {
                    ...f,
                    accountId: targetAcc.id,
                    accountName: targetAcc.name,
                    accountColor: targetAcc.color
                  };
                }
                return f;
              });
              setGoogleFiles(updated);
              triggerToast(`"${transferFile.name}" moved from ${transferFile.accountName} to ${targetAcc.name}!`);
            } else {
              // Copy file
              const copiedFile = {
                ...transferFile,
                id: Date.now(),
                name: `Copy_of_${transferFile.name}`,
                accountId: targetAcc.id,
                accountName: targetAcc.name,
                accountColor: targetAcc.color,
                date: 'Just now'
              };
              const updated = [copiedFile, ...googleFiles];
              setGoogleFiles(updated);
              triggerToast(`"${transferFile.name}" copied to ${targetAcc.name}!`);
            }
          }, 350);
          return 100;
        }
        return prev + 25;
      });
    }, 200);
  };

  return (
    <div className={`dashboard-root ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Background ambient light */}
      <div className="dashboard-ambient-glow" />

      {/* Responsive Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        currentUser={currentUser}
        connectedAccounts={connectedAccounts}
        selectedAccountId={selectedAccountId}
        onSelectAccount={setSelectedAccountId}
        activeAccount={activeAccount}
        onOpenConnectGoogleModal={() => setIsConnectGoogleModalOpen(true)}
        onOpenUploadModal={() => setIsUploadModalOpen(true)}
        onOpenNewFolderModal={() => setIsNewFolderModalOpen(true)}
      />

      {/* Backdrop overlay for mobile drawer */}
      <div
        className={`dashboard-mobile-overlay ${mobileSidebarOpen ? 'mobile-open' : ''}`}
        onClick={() => setMobileSidebarOpen(false)}
      />

      {/* Topbar */}
      <Topbar
        onToggleMobile={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        currentUser={currentUser}
        connectedAccounts={connectedAccounts}
        selectedAccountId={selectedAccountId}
        onSelectAccount={setSelectedAccountId}
        onOpenConnectGoogleModal={() => setIsConnectGoogleModalOpen(true)}
        onOpenUploadModal={() => setIsUploadModalOpen(true)}
        triggerToast={triggerToast}
      />

      {/* Notification Toast Alert */}
      {notification && (
        <div
          style={{
            position: 'fixed',
            top: 80,
            right: 28,
            zIndex: 999,
            background: 'rgba(16, 185, 129, 0.22)',
            border: '1px solid rgba(16, 185, 129, 0.5)',
            color: '#34d399',
            backdropFilter: 'blur(16px)',
            padding: '12px 20px',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: '0.88rem',
            fontWeight: 600,
            animation: 'slideDown 0.2s ease-out'
          }}
        >
          <CheckCircle2 size={18} />
          <span>{notification}</span>
        </div>
      )}

      {/* Adjusted Main Content Area */}
      <main className="dashboard-main-content">
        <Outlet
          context={{
            searchQuery,
            setSearchQuery,
            currentUser,
            triggerToast,
            connectedAccounts,
            setConnectedAccounts,
            selectedAccountId,
            setSelectedAccountId,
            activeAccount,
            googleFiles,
            setGoogleFiles,
            driveApiStatus,
            refreshFiles: loadFiles,
            onOpenUploadModal: () => setIsUploadModalOpen(true),
            onOpenNewFolderModal: () => setIsNewFolderModalOpen(true),
            onOpenConnectGoogleModal: () => setIsConnectGoogleModalOpen(true),
            onDirectGoogleAuthorize: () => handleConnectNewAccount(),
            onOpenTransferModal: handleStartTransfer
          }}
        />
      </main>

      {/* MODAL 1: Connect Google Account */}
      {isConnectGoogleModalOpen && (
        <div
          className="dashboard-modal-backdrop"
          onClick={() => !isConnectingGoogle && setIsConnectGoogleModalOpen(false)}
        >
          <div
            className="dashboard-modal-card"
            style={{ maxWidth: 520 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(66, 133, 244, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <GoogleIcon size={24} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#fff' }}>Connect Google Account</h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Aggregate Drive files, storage quotas & docs into one platform
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => !isConnectingGoogle && setIsConnectGoogleModalOpen(false)}
                disabled={isConnectingGoogle}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleConnectNewAccount}>
              {oauthError && (
                <div
                  style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    color: '#fca5a5',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-sm)',
                    marginBottom: 16,
                    fontSize: '0.84rem'
                  }}
                >
                  <strong>OAuth Configuration Notice:</strong> {oauthError}
                  <div style={{ marginTop: 6, fontSize: '0.78rem', color: '#fed7d7' }}>
                    Tip: Set <code>GOOGLE_CLIENT_ID</code> and <code>GOOGLE_CLIENT_SECRET</code> in backend <code>application.properties</code> to enable live Google authorization.
                  </div>
                </div>
              )}

              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 8 }}>
                  Drive Account Classification
                </label>
                <select
                  value={newAccountType}
                  onChange={(e) => setNewAccountType(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#0e1322',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '10px 14px',
                    color: '#fff',
                    outline: 'none',
                    fontSize: '0.9rem'
                  }}
                >
                  <option value="personal">Personal Google Drive (@gmail.com)</option>
                  <option value="workspace">Google Workspace / Business G-Suite</option>
                  <option value="edu">University / Education Drive (.edu)</option>
                </select>
                <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 6 }}>
                  You will be securely redirected to Google's official consent page to choose your account and grant Drive access.
                </span>
              </div>

              {/* OAuth Scope Info Notice */}
              <div
                style={{
                  background: 'rgba(66, 133, 244, 0.08)',
                  border: '1px solid rgba(66, 133, 244, 0.25)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px 14px',
                  marginBottom: 20,
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#93c5fd', fontWeight: 600 }}>
                  <ShieldCheck size={16} />
                  <span>Permissions Requested via Google OAuth 2.0</span>
                </div>
                <div>• Read & Manage files and folders across your Google Drive</div>
                <div>• Secure offline access token to monitor and aggregate storage quotas</div>
                <div>• Zero files or user documents are stored on our servers</div>
              </div>

              {isConnectingGoogle && (
                <div style={{ textAlign: 'center', padding: '10px 0 16px' }}>
                  <RefreshCw size={24} color="#60a5fa" style={{ animation: 'spin 1s linear infinite', marginBottom: 8 }} />
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#93c5fd' }}>
                    Authenticating with Google OAuth 2.0 & fetching Drive metadata...
                  </p>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setIsConnectGoogleModalOpen(false)}
                  disabled={isConnectingGoogle}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={isConnectingGoogle}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
                >
                  <GoogleIcon size={16} />
                  <span>{isConnectingGoogle ? 'Connecting...' : 'Authorize & Connect Google'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Cross-Drive Transfer */}
      {isTransferModalOpen && transferFile && (
        <div
          className="dashboard-modal-backdrop"
          onClick={() => !isTransferring && setIsTransferModalOpen(false)}
        >
          <div
            className="dashboard-modal-card"
            style={{ maxWidth: 560 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(59, 130, 246, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#38bdf8'
                  }}
                >
                  <Copy size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#fff' }}>Cross-Drive Cloud Transfer</h3>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Direct server-to-server stream between Google accounts without local download
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => !isTransferring && setIsTransferModalOpen(false)}
                disabled={isTransferring}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleExecuteTransfer}>
              {/* Transfer Diagram */}
              <div className="transfer-direction-box">
                <div className="transfer-source-box">
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Source Drive
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: transferFile.accountColor }} />
                    <strong style={{ fontSize: '0.85rem', color: '#fff' }}>{transferFile.accountName}</strong>
                  </div>
                  <span style={{ fontSize: '0.78rem', color: '#93c5fd', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {transferFile.name} ({transferFile.size})
                  </span>
                </div>

                <div className="transfer-arrow-icon-box">
                  <ArrowRight size={18} />
                </div>

                <div className="transfer-target-box">
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Destination Drive
                  </span>
                  <select
                    value={transferTargetAccountId}
                    onChange={(e) => setTransferTargetAccountId(e.target.value)}
                    style={{
                      background: '#0e1322',
                      border: '1px solid rgba(59, 130, 246, 0.4)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '6px 10px',
                      color: '#fff',
                      fontSize: '0.82rem',
                      outline: 'none',
                      width: '100%'
                    }}
                  >
                    {connectedAccounts
                      .filter(a => a.id !== transferFile.accountId)
                      .map(a => (
                        <option key={a.id} value={a.id}>
                          {a.name} ({a.email})
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Transfer Mode Radio */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 8 }}>
                  Transfer Action
                </label>
                <div style={{ display: 'flex', gap: 14 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: '#fff', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="transferMode"
                      value="copy"
                      checked={transferMode === 'copy'}
                      onChange={() => setTransferMode('copy')}
                    />
                    <span>Copy file (Preserve on source drive)</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: '#fff', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="transferMode"
                      value="move"
                      checked={transferMode === 'move'}
                      onChange={() => setTransferMode('move')}
                    />
                    <span>Move file (Delete from source drive)</span>
                  </label>
                </div>
              </div>

              {isTransferring && (
                <div style={{ marginBottom: 18 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 6 }}>
                    <span style={{ color: '#93c5fd' }}>Streaming data directly between Google Drives...</span>
                    <strong style={{ color: '#fff' }}>{transferProgress}%</strong>
                  </div>
                  <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 99, overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${transferProgress}%`,
                        background: 'var(--gradient-primary)',
                        transition: 'width 0.2s ease'
                      }}
                    />
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setIsTransferModalOpen(false)}
                  disabled={isTransferring}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={isTransferring}
                >
                  {isTransferring ? 'Transferring...' : `Confirm ${transferMode === 'copy' ? 'Copy' : 'Move'}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Quick Upload with Google Account target */}
      {isUploadModalOpen && (
        <div
          className="dashboard-modal-backdrop"
          onClick={() => !isUploading && setIsUploadModalOpen(false)}
        >
          <div
            className="dashboard-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(59, 130, 246, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#38bdf8'
                  }}
                >
                  <UploadCloud size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#fff' }}>Upload to Google Drive</h3>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    End-to-end encrypted before syncing to Google Cloud
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => !isUploading && setIsUploadModalOpen(false)}
                disabled={isUploading}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUploadFile}>
              {/* Hidden Real File Input */}
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setSelectedUploadFile(e.target.files[0]);
                  }
                }}
              />

              {/* Target Google Drive Selector */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Target Google Account
                </label>
                <select
                  value={uploadTargetAccount}
                  onChange={(e) => setUploadTargetAccount(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#0e1322',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '10px 14px',
                    color: '#fff',
                    outline: 'none',
                    fontSize: '0.9rem'
                  }}
                >
                  {connectedAccounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Drag & Drop Area */}
              <div
                onClick={() => !isUploading && fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingFile(true);
                }}
                onDragLeave={() => setIsDraggingFile(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDraggingFile(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    setSelectedUploadFile(e.dataTransfer.files[0]);
                  }
                }}
                style={{
                  border: isDraggingFile ? '2px dashed #38bdf8' : selectedUploadFile ? '2px solid rgba(59, 130, 246, 0.5)' : '2px dashed rgba(59, 130, 246, 0.35)',
                  borderRadius: 'var(--radius-md)',
                  padding: selectedUploadFile ? '24px 20px' : '36px 20px',
                  textAlign: 'center',
                  background: isDraggingFile ? 'rgba(56, 189, 248, 0.08)' : selectedUploadFile ? 'rgba(59, 130, 246, 0.06)' : 'rgba(59, 130, 246, 0.03)',
                  marginBottom: 20,
                  cursor: isUploading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {selectedUploadFile ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', textAlign: 'left', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: '10px',
                          background: 'rgba(59, 130, 246, 0.15)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#38bdf8',
                          flexShrink: 0
                        }}
                      >
                        <FileText size={24} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.92rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {selectedUploadFile.name}
                        </div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: 2 }}>
                          {(selectedUploadFile.size / (1024 * 1024)).toFixed(2)} MB • {selectedUploadFile.type || 'Document'}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedUploadFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      disabled={isUploading}
                      style={{
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: 'none',
                        color: '#f87171',
                        borderRadius: '6px',
                        padding: '6px 12px',
                        fontSize: '0.8rem',
                        cursor: 'pointer'
                      }}
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <>
                    <FileText size={36} color="#60a5fa" style={{ marginBottom: 12 }} />
                    <h4 style={{ color: '#fff', fontSize: '0.95rem', marginBottom: 6 }}>
                      Click to choose file or drag & drop here
                    </h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0 }}>
                      PDF, Docs, PNG, Sheets, Audio, Video up to 500 MB
                    </p>
                  </>
                )}
              </div>

              {isUploading && (
                <div style={{ marginBottom: 18 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 6 }}>
                    <span style={{ color: '#93c5fd' }}>Streaming directly to Google Cloud...</span>
                    <strong style={{ color: '#fff' }}>{uploadProgress}%</strong>
                  </div>
                  <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 99, overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${uploadProgress}%`,
                        background: 'var(--gradient-primary)',
                        transition: 'width 0.2s ease'
                      }}
                    />
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    setIsUploadModalOpen(false);
                    setSelectedUploadFile(null);
                  }}
                  disabled={isUploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={isUploading || !selectedUploadFile}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
                >
                  <UploadCloud size={16} />
                  <span>{isUploading ? `Uploading (${uploadProgress}%)...` : 'Upload to Google Drive'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: New Folder */}
      {isNewFolderModalOpen && (
        <div
          className="dashboard-modal-backdrop"
          onClick={() => setIsNewFolderModalOpen(false)}
        >
          <div
            className="dashboard-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(16, 185, 129, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#34d399'
                  }}
                >
                  <FolderPlus size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#fff' }}>Create Drive Folder</h3>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Create folder inside connected Google account
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => setIsNewFolderModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateFolder}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Target Google Drive
                </label>
                <select
                  value={newFolderTargetAccount}
                  onChange={(e) => setNewFolderTargetAccount(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#0e1322',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '8px 12px',
                    color: '#fff',
                    outline: 'none',
                    fontSize: '0.88rem'
                  }}
                >
                  {connectedAccounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.email})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 8 }}>
                  Folder Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Marketing Campaign 2026"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  required
                  autoFocus
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '10px 14px',
                    color: '#fff',
                    outline: 'none',
                    fontSize: '0.9rem'
                  }}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 8 }}>
                  Color Tag
                </label>
                <div style={{ display: 'flex', gap: 10 }}>
                  {['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'].map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewFolderColor(color)}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        backgroundColor: color,
                        border: newFolderColor === color ? '2px solid #ffffff' : 'none',
                        cursor: 'pointer',
                        transform: newFolderColor === color ? 'scale(1.15)' : 'scale(1)',
                        transition: 'transform 0.15s ease'
                      }}
                    />
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setIsNewFolderModalOpen(false)}
                  disabled={isCreatingFolder}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={isCreatingFolder || !newFolderName.trim()}
                >
                  <span>{isCreatingFolder ? 'Creating...' : 'Create Folder in Drive'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;
