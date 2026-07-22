import './Footer.css';

const WA_NUMBER = '6281219477977';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__inner">
          {/* Brand */}
          <div className="footer__col">
            <div className="footer__brand-row">
              <div className="footer__brand-text">
                <h3 className="footer__brand-name">Galeri Yudi</h3>
                <p className="footer__brand-tagline">Spesialis tanaman bonsai & hias pilihan,<br />langsung dari tangan pecinta tanaman.</p>
              </div>
              <div className="footer__social">
                <a href="https://www.instagram.com/galeri_yudi/" target="_blank" rel="noopener noreferrer" className="footer__social-link" aria-label="Instagram">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                  <span>Instagram</span>
                </a>
                <a href="https://www.facebook.com/yudi.anima?rdid=zVXnZt8S4icOgv4A&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F18uphiWryT%2F#" target="_blank" rel="noopener noreferrer" className="footer__social-link" aria-label="Facebook">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                  <span>Facebook</span>
                </a>
                <a href="https://www.youtube.com/@galeri_mini-mini?si=Mg16W2Ma37Ev_GSH" target="_blank" rel="noopener noreferrer" className="footer__social-link" aria-label="YouTube">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
                    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
                  </svg>
                  <span>YouTube</span>
                </a>
                <a href="https://www.tiktok.com/@galeriyudi" target="_blank" rel="noopener noreferrer" className="footer__social-link" aria-label="TikTok">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                  </svg>
                  <span>TikTok</span>
                </a>
                <a href="https://www.whatsapp.com/catalog/41321930707070/?app_absent=0" target="_blank" rel="noopener noreferrer" className="footer__social-link" aria-label="WhatsApp">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                  </svg>
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="footer__col">
            <h4 className="footer__heading">Navigasi</h4>
            <ul className="footer__links">
              <li><a href="#beranda" className="footer__link">Beranda</a></li>
              <li><a href="#koleksi" className="footer__link">Koleksi</a></li>
              <li><a href="#tentang" className="footer__link">Tentang Kami</a></li>
              <li><a href="#perawatan" className="footer__link">Cara Merawat</a></li>
            </ul>
          </div>

          {/* Info */}
          <div className="footer__col">
            <h4 className="footer__heading">Informasi</h4>
            <ul className="footer__links">
              <li><span className="footer__link">Jl. Raya Bonsai No. 123</span></li>
              <li><span className="footer__link">Indonesia</span></li>
              <li><span className="footer__link">Senin - Sabtu</span></li>
              <li><span className="footer__link">08:00 - 17:00 WIB</span></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="footer__col">
            <h4 className="footer__heading">Kontak</h4>
            <ul className="footer__links">
              <li>
                <a href={`https://wa.me/${WA_NUMBER}`} target="_blank" rel="noopener noreferrer" className="footer__link">
                  +62 812-1947-7977
                </a>
              </li>
              <li>
                <a href="mailto:hello@galeriyudi.id" className="footer__link">hello@galeriyudi.id</a>
              </li>
            </ul>
          </div>
        </div>

        <hr className="footer__divider" />

        <div className="footer__bottom">
          <span>&copy; {new Date().getFullYear()} Galeri Yudi. All rights reserved.</span>
          <div className="footer__bottom-right">
            <span>Crafted with 🌿 for plant lovers</span>
          </div>
        </div>
      </div>
    </footer>
  );
}