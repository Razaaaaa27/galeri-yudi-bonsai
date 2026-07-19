import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { fetchProducts, createProduct, updateProduct, deleteProduct, updateStock, verifyToken } from '../utils/api';
import { getToken, getUser, clearAuth } from '../utils/auth';
import { formatRupiah } from '../utils/format';
import Toast, { useToast } from '../components/Toast';
import './AdminPage.css';

const FALLBACK_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Crect fill='%23f0faf4' width='48' height='48'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='16'%3E🌿%3C/text%3E%3C/svg%3E";

export default function AdminPage() {
  const navigate = useNavigate();
  const { toast, showToast } = useToast();

  /* ── State ── */
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('products'); // 'products' | 'add'
  const [filter, setFilter] = useState('semua');
  const [search, setSearch] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Form state
  const [formId, setFormId] = useState('');
  const [formCategory, setFormCategory] = useState('paket');
  const [formName, setFormName] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formStock, setFormStock] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const fileInputRef = useRef(null);

  // Modals
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null, name: '' });
  const [logoutModal, setLogoutModal] = useState(false);

  /* ── Auth check ── */
  useEffect(() => {
    const token = getToken();
    if (!token) { navigate('/login'); return; }
    verifyToken().catch(() => { clearAuth(); navigate('/login'); });
  }, [navigate]);

  /* ── Fetch data ── */
  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch { setProducts([]); }
    setLoading(false);
  }, []);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  /* ── Derived data ── */
  const user = getUser();
  let filtered = products;
  if (filter !== 'semua') filtered = filtered.filter(p => p.category === filter);
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(p => p.name.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q)));
  }

  const stats = {
    total: products.length,
    paket: products.filter(p => p.category === 'paket').length,
    pot: products.filter(p => p.category === 'pot').length,
    stock: products.reduce((s, p) => s + (p.stock || 0), 0),
  };

  /* ── View switching ── */
  function switchView(v) {
    setView(v);
    setSidebarOpen(false);
    if (v === 'add') resetForm();
  }

  /* ── Form ── */
  function resetForm() {
    setFormId('');
    setFormCategory('paket');
    setFormName('');
    setFormPrice('');
    setFormStock('');
    setFormDesc('');
    setSelectedFile(null);
    setPreviewUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function editProduct(product) {
    setFormId(product.id);
    setFormCategory(product.category);
    setFormName(product.name);
    setFormPrice(String(product.price));
    setFormStock(String(product.stock));
    setFormDesc(product.description || '');
    setSelectedFile(null);
    setPreviewUrl(product.image || '');
    setView('add');
    setSidebarOpen(false);
  }

  function handleFile(file) {
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  function handleDrop(e) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) handleFile(file);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!formName.trim()) { showToast('Nama produk wajib diisi.', 'error'); return; }

    const fd = new FormData();
    fd.append('category', formCategory);
    fd.append('name', formName.trim());
    fd.append('price', formPrice);
    fd.append('stock', formStock);
    fd.append('description', formDesc.trim());
    if (selectedFile) fd.append('image', selectedFile);

    try {
      if (formId) {
        const data = await updateProduct(formId, fd);
        showToast(data.message || 'Produk berhasil diperbarui!');
      } else {
        const data = await createProduct(fd);
        showToast(data.message || 'Produk berhasil ditambahkan!');
      }
      resetForm();
      setView('products');
      await loadProducts();
    } catch (err) {
      showToast(err.message || 'Gagal menyimpan produk.', 'error');
    }
  }

  /* ── Stock ── */
  async function changeStock(id, delta) {
    try {
      const data = await updateStock(id, delta);
      showToast(data.message);
      await loadProducts();
    } catch (err) {
      showToast(err.message || 'Gagal memperbarui stok', 'error');
    }
  }

  /* ── Delete ── */
  async function executeDelete() {
    if (!deleteModal.id) return;
    try {
      await deleteProduct(deleteModal.id);
      setDeleteModal({ open: false, id: null, name: '' });
      showToast('Produk berhasil dihapus.');
      await loadProducts();
    } catch (err) {
      showToast(err.message || 'Gagal menghapus produk.', 'error');
    }
  }

  /* ── Logout ── */
  function doLogout() {
    clearAuth();
    navigate('/login');
  }

  return (
    <div className="admin-layout">
      {/* ── SIDEBAR ── */}
      <aside className={`sidebar ${sidebarOpen ? 'active' : ''}`}>
        <div className="sidebar__header">
          <Link to="/" className="sidebar__logo">🌿 Galeri Yudi</Link>
          <span className="sidebar__badge">Admin</span>
        </div>
        <nav className="sidebar__nav">
          <button className={`sidebar__link ${view === 'products' ? 'sidebar__link--active' : ''}`} onClick={() => switchView('products')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
            Kelola Produk
          </button>
          <button className={`sidebar__link ${view === 'add' && !formId ? 'sidebar__link--active' : ''}`} onClick={() => switchView('add')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>
            Tambah Produk
          </button>
          <Link to="/" className="sidebar__link">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
            Lihat Website
          </Link>
        </nav>
        <div className="sidebar__footer">
          <div className="sidebar__user">
            <div className="sidebar__user-avatar">{(user.username || 'A').charAt(0).toUpperCase()}</div>
            <div className="sidebar__user-info">
              <span className="sidebar__user-name">{user.username ? user.username.charAt(0).toUpperCase() + user.username.slice(1) : 'Admin'}</span>
              <span className="sidebar__user-role">Administrator</span>
            </div>
          </div>
          <button className="sidebar__logout" onClick={() => setLogoutModal(true)} title="Logout">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
            Logout
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="admin-main">
        {/* Top Bar */}
        <header className="topbar">
          <button className="topbar__toggle" onClick={() => setSidebarOpen(p => !p)} aria-label="Toggle sidebar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
          </button>
          <h1 className="topbar__title">{view === 'products' ? 'Kelola Produk' : formId ? 'Edit Produk' : 'Tambah Produk'}</h1>
          <div className="topbar__stats">
            <div className="topbar__stat"><div className="topbar__stat-value">{stats.total}</div><div className="topbar__stat-label">Produk</div></div>
            <div className="topbar__stat"><div className="topbar__stat-value">{stats.paket} / {stats.pot}</div><div className="topbar__stat-label">Paket / Pot</div></div>
            <div className="topbar__stat"><div className="topbar__stat-value">{stats.stock}</div><div className="topbar__stat-label">Total Stok</div></div>
          </div>
        </header>

        {/* ── VIEW: Product List ── */}
        {view === 'products' && (
          <div className="view">
            <div className="filter-bar">
              <div className="filter-bar__tabs">
                {['semua', 'paket', 'pot'].map(f => (
                  <button key={f} className={`filter-btn ${filter === f ? 'filter-btn--active' : ''}`} onClick={() => setFilter(f)}>
                    {f === 'semua' ? 'Semua' : f === 'paket' ? 'Paket Bonsai + Pot' : 'Pot Kosong'}
                  </button>
                ))}
              </div>
              <div className="filter-bar__search">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                <input type="text" placeholder="Cari produk..." value={search} onChange={e => setSearch(e.target.value)} autoComplete="off" />
              </div>
            </div>

            {loading ? (
              <div className="table-loading"><div className="table-loading__spinner" /><p>Memuat data produk...</p></div>
            ) : (
              <>
                {/* Desktop table */}
                <div className="table-wrapper">
                  <table className="table">
                    <thead>
                      <tr><th>Produk</th><th>Kategori</th><th>Harga</th><th>Stok</th><th>Aksi</th></tr>
                    </thead>
                    <tbody>
                      {filtered.length === 0 ? (
                        <tr><td colSpan="5"><div className="table__empty"><p>Tidak ada produk ditemukan.</p></div></td></tr>
                      ) : filtered.map(p => (
                        <tr key={p.id}>
                          <td>
                            <div className="table__product">
                              <img className="table__product-img" src={p.image || FALLBACK_IMG} alt={p.name} onError={e => { e.target.src = FALLBACK_IMG; }} />
                              <div>
                                <div className="table__product-name">{p.name}</div>
                                <div className="table__product-desc">{p.description || '—'}</div>
                              </div>
                            </div>
                          </td>
                          <td><span className={`table__category ${p.category === 'paket' ? 'table__category--paket' : 'table__category--pot'}`}>{p.category === 'paket' ? 'Bonsai + Pot' : 'Pot Kosong'}</span></td>
                          <td><span className="table__price">{formatRupiah(p.price)}</span></td>
                          <td>
                            <div className="stock-inline">
                              <button className="stock-inline__btn" onClick={() => changeStock(p.id, -1)} title="Kurangi stok">−</button>
                              <span className="stock-inline__value">
                                <span className={`table__stock-dot ${p.stock <= 0 ? 'table__stock-dot--empty' : p.stock <= 3 ? 'table__stock-dot--low' : 'table__stock-dot--ok'}`} />
                                {p.stock}
                              </span>
                              <button className="stock-inline__btn" onClick={() => changeStock(p.id, 1)} title="Tambah stok">+</button>
                            </div>
                          </td>
                          <td>
                            <div className="table__actions">
                              <button className="table__action-btn table__action-btn--edit" onClick={() => editProduct(p)} title="Edit">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                              </button>
                              <button className="table__action-btn table__action-btn--delete" onClick={() => setDeleteModal({ open: true, id: p.id, name: p.name })} title="Hapus">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <div className="mobile-products">
                  {filtered.length === 0 ? (
                    <div className="table__empty"><p>Tidak ada produk ditemukan.</p></div>
                  ) : filtered.map(p => (
                    <div className="mobile-product-card" key={p.id}>
                      <div className="mobile-product-card__header">
                        <img src={p.image || FALLBACK_IMG} alt={p.name} onError={e => { e.target.src = FALLBACK_IMG; }} />
                        <div>
                          <div className="mobile-product-card__name">{p.name}</div>
                          <span className={`table__category ${p.category === 'paket' ? 'table__category--paket' : 'table__category--pot'}`}>{p.category === 'paket' ? 'Bonsai + Pot' : 'Pot Kosong'}</span>
                        </div>
                      </div>
                      <div className="mobile-product-card__body">
                        <div className="mobile-product-card__row">
                          <span>Harga</span>
                          <span className="table__price">{formatRupiah(p.price)}</span>
                        </div>
                        <div className="mobile-product-card__row">
                          <span>Stok</span>
                          <div className="stock-inline">
                            <button className="stock-inline__btn" onClick={() => changeStock(p.id, -1)}>−</button>
                            <span className="stock-inline__value">
                              <span className={`table__stock-dot ${p.stock <= 0 ? 'table__stock-dot--empty' : p.stock <= 3 ? 'table__stock-dot--low' : 'table__stock-dot--ok'}`} />
                              {p.stock}
                            </span>
                            <button className="stock-inline__btn" onClick={() => changeStock(p.id, 1)}>+</button>
                          </div>
                        </div>
                      </div>
                      <div className="mobile-product-card__actions">
                        <button className="table__action-btn table__action-btn--edit" onClick={() => editProduct(p)}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                          Edit
                        </button>
                        <button className="table__action-btn table__action-btn--delete" onClick={() => setDeleteModal({ open: true, id: p.id, name: p.name })}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                          Hapus
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── VIEW: Add/Edit Product ── */}
        {view === 'add' && (
          <div className="view">
            <form className="form-card" onSubmit={handleSubmit} encType="multipart/form-data">
              <h2 className="form-card__title">{formId ? 'Edit Produk' : 'Tambah Produk Baru'}</h2>
              <p className="form-card__subtitle">Isi detail produk di bawah ini. Produk akan langsung muncul di website.</p>

              <div className="form-grid">
                {/* Kategori */}
                <div className="form-group form-group--full">
                  <label>Kategori *</label>
                  <div className="form-radio-group">
                    <label className="form-radio">
                      <input type="radio" name="category" value="paket" checked={formCategory === 'paket'} onChange={() => setFormCategory('paket')} />
                      <span className="form-radio__box" />
                      <span><strong>Paket Bonsai + Pot</strong><small>Bonsai dan pot dalam satu paket</small></span>
                    </label>
                    <label className="form-radio">
                      <input type="radio" name="category" value="pot" checked={formCategory === 'pot'} onChange={() => setFormCategory('pot')} />
                      <span className="form-radio__box" />
                      <span><strong>Pot Kosong</strong><small>Pot dijual terpisah tanpa tanaman</small></span>
                    </label>
                  </div>
                </div>

                {/* Nama */}
                <div className="form-group form-group--full">
                  <label htmlFor="form-name">Nama Produk *</label>
                  <input type="text" id="form-name" placeholder="Contoh: Paket Serenity - Bonsai Beringin + Pot Keramik Putih" value={formName} onChange={e => setFormName(e.target.value)} required />
                </div>

                {/* Harga & Stok */}
                <div className="form-group">
                  <label htmlFor="form-price">Harga (Rp) *</label>
                  <input type="number" id="form-price" placeholder="850000" min="0" value={formPrice} onChange={e => setFormPrice(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label htmlFor="form-stock">Jumlah Stok *</label>
                  <input type="number" id="form-stock" placeholder="10" min="0" value={formStock} onChange={e => setFormStock(e.target.value)} required />
                </div>

                {/* Deskripsi */}
                <div className="form-group form-group--full">
                  <label htmlFor="form-desc">Deskripsi</label>
                  <textarea id="form-desc" rows="3" placeholder="Deskripsi singkat produk..." value={formDesc} onChange={e => setFormDesc(e.target.value)} />
                </div>

                {/* Upload */}
                <div className="form-group form-group--full">
                  <label>Upload Gambar Produk</label>
                  <div
                    className="upload-area"
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={e => e.preventDefault()}
                    onDrop={handleDrop}
                  >
                    <input type="file" ref={fileInputRef} accept="image/*" hidden onChange={e => { if (e.target.files[0]) handleFile(e.target.files[0]); }} />
                    {previewUrl ? (
                      <div className="upload-area__preview">
                        <img src={previewUrl} alt="Preview" />
                        <button type="button" className="upload-area__remove" onClick={e => { e.stopPropagation(); setSelectedFile(null); setPreviewUrl(''); if (fileInputRef.current) fileInputRef.current.value = ''; }} title="Hapus gambar">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                        </button>
                        <span className="upload-area__filename">{selectedFile ? selectedFile.name : 'Gambar saat ini'}</span>
                      </div>
                    ) : (
                      <div className="upload-area__content">
                        <div className="upload-area__icon">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                        </div>
                        <p className="upload-area__text"><strong>Klik untuk upload</strong> atau drag &amp; drop gambar di sini</p>
                        <span className="upload-area__hint">JPG, PNG, WEBP (Maks. 5MB)</span>
                      </div>
                    )}
                  </div>
                  <small className="form-hint">Upload gambar langsung dari komputer Anda.</small>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn--secondary" onClick={() => { resetForm(); setView('products'); }}>Batal</button>
                <button type="submit" className="btn btn--primary">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>
                  {formId ? 'Simpan Perubahan' : 'Simpan Produk'}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* ── Delete Modal ── */}
      <div className={`modal-overlay ${deleteModal.open ? 'active' : ''}`}>
        <div className="modal">
          <div className="modal__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
          </div>
          <h3 className="modal__title">Hapus Produk?</h3>
          <p className="modal__text">"{deleteModal.name}" akan dihapus permanen dari katalog.</p>
          <div className="modal__actions">
            <button className="btn btn--secondary" onClick={() => setDeleteModal({ open: false, id: null, name: '' })}>Batal</button>
            <button className="btn btn--danger" onClick={executeDelete}>Hapus</button>
          </div>
        </div>
      </div>

      {/* ── Logout Modal ── */}
      <div className={`modal-overlay ${logoutModal ? 'active' : ''}`}>
        <div className="modal">
          <div className="modal__icon modal__icon--logout">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
          </div>
          <h3 className="modal__title">Logout?</h3>
          <p className="modal__text">Anda akan keluar dari dashboard admin.</p>
          <div className="modal__actions">
            <button className="btn btn--secondary" onClick={() => setLogoutModal(false)}>Batal</button>
            <button className="btn btn--danger" onClick={doLogout}>Logout</button>
          </div>
        </div>
      </div>

      {/* Toast */}
      <Toast message={toast.message} type={toast.type} visible={toast.visible} />

      {/* Sidebar backdrop */}
      {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}
    </div>
  );
}
