/* ===================================================
   GALERI YUDI — JavaScript
   Product display with API fetch, categories, stock,
   scroll reveals, navbar, mobile menu
   =================================================== */

// ─────────────────────────────────────────────────────
// CONFIGURATION
// ─────────────────────────────────────────────────────
const CONFIG = {
  // [GANTI: Ubah dengan nomor WhatsApp Anda (tanpa +, tanpa spasi)]
  whatsappNumber: '6281219477977',
  storeName: 'Galeri Yudi',
  apiBase: '/api',
};

// ─────────────────────────────────────────────────────
// DEFAULT PRODUCTS (fallback when API is unavailable)
// ─────────────────────────────────────────────────────
const DEFAULT_PRODUCTS = [
  {
    id: '1',
    category: 'paket',
    name: 'Paket Serenity — Bonsai Beringin + Pot Keramik Putih',
    price: 850000,
    stock: 5,
    description: 'Bonsai beringin dewasa dengan akar gantung eksotis, dipadukan pot keramik putih minimalis berglaze halus.',
    image: 'assets/images/product-beringin.png',
  },
  {
    id: '2',
    category: 'paket',
    name: 'Paket Zen Garden — Bonsai Maple Jepang + Pot Tanah Liat',
    price: 1250000,
    stock: 3,
    description: 'Maple Jepang dengan dedaunan merah-hijau yang memukau. Pot tanah liat cokelat tua dengan aksen klasik.',
    image: 'assets/images/product-maple.png',
  },
  {
    id: '3',
    category: 'paket',
    name: 'Paket Harmony — Bonsai Serut + Pot Keramik Abu-abu',
    price: 650000,
    stock: 8,
    description: 'Bonsai serut dengan daun kecil rapat yang mudah dirawat. Pot keramik abu-abu elegant dengan finishing matte.',
    image: 'assets/images/product-serut.png',
  },
  {
    id: '4',
    category: 'paket',
    name: 'Paket Evergreen — Bonsai Juniper + Pot Keramik Cokelat',
    price: 950000,
    stock: 4,
    description: 'Juniper cascading klasik dengan karakter batang berpilin. Pot keramik rectangular cokelat tua yang kokoh.',
    image: 'assets/images/product-juniper.png',
  },
  {
    id: '5',
    category: 'paket',
    name: 'Paket Skyline — Bonsai Cemara + Pot Keramik Biru-Abu',
    price: 750000,
    stock: 6,
    description: 'Bonsai cemara tegak dengan cabang berlapis indah. Pot keramik glazed biru-abu yang menambah kesan tenang.',
    image: 'assets/images/product-cemara.png',
  },
  {
    id: '6',
    category: 'pot',
    name: 'Pot Keramik Putih Minimalis — Round',
    price: 185000,
    stock: 15,
    description: 'Pot keramik bulat berwarna putih polos dengan finishing glaze halus. Cocok untuk bonsai berukuran kecil-sedang.',
    image: 'assets/images/product-beringin.png',
  },
  {
    id: '7',
    category: 'pot',
    name: 'Pot Tanah Liat Klasik — Oval',
    price: 150000,
    stock: 20,
    description: 'Pot tanah liat oval dengan warna cokelat natural. Material tebal dan kokoh, desain tradisional Jepang.',
    image: 'assets/images/product-maple.png',
  },
  {
    id: '8',
    category: 'pot',
    name: 'Pot Keramik Abu-abu Matte — Rectangular',
    price: 220000,
    stock: 10,
    description: 'Pot keramik persegi panjang berwarna abu-abu dengan finishing matte premium. Elegan untuk bonsai formal.',
    image: 'assets/images/product-serut.png',
  },
  {
    id: '9',
    category: 'pot',
    name: 'Pot Keramik Biru-Abu Glazed — Round',
    price: 200000,
    stock: 12,
    description: 'Pot keramik bulat dengan glazed biru-abu yang unik. Memberikan kesan tenang dan natural.',
    image: 'assets/images/product-cemara.png',
  },
];

// ─────────────────────────────────────────────────────
// DATA LAYER — API based with fallback
// ─────────────────────────────────────────────────────
let productsData = [];

async function fetchProducts() {
  try {
    const response = await fetch(`${CONFIG.apiBase}/products`);
    if (!response.ok) throw new Error('API error');
    productsData = await response.json();
    return productsData;
  } catch (err) {
    console.warn('API not available, using default products:', err.message);
    productsData = DEFAULT_PRODUCTS;
    return productsData;
  }
}

// ─────────────────────────────────────────────────────
// UTILITY: Format Rupiah
// ─────────────────────────────────────────────────────
function formatRupiah(amount) {
  return 'Rp ' + Number(amount).toLocaleString('id-ID');
}

