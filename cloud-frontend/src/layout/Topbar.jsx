import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  Search,
  X,
  Bell,
  UploadCloud,
  ChevronDown,
  ShieldCheck,
  Settings,
  LogOut,
  HardDrive,
  Folder,
  Clock,
  Users,
  Trash2,
  Star,
  CheckCircle2,
  FileText
} from 'lucide-react';

const viewMetadata = {
  '/dashboard': { title: 'My Files', icon: Folder },
  '/dashboard/my-files': { title: 'My Files', icon: Folder },
  '/dashboard/recent': { title: 'Recent Files', icon: Clock },
  '/dashboard/shared': { title: 'Shared with Me', icon: Users },
  '/dashboard/trash': { title: 'Trash & Bin', icon: Trash2 },
  '/dashboard/starred': { title: 'Starred Files', icon: Star }
};

const Topbar = ({
  onToggleMobile,
  searchQuery,
  onSearchChange,
  currentUser,
  onOpenUploadModal
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const notifRef = useRef(null);
  const userMenuRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/login', { replace: true });
  };

  const currentMeta = viewMetadata[location.pathname] || { title: 'Cloud Drive', icon: HardDrive };
  const PageIcon = currentMeta.icon;

  const userInitials = (currentUser?.fullName || 'Alex Rivera')
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="dashboard-topbar">
      {/* Topbar Left: Mobile trigger & Breadcrumbs */}
      <div className="topbar-left">
        <button
          type="button"
          className="mobile-menu-trigger-btn"
          onClick={onToggleMobile}
          aria-label="Open sidebar drawer"
        >
          <Menu size={20} />
        </button>

        <div className="topbar-breadcrumb">
          <span className="breadcrumb-root">
            <HardDrive size={15} color="#38bdf8" />
            <span>Drive</span>
          </span>
          <span className="breadcrumb-sep">/</span>
          <span className="breadcrumb-active">
            <PageIcon size={16} color="#60a5fa" />
            <span>{currentMeta.title}</span>
          </span>
        </div>
      </div>

      {/* Topbar Center: Global Search */}
      <div className="topbar-center">
        <div className="topbar-search-box">
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            className="search-input-field"
            placeholder="Search drive by name, folder, tag..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchQuery ? (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => onSearchChange('')}
              title="Clear search"
            >
              <X size={14} />
            </button>
          ) : (
            <span className="search-shortcut-badge">⌘K</span>
          )}
        </div>
      </div>

      {/* Topbar Right: Actions, Notifications, Profile */}
      <div className="topbar-right">
        {/* Sync Status Badge */}
        <div className="sync-status-badge">
          <span className="sync-pulse-dot" />
          <span>Synced</span>
        </div>

        {/* Quick Upload Button */}
        <button
          type="button"
          className="topbar-icon-action-btn"
          onClick={onOpenUploadModal}
          title="Upload file or folder"
          aria-label="Upload"
        >
          <UploadCloud size={18} />
        </button>

        {/* Notifications Dropdown */}
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button
            type="button"
            className="topbar-icon-action-btn"
            onClick={() => {
              setNotificationsOpen(!notificationsOpen);
              setUserMenuOpen(false);
            }}
            title="Notifications"
            aria-label="View notifications"
          >
            <Bell size={18} />
            <span className="unread-indicator-dot" />
          </button>

          {notificationsOpen && (
            <div className="topbar-popover-dropdown notifications-panel">
              <div className="notification-header">
                <span>Drive Activity</span>
                <span style={{ fontSize: '0.74rem', color: '#38bdf8', cursor: 'pointer' }}>
                  Mark all read
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '4px 0' }}>
                <div className="notification-item notification-item-unread">
                  <FileText size={18} color="#60a5fa" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <strong style={{ color: '#fff', display: 'block' }}>Sarah Jenkins shared a folder</strong>
                    <span>"Quarterly_Assets_2026" was shared with edit rights</span>
                    <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>
                      10 mins ago
                    </span>
                  </div>
                </div>

                <div className="notification-item">
                  <CheckCircle2 size={18} color="#10b981" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <strong style={{ color: '#fff', display: 'block' }}>Encrypted Sync Complete</strong>
                    <span>All 148 drive files verified and securely backed up</span>
                    <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>
                      1 hour ago
                    </span>
                  </div>
                </div>

                <div className="notification-item">
                  <Trash2 size={18} color="#fb7185" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <strong style={{ color: '#fff', display: 'block' }}>Trash clean warning</strong>
                    <span>5 files in trash will be permanently purged in 24 days</span>
                    <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>
                      Yesterday
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div style={{ position: 'relative' }} ref={userMenuRef}>
          <button
            type="button"
            className="topbar-user-profile-btn"
            onClick={() => {
              setUserMenuOpen(!userMenuOpen);
              setNotificationsOpen(false);
            }}
            aria-label="User account menu"
          >
            <div className="user-avatar-pill" style={{ width: 30, height: 30, minWidth: 30, fontSize: '0.78rem' }}>
              <span>{userInitials}</span>
              <span className="user-status-dot" />
            </div>
            <span className="topbar-user-name">{currentUser?.fullName || 'Alex Rivera'}</span>
            <ChevronDown size={14} color="var(--text-secondary)" />
          </button>

          {userMenuOpen && (
            <div className="topbar-popover-dropdown user-menu-panel">
              <div className="user-menu-header">
                <div className="user-menu-name">{currentUser?.fullName || 'Alex Rivera'}</div>
                <div className="user-menu-email">{currentUser?.email || 'alex@cloudvault.io'}</div>
                <span className="brand-badge-pro" style={{ display: 'inline-block', marginTop: 6 }}>
                  {currentUser?.role || 'PRO MEMBER'}
                </span>
              </div>

              <div style={{ padding: '4px 0' }}>
                <button
                  type="button"
                  className="user-menu-link"
                  onClick={() => {
                    setUserMenuOpen(false);
                    navigate('/dashboard/my-files');
                  }}
                >
                  <Folder size={16} />
                  <span>My Cloud Storage</span>
                </button>
                <button
                  type="button"
                  className="user-menu-link"
                  onClick={() => {
                    setUserMenuOpen(false);
                    alert('Security encryption: Zero-Knowledge AES-256 enabled.');
                  }}
                >
                  <ShieldCheck size={16} />
                  <span>Security & Keys</span>
                </button>
                <button
                  type="button"
                  className="user-menu-link"
                  onClick={() => {
                    setUserMenuOpen(false);
                    alert('Account Settings: Vault preferences & sync parameters.');
                  }}
                >
                  <Settings size={16} />
                  <span>Account Settings</span>
                </button>
                <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '6px 0' }} />
                <button
                  type="button"
                  className="user-menu-link logout-link"
                  onClick={handleLogout}
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
