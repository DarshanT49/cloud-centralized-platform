import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Cloud,
  Shield,
  Zap,
  Share2,
  Clock,
  Laptop,
  Users,
  CheckCircle2,
  ArrowRight,
  UploadCloud,
  FileText,
  Image as ImageIcon,
  Film,
  Archive,
  HardDrive,
  Lock,
  Server,
  Sparkles,
  Search,
  ExternalLink
} from 'lucide-react';
import './HomePage.css';

const sampleFiles = [
  {
    id: 1,
    name: 'Quarterly_Financial_Report_2026.pdf',
    type: 'doc',
    category: 'Documents',
    size: '14.2 MB',
    updated: '10 mins ago',
    icon: FileText
  },
  {
    id: 2,
    name: 'App_Design_System_v3.fig',
    type: 'figma',
    category: 'Media',
    size: '128.5 MB',
    updated: '2 hours ago',
    icon: ImageIcon
  },
  {
    id: 3,
    name: 'Product_Keynote_Launch_4K.mp4',
    type: 'video',
    category: 'Media',
    size: '840.0 MB',
    updated: 'Yesterday',
    icon: Film
  },
  {
    id: 4,
    name: 'Production_Database_Backup.tar.gz',
    type: 'sheet',
    category: 'Archives',
    size: '1.2 GB',
    updated: '3 days ago',
    icon: Archive
  }
];

