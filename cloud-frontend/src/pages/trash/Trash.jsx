import React, { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  FileText,
  Image as ImageIcon,
  Film,
  Archive,
  Trash2,
  RotateCcw,
  AlertTriangle,
  PlusCircle
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

const Trash = () => {
  const outletCtx = useOutletContext() || {};
  const {
    searchQuery = '',
    triggerToast = () => {},
    googleFiles = [],
    setGoogleFiles = () => {},
    connectedAccounts = [],
    onOpenConnectGoogleModal = () => {}
  } = outletCtx;

  const trashFiles = useMemo(() => {
    return googleFiles.filter(f => f.trashed);
  }, [googleFiles]);

  const restoreFromTrash = (trashFile) => {
    setGoogleFiles(prev => prev.map(f => f.id === trashFile.id ? { ...f, trashed: false } : f));
    triggerToast(`"${trashFile.name}" restored to My Files`);
  };

  const deletePermanently = (id) => {
    setGoogleFiles(prev => prev.filter(f => f.id !== id));
    triggerToast('File permanently deleted from Google Drive.');
  };

  const emptyTrash = () => {
    if (trashFiles.length === 0) return;
    setGoogleFiles(prev => prev.filter(f => !f.trashed));
    triggerToast('Trash emptied. Storage space freed up across drives!');
  };

  const filtered = useMemo(() => {
    return trashFiles.filter(t =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [trashFiles, searchQuery]);

  return (
    <div className="trash-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#fff', margin: 0 }}>
            Trash & <span className="gradient-text">Bin</span>
          </h1>
          <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            Deleted items from connected Google Drives are kept before permanent deletion
          </p>
        </div>

        {trashFiles.length > 0 && (
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={emptyTrash}
            style={{ color: '#fb7185', borderColor: 'rgba(244, 63, 94, 0.3)' }}
          >
            <Trash2 size={16} />
            <span>Empty Trash ({trashFiles.length})</span>
          </button>
        )}
      </div>

      {/* Warning Alert Banner */}
      {connectedAccounts.length > 0 && trashFiles.length > 0 && (
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
            <strong>Items in trash are subject to Google Drive's 30-day retention policy.</strong>
            <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 2 }}>
              You can restore any deleted file back to its folder or purge it immediately.
            </span>
          </div>
        </div>
      )}

      {connectedAccounts.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px 24px', textAlign: 'center' }}>
          <GoogleIcon size={44} style={{ marginBottom: 14 }} />
          <h3 style={{ color: '#fff', fontSize: '1.15rem', marginBottom: 6 }}>No Google Accounts Linked</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', maxWidth: 440, margin: '0 auto 20px' }}>
            Connect your Google accounts to manage files and recycle bins across your drives.
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
                <th style={{ padding: '14px 20px', fontWeight: 600 }}>Drive Account</th>
                <th style={{ padding: '14px 20px', fontWeight: 600 }}>Size</th>
                <th style={{ padding: '14px 20px', fontWeight: 600 }}>Deleted Date</th>
                <th style={{ padding: '14px 20px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr
                  key={t.id}
                  style={{
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <td style={{ padding: '14px 20px', color: '#fff', display: 'flex', alignItems: 'center', gap: 12 }}>
                    {getFileIcon(t.type)}
                    <span style={{ fontWeight: 500 }}>{t.name}</span>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: 4,
                        fontSize: '0.74rem',
                        fontWeight: 600,
                        background: 'rgba(66, 133, 244, 0.12)',
                        color: t.accountColor || '#60a5fa',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                    >
                      <GoogleIcon size={12} />
                      {t.accountName || 'Google Drive'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px', color: 'var(--text-secondary)' }}>{t.size}</td>
                  <td style={{ padding: '14px 20px', color: 'var(--text-muted)' }}>{t.date || 'Recent'}</td>
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
                          gap: 6,
                          cursor: 'pointer'
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
                          gap: 6,
                          cursor: 'pointer'
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
  );
};

export default Trash;
