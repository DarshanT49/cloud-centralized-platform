import React from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import {
  Folder,
  PlusCircle,
  UploadCloud,
  FolderPlus,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  HardDrive
} from 'lucide-react';
import GoogleIcon from '../../components/GoogleIcon';

const Dashboard = () => {
  const outletCtx = useOutletContext() || {};
  const {
    connectedAccounts = [],
    onOpenConnectGoogleModal = () => {},
    onOpenUploadModal = () => {},
    onOpenNewFolderModal = () => {},
    currentUser = {},
    driveApiStatus = {},
    refreshFiles = () => {},
    onDirectGoogleAuthorize = () => {}
  } = outletCtx;

  const displayName = currentUser?.fullName || currentUser?.email?.split('@')[0] || 'User';
  const hasAccounts = connectedAccounts.length > 0;

  return (
    <div className="clean-dashboard" style={{ maxWidth: 1100, margin: '0 auto' }}>
      {/* 1. Minimal Welcome Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>
          Welcome, <span className="gradient-text">{displayName}</span>
        </h1>
        <p style={{ margin: '6px 0 0', color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
          Your multi-cloud hub for aggregating and managing Google Drives in one unified place.
        </p>
      </div>

      {/* Google Drive API Activation Notice */}
      {driveApiStatus?.apiDisabled && (
        <div
          className="glass-panel"
          style={{
            padding: '24px 28px',
            marginBottom: 28,
            borderRadius: 'var(--radius-lg)',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(15, 23, 42, 0.7) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 20
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, maxWidth: 640 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '12px',
                background: 'rgba(245, 158, 11, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <GoogleIcon size={26} />
            </div>
            <div>
              <h3 style={{ margin: '0 0 4px', fontSize: '1.05rem', color: '#fbbf24', fontWeight: 700 }}>
                Google Drive API Activation Required
              </h3>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.86rem', lineHeight: 1.5 }}>
                Your Google Account is linked, but the <strong>Google Drive API</strong> must be enabled in your Google Cloud Console for project <code>703955159949</code> before file listings can be fetched.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <a
              href={driveApiStatus.activationUrl || 'https://console.developers.google.com/apis/api/drive.googleapis.com/overview?project=703955159949'}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              style={{ padding: '10px 20px', fontSize: '0.88rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <ExternalLink size={15} />
              <span>Enable Google Drive API</span>
            </a>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={refreshFiles}
              style={{ padding: '10px 18px', fontSize: '0.88rem' }}
            >
              <span>Refresh</span>
            </button>
          </div>
        </div>
      )}

      {/* Google Drive Permission Authorization Notice */}
      {driveApiStatus?.needsReauth && (
        <div
          className="glass-panel"
          style={{
            marginBottom: 28,
            padding: '20px 24px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(59, 130, 246, 0.4)',
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(15, 23, 42, 0.7) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 20
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, maxWidth: 640 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '12px',
                background: 'rgba(59, 130, 246, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <GoogleIcon size={26} />
            </div>
            <div>
              <h3 style={{ margin: '0 0 4px', fontSize: '1.05rem', color: '#60a5fa', fontWeight: 700 }}>
                Google Drive Permission Authorization Required
              </h3>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.86rem', lineHeight: 1.5 }}>
                Your Google Account is connected, but file access permissions need to be approved. Click below to grant Google Drive file access so CloudVault can list and assess all your Drive files.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={onDirectGoogleAuthorize || onOpenConnectGoogleModal}
              style={{ padding: '10px 20px', fontSize: '0.88rem', display: 'inline-flex', alignItems: 'center', gap: 8 }}
            >
              <GoogleIcon size={16} />
              <span>Authorize Google Drive Access</span>
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={refreshFiles}
              style={{ padding: '10px 18px', fontSize: '0.88rem' }}
            >
              <span>Refresh</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. Connected Google Drives Section */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', margin: 0 }}>
            Connected Google Drives
          </h2>
          {hasAccounts && (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={onOpenConnectGoogleModal}
              style={{ fontSize: '0.82rem', color: '#60a5fa' }}
            >
              + Link Another Account
            </button>
          )}
        </div>

        {!hasAccounts ? (
          /* Empty State: No Drives Linked */
          <div
            className="glass-panel"
            style={{
              padding: '40px 28px',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid rgba(66, 133, 244, 0.25)',
              background: 'linear-gradient(135deg, rgba(66, 133, 244, 0.08) 0%, rgba(15, 23, 42, 0.6) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 24
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, maxWidth: 600 }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 14,
                  background: 'rgba(255, 255, 255, 0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <GoogleIcon size={32} />
              </div>
              <div>
                <h3 style={{ margin: '0 0 6px', fontSize: '1.15rem', color: '#fff', fontWeight: 700 }}>
                  No Google Accounts Linked Yet
                </h3>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.5 }}>
                  Connect your Personal, Workspace, or University Google accounts to access and organize all your drive files here.
                </p>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-primary"
              onClick={onOpenConnectGoogleModal}
              style={{ padding: '12px 24px', fontSize: '0.92rem' }}
            >
              <PlusCircle size={18} />
              <span>Connect Google Drive</span>
            </button>
          </div>
        ) : (
          /* Grid of Linked Google Drive Cards */
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 16
            }}
          >
            {connectedAccounts.map(account => (
              <div
                key={account.id}
                className="glass-panel"
                style={{
                  padding: '20px',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(66, 133, 244, 0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <GoogleIcon size={22} />
                  </div>
                  <div style={{ overflow: 'hidden' }}>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#fff' }}>
                      {account.name}
                    </h4>
                    <span
                      style={{
                        fontSize: '0.78rem',
                        color: 'var(--text-muted)',
                        display: 'block',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                      title={account.email}
                    >
                      {account.email}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTop: '1px solid var(--border-color)' }}>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      padding: '2px 8px',
                      borderRadius: 4,
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: 'var(--text-secondary)',
                      textTransform: 'capitalize'
                    }}
                  >
                    {account.accountType || 'Google Drive'}
                  </span>
                  <Link
                    to="/dashboard/my-files"
                    style={{ fontSize: '0.8rem', color: '#60a5fa', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    <span>Browse Files</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            ))}

            {/* Add Another Drive Card */}
            <div
              className="glass-panel"
              onClick={onOpenConnectGoogleModal}
              style={{
                padding: '20px',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                cursor: 'pointer',
                borderStyle: 'dashed',
                minHeight: 120,
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(66, 133, 244, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color)';
              }}
            >
              <PlusCircle size={24} color="#60a5fa" style={{ marginBottom: 6 }} />
              <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#fff' }}>Link Another Google Account</span>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Personal, Workspace or Edu</span>
            </div>
          </div>
        )}
      </div>

      {/* 3. Quick Actions Row */}
      <div style={{ marginBottom: 36 }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: 16 }}>
          Quick Actions
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: 14
          }}
        >
          <div
            className="glass-panel"
            onClick={onOpenUploadModal}
            style={{
              padding: '16px 20px',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(56, 189, 248, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#38bdf8'
              }}
            >
              <UploadCloud size={20} />
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#fff', fontWeight: 600 }}>Upload File</h4>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Direct to Google Drive</span>
            </div>
          </div>

          <div
            className="glass-panel"
            onClick={onOpenNewFolderModal}
            style={{
              padding: '16px 20px',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(52, 211, 153, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#34d399'
              }}
            >
              <FolderPlus size={20} />
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#fff', fontWeight: 600 }}>New Folder</h4>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Create directory</span>
            </div>
          </div>

          <Link
            to="/dashboard/my-files"
            className="glass-panel"
            style={{
              padding: '16px 20px',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              textDecoration: 'none'
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(192, 132, 252, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#c084fc'
              }}
            >
              <Folder size={20} />
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#fff', fontWeight: 600 }}>Browse All Files</h4>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>View full directory</span>
            </div>
          </Link>
        </div>
      </div>

      {/* 4. Privacy & Architecture Notice */}
      <div
        className="glass-panel"
        style={{
          padding: '16px 20px',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          color: 'var(--text-secondary)',
          fontSize: '0.84rem'
        }}
      >
        <ShieldCheck size={20} color="#34d399" style={{ flexShrink: 0 }} />
        <span>
          <strong>Direct Multi-Drive Aggregator:</strong> Files remain securely stored on your respective Google Drive accounts. CloudVault never stores or duplicates raw files on local application servers.
        </span>
      </div>
    </div>
  );
};

export default Dashboard;
