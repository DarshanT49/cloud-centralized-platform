import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  FileText,
  Image as ImageIcon,
  Download,
  Star
} from 'lucide-react';

const initialStarredFiles = [
  { id: 1, name: 'Project_Alpha_Blueprint.pdf', size: '8.4 MB', type: 'doc', date: 'Today, 2:40 PM', folder: 'Work Documents' },
  { id: 3, name: 'Annual_Financial_Model_2026.xlsx', size: '4.1 MB', type: 'sheet', date: 'Yesterday', folder: 'Work Documents' },
  { id: 6, name: 'Product_Roadmap_Q4.pdf', size: '3.6 MB', type: 'doc', date: 'Sep 28, 2026', folder: 'Work Documents' }
];

const getFileIcon = (type) => {
  switch (type) {
    case 'image':
      return <ImageIcon size={18} color="#c084fc" />;
    case 'sheet':
      return <FileText size={18} color="#34d399" />;
    default:
      return <FileText size={18} color="#60a5fa" />;
  }
};

const Starred = () => {
  const outletCtx = useOutletContext() || {};
  const { searchQuery = '', triggerToast = () => {} } = outletCtx;
  const [starredFiles, setStarredFiles] = useState(initialStarredFiles);

  const unstar = (id, name) => {
    setStarredFiles(prev => prev.filter(f => f.id !== id));
    triggerToast(`"${name}" removed from Starred`);
  };

  const filtered = starredFiles.filter(f =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="starred-page">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#fff', margin: 0 }}>
          Starred <span className="gradient-text">Files</span>
        </h1>
        <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
          Quick access to your prioritized and favorited files
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <Star size={42} color="var(--text-muted)" style={{ marginBottom: 14 }} />
          <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: 6 }}>No starred files</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Star important files in My Files to easily access them here.
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
                  <td style={{ padding: '14px 20px', color: 'var(--text-secondary)' }}>{f.folder}</td>
                  <td style={{ padding: '14px 20px', color: 'var(--text-secondary)' }}>{f.size}</td>
                  <td style={{ padding: '14px 20px', color: 'var(--text-muted)' }}>{f.date}</td>
                  <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 8 }}>
                      <button
                        type="button"
                        onClick={() => unstar(f.id, f.name)}
                        style={{
                          background: 'rgba(245, 158, 11, 0.15)',
                          padding: '6px',
                          borderRadius: '4px',
                          color: '#f59e0b'
                        }}
                        title="Remove from starred"
                      >
                        <Star size={15} fill="#f59e0b" />
                      </button>
                      <button
                        type="button"
                        onClick={() => triggerToast(`Downloading ${f.name}...`)}
                        style={{
                          background: 'rgba(255,255,255,0.05)',
                          padding: '6px',
                          borderRadius: '4px',
                          color: 'var(--text-secondary)'
                        }}
                        title="Download"
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
  );
};

export default Starred;
