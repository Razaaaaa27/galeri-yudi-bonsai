import { useState, useEffect, useRef, useCallback } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import { fetchProducts } from '../utils/api';
import './HomePage.css';

const WA_URL = 'https://wa.me/6281219477977?text=Halo%2C%20saya%20ingin%20konsultasi%20memilih%20paket%20bonsai%20yang%20cocok';

/* ── Default products (fallback when API unavailable) ── */
const DEFAULT_PRODUCTS = [
  { id: '1', category: 'paket', name: 'Paket Serenity — Bonsai Beringin + Pot Keramik Putih', price: 850000, stock: 5, description: 'Bonsai beringin dewasa dengan akar gantung eksotis.', image: '/assets/images/product-beringin.png' },
  { id: '2', category: 'paket', name: 'Paket Zen Garden — Bonsai Maple Jepang + Pot Tanah Liat', price: 1250000, stock: 3, description: 'Maple Jepang dengan dedaunan merah-hijau yang memukau.', image: '/assets/images/product-maple.png' },
  { id: '3', category: 'paket', name: 'Paket Harmony — Bonsai Serut + Pot Keramik Abu-abu', price: 650000, stock: 8, description: 'Bonsai serut dengan daun kecil rapat yang mudah dirawat.', image: '/assets/images/product-serut.png' },
];

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState('semua');
  const [scrollProgress, setScrollProgress] = useState(0);
  const observerRef = useRef(null);

  // ── Fetch products ──
  useEffect(() => {
    async function load() {
      try {
        const data = await fetchProducts();
        setProducts(data.length > 0 ? data : DEFAULT_PRODUCTS);
      } catch {
        setProducts(DEFAULT_PRODUCTS);
      }
    }
    load();
  }, []);

  // ── Scroll progress ──
  useEffect(() => {
    function handleScroll() {
      const scrollTop = window.scrollY;
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(docH > 0 ? (scrollTop / docH) * 100 : 0);
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ── Scroll reveal ──
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    const els = document.querySelectorAll('.reveal:not(.revealed)');
    if (els.length === 0) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observerRef.current?.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    els.forEach(el => observerRef.current.observe(el));
    return () => observerRef.current?.disconnect();
  }, [products, filter]);

  const filtered = filter === 'semua' ? products : products.filter(p => p.category === filter);

  return (
    <>
      <Navbar />

      {/* Scroll Progress */}
      <div className="scroll-progress" style={{ width: `${scrollProgress}%` }} />

      {/* ── HERO ── */}
      <section className="hero" id="beranda">
        <div className="hero__bg-orbs">
          <div className="hero__orb hero__orb--1" />
          <div className="hero__orb hero__orb--2" />
          <div className="hero__orb hero__orb--3" />
        </div>
        <div className="container">
          <div className="hero__inner">
            <div className="hero__content reveal">
              <h1 className="hero__title">
                Bonsai. Pot.<br />
                <span>Satu Karya Utuh.</span>
              </h1>
              <p className="hero__subtitle">
                Setiap paket kami menggabungkan bonsai pilihan dengan pot keramik yang serasi,
                dirancang harmonis, siap menjadi pusat perhatian di ruang Anda.
              </p>
              <div className="hero__actions">
                <a href="#koleksi" className="btn btn--primary btn--large">
                  Lihat Koleksi
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                </a>
                <a href="https://wa.me/6281219477977?text=Halo%2C%20saya%20tertarik%20dengan%20koleksi%20bonsai" target="_blank" rel="noopener noreferrer" className="btn btn--secondary btn--large">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                  </svg>
                  Chat WhatsApp
                </a>
              </div>
            </div>
            <div className="hero__image reveal reveal-delay-2">
              <img src="/assets/images/hero-bonsai.png" alt="Bonsai premium dalam pot keramik" width="560" height="560" />
            </div>
          </div>
        </div>
      </section>

      {/* ── VALUE PROPOSITION ── */}
      <section className="section section--alt" id="keunggulan">
        <div className="container">
          <div className="section__header reveal">
            <span className="section__label">Kenapa Berbeda</span>
            <h2 className="section__title">Satu Paket, Tanpa Ribet</h2>
            <p className="section__subtitle">
              Kami percaya bonsai dan pot adalah satu kesatuan seni. Setiap paket dirancang agar Anda tinggal pajang.
            </p>
          </div>
          <div className="features__grid">
            {[
              { icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4', title: 'Paket Lengkap', desc: 'Bonsai dan pot sudah menjadi satu kesatuan harmonis. Tidak perlu repot mencari pot yang cocok.' },
              { icon: 'M12 2L2 7l10 5 10-5-10-5z|M2 17l10 5 10-5|M2 12l10 5 10-5', title: 'Pot Premium', desc: 'Setiap pot dipilih dari keramik atau tanah liat berkualitas tinggi. Desain di-matching dengan tiap tanaman.' },
              { icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z|M9 22V12h6v10', title: 'Siap Pajang', desc: 'Sudah ditata secara profesional, tinggal letakkan di meja, rak, atau sudut favorit Anda.' },
            ].map((feat, i) => (
              <div className={`feature-card reveal reveal-delay-${i + 1}`} key={feat.title}>
                <div className="feature-card__icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    {feat.icon.split('|').map((d, j) => <path key={j} d={d} />)}
                  </svg>
                </div>
                <h3 className="feature-card__title">{feat.title}</h3>
                <p className="feature-card__desc">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── KOLEKSI PRODUK ── */}
      <section className="section" id="koleksi">
        <div className="container">
          <div className="section__header reveal">
            <span className="section__label">Koleksi Kami</span>
            <h2 className="section__title">Temukan yang Anda Cari</h2>
            <p className="section__subtitle">
              Pilih paket bonsai lengkap siap pajang, atau pot premium pilihan untuk koleksi Anda sendiri.
            </p>
          </div>

          {/* Category Tabs */}
          <div className="category-tabs reveal">
            {[
              { key: 'semua', label: 'Semua', icon: 'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z' },
              { key: 'paket', label: 'Paket Bonsai + Pot', icon: 'M12 2L2 7l10 5 10-5-10-5z|M2 17l10 5 10-5|M2 12l10 5 10-5' },
              { key: 'pot', label: 'Pot Kosong', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
            ].map(tab => (
              <button
                key={tab.key}
                className={`category-tab ${filter === tab.key ? 'category-tab--active' : ''}`}
                onClick={() => setFilter(tab.key)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                  {tab.icon.split('|').map((d, j) => <path key={j} d={d} />)}
                </svg>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="products__grid">
            {filtered.length === 0 ? (
              <div className="products__empty">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="48" height="48">
                  <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <p>Belum ada produk di kategori ini.</p>
              </div>
            ) : (
              filtered.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* ── TENTANG KAMI ── */}
      <section className="section section--alt" id="tentang">
        <div className="container">
          <div className="about__inner">
            <div className="about__image reveal">
              <img src="/assets/images/hero-bonsai.png" alt="Proses perawatan bonsai" width="560" height="700" loading="lazy" />
            </div>
            <div className="about__content reveal reveal-delay-2">
              <span className="about__label">Tentang Kami</span>
              <h2 className="about__title">Lebih dari Sekadar Tanaman — Ini adalah Seni Hidup</h2>
              <p className="about__text">
                Di balik setiap bonsai yang kami kirim, ada proses panjang penuh ketelitian.
                Mulai dari pemilihan bibit, pembentukan batang, hingga pencocokan dengan pot yang tepat —
                semuanya dilakukan dengan standar yang sama: kesempurnaan.
              </p>
              <p className="about__text">
                Kami memilih untuk menjual bonsai dalam bentuk paket lengkap karena kami percaya
                bahwa keindahan bonsai baru benar-benar hidup ketika berpadu dengan pot yang serasi.
              </p>
              <div className="about__highlight">
                <div className="about__stat">
                  <div className="about__stat-number">500+</div>
                  <div className="about__stat-label">Paket Terjual</div>
                </div>
                <div className="about__stat">
                  <div className="about__stat-number">50+</div>
                  <div className="about__stat-label">Varietas Bonsai</div>
                </div>
                <div className="about__stat">
                  <div className="about__stat-number">4.9</div>
                  <div className="about__stat-label">Rating Pelanggan</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CARA MERAWAT ── */}
      <section className="section" id="perawatan">
        <div className="container">
          <div className="section__header reveal">
            <span className="section__label">Panduan</span>
            <h2 className="section__title">Cara Merawat Bonsai Anda</h2>
            <p className="section__subtitle">
              Bonsai bukan tanaman yang sulit dirawat — cukup perhatikan empat hal dasar ini.
            </p>
          </div>
          <div className="care__grid">
            {[
              { icon: 'M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z', title: 'Penyiraman', desc: 'Siram ketika lapisan tanah atas terasa kering. Gunakan air mengalir hingga keluar dari lubang drainase.' },
              { icon: 'circle-sun', title: 'Cahaya', desc: 'Letakkan di tempat dengan cahaya tidak langsung yang terang. Hindari sinar matahari langsung terlalu lama.' },
              { icon: 'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z', title: 'Pemangkasan', desc: 'Pangkas secara rutin untuk menjaga bentuk. Gunakan gunting khusus bonsai untuk hasil yang rapi.' },
              { icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', title: 'Pemupukan', desc: 'Berikan pupuk cair setiap 2-4 minggu saat musim tumbuh. Kurangi frekuensi di musim dingin/hujan.' },
            ].map((tip, i) => (
              <div className={`care-card reveal reveal-delay-${i + 1}`} key={tip.title}>
                <div className="care-card__icon">
                  {tip.icon === 'circle-sun' ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="5" />
                      <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
                      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                      <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
                      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d={tip.icon} />
                    </svg>
                  )}
                </div>
                <h3 className="care-card__title">{tip.title}</h3>
                <p className="care-card__desc">{tip.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONI ── */}
      <section className="section section--alt" id="testimoni">
        <div className="container">
          <div className="section__header reveal">
            <span className="section__label">Testimoni</span>
            <h2 className="section__title">Kata Mereka</h2>
            <p className="section__subtitle">Kepuasan pelanggan adalah bukti terbaik dari kualitas yang kami jaga.</p>
          </div>
          <div className="testimonials__grid">
            {[
              { name: 'Andi Rahmat', loc: 'Jakarta', init: 'AR', text: '"Bonsai beringin yang saya pesan datang dalam kondisi sempurna. Pot keramiknya cantik banget, langsung pajang di ruang tamu. Banyak tamu yang memuji!"' },
              { name: 'Sarah Putri', loc: 'Bandung', init: 'SP', text: '"Saya sudah beli 3 paket untuk hadiah. Semua penerima sangat senang. Packaging-nya rapi dan aman, bonsainya sehat semua. Recommended!"' },
              { name: 'Budi Wicaksono', loc: 'Surabaya', init: 'BW', text: '"Konsep paket lengkap ini genius. Dulu saya bingung cari pot yang cocok, sekarang tinggal pilih paket dan langsung display. Kualitasnya premium banget."' },
            ].map((t, i) => (
              <div className={`testimonial-card reveal reveal-delay-${i + 1}`} key={t.name}>
                <div className="testimonial-card__stars">
                  {[...Array(5)].map((_, j) => (
                    <svg key={j} viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                  ))}
                </div>
                <p className="testimonial-card__text">{t.text}</p>
                <div className="testimonial-card__author">
                  <div className="testimonial-card__avatar">{t.init}</div>
                  <div>
                    <div className="testimonial-card__name">{t.name}</div>
                    <div className="testimonial-card__location">{t.loc}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section" id="kontak">
        <div className="container">
          <div className="reveal">
            <h2 className="cta-section__title">Punya Bonsai Favorit?<br />Konsultasi Dulu, Gratis.</h2>
            <p className="cta-section__subtitle">
              Ceritakan ruang Anda, kami bantu pilihkan paket bonsai yang paling cocok. Langsung chat — tanpa komitmen.
            </p>
            <a href={WA_URL} target="_blank" rel="noopener noreferrer" className="btn btn--primary btn--large">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
              Chat WhatsApp Sekarang
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
