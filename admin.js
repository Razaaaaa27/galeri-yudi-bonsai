/* ===================================================
   GALERI YUDI — Admin Panel JavaScript
   API-based CRUD with JWT Auth & Image Upload
   =================================================== */

const API_BASE = '/api';

// ─────────────────────────────────────────────────────
// AUTH HELPERS
// ─────────────────────────────────────────────────────
function getToken() {
  return localStorage.getItem('galeriyudi_token');
}

function getAuthHeaders() {
  return {
    Authorization: `Bearer ${getToken()}`,
  };
}

function logout() {
  localStorage.removeItem('galeriyudi_token');
  localStorage.removeItem('galeriyudi_user');
  window.location.href = 'login.html';
}

async function checkAuth() {
  const token = getToken();
  if (!token) {
    window.location.href = 'login.html';
    return false;
  }

  try {
    const res = await fetch(`${API_BASE}/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
    });

    if (!res.ok) {
      logout();
      return false;
    }

    // Set user info
    const user = JSON.parse(localStorage.getItem('galeriyudi_user') || '{}');
    const nameEl = document.getElementById('user-name');
    const avatarEl = document.getElementById('user-avatar');
    if (nameEl && user.username) {
      nameEl.textContent = user.username.charAt(0).toUpperCase() + user.username.slice(1);
    }
    if (avatarEl && user.username) {
      avatarEl.textContent = user.username.charAt(0).toUpperCase();
    }

    return true;
  } catch (err) {
    console.error('Auth check failed:', err);
    logout();
    return false;
  }
}

// ─────────────────────────────────────────────────────
// DATA LAYER — API based
// ─────────────────────────────────────────────────────
let productsCache = [];

async function fetchProducts() {
  try {
    const res = await fetch(`${API_BASE}/products`);
    if (!res.ok) throw new Error('Failed to fetch products');
    productsCache = await res.json();
    return productsCache;
  } catch (err) {
    console.error('Fetch products error:', err);
    return [];
  }
}

function formatRupiah(amount) {
  return 'Rp ' + Number(amount).toLocaleString('id-ID');
}

// ─────────────────────────────────────────────────────
// STATE
// ─────────────────────────────────────────────────────
let currentAdminFilter = 'semua';
let currentSearchQuery = '';
let deleteTargetId = null;

// ─────────────────────────────────────────────────────
// RENDER PRODUCT TABLE
// ─────────────────────────────────────────────────────
async function renderTable() {
  const tbody = document.getElementById('products-tbody');
  const loading = document.getElementById('table-loading');
  const tableWrapper = document.querySelector('.table-wrapper');
  if (!tbody) return;

  // Show loading
  if (loading) loading.style.display = 'flex';
  if (tableWrapper) tableWrapper.style.display = 'none';

  let products = await fetchProducts();

  // Hide loading, show table
  if (loading) loading.style.display = 'none';
  if (tableWrapper) tableWrapper.style.display = 'block';

  // Apply filter
  if (currentAdminFilter !== 'semua') {
    products = products.filter(p => p.category === currentAdminFilter);
  }

  // Apply search
  if (currentSearchQuery) {
    const q = currentSearchQuery.toLowerCase();
    products = products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.description && p.description.toLowerCase().includes(q))
    );
  }

  if (products.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5">
          <div class="table__empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
            </svg>
            <p>Tidak ada produk ditemukan.</p>
          </div>
        </td>
      </tr>
    `;
    updateStats();
    return;
  }

  tbody.innerHTML = products.map(product => {
    const pid = product.id;
    const categoryLabel = product.category === 'paket' ? 'Bonsai + Pot' : 'Pot Kosong';
    const categoryClass = product.category === 'paket' ? 'table__category--paket' : 'table__category--pot';

    let stockDotClass = 'table__stock-dot--ok';
    if (product.stock <= 0) stockDotClass = 'table__stock-dot--empty';
    else if (product.stock <= 3) stockDotClass = 'table__stock-dot--low';

    const imgSrc = product.image || '';
    const fallbackImg = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'><rect fill='%23f0faf4' width='48' height='48'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='16'>🌿</text></svg>";

    return `
      <tr data-id="${pid}">
        <td>
          <div class="table__product">
            <img class="table__product-img" 
                 src="${imgSrc}" 
                 alt="${product.name}"
                 onerror="this.src='${fallbackImg}'">
            <div>
              <div class="table__product-name">${product.name}</div>
              <div class="table__product-desc">${product.description || '—'}</div>
            </div>
          </div>
        </td>
        <td><span class="table__category ${categoryClass}">${categoryLabel}</span></td>
        <td><span class="table__price">${formatRupiah(product.price)}</span></td>
        <td>
          <div class="stock-inline">
            <button class="stock-inline__btn" onclick="changeStock('${pid}', -1)" title="Kurangi stok">−</button>
            <span class="stock-inline__value">
              <span class="table__stock-dot ${stockDotClass}"></span>
              ${product.stock}
            </span>
            <button class="stock-inline__btn" onclick="changeStock('${pid}', 1)" title="Tambah stok">+</button>
          </div>
        </td>
        <td>
          <div class="table__actions">
            <button class="table__action-btn table__action-btn--edit" onclick="editProduct('${pid}')" title="Edit produk">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button class="table__action-btn table__action-btn--delete" onclick="confirmDelete('${pid}')" title="Hapus produk">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  updateStats();
}

// ─────────────────────────────────────────────────────
// STATS
// ─────────────────────────────────────────────────────
function updateStats() {
  const stats = document.getElementById('topbar-stats');
  if (!stats) return;

  const products = productsCache;
  const totalProducts = products.length;
  const totalPaket = products.filter(p => p.category === 'paket').length;
  const totalPot = products.filter(p => p.category === 'pot').length;
  const totalStock = products.reduce((sum, p) => sum + (p.stock || 0), 0);

  stats.innerHTML = `
    <div class="topbar__stat">
      <div class="topbar__stat-value">${totalProducts}</div>
      <div class="topbar__stat-label">Produk</div>
    </div>
    <div class="topbar__stat">
      <div class="topbar__stat-value">${totalPaket} / ${totalPot}</div>
      <div class="topbar__stat-label">Paket / Pot</div>
    </div>
    <div class="topbar__stat">
      <div class="topbar__stat-value">${totalStock}</div>
      <div class="topbar__stat-label">Total Stok</div>
    </div>
  `;
}

// ─────────────────────────────────────────────────────
// INLINE STOCK CHANGE
// ─────────────────────────────────────────────────────
async function changeStock(productId, delta) {
  try {
    const res = await fetch(`${API_BASE}/products/${productId}/stock`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ delta }),
    });

    if (!res.ok) {
      const err = await res.json();
      showToast(err.error || 'Gagal memperbarui stok', 'error');
      return;
    }

    const data = await res.json();
    showToast(data.message);
    await renderTable();
  } catch (err) {
    console.error('Change stock error:', err);
    showToast('Gagal memperbarui stok', 'error');
  }
}

// ─────────────────────────────────────────────────────
// VIEW SWITCHING
// ─────────────────────────────────────────────────────
function showView(viewName) {
  document.querySelectorAll('.view').forEach(v => v.classList.add('view--hidden'));
  document.getElementById(`view-${viewName}`)?.classList.remove('view--hidden');

  document.querySelectorAll('.sidebar__link').forEach(l => l.classList.remove('sidebar__link--active'));
  document.getElementById(`nav-${viewName}`)?.classList.add('sidebar__link--active');

  const title = document.getElementById('topbar-title');
  if (viewName === 'products') {
    title.textContent = 'Kelola Produk';
  } else if (viewName === 'add') {
    title.textContent = document.getElementById('form-id').value ? 'Edit Produk' : 'Tambah Produk';
  }
}

// ─────────────────────────────────────────────────────
// IMAGE UPLOAD HANDLING
// ─────────────────────────────────────────────────────
let selectedFile = null;

function initUploadArea() {
  const uploadArea = document.getElementById('upload-area');
  const fileInput = document.getElementById('form-image');
  const uploadContent = document.getElementById('upload-content');
  const uploadPreview = document.getElementById('upload-preview');
  const previewImg = document.getElementById('preview-img');
  const removeBtn = document.getElementById('remove-image');
  const filenameEl = document.getElementById('upload-filename');

  if (!uploadArea) return;

  // Click to upload
  uploadArea.addEventListener('click', (e) => {
    if (e.target.closest('.upload-area__remove')) return;
    fileInput.click();
  });

  // File selected
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
  });

  // Drag & Drop
  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('upload-area--dragover');
  });

  uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('upload-area--dragover');
  });

  uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('upload-area--dragover');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFile(file);
    }
  });

  // Remove image
  removeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    selectedFile = null;
    fileInput.value = '';
    uploadContent.style.display = 'flex';
    uploadPreview.style.display = 'none';
  });

  function handleFile(file) {
    selectedFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      previewImg.src = e.target.result;
      filenameEl.textContent = file.name;
      uploadContent.style.display = 'none';
      uploadPreview.style.display = 'flex';
    };
    reader.readAsDataURL(file);
  }
}

// ─────────────────────────────────────────────────────
// FORM: Add / Edit Product
// ─────────────────────────────────────────────────────
function resetForm() {
  document.getElementById('form-id').value = '';
  document.getElementById('form-name').value = '';
  document.getElementById('form-price').value = '';
  document.getElementById('form-stock').value = '';
  document.getElementById('form-desc').value = '';
  document.getElementById('form-cat-paket').checked = true;
  document.getElementById('form-title').textContent = 'Tambah Produk Baru';

  // Reset image upload
  selectedFile = null;
  const fileInput = document.getElementById('form-image');
  if (fileInput) fileInput.value = '';
  const uploadContent = document.getElementById('upload-content');
  const uploadPreview = document.getElementById('upload-preview');
  if (uploadContent) uploadContent.style.display = 'flex';
  if (uploadPreview) uploadPreview.style.display = 'none';

  document.getElementById('form-submit').innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
    </svg>
    Simpan Produk
  `;
}

async function editProduct(productId) {
  const product = productsCache.find(p => String(p.id) === String(productId));
  if (!product) return;

  document.getElementById('form-id').value = product.id;
  document.getElementById('form-name').value = product.name;
  document.getElementById('form-price').value = product.price;
  document.getElementById('form-stock').value = product.stock;
  document.getElementById('form-desc').value = product.description || '';

  if (product.category === 'pot') {
    document.getElementById('form-cat-pot').checked = true;
  } else {
    document.getElementById('form-cat-paket').checked = true;
  }

  // Show existing image in preview
  selectedFile = null;
  const uploadContent = document.getElementById('upload-content');
  const uploadPreview = document.getElementById('upload-preview');
  const previewImg = document.getElementById('preview-img');
  const filenameEl = document.getElementById('upload-filename');

  if (product.image) {
    previewImg.src = product.image;
    filenameEl.textContent = 'Gambar saat ini';
    uploadContent.style.display = 'none';
    uploadPreview.style.display = 'flex';
  } else {
    uploadContent.style.display = 'flex';
    uploadPreview.style.display = 'none';
  }

  document.getElementById('form-title').textContent = 'Edit Produk';
  document.getElementById('form-submit').innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
    </svg>
    Simpan Perubahan
  `;

  showView('add');
}

async function handleFormSubmit(e) {
  e.preventDefault();

  const editId = document.getElementById('form-id').value;
  const category = document.querySelector('input[name="category"]:checked').value;
  const name = document.getElementById('form-name').value.trim();
  const price = document.getElementById('form-price').value;
  const stock = document.getElementById('form-stock').value;
  const description = document.getElementById('form-desc').value.trim();

  if (!name) {
    alert('Nama produk wajib diisi.');
    return;
  }

  // Build FormData for multipart upload
  const formData = new FormData();
  formData.append('category', category);
  formData.append('name', name);
  formData.append('price', price);
  formData.append('stock', stock);
  formData.append('description', description);

  if (selectedFile) {
    formData.append('image', selectedFile);
  }

  try {
    const url = editId
      ? `${API_BASE}/products/${editId}`
      : `${API_BASE}/products`;
    const method = editId ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: getAuthHeaders(),
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      showToast(data.error || 'Gagal menyimpan produk.', 'error');
      return;
    }

    showToast(data.message || (editId ? 'Produk berhasil diperbarui!' : 'Produk baru berhasil ditambahkan!'));
    resetForm();
    showView('products');
    await renderTable();
  } catch (err) {
    console.error('Form submit error:', err);
    showToast('Gagal menyimpan produk. Cek koneksi server.', 'error');
  }
}

// ─────────────────────────────────────────────────────
// DELETE
// ─────────────────────────────────────────────────────
function confirmDelete(productId) {
  deleteTargetId = productId;
  const product = productsCache.find(p => String(p.id) === String(productId));
  const modal = document.getElementById('delete-modal');
  const text = document.getElementById('delete-modal-text');

  if (product) {
    text.textContent = `"${product.name}" akan dihapus permanen dari katalog.`;
  }

  modal.classList.add('active');
}

async function executeDelete() {
  if (!deleteTargetId) return;

  try {
    const res = await fetch(`${API_BASE}/products/${deleteTargetId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const err = await res.json();
      showToast(err.error || 'Gagal menghapus produk.', 'error');
      return;
    }

    document.getElementById('delete-modal').classList.remove('active');
    deleteTargetId = null;

    showToast('Produk berhasil dihapus.');
    await renderTable();
  } catch (err) {
    console.error('Delete error:', err);
    showToast('Gagal menghapus produk.', 'error');
  }
}

// ─────────────────────────────────────────────────────
// TOAST
// ─────────────────────────────────────────────────────
let toastTimer = null;
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  const toastText = document.getElementById('toast-text');
  const toastIcon = toast.querySelector('.toast__icon');

  toastText.textContent = message;

  if (type === 'error') {
    toastIcon.textContent = '✕';
    toast.classList.add('toast--error');
  } else {
    toastIcon.textContent = '✓';
    toast.classList.remove('toast--error');
  }

  toast.classList.add('active');

  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('active');
  }, 3000);
}