const HomePage = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [uploadedFiles, setUploadedFiles] = useState(sampleFiles);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Filter files based on tab
  const filteredFiles = activeTab === 'All'
    ? uploadedFiles
    : uploadedFiles.filter(f => f.category === activeTab);

  // Simulate an upload action
  const handleSimulatedUpload = () => {
    if (isUploading) return;
    setIsUploading(true);
    setUploadSuccess(false);

    setTimeout(() => {
      const newFile = {
        id: Date.now(),
        name: `Encrypted_Document_${Math.floor(Math.random() * 900 + 100)}.pdf`,
        type: 'doc',
        category: 'Documents',
        size: '3.6 MB',
        updated: 'Just now',
        icon: FileText
      };
      setUploadedFiles(prev => [newFile, ...prev]);
      setIsUploading(false);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    }, 1200);
  };

  return (
    <div className="home-page-container">
      {/* 1. Hero Section */}
      <section className="hero-section">
        <div className="hero-bg-glow"></div>
        <div className="container hero-content">
          <div className="hero-badge-wrapper">
            <span className="badge">
              <Sparkles size={14} />
              <span>Unified Multi-Cloud Drive Aggregator</span>
            </span>
          </div>

          <h1 className="hero-title">
            All Your Google Drives <br />
            Unified In <span className="gradient-text">One Powerhouse</span>
          </h1>

          <p className="hero-subtitle">
            Connect multiple Google accounts (Personal, Workspace, Edu) into a single hub.
            Search across drives, aggregate quotas, and transfer files between accounts without local server storage.
          </p>

          <div className="hero-cta-group">
            <Link to="/register" className="btn btn-primary btn-lg">
              <span>Connect Drives Free</span>
              <ArrowRight size={18} />
            </Link>

            <Link to="/dashboard" className="btn btn-secondary btn-lg">
              <HardDrive size={18} />
              <span>Open Cloud Hub</span>
            </Link>
          </div>

          {/* Trust Highlights */}
          <div className="hero-trust-bar">
            <div className="trust-item">
              <Shield size={16} />
              <span>256-Bit AES Encryption</span>
            </div>
            <div className="trust-item">
              <Zap size={16} />
              <span>10 Gbps Edge CDN</span>
            </div>
            <div className="trust-item">
              <Server size={16} />
              <span>99.99% Guaranteed SLA</span>
            </div>
            <div className="trust-item">
              <Lock size={16} />
              <span>Zero-Knowledge Privacy</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Interactive Mockup Showcase */}
      <section className="container preview-section">
        <div className="preview-window">
          {/* Header */}
          <div className="window-header">
            <div className="window-dots">
              <span className="dot dot-red"></span>
              <span className="dot dot-yellow"></span>
              <span className="dot dot-green"></span>
            </div>
            <div className="window-title">
              <Cloud size={16} />
              <span>CloudVault Drive — My Workspace (Live Preview)</span>
            </div>
            <div className="window-status">
              <span className="dot dot-green" style={{ width: 8, height: 8 }}></span>
              <span>Encrypted & Connected</span>
            </div>
          </div>

          {/* Body */}
          <div className="window-body">
            {/* Storage Meter Bar */}
            <div className="storage-overview-card">
              <div className="storage-info">
                <div className="storage-meta">
                  <span className="storage-label">Personal Cloud Storage</span>
                  <span className="storage-value">64.2 GB / 100 GB (64%)</span>
                </div>
                <div className="storage-progress-track">
                  <div className="storage-progress-fill"></div>
                </div>
              </div>

              <div className="storage-actions">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleSimulatedUpload}
                  disabled={isUploading}
                >
                  <UploadCloud size={16} />
                  <span>{isUploading ? 'Encrypting & Uploading...' : 'Upload File'}</span>
                </button>
                <Link to="/dashboard" className="btn btn-primary btn-sm">
                  <span>Manage Drive</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Notification alert on upload */}
            {uploadSuccess && (
              <div
                style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  color: '#6ee7b7',
                  padding: '10px 16px',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: '16px',
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <CheckCircle2 size={16} />
                <span>File successfully encrypted and stored to CloudVault!</span>
              </div>
            )}

            {/* Filter Tabs */}
            <div className="preview-tabs">
              {['All', 'Documents', 'Media', 'Archives'].map(tab => (
                <button
                  key={tab}
                  type="button"
                  className={`preview-tab-btn ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === 'All' && 'All Files'}
                  {tab === 'Documents' && 'Documents'}
                  {tab === 'Media' && 'Media & Design'}
                  {tab === 'Archives' && 'Archives'}
                </button>
              ))}
            </div>

            {/* Files Grid */}
            <div className="files-preview-grid">
              {filteredFiles.map(file => {
                const IconComp = file.icon;
                return (
                  <div key={file.id} className="file-preview-card" title={file.name}>
                    <div className={`file-icon-box ${file.type}`}>
                      <IconComp size={22} />
                    </div>
                    <div className="file-details">
                      <p className="file-name">{file.name}</p>
                      <div className="file-meta">
                        <span>{file.size}</span>
                        <span>•</span>
                        <span>{file.updated}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Interactive Dropzone Banner */}
            <div
              className="preview-dropzone"
              onClick={handleSimulatedUpload}
              role="button"
              tabIndex={0}
            >
              <div className="dropzone-inner">
                <UploadCloud size={28} />
                <p>
                  Drag and drop files here to upload, or{' '}
                  <span className="dropzone-highlight">click to select from computer</span>
                </p>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Supports all formats up to 50 GB per file • 256-bit AES encrypted on upload
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Metrics Statistics */}
      <section className="metrics-section">
        <div className="container metrics-grid">
          <div className="metric-card">
            <h3 className="metric-number gradient-text">50M+</h3>
            <p className="metric-label">Encrypted Files Stored</p>
          </div>
          <div className="metric-card">
            <h3 className="metric-number gradient-accent-text">99.99%</h3>
            <p className="metric-label">High Availability Uptime</p>
          </div>
          <div className="metric-card">
            <h3 className="metric-number gradient-text">180+</h3>
            <p className="metric-label">Global Edge PoP Nodes</p>
          </div>
          <div className="metric-card">
            <h3 className="metric-number gradient-accent-text">0</h3>
            <p className="metric-label">Zero Knowledge Breaches</p>
          </div>
        </div>
      </section>

      {/* 4. Features Grid */}
      <section id="features" className="container features-section">
        <div className="section-header">
          <div className="section-tag">
            <span className="badge">Core Capabilities</span>
          </div>
          <h2 className="section-title">Engineered for Performance & Security</h2>
          <p className="section-desc">
            Everything you need to store, share, and manage your important personal
            and business assets without compromising privacy.
          </p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <Shield size={26} />
            </div>
            <h3 className="feature-title">Zero-Knowledge Architecture</h3>
            <p className="feature-text">
              Your data is encrypted before it leaves your machine. Your private keys never
              touch our servers, meaning only you hold the keys to your files.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <Zap size={26} />
            </div>
            <h3 className="feature-title">High-Speed Edge Network</h3>
            <p className="feature-text">
              Accelerated parallel chunk uploading and distributed multi-region edge caches
              ensure your file uploads and downloads saturate your line speed.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <Share2 size={26} />
            </div>
            <h3 className="feature-title">Smart Link Sharing</h3>
            <p className="feature-text">
              Create password-protected links with self-destruct expiry times and download
              limits. Revoke access anytime with a single click.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <Clock size={26} />
            </div>
            <h3 className="feature-title">Unlimited Version History</h3>
            <p className="feature-text">
              Made an accidental change or deleted an asset? Roll back to previous versions
              or restore files seamlessly with a 30-day revision history.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <Laptop size={26} />
            </div>
            <h3 className="feature-title">Real-Time Multi-Device Sync</h3>
            <p className="feature-text">
              Keep your folders synced seamlessly across Windows, macOS, Linux, iOS, and
              Android devices with intelligent background sync.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <Users size={26} />
            </div>
            <h3 className="feature-title">Granular Team Workspaces</h3>
            <p className="feature-text">
              Collaborate effortlessly with role-based member permissions, shared team
              folders, audit logs, and centralized storage allocation.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Security Spotlight Section */}
      <section id="security" className="container security-section">
        <div className="security-panel">
          <div className="security-text">
            <span className="badge" style={{ marginBottom: 14 }}>
              Enterprise Defense
            </span>
            <h3>Privacy by Design, Not by Policy</h3>
            <p>
              Traditional cloud storage services scan your files for targeted ads and index
              your data. CloudVault uses military-standard cryptographic protocols to ensure
              unrivaled confidentiality.
            </p>

            <ul className="security-list">
              <li className="security-list-item">
                <CheckCircle2 size={18} />
                <span>Client-Side AES-GCM 256-Bit File Encryption</span>
              </li>
              <li className="security-list-item">
                <CheckCircle2 size={18} />
                <span>Multi-Factor Biometric & Hardware Key Authentication</span>
              </li>
              <li className="security-list-item">
                <CheckCircle2 size={18} />
                <span>SOC2 Type II & ISO 27001 Certified Infrastructure</span>
              </li>
              <li className="security-list-item">
                <CheckCircle2 size={18} />
                <span>Automated Ransomware & File Tampering Shields</span>
              </li>
            </ul>
          </div>

          <div className="security-badge-grid">
            <div className="security-card-box">
              <Lock size={30} />
              <h4>Zero-Knowledge</h4>
              <span>Private client keys</span>
            </div>
            <div className="security-card-box">
              <Server size={30} />
              <h4>Geo-Redundant</h4>
              <span>Triple replication</span>
            </div>
            <div className="security-card-box">
              <Zap size={30} />
              <h4>DDoS Defense</h4>
              <span>Cloudflare Enterprise</span>
            </div>
            <div className="security-card-box">
              <Shield size={30} />
              <h4>SOC2 & GDPR</h4>
              <span>Strict compliance</span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Call to Action Banner */}
      <section id="pricing" className="container cta-section">
        <div className="cta-banner">
          <h2 className="cta-title">Unify All Your Google Drives Today</h2>
          <p className="cta-subtitle">
            Join users who organize personal, work, and university accounts in one centralized CloudVault.
            Aggregate your storage with zero local server disk hosting.
          </p>
          <div className="cta-buttons">
            <Link to="/register" className="btn btn-primary btn-lg">
              <span>Create Free Account</span>
              <ArrowRight size={18} />
            </Link>
            <a href="#features" className="btn btn-secondary btn-lg">
              <span>Learn More</span>
            </a>
          </div>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="footer-main">
        <div className="container">
          <div className="footer-top">
            <div className="footer-brand">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Cloud size={24} color="#38bdf8" />
                <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>
                  Cloud<span className="gradient-text">Vault</span>
                </span>
              </div>
              <p>
                Secure, lightning-fast, and private decentralized cloud storage designed for
                creators, developers, and modern teams.
              </p>
            </div>

            <div className="footer-col">
              <h5>Product</h5>
              <ul>
                <li><a href="#features">File Sync</a></li>
                <li><a href="#security">Zero Knowledge</a></li>
                <li><a href="#pricing">Storage Plans</a></li>
                <li><Link to="/dashboard">Web App</Link></li>
              </ul>
            </div>

            <div className="footer-col">
              <h5>Security</h5>
              <ul>
                <li><a href="#security">Encryption Specs</a></li>
                <li><a href="#security">Compliance</a></li>
                <li><a href="#security">Vulnerability Bounty</a></li>
                <li><a href="#security">Trust Center</a></li>
              </ul>
            </div>

            <div className="footer-col">
              <h5>Company</h5>
              <ul>
                <li><a href="#about">About CloudVault</a></li>
                <li><a href="#careers">Careers</a></li>
                <li><a href="#privacy">Privacy Policy</a></li>
                <li><a href="#terms">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} CloudVault Technologies, Inc. All rights reserved.</span>
            <span>Made with React & Vite • Privacy Protected</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;