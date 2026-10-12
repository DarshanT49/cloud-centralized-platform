import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  FileText,
  Image as ImageIcon,
  Archive,
  Copy,
  Users
} from 'lucide-react';

const initialSharedFiles = [
  { id: 101, name: 'Q3_Performance_Review.pdf', size: '5.2 MB', type: 'doc', sharedBy: 'Sarah Jenkins', sharedWith: 'You', permission: 'Can Edit', date: 'Today' },
  { id: 102, name: 'Design_System_v2_Tokens.png', size: '45.0 MB', type: 'image', sharedBy: 'You', sharedWith: 'Design Team (4)', permission: 'View Only', date: 'Oct 08, 2026' },
  { id: 103, name: 'Product_Launch_Press_Kit.zip', size: '120.4 MB', type: 'archive', sharedBy: 'Marketing Lead', sharedWith: 'You', permission: 'Can Edit', date: 'Oct 03, 2026' }
];

const getFileIcon = (type) => {
  switch (type) {
    case 'image':
      return <ImageIcon size={18} color="#c084fc" />;
    case 'archive':
      return <Archive size={18} color="#fbbf24" />;
    default:
      return <FileText size={18} color="#60a5fa" />;
  }
};

const Shared = () => {
  const outletCtx = useOutletContext() || {};
  const { searchQuery = '', triggerToast = () => {} } = outletCtx;
  const [sharedFiles] = useState(initialSharedFiles);

  const copyShareLink = (fileName) => {
    navigator.clipboard?.writeText(`https://cloudvault.app/share/${encodeURIComponent(fileName)}`);
    triggerToast('Encrypted share link copied to clipboard!');
  };

  const filtered = sharedFiles.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="shared-page">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#fff', margin: 0 }}>
          Shared <span className="gradient-text">with Me</span>
        </h1>
        <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
          Files and assets shared by teammates and external collaborators
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="glass-panel" style={{ padding: '48px 20px', textAlign: 'center' }}>
          <Users size={36} color="var(--text-muted)" style={{ marginBottom: 12 }} />
          <h3 style={{ color: '#fff', fontSize: '1rem', marginBottom: 4 }}>No shared files found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem' }}>
            {searchQuery ? `No files match "${searchQuery}"` : 'Files shared with your account will appear here.'}
          </p>
        </div>
      ) : (
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
              {filtered.map(s => (
                <tr
                  key={s.id}
                  style={{
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
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
                        gap: 6,
                        cursor: 'pointer'
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
      )}
    </div>
  );
};

export default Shared;
