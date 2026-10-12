import React, { useState } from 'react';
import { useOutletContext, useLocation } from 'react-router-dom';
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
  RotateCcw,
  AlertTriangle,
  Copy,
  FolderPlus
} from 'lucide-react';

const initialFolders = [
  { id: 1, name: 'Work Documents', filesCount: 38, size: '24.5 GB', color: '#60a5fa' },
  { id: 2, name: 'Design Assets & UI', filesCount: 84, size: '18.2 GB', color: '#c084fc' },
  { id: 3, name: 'Video Productions', filesCount: 14, size: '19.8 GB', color: '#fb7185' },
  { id: 4, name: 'Personal Backups', filesCount: 12, size: '1.7 GB', color: '#34d399' }
];

const initialFiles = [
  { id: 1, name: 'Project_Alpha_Blueprint.pdf', size: '8.4 MB', type: 'doc', date: 'Today, 2:40 PM', starred: true, folder: 'Work Documents' },
  { id: 2, name: 'Hero_Mockup_Retina_Render.png', size: '14.2 MB', type: 'image', date: 'Today, 11:15 AM', starred: false, folder: 'Design Assets & UI' },
  { id: 3, name: 'Annual_Financial_Model_2026.xlsx', size: '4.1 MB', type: 'sheet', date: 'Yesterday', starred: true, folder: 'Work Documents' },
  { id: 4, name: 'Client_Demo_Recording_1080p.mp4', size: '412.0 MB', type: 'video', date: 'Oct 05, 2026', starred: false, folder: 'Video Productions' },
  { id: 5, name: 'Source_Code_Archive.zip', size: '85.4 MB', type: 'archive', date: 'Oct 01, 2026', starred: false, folder: 'Personal Backups' },
  { id: 6, name: 'Product_Roadmap_Q4.pdf', size: '3.6 MB', type: 'doc', date: 'Sep 28, 2026', starred: true, folder: 'Work Documents' },
  { id: 7, name: 'Brand_Identity_Guidelines.pdf', size: '22.1 MB', type: 'doc', date: 'Sep 24, 2026', starred: false, folder: 'Design Assets & UI' }
];

const initialShared = [
  { id: 101, name: 'Q3_Performance_Review.pdf', size: '5.2 MB', type: 'doc', sharedBy: 'Sarah Jenkins', sharedWith: 'You', permission: 'Can Edit', date: 'Today' },
  { id: 102, name: 'Design_System_v2_Tokens.png', size: '45.0 MB', type: 'image', sharedBy: 'You', sharedWith: 'Design Team (4)', permission: 'View Only', date: 'Oct 08, 2026' },
  { id: 103, name: 'Product_Launch_Press_Kit.zip', size: '120.4 MB', type: 'archive', sharedBy: 'Marketing Lead', sharedWith: 'You', permission: 'Can Edit', date: 'Oct 03, 2026' }
];

const initialTrash = [
  { id: 201, name: 'Old_Pitch_Deck_Draft.pdf', size: '12.8 MB', type: 'doc', deletedDate: '2 days ago', daysRemaining: 28 },
  { id: 202, name: 'Unused_Hero_Illustration_v1.png', size: '8.4 MB', type: 'image', deletedDate: '5 days ago', daysRemaining: 25 },
  { id: 203, name: 'Temp_Database_Export.xlsx', size: '64.0 MB', type: 'sheet', deletedDate: '10 days ago', daysRemaining: 20 }
];

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

