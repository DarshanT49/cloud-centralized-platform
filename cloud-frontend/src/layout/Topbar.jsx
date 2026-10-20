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
  LayoutDashboard
} from 'lucide-react';
import GoogleIcon from '../components/GoogleIcon';

const viewMetadata = {
  '/dashboard': { title: 'Dashboard', icon: LayoutDashboard },
  '/dashboard/my-files': { title: 'Google Drive Files', icon: Folder },
  '/dashboard/recent': { title: 'Recent Activity', icon: Clock },
  '/dashboard/shared': { title: 'Shared with Me', icon: Users },
  '/dashboard/trash': { title: 'Trash & Bin', icon: Trash2 },
  '/dashboard/starred': { title: 'Starred Files', icon: Star }
};

const Topbar = ({
  onToggleMobile,
  searchQuery,
  onSearchChange,
  currentUser,
  connectedAccounts = [],
  selectedAccountId = 'all',
  onSelectAccount = () => {},
  onOpenConnectGoogleModal = () => {},
  onOpenUploadModal = () => {},
  triggerToast = () => {}
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
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    navigate('/login', { replace: true });
  };

  const currentMeta = viewMetadata[location.pathname] || { title: 'Dashboard', icon: LayoutDashboard };
  const PageIcon = currentMeta.icon;

  const displayName = currentUser?.fullName || currentUser?.email?.split('@')[0] || 'User';
  const userInitials = displayName.slice(0, 2).toUpperCase();

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
            <span>CloudVault</span>
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
            placeholder="Search drive files..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => onSearchChange('')}
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Topbar Right: Actions, Notifications, Profile */}
      <div className="topbar-right">
        {/* Active Google Drive Indicator Pill */}
        <button
          type="button"
          className="topbar-google-pill"
          onClick={onOpenConnectGoogleModal}
          title="Manage connected Google Drives"
        >
          <GoogleIcon size={14} />
          <span>
            {connectedAccounts.length === 0
              ? '+ Connect Google Drive'
              : selectedAccountId === 'all'
              ? `${connectedAccounts.length} Connected ${connectedAccounts.length === 1 ? 'Drive' : 'Drives'}`
              : (connectedAccounts.find(a => a.id === selectedAccountId)?.name || 'Google Drive')}
          </span>
        </button>

        {/* Quick Upload Button */}
        <button
          type="button"
          className="topbar-icon-action-btn"
          onClick={onOpenUploadModal}
          title="Upload to Google Drive"
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
          </button>

          {notificationsOpen && (
            <div className="topbar-popover-dropdown notifications-panel">
              <div className="notification-header">
                <span>Notifications</span>
              </div>
              <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Bell size={24} style={{ marginBottom: 8, opacity: 0.4 }} />
                <p style={{ margin: 0, fontSize: '0.84rem' }}>No new notifications</p>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  Drive activity updates will appear here
                </span>
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
            title="User Settings"
          >
            <div className="topbar-user-avatar">
              <span>{userInitials}</span>
            </div>
            <div className="topbar-user-meta">
              <span className="user-name">{displayName}</span>
              <span className="user-role">{currentUser?.email || 'Logged in'}</span>
            </div>
            <ChevronDown size={14} color="var(--text-muted)" />
          </button>

          {userMenuOpen && (
            <div className="topbar-popover-dropdown profile-dropdown-menu">
              <div className="profile-dropdown-header">
                <span className="user-full-name">{displayName}</span>
                <span className="user-email">{currentUser?.email || 'No email set'}</span>
              </div>

              <div className="dropdown-menu-list">
                <button
                  type="button"
                  className="dropdown-menu-item"
                  onClick={() => {
                    setUserMenuOpen(false);
                    onOpenConnectGoogleModal();
                  }}
                >
                  <GoogleIcon size={14} />
                  <span>Linked Google Accounts ({connectedAccounts.length})</span>
                </button>
              </div>

              <div className="profile-dropdown-divider" />

              <button
                type="button"
                className="dropdown-menu-item logout-item"
                onClick={handleLogout}
              >
                <LogOut size={15} />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
