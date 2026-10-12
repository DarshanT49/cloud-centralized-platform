import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  FileText,
  Image as ImageIcon,
  Film,
  Archive,
  Search,
  Share2
} from 'lucide-react';

const initialRecentFiles = [
  { id: 1, name: 'Project_Alpha_Blueprint.pdf', size: '8.4 MB', type: 'doc', date: 'Today, 2:40 PM' },
  { id: 2, name: 'Hero_Mockup_Retina_Render.png', size: '14.2 MB', type: 'image', date: 'Today, 11:15 AM' },
  { id: 3, name: 'Annual_Financial_Model_2026.xlsx', size: '4.1 MB', type: 'sheet', date: 'Yesterday, 4:20 PM' },
  { id: 4, name: 'Client_Demo_Recording_1080p.mp4', size: '412.0 MB', type: 'video', date: 'Oct 05, 2026' },
  { id: 5, name: 'Source_Code_Archive.zip', size: '85.4 MB', type: 'archive', date: 'Oct 01, 2026' },
  { id: 6, name: 'Product_Roadmap_Q4.pdf', size: '3.6 MB', type: 'doc', date: 'Sep 28, 2026' }
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

const Recent = () => {
  const outletCtx = useOutletContext() || {};
  const { searchQuery = '', triggerToast = () => {} } = outletCtx;
  const [recentFiles] = useState(initialRecentFiles);

  const copyShareLink = (fileName) => {
    navigator.clipboard?.writeText(`https://cloudvault.app/share/${encodeURIComponent(fileName)}`);
    triggerToast('Encrypted share link copied to clipboard!');
  };

  const filtered = recentFiles.filter(f =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="recent-page">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#fff', margin: 0 }}>
          Recent <span className="gradient-text">Activity</span>
        </h1>
        <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
          Recently opened, uploaded, or updated files in your vault
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="glass-panel" style={{ padding: '48px 20px', textAlign: 'center' }}>
          <Search size={36} color="var(--text-muted)" style={{ marginBottom: 12 }} />
          <h3 style={{ color: '#fff', fontSize: '1rem', marginBottom: 4 }}>No recent files found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem' }}>
            {searchQuery ? `No files match "${searchQuery}"` : 'Files you interact with will appear here.'}
          </p>
        </div>
      ) : (
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
              {filtered.map(f => (
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
                  <td style={{ padding: '14px 20px', color: '#38bdf8' }}>{f.date}</td>
                  <td style={{ padding: '14px 20px', color: 'var(--text-secondary)' }}>{f.size}</td>
                  <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 8 }}>
                      <button
                        type="button"
                        onClick={() => triggerToast(`Opened file ${f.name}`)}
                        style={{
                          background: 'rgba(59, 130, 246, 0.15)',
                          border: '1px solid rgba(59, 130, 246, 0.3)',
                          color: '#60a5fa',
                          padding: '6px 12px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.8rem'
                        }}
                      >
                        Open
                      </button>
                      <button
                        type="button"
                        onClick={() => copyShareLink(f.name)}
                        style={{
                          background: 'rgba(255,255,255,0.05)',
                          padding: '6px',
                          borderRadius: '4px',
                          color: 'var(--text-secondary)'
                        }}
                        title="Copy share link"
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
      )}
    </div>
  );
};

export default Recent;