// ─────────────────────────────────────────────────────
// SIDEBAR TOGGLE (mobile)
// ─────────────────────────────────────────────────────
function initSidebarToggle() {
  const toggle = document.getElementById('sidebar-toggle');
  const sidebar = document.getElementById('sidebar');
  if (!toggle || !sidebar) return;

  toggle.addEventListener('click', () => {
    sidebar.classList.toggle('active');
  });

  // Close sidebar when clicking outside on mobile
  document.addEventListener('click', (e) => {
    if (window.innerWidth <= 768 &&
        sidebar.classList.contains('active') &&
        !sidebar.contains(e.target) &&
        !toggle.contains(e.target)) {
      sidebar.classList.remove('active');
    }
  });
}

// ─────────────────────────────────────────────────────
// LOGOUT
// ─────────────────────────────────────────────────────
function initLogout() {
  const logoutBtn = document.getElementById('logout-btn');
  const logoutModal = document.getElementById('logout-modal');
  const logoutCancel = document.getElementById('logout-cancel');
  const logoutConfirm = document.getElementById('logout-confirm');

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      logoutModal.classList.add('active');
    });
  }

  if (logoutCancel) {
    logoutCancel.addEventListener('click', () => {
      logoutModal.classList.remove('active');
    });
  }

  if (logoutConfirm) {
    logoutConfirm.addEventListener('click', () => {
      logout();
    });
  }
}

