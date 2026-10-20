import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import GoogleIcon from '../components/GoogleIcon';
import {
  Cloud,
  Folder,
  Clock,
  Users,
  Trash2,
  Star,
  Plus,
  UploadCloud,
  FolderPlus,
  FileUp,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  LayoutDashboard,
  Layers,
  Check
} from 'lucide-react';

const navItems = [
  {
    name: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard
  },
  {
    name: 'Google Drive Files',
    path: '/dashboard/my-files',
    icon: Folder
  },
  {
    name: 'Recent Activity',
    path: '/dashboard/recent',
    icon: Clock
  },
  {
    name: 'Shared with Me',
    path: '/dashboard/shared',
    icon: Users
  },
  {
    name: 'Starred Files',
    path: '/dashboard/starred',
    icon: Star
  },
  {
    name: 'Trash & Bin',
    path: '/dashboard/trash',
    icon: Trash2
  }
];

const Sidebar = ({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
  connectedAccounts = [],
  selectedAccountId = 'all',
  onSelectAccount = () => {},
  activeAccount,
  onOpenConnectGoogleModal = () => {},
  onOpenUploadModal = () => {},
  onOpenNewFolderModal = () => {}
}) => {
  const [showUploadMenu, setShowUploadMenu] = useState(false);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const accountDropdownRef = useRef(null);

  // Close account dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (accountDropdownRef.current && !accountDropdownRef.current.contains(e.target)) {
        setShowAccountDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const hasAccounts = connectedAccounts.length > 0;

  return (
    <aside className={`dashboard-sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
      {/* Sidebar Header */}
      <div className="sidebar-header">
        <Link to="/" className="sidebar-brand" onClick={onCloseMobile}>
          <div className="brand-icon-box">
            <Cloud size={20} />
          </div>
          <div className="brand-text-container">
            <span className="brand-title">
              Cloud<span className="gradient-text">Vault</span>
            </span>
          </div>
        </Link>

        {/* Desktop collapse toggle */}
        <button
          type="button"
          className="sidebar-collapse-btn"
          onClick={onToggleCollapse}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label="Toggle sidebar collapse"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        {/* Mobile close toggle */}
        <button
          type="button"
          className="mobile-menu-trigger-btn"
          style={{ display: mobileOpen ? 'flex' : 'none' }}
          onClick={onCloseMobile}
          aria-label="Close sidebar"
        >
          <X size={18} />
        </button>
      </div>

      {/* Google Multi-Account Switcher */}
      <div className="google-account-switcher-box" ref={accountDropdownRef}>
        <button
          type="button"
          className="switcher-toggle-btn"
          onClick={() => setShowAccountDropdown(!showAccountDropdown)}
          title="Switch Active Google Account or View All"
        >
          <div className="switcher-account-info">
            <div className="account-avatar-wrapper">
              {!hasAccounts ? (
                <div className="account-avatar-fallback">
                  <GoogleIcon size={16} />
                </div>
              ) : selectedAccountId === 'all' ? (
                <div className="account-avatar-fallback">
                  <Layers size={16} />
                </div>
              ) : activeAccount?.avatar ? (
                <img
                  src={activeAccount.avatar}
                  alt={activeAccount.name}
                  className="account-avatar-img"
                />
              ) : (
                <div className="account-avatar-fallback">
                  {activeAccount?.name?.[0] || 'G'}
                </div>
              )}
            </div>

            <div className="switcher-account-text">
              <span className="account-display-name">
                {!hasAccounts
                  ? 'Connect Google Drive'
                  : selectedAccountId === 'all'
                  ? 'All Google Accounts'
                  : activeAccount?.name || 'Google Drive'}
              </span>
              <span className="account-display-email">
                {!hasAccounts
                  ? 'Click to link account'
                  : selectedAccountId === 'all'
                  ? `${connectedAccounts.length} Connected Drives`
                  : activeAccount?.email || 'Connected'}
              </span>
            </div>
          </div>

          <ChevronDown
            size={14}
            className="switcher-chevron"
            style={{
              transition: 'transform 0.2s ease',
              transform: showAccountDropdown ? 'rotate(180deg)' : 'none',
              color: 'var(--text-muted)'
            }}
          />
        </button>

        {/* Account Switcher Dropdown */}
        {showAccountDropdown && (
          <div className="account-switcher-dropdown">
            <div className="account-dropdown-header">
              <span>Google Accounts</span>
              <button
                type="button"
                className="btn-dropdown-add"
                onClick={() => {
                  setShowAccountDropdown(false);
                  onOpenConnectGoogleModal();
                }}
              >
                + Connect
              </button>
            </div>

            {hasAccounts && (
              <button
                type="button"
                className={`account-select-option ${selectedAccountId === 'all' ? 'active' : ''}`}
                onClick={() => {
                  onSelectAccount('all');
                  setShowAccountDropdown(false);
                }}
              >
                <div className="account-option-left">
                  <div className="account-avatar-wrapper" style={{ width: 26, height: 26, minWidth: 26 }}>
                    <div className="account-avatar-fallback" style={{ fontSize: '0.75rem' }}>
                      <Layers size={14} />
                    </div>
                  </div>
                  <div className="account-option-meta">
                    <span className="account-option-name">All Drives Aggregated</span>
                    <span className="account-option-sub">
                      {connectedAccounts.length} Connected {connectedAccounts.length === 1 ? 'Drive' : 'Drives'}
                    </span>
                  </div>
                </div>
                {selectedAccountId === 'all' && <Check size={14} color="#60a5fa" />}
              </button>
            )}

            {connectedAccounts.map(account => {
              const isSelected = selectedAccountId === account.id;
              return (
                <button
                  key={account.id}
                  type="button"
                  className={`account-select-option ${isSelected ? 'active' : ''}`}
                  onClick={() => {
                    onSelectAccount(account.id);
                    setShowAccountDropdown(false);
                  }}
                >
                  <div className="account-option-left">
                    <div className="account-avatar-wrapper" style={{ width: 26, height: 26, minWidth: 26 }}>
                      {account.avatar ? (
                        <img src={account.avatar} alt={account.name} className="account-avatar-img" />
                      ) : (
                        <div className="account-avatar-fallback" style={{ fontSize: '0.7rem' }}>
                          {account.name?.[0] || 'G'}
                        </div>
                      )}
                    </div>
                    <div className="account-option-meta">
                      <span className="account-option-name">{account.name}</span>
                      <span className="account-option-sub">{account.email}</span>
                    </div>
                  </div>
                  {isSelected && <Check size={14} color="#60a5fa" />}
                </button>
              );
            })}

            <div className="account-dropdown-divider" />

            <button
              type="button"
              className="btn-add-google-account"
              onClick={() => {
                setShowAccountDropdown(false);
                onOpenConnectGoogleModal();
              }}
            >
              <GoogleIcon size={14} />
              <span>+ Connect Google Drive</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Upload / Create Action Button */}
      <div className="sidebar-action-wrap">
        <button
          type="button"
          className="sidebar-new-btn"
          onClick={() => setShowUploadMenu(!showUploadMenu)}
          title="Upload or create new items"
        >
          <Plus size={18} />
          <span>New Upload</span>
        </button>

        {/* Quick Upload Dropdown Menu */}
        {showUploadMenu && (
          <div className="sidebar-action-menu">
            <button
              type="button"
              className="action-menu-item"
              onClick={() => {
                setShowUploadMenu(false);
                onOpenUploadModal();
              }}
            >
              <FileUp size={16} color="#38bdf8" />
              <span>Upload to Google Drive</span>
            </button>
            <button
              type="button"
              className="action-menu-item"
              onClick={() => {
                setShowUploadMenu(false);
                onOpenNewFolderModal();
              }}
            >
              <FolderPlus size={16} color="#34d399" />
              <span>New Drive Folder</span>
            </button>
          </div>
        )}
      </div>

      {/* Sidebar Nav Items */}
      <div className="sidebar-nav-container">
        <div>
          <div className="sidebar-section-title">Navigation</div>
          <ul className="sidebar-menu-list">
            {navItems.map(item => {
              const Icon = item.icon;
              return (
                <li key={item.name} className="sidebar-menu-item">
                  <NavLink
                    to={item.path}
                    end={item.path === '/dashboard'}
                    onClick={onCloseMobile}
                    className={({ isActive }) => `sidebar-menu-link ${isActive ? 'active' : ''}`}
                    title={collapsed ? item.name : undefined}
                  >
                    <div className="menu-link-main">
                      <div className="menu-link-icon">
                        <Icon size={18} />
                      </div>
                      <span className="menu-link-text">{item.name}</span>
                    </div>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
