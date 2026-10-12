import React, { useState } from 'react';
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
    openUploadModal = () => {},
    openNewFolderModal = () => {}
  } = outletCtx;

  const [files, setFiles] = useState(initialFiles);
  const [activeCategory, setActiveCategory] = useState('all');
  const [viewMode, setViewMode] = useState('list');

  // Toggle star
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

  // Move to trash
  const moveToTrash = (file) => {
    setFiles(prev => prev.filter(f => f.id !== file.id));
    triggerToast(`"${file.name}" moved to Trash`);
  };

  // Copy share link
  const copyShareLink = (fileName) => {
    navigator.clipboard?.writeText(`https://cloudvault.app/share/${encodeURIComponent(fileName)}`);
    triggerToast('Encrypted share link copied to clipboard!');
  };

  // Filter files
  const filteredFiles = files.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeCategory === 'all') return matchesSearch;
    return matchesSearch && f.type === activeCategory;
  });

  return (
    <div className="myfile-page">
      {/* Header & Primary Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#fff', margin: 0 }}>
            My <span className="gradient-text">Files</span>
          </h1>
          <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            All your encrypted folders, documents, and assets
          </p>
        </div>

        {/* View Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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
      </div>

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

      {/* Category Tabs */}
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
    </div>
  );
};

export default MyFile;
