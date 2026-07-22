import './Footer.css';

const WA_NUMBER = '6281219477977';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__inner">
          {/* Brand */}
          <div className="footer__col">
            <div className="footer__brand-name">Galeri Yudi</div>
            <p className="footer__brand-desc">
              Paket bonsai premium lengkap dengan pot keramik pilihan.
              Satu karya utuh, siap menjadi kebanggaan ruang Anda.
            </p>
            <div className="footer__social">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="footer__social-link" aria-label="Instagram">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              <a href={`https://wa.me/${WA_NUMBER}`} target="_blank" rel="noopener noreferrer" className="footer__social-link" aria-label="WhatsApp">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
              </a>
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
          <span>Crafted with 🌿 for plant lovers</span>
        </div>
      </div>
    </footer>
  );
}
