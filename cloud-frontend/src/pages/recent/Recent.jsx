import React, { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  FileText,
  Image as ImageIcon,
  Film,
  Archive,
  Search,
  Share2,
  ExternalLink,
  PlusCircle
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

const Recent = () => {
  const outletCtx = useOutletContext() || {};
  const {
    searchQuery = '',
    triggerToast = () => {},
    googleFiles = [],
    connectedAccounts = [],
    onOpenConnectGoogleModal = () => {}
  } = outletCtx;

  const copyShareLink = (fileName) => {
    navigator.clipboard?.writeText(`https://cloudvault.app/share/${encodeURIComponent(fileName)}`);
    triggerToast('Encrypted share link copied to clipboard!');
  };

  // Recent files derived from googleFiles
  const filtered = useMemo(() => {
    return googleFiles
      .filter(f => !f.trashed)
      .filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .slice(0, 15);
  }, [googleFiles, searchQuery]);

  return (
    <div className="recent-page">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#fff', margin: 0 }}>
          Recent <span className="gradient-text">Activity</span>
        </h1>
        <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
          Recently modified, synchronized, or accessed files across your connected Google Drives
        </p>
      </div>

      {connectedAccounts.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px 24px', textAlign: 'center' }}>
          <GoogleIcon size={44} style={{ marginBottom: 14 }} />
          <h3 style={{ color: '#fff', fontSize: '1.15rem', marginBottom: 6 }}>No Google Accounts Linked</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', maxWidth: 440, margin: '0 auto 20px' }}>
            Connect your Google accounts to view recent file activity across all your personal and workspace drives in real-time.
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
        <div className="glass-panel" style={{ padding: '48px 20px', textAlign: 'center' }}>
          <Search size={36} color="var(--text-muted)" style={{ marginBottom: 12 }} />
          <h3 style={{ color: '#fff', fontSize: '1rem', marginBottom: 4 }}>No recent files found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem' }}>
            {searchQuery ? `No files match "${searchQuery}"` : 'Files in your connected Google drives will appear here.'}
          </p>
        </div>
      ) : (
        <div className="glass-panel" style={{ overflowX: 'auto', borderRadius: 'var(--radius-md)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '14px 20px', fontWeight: 600 }}>File Name</th>
                <th style={{ padding: '14px 20px', fontWeight: 600 }}>Google Drive</th>
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
                  <td style={{ padding: '14px 20px', color: '#38bdf8' }}>{f.date}</td>
                  <td style={{ padding: '14px 20px', color: 'var(--text-secondary)' }}>{f.size}</td>
                  <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 8 }}>
                      <button
                        type="button"
                        onClick={() => f.webViewLink ? window.open(f.webViewLink, '_blank') : triggerToast(`Viewing ${f.name}`)}
                        style={{
                          background: 'rgba(59, 130, 246, 0.15)',
                          border: '1px solid rgba(59, 130, 246, 0.3)',
                          color: '#60a5fa',
                          padding: '6px 12px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.8rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          cursor: 'pointer'
                        }}
                      >
                        <ExternalLink size={13} />
                        <span>View</span>
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
