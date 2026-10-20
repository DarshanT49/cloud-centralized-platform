import React, { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Folder,
  FileText,
  Image as ImageIcon,
  Film,
  Archive,
  UploadCloud,
  Search,
  Download,
  Share2,
  Trash2,
  Star,
  Grid,
  List,
  FolderPlus,
  ArrowRightLeft,
  PlusCircle,
  ExternalLink
} from 'lucide-react';
import GoogleIcon from '../../components/GoogleIcon';

const getFileIcon = (type) => {
  switch (type) {
    case 'image':
      return <ImageIcon size={18} color="#c084fc" />;
    case 'video':
      return <Film size={18} color="#fb7185" />;
    case 'sheet':
      return <FileText size={18} color="#34d399" />;
    case 'archive':
      return <Archive size={18} color="#fbbf24" />;
    default:
      return <FileText size={18} color="#60a5fa" />;
  }
};

const MyFile = () => {
  const outletCtx = useOutletContext() || {};
  const {
    searchQuery = '',
    triggerToast = () => {},
    onOpenUploadModal = () => {},
    onOpenNewFolderModal = () => {},
    onOpenConnectGoogleModal = () => {},
    onOpenTransferModal = () => {},
    googleFiles = [],
    setGoogleFiles = () => {},
    connectedAccounts = [],
    activeAccount = null,
    driveApiStatus = {},
    refreshFiles = () => {},
    onDirectGoogleAuthorize = () => {}
  } = outletCtx;

  const [activeCategory, setActiveCategory] = useState('all');
  const [viewMode, setViewMode] = useState('list');

  // Toggle star
  const toggleStar = (id) => {
    setGoogleFiles(prev => prev.map(f => {
      if (f.id === id) {
        const nextStarred = !f.starred;
        triggerToast(nextStarred ? 'File added to Starred' : 'File removed from Starred');
        return { ...f, starred: nextStarred };
      }
      return f;
    }));
  };

  // Move to trash
  const moveToTrash = (file) => {
    setGoogleFiles(prev => prev.filter(f => f.id !== file.id));
    triggerToast(`"${file.name}" moved to Trash`);
  };

  // Copy share link
  const copyShareLink = (fileName) => {
    navigator.clipboard?.writeText(`https://cloudvault.app/share/${encodeURIComponent(fileName)}`);
    triggerToast('Encrypted share link copied to clipboard!');
  };

  // Extract dynamic folders from googleFiles
  const folders = useMemo(() => {
    const map = {};
    googleFiles.filter(f => !f.trashed).forEach(f => {
      const folderName = f.folder || 'General';
      if (!map[folderName]) {
        map[folderName] = {
          name: folderName,
          filesCount: 0,
          color: folderName.toLowerCase().includes('work') ? '#60a5fa' :
                 folderName.toLowerCase().includes('video') ? '#fb7185' :
                 folderName.toLowerCase().includes('design') ? '#c084fc' : '#34d399'
        };
      }
      map[folderName].filesCount += 1;
    });
    return Object.values(map);
  }, [googleFiles]);

  // Filter files
  const filteredFiles = useMemo(() => {
    return googleFiles
      .filter(f => !f.trashed)
      .filter(f => {
        const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase());
        if (activeCategory === 'all') return matchesSearch;
        return matchesSearch && f.type === activeCategory;
      });
  }, [googleFiles, searchQuery, activeCategory]);

  return (
    <div className="myfile-page">
      {/* Header & Primary Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#fff', margin: 0 }}>
            My <span className="gradient-text">Files</span>
          </h1>
          <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            {activeAccount ? `Browsing ${activeAccount.name} (${activeAccount.email})` : 'All your connected Google Drive files'}
          </p>
        </div>

        {/* View Actions */}
        {connectedAccounts.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onOpenNewFolderModal}
            >
              <FolderPlus size={16} color="#34d399" />
              <span>New Folder</span>
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={onOpenUploadModal}
            >
              <UploadCloud size={16} />
              <span>Upload File</span>
            </button>

            {/* List vs Grid Switch */}
            <div
              style={{
                display: 'flex',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                padding: 2
              }}
            >
              <button
                type="button"
                onClick={() => setViewMode('list')}
                style={{
                  background: viewMode === 'list' ? 'rgba(59, 130, 246, 0.25)' : 'transparent',
                  color: viewMode === 'list' ? '#38bdf8' : 'var(--text-muted)',
                  padding: '6px 8px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center'
                }}
                title="List view"
              >
                <List size={16} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                style={{
                  background: viewMode === 'grid' ? 'rgba(59, 130, 246, 0.25)' : 'transparent',
                  color: viewMode === 'grid' ? '#38bdf8' : 'var(--text-muted)',
                  padding: '6px 8px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center'
                }}
                title="Grid view"
              >
                <Grid size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Clean Zero State: No Accounts Connected */}
      {connectedAccounts.length === 0 ? (
        <div
          className="glass-panel"
          style={{
            padding: '56px 32px',
            textAlign: 'center',
            maxWidth: 620,
            margin: '40px auto',
            borderRadius: 'var(--radius-lg)'
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '20px',
              background: 'rgba(66, 133, 244, 0.1)',
              border: '1px solid rgba(66, 133, 244, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px'
            }}
          >
            <GoogleIcon size={36} />
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#fff', margin: '0 0 10px' }}>
            No Google Drive Linked
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6, margin: '0 0 28px' }}>
            Connect your Google Drive accounts to access, search, and manage files across all your drives from this single dashboard.
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onOpenConnectGoogleModal}
            style={{ padding: '12px 28px', fontSize: '0.95rem', margin: '0 auto' }}
          >
            <PlusCircle size={18} />
            <span>Connect Google Drive</span>
          </button>
        </div>
      ) : (
        <>

      {/* Folders Section */}
      {folders.length > 0 && (
        <div style={{ marginBottom: 36 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: '1.15rem', color: '#fff', margin: 0 }}>Folders</h2>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={onOpenNewFolderModal}
              style={{ fontSize: '0.8rem', color: '#60a5fa' }}
            >
              + New Folder
            </button>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
              gap: 16
            }}
          >
            {folders.map(folder => (
              <div
                key={folder.name}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.4)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
                onClick={() => triggerToast(`Opened folder "${folder.name}"`)}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 'var(--radius-sm)',
                    background: `${folder.color}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: folder.color
                  }}
                >
                  <Folder size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '0.92rem', fontWeight: 600, color: '#fff', margin: 0 }}>{folder.name}</h3>
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                    {folder.filesCount} {folder.filesCount === 1 ? 'file' : 'files'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Tabs */}
      {googleFiles.length > 0 && (
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, marginBottom: 20 }}>
          {[
            { id: 'all', label: 'All Files' },
            { id: 'doc', label: 'Documents' },
            { id: 'image', label: 'Images' },
            { id: 'video', label: 'Videos' },
            { id: 'sheet', label: 'Sheets' },
            { id: 'archive', label: 'Archives' }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveCategory(tab.id)}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.82rem',
                fontWeight: 600,
                background: activeCategory === tab.id ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                color: activeCategory === tab.id ? '#60a5fa' : 'var(--text-secondary)',
                border: activeCategory === tab.id ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Files List / Grid */}
      {driveApiStatus?.apiDisabled ? (
        <div
          className="glass-panel"
          style={{
            padding: '36px 28px',
            textAlign: 'center',
            maxWidth: 640,
            margin: '20px auto 40px',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(15, 23, 42, 0.7) 100%)',
            borderRadius: 'var(--radius-lg)'
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '16px',
              background: 'rgba(245, 158, 11, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}
          >
            <GoogleIcon size={30} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fbbf24', margin: '0 0 8px' }}>
            Google Drive API Activation Required
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6, margin: '0 0 24px' }}>
            Your Google account is linked, but the <strong>Google Drive API</strong> is not enabled in your Google Cloud Console for project <code>703955159949</code>. Enable it to grant CloudVault access to your files.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            <a
              href={driveApiStatus.activationUrl || 'https://console.developers.google.com/apis/api/drive.googleapis.com/overview?project=703955159949'}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              style={{ padding: '10px 22px', fontSize: '0.9rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}
            >
              <ExternalLink size={16} />
              <span>Enable Google Drive API</span>
            </a>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={refreshFiles}
              style={{ padding: '10px 20px', fontSize: '0.9rem' }}
            >
              <span>Refresh Files</span>
            </button>
          </div>
        </div>
      ) : driveApiStatus?.needsReauth ? (
        <div
          className="glass-panel"
          style={{
            padding: '36px 28px',
            textAlign: 'center',
            maxWidth: 640,
            margin: '20px auto 40px',
            border: '1px solid rgba(59, 130, 246, 0.4)',
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(15, 23, 42, 0.7) 100%)',
            borderRadius: 'var(--radius-lg)'
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '16px',
              background: 'rgba(59, 130, 246, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}
          >
            <GoogleIcon size={30} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#60a5fa', margin: '0 0 8px' }}>
            Google Drive Permission Authorization Required
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6, margin: '0 0 24px' }}>
            Your Google Account is linked, but file access permissions have not been granted yet. Please click below to grant Google Drive access so CloudVault can display and assess all your Drive files.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={onDirectGoogleAuthorize || onOpenConnectGoogleModal}
              style={{ padding: '10px 22px', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: 8 }}
            >
              <GoogleIcon size={16} />
              <span>Authorize Google Drive Access</span>
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={refreshFiles}
              style={{ padding: '10px 20px', fontSize: '0.9rem' }}
            >
              <span>Refresh Files</span>
            </button>
          </div>
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="glass-panel" style={{ padding: '48px 20px', textAlign: 'center' }}>
          <Search size={36} color="var(--text-muted)" style={{ marginBottom: 12 }} />
          <h3 style={{ color: '#fff', fontSize: '1rem', marginBottom: 4 }}>
            {searchQuery ? 'No matching files' : 'No files in this Google Drive'}
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem' }}>
            {searchQuery ? `No files match "${searchQuery}"` : 'Upload a file or sync your drive to see files here.'}
          </p>
        </div>
      ) : viewMode === 'list' ? (
        /* Table View */
        <div className="glass-panel" style={{ overflowX: 'auto', borderRadius: 'var(--radius-md)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '14px 20px', fontWeight: 600 }}>File Name</th>
                <th style={{ padding: '14px 20px', fontWeight: 600 }}>Drive Account</th>
                <th style={{ padding: '14px 20px', fontWeight: 600 }}>Folder</th>
                <th style={{ padding: '14px 20px', fontWeight: 600 }}>Size</th>
                <th style={{ padding: '14px 20px', fontWeight: 600 }}>Last Modified</th>
                <th style={{ padding: '14px 20px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFiles.map(f => (
                <tr
                  key={f.id}
                  style={{
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <td style={{ padding: '14px 20px', color: '#fff', display: 'flex', alignItems: 'center', gap: 12 }}>
                    {getFileIcon(f.type)}
                    {f.webViewLink ? (
                      <a
                        href={f.webViewLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#fff', textDecoration: 'none', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = '#60a5fa'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = '#fff'; }}
                        title="Open in Google Drive"
                      >
                        <span>{f.name}</span>
                        <ExternalLink size={12} color="var(--text-muted)" />
                      </a>
                    ) : (
                      <span style={{ fontWeight: 500 }}>{f.name}</span>
                    )}
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: 4,
                        fontSize: '0.74rem',
                        fontWeight: 600,
                        background: 'rgba(66, 133, 244, 0.12)',
                        color: f.accountColor || '#60a5fa',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                    >
                      <GoogleIcon size={12} />
                      {f.accountName || 'Google Drive'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px', color: 'var(--text-secondary)' }}>{f.folder || 'Root'}</td>
                  <td style={{ padding: '14px 20px', color: 'var(--text-secondary)' }}>{f.size}</td>
                  <td style={{ padding: '14px 20px', color: 'var(--text-muted)' }}>{f.date}</td>
                  <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 6 }}>
                      {/* Cross Drive Transfer Button */}
                      {connectedAccounts.length > 1 && (
                        <button
                          type="button"
                          title="Transfer to another Drive"
                          onClick={() => onOpenTransferModal(f)}
                          style={{
                            background: 'rgba(59, 130, 246, 0.15)',
                            padding: '6px',
                            borderRadius: '4px',
                            color: '#38bdf8'
                          }}
                        >
                          <ArrowRightLeft size={15} />
                        </button>
                      )}
                      {f.webViewLink && (
                        <a
                          href={f.webViewLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Open in Google Drive"
                          style={{
                            background: 'rgba(59, 130, 246, 0.15)',
                            padding: '6px',
                            borderRadius: '4px',
                            color: '#38bdf8',
                            display: 'inline-flex',
                            alignItems: 'center'
                          }}
                        >
                          <ExternalLink size={15} />
                        </a>
                      )}
                      <button
                        type="button"
                        title={f.starred ? 'Starred' : 'Add to Starred'}
                        onClick={() => toggleStar(f.id)}
                        style={{
                          background: f.starred ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255,255,255,0.05)',
                          padding: '6px',
                          borderRadius: '4px',
                          color: f.starred ? '#f59e0b' : 'var(--text-muted)'
                        }}
                      >
                        <Star size={15} fill={f.starred ? '#f59e0b' : 'none'} />
                      </button>
                      <button
                        type="button"
                        title="Share"
                        onClick={() => copyShareLink(f.name)}
                        style={{
                          background: 'rgba(255,255,255,0.05)',
                          padding: '6px',
                          borderRadius: '4px',
                          color: 'var(--text-secondary)'
                        }}
                      >
                        <Share2 size={15} />
                      </button>
                      <button
                        type="button"
                        title="Download"
                        onClick={() => {
                          if (f.webContentLink) {
                            window.open(f.webContentLink, '_blank');
                          } else if (f.webViewLink) {
                            window.open(f.webViewLink, '_blank');
                          } else {
                            triggerToast(`Downloading ${f.name}...`);
                          }
                        }}
                        style={{
                          background: 'rgba(255,255,255,0.05)',
                          padding: '6px',
                          borderRadius: '4px',
                          color: 'var(--text-secondary)'
                        }}
                      >
                        <Download size={15} />
                      </button>
                      <button
                        type="button"
                        title="Move to Trash"
                        onClick={() => moveToTrash(f)}
                        style={{
                          background: 'rgba(244,63,94,0.1)',
                          padding: '6px',
                          borderRadius: '4px',
                          color: '#fb7185'
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Grid Cards View */
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: 16
          }}
        >
          {filteredFiles.map(f => (
            <div
              key={f.id}
              className="glass-panel"
              style={{
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 14,
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.4)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {getFileIcon(f.type)}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {connectedAccounts.length > 1 && (
                    <button
                      type="button"
                      onClick={() => onOpenTransferModal(f)}
                      title="Transfer across drives"
                      style={{ background: 'transparent', color: '#38bdf8' }}
                    >
                      <ArrowRightLeft size={15} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => toggleStar(f.id)}
                    style={{ background: 'transparent', color: f.starred ? '#f59e0b' : 'var(--text-muted)' }}
                  >
                    <Star size={16} fill={f.starred ? '#f59e0b' : 'none'} />
                  </button>
                </div>
              </div>

              <div>
                <h4
                  style={{
                    margin: '0 0 4px',
                    fontSize: '0.88rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                  title={f.name}
                >
                  {f.webViewLink ? (
                    <a
                      href={f.webViewLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#fff', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = '#60a5fa'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = '#fff'; }}
                    >
                      <span>{f.name}</span>
                      <ExternalLink size={11} color="var(--text-muted)" />
                    </a>
                  ) : (
                    <span style={{ color: '#fff' }}>{f.name}</span>
                  )}
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      color: f.accountColor || '#60a5fa',
                      background: 'rgba(66, 133, 244, 0.1)',
                      padding: '1px 5px',
                      borderRadius: 3
                    }}
                  >
                    {f.accountName || 'Google Drive'}
                  </span>
                </div>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  {f.size} • {f.date}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, borderTop: '1px solid var(--border-color)', paddingTop: 10 }}>
                {f.webViewLink && (
                  <a
                    href={f.webViewLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ background: 'rgba(59, 130, 246, 0.15)', padding: 6, borderRadius: 4, color: '#38bdf8', display: 'inline-flex', alignItems: 'center' }}
                    title="Open in Google Drive"
                  >
                    <ExternalLink size={14} />
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => copyShareLink(f.name)}
                  style={{ background: 'rgba(255,255,255,0.05)', padding: 6, borderRadius: 4, color: 'var(--text-secondary)' }}
                  title="Share"
                >
                  <Share2 size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (f.webContentLink) {
                      window.open(f.webContentLink, '_blank');
                    } else if (f.webViewLink) {
                      window.open(f.webViewLink, '_blank');
                    } else {
                      triggerToast(`Downloading ${f.name}...`);
                    }
                  }}
                  style={{ background: 'rgba(255,255,255,0.05)', padding: 6, borderRadius: 4, color: 'var(--text-secondary)' }}
                  title="Download"
                >
                  <Download size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => moveToTrash(f)}
                  style={{ background: 'rgba(244,63,94,0.1)', padding: 6, borderRadius: 4, color: '#fb7185' }}
                  title="Move to Trash"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
        </>
      )}
    </div>
  );
};

export default MyFile;
