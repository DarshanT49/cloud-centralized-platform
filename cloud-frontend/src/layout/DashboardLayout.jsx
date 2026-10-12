import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import {
  UploadCloud,
  X,
  FolderPlus,
  CheckCircle2,
  FileText
} from 'lucide-react';
import './DashboardLayout.css';

const DashboardLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderColor, setNewFolderColor] = useState('#3b82f6');
  const [notification, setNotification] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Load user from localStorage or fallback to standard profile
  const [currentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('currentUser');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error parsing stored user:', e);
    }
    return {
      fullName: 'Alex Rivera',
      email: 'alex.rivera@cloudvault.io',
      role: 'PRO MEMBER',
      storageUsed: '64.2 GB',
      storageTotal: '100 GB',
      storagePercent: 64
    };
  });

  // Close mobile sidebar on escape key or resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 992) {
        setMobileSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const triggerToast = (msg) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification('');
    }, 3500);
  };

  const handleSimulateUpload = (e) => {
    e.preventDefault();
    setIsUploading(true);
    setUploadProgress(15);

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          setTimeout(() => {
            setIsUploading(false);
            setIsUploadModalOpen(false);
            setUploadProgress(0);
            triggerToast('File successfully uploaded & AES-256 encrypted!');
          }, 400);
          return 100;
        }
        return prev + 25;
      });
    }, 200);
  };

  const handleCreateFolder = (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    setIsNewFolderModalOpen(false);
    triggerToast(`Folder "${newFolderName.trim()}" created successfully!`);
    setNewFolderName('');
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
        onOpenUploadModal={() => setIsUploadModalOpen(true)}
      />

      {/* Notification Toast Alert */}
      {notification && (
        <div
          style={{
            position: 'fixed',
            top: 80,
            right: 28,
            zIndex: 999,
            background: 'rgba(16, 185, 129, 0.2)',
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
            openUploadModal: () => setIsUploadModalOpen(true),
            openNewFolderModal: () => setIsNewFolderModalOpen(true)
          }}
        />
      </main>

      {/* Modal: Quick Upload */}
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
                  <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#fff' }}>Upload to Vault</h3>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    End-to-end encrypted before upload
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

            <form onSubmit={handleSimulateUpload}>
              <div
                style={{
                  border: '2px dashed rgba(59, 130, 246, 0.35)',
                  borderRadius: 'var(--radius-md)',
                  padding: '36px 20px',
                  textAlign: 'center',
                  background: 'rgba(59, 130, 246, 0.03)',
                  marginBottom: 20,
                  cursor: 'pointer',
                  transition: 'border-color 0.2s ease'
                }}
              >
                <FileText size={36} color="#60a5fa" style={{ marginBottom: 12 }} />
                <h4 style={{ color: '#fff', fontSize: '0.95rem', marginBottom: 6 }}>
                  Click to choose file or drag & drop here
                </h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0 }}>
                  PDF, PNG, JPG, MP4, ZIP, XLSX up to 5 GB
                </p>
              </div>

              {isUploading && (
                <div style={{ marginBottom: 18 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 6 }}>
                    <span style={{ color: '#93c5fd' }}>Encrypting & Uploading...</span>
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
                  onClick={() => setIsUploadModalOpen(false)}
                  disabled={isUploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={isUploading}
                >
                  <span>{isUploading ? 'Uploading...' : 'Upload Now'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: New Folder */}
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
                  <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#fff' }}>Create New Folder</h3>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Organize your documents and assets
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
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Create Folder
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
