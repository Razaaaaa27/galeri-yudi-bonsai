import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const NAV_LINKS = [
  { label: 'Beranda', href: '#beranda' },
  { label: 'Koleksi', href: '#koleksi' },
  { label: 'Tentang', href: '#tentang' },
  { label: 'Cara Merawat', href: '#perawatan' },
  { label: 'Kontak', href: '#kontak' },
];

const WA_URL = 'https://wa.me/6281219477977?text=Halo%2C%20saya%20ingin%20bertanya%20tentang%20koleksi%20bonsai';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  // Only show full navbar on home page
  const isHome = location.pathname === '/';

  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 50);
    }
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false);
    document.body.style.overflow = '';
  }, [location]);

  function toggleMobile() {
    setIsMobileOpen(prev => {
      document.body.style.overflow = !prev ? 'hidden' : '';
      return !prev;
    });
  }

  function handleAnchorClick(e, href) {
    if (!isHome) {
      // Navigate to home first, then scroll
      return;
    }
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      const navH = document.querySelector('.navbar')?.offsetHeight || 64;
      const pos = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top: pos, behavior: 'smooth' });
    }
    setIsMobileOpen(false);
    document.body.style.overflow = '';
  }

  return (
    <>
      <nav className={`navbar ${isScrolled ? 'navbar--solid' : 'navbar--transparent'}`} id="navbar">
        <div className="navbar__inner">
          <Link to="/" className="navbar__logo">Galeri Yudi</Link>

          {isHome && (
            <ul className="navbar__menu">
              {NAV_LINKS.map(link => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="navbar__link"
                    onClick={(e) => handleAnchorClick(e, link.href)}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          )}

          {isHome && (
            <a href={WA_URL} target="_blank" rel="noopener noreferrer" className="navbar__cta navbar__cta-desktop">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
              Pesan via WhatsApp
            </a>
          )}

          {isHome && (
            <button
              className={`navbar__toggle ${isMobileOpen ? 'active' : ''}`}
              onClick={toggleMobile}
              aria-label="Toggle menu"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          )}
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isHome && (
        <div className={`mobile-menu ${isMobileOpen ? 'active' : ''}`}>
          <div className="mobile-menu__links">
            {NAV_LINKS.map(link => (
              <a
                key={link.href}
                href={link.href}
                className="mobile-menu__link"
                onClick={(e) => handleAnchorClick(e, link.href)}
              >
                {link.label}
              </a>
            ))}
            <a href={WA_URL} target="_blank" rel="noopener noreferrer" className="btn btn--primary mobile-menu__cta">
              Pesan via WhatsApp
            </a>
          </div>
        </div>
      )}
    </>
  );
}
