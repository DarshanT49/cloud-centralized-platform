import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
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
  X
} from 'lucide-react';

const navItems = [
  {
    name: 'My Files',
    path: '/dashboard/my-files',
    fallbackPath: '/dashboard',
    icon: Folder,
    badge: '148'
  },
  {
    name: 'Recent',
    path: '/dashboard/recent',
    icon: Clock,
    badge: '12'
  },
  {
    name: 'Shared',
    path: '/dashboard/shared',
    icon: Users,
    badge: '4'
  },
  {
    name: 'Starred',
    path: '/dashboard/starred',
    icon: Star,
    badge: null
  },
  {
    name: 'Trash',
    path: '/dashboard/trash',
    icon: Trash2,
    badge: '5'
  }
];

const quickFolders = [
  { name: 'Work Documents', color: '#60a5fa' },
  { name: 'Design Assets & UI', color: '#c084fc' },
  { name: 'Video Productions', color: '#fb7185' },
  { name: 'Personal Backups', color: '#34d399' }
];

const Sidebar = ({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
  currentUser,
  onOpenUploadModal,
  onOpenNewFolderModal
}) => {
  const [showUploadMenu, setShowUploadMenu] = useState(false);

  const userInitials = (currentUser?.fullName || 'Alex Rivera')
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

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
            <span className="brand-badge-pro">PRO</span>
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
              <span>Upload Files</span>
            </button>
            <button
              type="button"
              className="action-menu-item"
              onClick={() => {
                setShowUploadMenu(false);
                onOpenUploadModal();
              }}
            >
              <UploadCloud size={16} color="#818cf8" />
              <span>Upload Folder</span>
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
              <span>New Folder</span>
            </button>
          </div>
        )}
      </div>

      {/* Sidebar Nav Items */}
      <div className="sidebar-nav-container">
        {/* Core Menu */}
        <div>
          <div className="sidebar-section-title">Files & Drive</div>
          <ul className="sidebar-menu-list">
            {navItems.map(item => {
              const Icon = item.icon;
              return (
                <li key={item.name} className="sidebar-menu-item">
                  <NavLink
                    to={item.path}
                    onClick={onCloseMobile}
                    className={({ isActive }) => {
                      const active = isActive || (item.fallbackPath && window.location.pathname === item.fallbackPath);
                      return `sidebar-menu-link ${active ? 'active' : ''}`;
                    }}
                    title={collapsed ? item.name : undefined}
                  >
                    <div className="menu-link-main">
                      <div className="menu-link-icon">
                        <Icon size={18} />
                      </div>
                      <span className="menu-link-text">{item.name}</span>
                    </div>
                    {item.badge && <span className="menu-badge">{item.badge}</span>}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Quick Folders Tag Group */}
        {!collapsed && (
          <div>
            <div className="sidebar-section-title">Favorite Folders</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {quickFolders.map(folder => (
                <NavLink
                  key={folder.name}
                  to={`/dashboard/my-files?folder=${encodeURIComponent(folder.name)}`}
                  className="folder-pill-link"
                  onClick={onCloseMobile}
                >
                  <span
                    className="folder-color-dot"
                    style={{ backgroundColor: folder.color }}
                  />
                  <span>{folder.name}</span>
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </div>


    </aside>
  );
};

export default Sidebar;