const Dashboard = ({ view: viewProp }) => {
  const location = useLocation();
  const outletCtx = useOutletContext() || {};
  const {
    searchQuery = '',
    triggerToast = () => {},
    openUploadModal = () => {},
    openNewFolderModal = () => {}
  } = outletCtx;

  // Determine current active view from prop or URL path
  const currentView = viewProp || (() => {
    if (location.pathname.includes('/recent')) return 'recent';
    if (location.pathname.includes('/shared')) return 'shared';
    if (location.pathname.includes('/trash')) return 'trash';
    if (location.pathname.includes('/starred')) return 'starred';
    return 'my-files';
  })();

  const [files, setFiles] = useState(initialFiles);
  const [trashFiles, setTrashFiles] = useState(initialTrash);
  const [sharedFiles] = useState(initialShared);
  const [activeCategory, setActiveCategory] = useState('all');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'

  // Star / unstar file
  const toggleStar = (id) => {
    setFiles(prev => prev.map(f => {
      if (f.id === id) {
        const nextStarred = !f.starred;
        triggerToast(nextStarred ? 'File added to Starred' : 'File removed from Starred');
        return { ...f, starred: nextStarred };
      }
      return f;
    }));
  };

  // Move file to trash
  const moveToTrash = (file) => {
    setFiles(prev => prev.filter(f => f.id !== file.id));
    setTrashFiles(prev => [
      {
        id: file.id,
        name: file.name,
        size: file.size,
        type: file.type,
        deletedDate: 'Just now',
        daysRemaining: 30
      },
      ...prev
    ]);
    triggerToast(`"${file.name}" moved to Trash`);
  };

  // Restore file from trash
  const restoreFromTrash = (trashFile) => {
    setTrashFiles(prev => prev.filter(t => t.id !== trashFile.id));
    setFiles(prev => [
      {
        id: trashFile.id,
        name: trashFile.name,
        size: trashFile.size,
        type: trashFile.type,
        date: 'Restored today',
        starred: false,
        folder: 'Work Documents'
      },
      ...prev
    ]);
    triggerToast(`"${trashFile.name}" restored to My Files`);
  };

  // Permanently delete from trash
  const deletePermanently = (id) => {
    setTrashFiles(prev => prev.filter(t => t.id !== id));
    triggerToast('File permanently deleted from vault.');
  };

  // Empty trash
  const emptyTrash = () => {
    if (trashFiles.length === 0) return;
    setTrashFiles([]);
    triggerToast('Trash emptied. Storage space freed up!');
  };

  // Copy share link
  const copyShareLink = (fileName) => {
    navigator.clipboard?.writeText(`https://cloudvault.app/share/${encodeURIComponent(fileName)}`);
    triggerToast('Encrypted share link copied to clipboard!');
  };

  // Filter files by category & search
  const filteredFiles = files.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeCategory === 'all') return matchesSearch;
    return matchesSearch && f.type === activeCategory;
  });

  const starredList = files.filter(f => f.starred && f.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const filteredTrash = trashFiles.filter(f =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredShared = sharedFiles.filter(f =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      {/* View Header & Primary Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#fff', margin: 0 }}>
            {currentView === 'my-files' && <span>My <span className="gradient-text">Files</span></span>}
            {currentView === 'recent' && <span>Recent <span className="gradient-text">Activity</span></span>}
            {currentView === 'shared' && <span>Shared <span className="gradient-text">with Me</span></span>}
            {currentView === 'trash' && <span>Trash & <span className="gradient-text">Bin</span></span>}
            {currentView === 'starred' && <span>Starred <span className="gradient-text">Files</span></span>}
          </h1>
          <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            {currentView === 'my-files' && 'All your encrypted folders, documents, and assets'}
            {currentView === 'recent' && 'Recently opened and modified files in your vault'}
            {currentView === 'shared' && 'Files shared by team members and collaborators'}
            {currentView === 'trash' && 'Deleted items are kept for 30 days before permanent deletion'}
            {currentView === 'starred' && 'Quick access to your most important files'}
          </p>
        </div>

        {/* View Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {currentView === 'my-files' && (
            <>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={openNewFolderModal}
              >
                <FolderPlus size={16} color="#34d399" />
                <span>New Folder</span>
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={openUploadModal}
              >
                <UploadCloud size={16} />
                <span>Upload File</span>
              </button>
            </>
          )}

          {currentView === 'trash' && trashFiles.length > 0 && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={emptyTrash}
              style={{ color: '#fb7185', borderColor: 'rgba(244, 63, 94, 0.3)' }}
            >
              <Trash2 size={16} />
              <span>Empty Trash</span>
            </button>
          )}

          {/* Toggle between Grid and List */}
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
      </div>

      {/* VIEW: MY FILES */}
      {currentView === 'my-files' && (
        <>
          {/* Storage Quick Summary Banner */}
          <div
            className="glass-panel"
            style={{
              padding: '20px 24px',
              marginBottom: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 20
            }}
          >
            <div style={{ flex: 1, minWidth: 260 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.88rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Storage Quota Used</span>
                <strong style={{ color: '#fff' }}>64.2 GB of 100 GB (64%)</strong>
              </div>
              <div style={{ height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ width: '64%', height: '100%', background: 'var(--gradient-primary)' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 24 }}>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', display: 'block' }}>148</span>
                <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Files</span>
              </div>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#38bdf8', display: 'block' }}>4</span>
                <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Folders</span>
              </div>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#10b981', display: 'block' }}>100%</span>
                <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Encrypted</span>
              </div>
            </div>
          </div>

          {/* Folders Section */}
          <div style={{ marginBottom: 36 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: '1.15rem', color: '#fff', margin: 0 }}>Folders</h2>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={openNewFolderModal}
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
              {initialFolders.map(folder => (
                <div
                  key={folder.id}
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
                      {folder.filesCount} files • {folder.size}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Files Filtering Tabs */}
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

          {/* Files List / Grid */}
          {filteredFiles.length === 0 ? (
            <div className="glass-panel" style={{ padding: '48px 20px', textAlign: 'center' }}>
              <Search size={36} color="var(--text-muted)" style={{ marginBottom: 12 }} />
              <h3 style={{ color: '#fff', fontSize: '1rem', marginBottom: 4 }}>No files found</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem' }}>
                {searchQuery ? `No files match "${searchQuery}"` : 'Upload files to get started.'}
              </p>
            </div>
          ) : viewMode === 'list' ? (
            /* Table View */
            <div className="glass-panel" style={{ overflowX: 'auto', borderRadius: 'var(--radius-md)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '14px 20px', fontWeight: 600 }}>File Name</th>
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
                        <span style={{ fontWeight: 500 }}>{f.name}</span>
                      </td>
                      <td style={{ padding: '14px 20px', color: 'var(--text-secondary)' }}>{f.folder}</td>
                      <td style={{ padding: '14px 20px', color: 'var(--text-secondary)' }}>{f.size}</td>
                      <td style={{ padding: '14px 20px', color: 'var(--text-muted)' }}>{f.date}</td>
                      <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 6 }}>
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
                            onClick={() => triggerToast(`Downloading ${f.name}...`)}
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
                    <button
                      type="button"
                      onClick={() => toggleStar(f.id)}
                      style={{ background: 'transparent', color: f.starred ? '#f59e0b' : 'var(--text-muted)' }}
                    >
                      <Star size={16} fill={f.starred ? '#f59e0b' : 'none'} />
                    </button>
                  </div>

                  <div>
                    <h4
                      style={{
                        margin: '0 0 4px',
                        color: '#fff',
                        fontSize: '0.88rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                      title={f.name}
                    >
                      {f.name}
                    </h4>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      {f.size} • {f.date}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, borderTop: '1px solid var(--border-color)', paddingTop: 10 }}>
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
                      onClick={() => triggerToast(`Downloading ${f.name}...`)}
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

      {/* VIEW: RECENT */}
      {currentView === 'recent' && (
        <div>
          <div className="glass-panel" style={{ overflowX: 'auto', borderRadius: 'var(--radius-md)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '14px 20px', fontWeight: 600 }}>File Name</th>
                  <th style={{ padding: '14px 20px', fontWeight: 600 }}>Last Modified</th>
                  <th style={{ padding: '14px 20px', fontWeight: 600 }}>Size</th>
                  <th style={{ padding: '14px 20px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFiles.map(f => (
                  <tr
                    key={f.id}
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                  >
                    <td style={{ padding: '14px 20px', color: '#fff', display: 'flex', alignItems: 'center', gap: 12 }}>
                      {getFileIcon(f.type)}
                      <span style={{ fontWeight: 500 }}>{f.name}</span>
                    </td>
                    <td style={{ padding: '14px 20px', color: '#38bdf8' }}>{f.date}</td>
                    <td style={{ padding: '14px 20px', color: 'var(--text-secondary)' }}>{f.size}</td>
                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 6 }}>
                        <button
                          type="button"
                          onClick={() => triggerToast(`Opened ${f.name}`)}
                          style={{ background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '4px', color: '#60a5fa', fontSize: '0.8rem' }}
                        >
                          Open
                        </button>
                        <button
                          type="button"
                          onClick={() => copyShareLink(f.name)}
                          style={{ background: 'rgba(255,255,255,0.05)', padding: '6px', borderRadius: '4px', color: 'var(--text-secondary)' }}
                        >
                          <Share2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW: SHARED */}
      {currentView === 'shared' && (
        <div>
          <div className="glass-panel" style={{ overflowX: 'auto', borderRadius: 'var(--radius-md)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '14px 20px', fontWeight: 600 }}>File Name</th>
                  <th style={{ padding: '14px 20px', fontWeight: 600 }}>Shared By</th>
                  <th style={{ padding: '14px 20px', fontWeight: 600 }}>Access Level</th>
                  <th style={{ padding: '14px 20px', fontWeight: 600 }}>Date</th>
                  <th style={{ padding: '14px 20px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredShared.map(s => (
                  <tr
                    key={s.id}
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                  >
                    <td style={{ padding: '14px 20px', color: '#fff', display: 'flex', alignItems: 'center', gap: 12 }}>
                      {getFileIcon(s.type)}
                      <span style={{ fontWeight: 500 }}>{s.name}</span>
                    </td>
                    <td style={{ padding: '14px 20px', color: 'var(--text-secondary)' }}>{s.sharedBy}</td>
                    <td style={{ padding: '14px 20px' }}>
                      <span
                        style={{
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          background: s.permission === 'Can Edit' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                          color: s.permission === 'Can Edit' ? '#60a5fa' : '#34d399'
                        }}
                      >
                        {s.permission}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px', color: 'var(--text-muted)' }}>{s.date}</td>
                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => copyShareLink(s.name)}
                        style={{
                          background: 'rgba(59, 130, 246, 0.12)',
                          border: '1px solid rgba(59, 130, 246, 0.3)',
                          color: '#60a5fa',
                          padding: '6px 12px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.8rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6
                        }}
                      >
                        <Copy size={13} />
                        <span>Copy Link</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW: TRASH */}
      {currentView === 'trash' && (
        <div>
          {/* Warning Banner */}
          <div
            style={{
              background: 'rgba(244, 63, 94, 0.08)',
              border: '1px solid rgba(244, 63, 94, 0.25)',
              borderRadius: 'var(--radius-md)',
              padding: '14px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 24,
              color: '#fda4af',
              fontSize: '0.88rem'
            }}
          >
            <AlertTriangle size={20} color="#fb7185" style={{ flexShrink: 0 }} />
            <div>
              <strong>Items in trash are automatically purged after 30 days.</strong>
              <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                You can restore any deleted file or purge it immediately to free up quota.
              </span>
            </div>
          </div>

          {filteredTrash.length === 0 ? (
            <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center' }}>
              <Trash2 size={42} color="var(--text-muted)" style={{ marginBottom: 14 }} />
              <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: 6 }}>Trash is empty</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Files you delete will appear here before being permanently removed.
              </p>
            </div>
          ) : (
            <div className="glass-panel" style={{ overflowX: 'auto', borderRadius: 'var(--radius-md)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '14px 20px', fontWeight: 600 }}>File Name</th>
                    <th style={{ padding: '14px 20px', fontWeight: 600 }}>Deleted</th>
                    <th style={{ padding: '14px 20px', fontWeight: 600 }}>Days Remaining</th>
                    <th style={{ padding: '14px 20px', fontWeight: 600 }}>Size</th>
                    <th style={{ padding: '14px 20px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTrash.map(t => (
                    <tr
                      key={t.id}
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                    >
                      <td style={{ padding: '14px 20px', color: '#fff', display: 'flex', alignItems: 'center', gap: 12 }}>
                        {getFileIcon(t.type)}
                        <span style={{ fontWeight: 500 }}>{t.name}</span>
                      </td>
                      <td style={{ padding: '14px 20px', color: 'var(--text-muted)' }}>{t.deletedDate}</td>
                      <td style={{ padding: '14px 20px', color: '#fb7185' }}>{t.daysRemaining} days left</td>
                      <td style={{ padding: '14px 20px', color: 'var(--text-secondary)' }}>{t.size}</td>
                      <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 8 }}>
                          <button
                            type="button"
                            title="Restore file"
                            onClick={() => restoreFromTrash(t)}
                            style={{
                              background: 'rgba(59, 130, 246, 0.15)',
                              border: '1px solid rgba(59, 130, 246, 0.3)',
                              color: '#60a5fa',
                              padding: '6px 12px',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: '0.8rem',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6
                            }}
                          >
                            <RotateCcw size={14} />
                            <span>Restore</span>
                          </button>
                          <button
                            type="button"
                            title="Delete permanently"
                            onClick={() => deletePermanently(t.id)}
                            style={{
                              background: 'rgba(244, 63, 94, 0.12)',
                              border: '1px solid rgba(244, 63, 94, 0.3)',
                              color: '#fb7185',
                              padding: '6px 12px',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: '0.8rem',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6
                            }}
                          >
                            <Trash2 size={14} />
                            <span>Delete Forever</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* VIEW: STARRED */}
      {currentView === 'starred' && (
        <div>
          {starredList.length === 0 ? (
            <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center' }}>
              <Star size={42} color="var(--text-muted)" style={{ marginBottom: 14 }} />
              <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: 6 }}>No starred files yet</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Star important files in My Files to easily find them here.
              </p>
            </div>
          ) : (
            <div className="glass-panel" style={{ overflowX: 'auto', borderRadius: 'var(--radius-md)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '14px 20px', fontWeight: 600 }}>File Name</th>
                    <th style={{ padding: '14px 20px', fontWeight: 600 }}>Folder</th>
                    <th style={{ padding: '14px 20px', fontWeight: 600 }}>Size</th>
                    <th style={{ padding: '14px 20px', fontWeight: 600 }}>Last Modified</th>
                    <th style={{ padding: '14px 20px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {starredList.map(f => (
                    <tr
                      key={f.id}
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                    >
                      <td style={{ padding: '14px 20px', color: '#fff', display: 'flex', alignItems: 'center', gap: 12 }}>
                        {getFileIcon(f.type)}
                        <span style={{ fontWeight: 500 }}>{f.name}</span>
                      </td>
                      <td style={{ padding: '14px 20px', color: 'var(--text-secondary)' }}>{f.folder}</td>
                      <td style={{ padding: '14px 20px', color: 'var(--text-secondary)' }}>{f.size}</td>
                      <td style={{ padding: '14px 20px', color: 'var(--text-muted)' }}>{f.date}</td>
                      <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          <button
                            type="button"
                            onClick={() => toggleStar(f.id)}
                            style={{ background: 'rgba(245, 158, 11, 0.15)', padding: '6px', borderRadius: '4px', color: '#f59e0b' }}
                          >
                            <Star size={15} fill="#f59e0b" />
                          </button>
                          <button
                            type="button"
                            onClick={() => triggerToast(`Downloading ${f.name}...`)}
                            style={{ background: 'rgba(255,255,255,0.05)', padding: '6px', borderRadius: '4px', color: 'var(--text-secondary)' }}
                          >
                            <Download size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
