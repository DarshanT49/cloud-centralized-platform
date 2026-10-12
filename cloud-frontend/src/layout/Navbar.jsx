import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import {
  Cloud,
  Search,
  Menu,
  X,
  ArrowRight,
  ShieldCheck,
  FolderLock,
  Layers
} from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <header className={`navbar-header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container navbar-container">
        {/* Brand Logo */}
        <Link to="/" className="navbar-brand" aria-label="CloudVault Home">
          <div className="brand-icon-wrapper">
            <Cloud size={22} />
          </div>
          <span className="brand-name">
            Cloud<span className="gradient-text">Vault</span>
          </span>
          <span className="brand-badge">PRO</span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav aria-label="Main Navigation">
          <ul className="navbar-nav">
            <li>
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `nav-link ${isActive && location.pathname === '/' ? 'active' : ''}`
                }
              >
                Overview
              </NavLink>
            </li>
            <li>
              <a href="/#features" className="nav-link">
                Features
              </a>
            </li>
            <li>
              <a href="/#security" className="nav-link">
                Security
              </a>
            </li>
            <li>
              <a href="/#pricing" className="nav-link">
                Pricing
              </a>
            </li>
          </ul>
        </nav>

        {/* Quick Search & Actions */}
        <div className="navbar-actions">
          <div
            className="navbar-search"
            title="Search files and folders"
            tabIndex={0}
            role="searchbox"
          >
            <Search size={15} />
            <span>Search files...</span>
            <span className="search-kbd">⌘K</span>
          </div>

          <Link to="/login" className="btn btn-ghost btn-sm btn-desktop">
            Sign In
          </Link>

          <Link to="/register" className="btn btn-primary btn-sm btn-desktop">
            <span>Get Started</span>
            <ArrowRight size={15} />
          </Link>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            className="mobile-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <div className={`mobile-menu-drawer ${mobileMenuOpen ? 'open' : ''}`}>
        <ul className="mobile-nav-list">
          <li>
            <NavLink
              to="/"
              className={({ isActive }) =>
                `mobile-nav-link ${isActive && location.pathname === '/' ? 'active' : ''}`
              }
            >
              <span>Overview</span>
              <Layers size={18} />
            </NavLink>
          </li>
          <li>
            <a href="/#features" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
              <span>Features</span>
              <FolderLock size={18} />
            </a>
          </li>
          <li>
            <a href="/#security" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
              <span>Security & Encryption</span>
              <ShieldCheck size={18} />
            </a>
          </li>
          <li>
            <a href="/#pricing" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
              <span>Storage Plans</span>
            </a>
          </li>
        </ul>

        <div className="mobile-actions">
          <Link to="/login" className="btn btn-secondary" style={{ width: '100%' }}>
            Sign In
          </Link>
          <Link to="/register" className="btn btn-primary" style={{ width: '100%' }}>
            Get Started Free
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;