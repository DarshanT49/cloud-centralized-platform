import React, { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  FileText,
  Image as ImageIcon,
  Film,
  Archive,
  Download,
  Star,
  Search,
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
    case 'archive':
      return <Archive size={18} color="#fbbf24" />;
    case 'sheet':
      return <FileText size={18} color="#34d399" />;
    default:
      return <FileText size={18} color="#60a5fa" />;
  }
};

const Starred = () => {
  const outletCtx = useOutletContext() || {};
  const {
    searchQuery = '',
    triggerToast = () => {},
    googleFiles = [],
    setGoogleFiles = () => {},
    connectedAccounts = [],
    onOpenConnectGoogleModal = () => {}
  } = outletCtx;

  const unstar = (id, name) => {
    setGoogleFiles(prev => prev.map(f => f.id === id ? { ...f, starred: false } : f));
    triggerToast(`"${name}" removed from Starred`);
  };

  const filtered = useMemo(() => {
    return googleFiles
      .filter(f => !f.trashed && f.starred)
      .filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [googleFiles, searchQuery]);

  return (
    <div className="starred-page">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#fff', margin: 0 }}>
          Starred <span className="gradient-text">Files</span>
        </h1>
        <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
          Quick access to your prioritized and favorited files across all connected Google Drives
        </p>
      </div>

      {connectedAccounts.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px 24px', textAlign: 'center' }}>
          <GoogleIcon size={44} style={{ marginBottom: 14 }} />
          <h3 style={{ color: '#fff', fontSize: '1.15rem', marginBottom: 6 }}>No Google Accounts Linked</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', maxWidth: 440, margin: '0 auto 20px' }}>
            Connect your Google accounts to bookmark and star important files across all your drives.
          </p>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={onOpenConnectGoogleModal}
          >
            <PlusCircle size={16} />
            <span>Connect Google Drive</span>
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <Star size={42} color="var(--text-muted)" style={{ marginBottom: 14 }} />
          <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: 6 }}>No starred files</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            {searchQuery ? `No starred files match "${searchQuery}"` : 'Star important files in My Files to easily access them here.'}
          </p>
        </div>
      ) : (
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
                    <div style={{ display: 'inline-flex', gap: 8 }}>
                      <button
                        type="button"
                        onClick={() => unstar(f.id, f.name)}
                        style={{
                          background: 'rgba(245, 158, 11, 0.15)',
                          padding: '6px',
                          borderRadius: '4px',
                          color: '#f59e0b',
                          cursor: 'pointer'
                        }}
                        title="Remove from starred"
                      >
                        <Star size={15} fill="#f59e0b" />
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
                        style={{
                          background: 'rgba(255,255,255,0.05)',
                          padding: '6px',
                          borderRadius: '4px',
                          color: 'var(--text-secondary)',
                          cursor: 'pointer'
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