// ─────────────────────────────────────────────────────
// UTILITY: Generate WhatsApp URL with pre-filled message
// ─────────────────────────────────────────────────────
function getWhatsAppURL(productName) {
  const message = productName
    ? `Halo, saya tertarik dengan ${productName}. Apakah masih tersedia?`
    : `Halo, saya ingin bertanya tentang koleksi bonsai`;
  return `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

// ─────────────────────────────────────────────────────
// CURRENT FILTER STATE
// ─────────────────────────────────────────────────────
let currentFilter = 'semua';

// ─────────────────────────────────────────────────────
// RENDER PRODUCTS with category filter
// ─────────────────────────────────────────────────────
async function renderProducts(filter) {
  if (filter !== undefined) currentFilter = filter;

  const grid = document.getElementById('products-grid');
  if (!grid) return;

  // Fetch fresh data
  const allProducts = await fetchProducts();
  const filtered = currentFilter === 'semua'
    ? allProducts
    : allProducts.filter(p => p.category === currentFilter);

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="products__empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" width="48" height="48">
          <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
        </svg>
        <p>Belum ada produk di kategori ini.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map((product, index) => {
    const pid = product.id;
    const isOutOfStock = product.stock <= 0;
    const stockLabel = isOutOfStock
      ? '<span class="product-card__stock product-card__stock--empty">Stok Habis</span>'
      : `<span class="product-card__stock product-card__stock--available">Stok: ${product.stock}</span>`;

    const categoryBadge = product.category === 'paket'
      ? 'Bonsai + Pot'
      : 'Pot Kosong';

    const fallbackImg = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'><rect fill='%23f0faf4' width='400' height='300'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%232d6a4f' font-size='20'>🌿 Foto Produk</text></svg>";

    return `
      <div class="product-card reveal reveal-delay-${(index % 3) + 1}" id="product-${pid}">
        <div class="product-card__image">
          <img src="${product.image}" 
               alt="${product.name}" 
               width="400" height="300"
               loading="lazy"
               onerror="this.src='${fallbackImg}'">
          <span class="product-card__badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="12" height="12">
              <path d="m9 12 2 2 4-4"/>
            </svg>
            ${categoryBadge}
          </span>
          ${isOutOfStock ? '<div class="product-card__overlay">Stok Habis</div>' : ''}
        </div>
        <div class="product-card__body">
          <h3 class="product-card__name">${product.name}</h3>
          <p class="product-card__desc">${product.description}</p>
          <div class="product-card__footer">
            <div>
              <span class="product-card__price">${formatRupiah(product.price)}</span>
              ${stockLabel}
            </div>
            ${isOutOfStock
        ? `<span class="product-card__btn product-card__btn--disabled">Stok Habis</span>`
        : `<a href="${getWhatsAppURL(product.name)}" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    class="product-card__btn"
                    aria-label="Pesan ${product.name} via WhatsApp">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                  </svg>
                  Pesan Sekarang
                </a>`
      }
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Update active tab
  document.querySelectorAll('.category-tab').forEach(tab => {
    tab.classList.toggle('category-tab--active', tab.dataset.category === currentFilter);
  });

  // Re-observe newly created product cards for scroll reveal
  initScrollReveal();
}

// ─────────────────────────────────────────────────────
// CATEGORY TAB CLICKS
// ─────────────────────────────────────────────────────
function initCategoryTabs() {
  document.querySelectorAll('.category-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      renderProducts(tab.dataset.category);
    });
  });
}

// ─────────────────────────────────────────────────────
// NAVBAR: Transparent → Solid on scroll
// ─────────────────────────────────────────────────────
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  const SCROLL_THRESHOLD = 50;

  function updateNavbar() {
    if (window.scrollY > SCROLL_THRESHOLD) {
      navbar.classList.remove('navbar--transparent');
      navbar.classList.add('navbar--solid');
    } else {
      navbar.classList.remove('navbar--solid');
      navbar.classList.add('navbar--transparent');
    }
  }

  updateNavbar();
  window.addEventListener('scroll', updateNavbar, { passive: true });
}

// ─────────────────────────────────────────────────────
// MOBILE MENU
// ─────────────────────────────────────────────────────
function initMobileMenu() {
  const toggle = document.getElementById('navbar-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  if (!toggle || !mobileMenu) return;

  const mobileLinks = mobileMenu.querySelectorAll('.mobile-menu__link');

  toggle.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.contains('active');
    mobileMenu.classList.toggle('active');
    toggle.classList.toggle('active');
    document.body.style.overflow = isOpen ? '' : 'hidden';
  });

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('active');
      toggle.classList.remove('active');
      document.body.style.overflow = '';
    });
  });
}

// ─────────────────────────────────────────────────────
// SMOOTH SCROLL for anchor links
// ─────────────────────────────────────────────────────
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();

      const navbarHeight = document.getElementById('navbar')?.offsetHeight || 64;
      const targetPosition = target.getBoundingClientRect().top + window.scrollY - navbarHeight;

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth',
      });
    });
  });
}

// ─────────────────────────────────────────────────────
// SCROLL REVEAL (Intersection Observer)
// ─────────────────────────────────────────────────────
let revealObserver = null;

function initScrollReveal() {
  if (revealObserver) {
    revealObserver.disconnect();
  }

  const elements = document.querySelectorAll('.reveal:not(.revealed)');
  if (elements.length === 0) return;

  revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  elements.forEach(el => revealObserver.observe(el));
}

// ─────────────────────────────────────────────────────
// ACTIVE NAV LINK highlight on scroll
// ─────────────────────────────────────────────────────
function initActiveNavHighlight() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.navbar__link');

  if (sections.length === 0 || navLinks.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            link.style.color = '';
            if (link.getAttribute('href') === `#${id}`) {
              link.style.color = 'var(--color-green-primary)';
            }
          });
        }
      });
    },
    {
      threshold: 0.2,
      rootMargin: '-80px 0px -50% 0px',
    }
  );

  sections.forEach(section => observer.observe(section));
}

// ─────────────────────────────────────────────────────
// SCROLL PROGRESS BAR
// ─────────────────────────────────────────────────────
function initScrollProgress() {
  const progressBar = document.getElementById('scroll-progress');
  if (!progressBar) return;

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;
    progressBar.style.width = scrollPercent + '%';
  }, { passive: true });
}

// ─────────────────────────────────────────────────────
// INITIALIZE
// ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderProducts('semua');
  initCategoryTabs();
  initNavbar();
  initMobileMenu();
  initSmoothScroll();
  initScrollReveal();
  initActiveNavHighlight();
  initScrollProgress();
});