// ─────────────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  // Check authentication first
  const isAuth = await checkAuth();
  if (!isAuth) return;

  // Render table
  await renderTable();

  // Sidebar nav
  document.getElementById('nav-products')?.addEventListener('click', (e) => {
    e.preventDefault();
    showView('products');
  });

  document.getElementById('nav-add')?.addEventListener('click', (e) => {
    e.preventDefault();
    resetForm();
    showView('add');
  });

  // Filter tabs
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentAdminFilter = btn.dataset.filter;
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('filter-btn--active'));
      btn.classList.add('filter-btn--active');
      renderTable();
    });
  });

  // Search
  document.getElementById('search-input')?.addEventListener('input', (e) => {
    currentSearchQuery = e.target.value;
    renderTable();
  });

  // Form
  document.getElementById('product-form')?.addEventListener('submit', handleFormSubmit);

  // Form cancel
  document.getElementById('form-cancel')?.addEventListener('click', () => {
    resetForm();
    showView('products');
  });

  // Delete modal
  document.getElementById('delete-confirm')?.addEventListener('click', executeDelete);
  document.getElementById('delete-cancel')?.addEventListener('click', () => {
    document.getElementById('delete-modal').classList.remove('active');
    deleteTargetId = null;
  });

  // Init upload area
  initUploadArea();

  // Init sidebar toggle
  initSidebarToggle();

  // Init logout
  initLogout();
});
