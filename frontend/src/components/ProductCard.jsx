import { formatRupiah, getWhatsAppURL } from '../utils/format';
import './ProductCard.css';

const FALLBACK_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect fill='%23f0faf4' width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%232d6a4f' font-size='20'%3E🌿 Foto Produk%3C/text%3E%3C/svg%3E";

export default function ProductCard({ product, index = 0 }) {
  const isOutOfStock = product.stock <= 0;
  const categoryBadge = product.category === 'paket' ? 'Bonsai + Pot' : 'Pot Kosong';

  return (
    <div className={`product-card reveal reveal-delay-${(index % 3) + 1}`} id={`product-${product.id}`}>
      <div className="product-card__image">
        <img
          src={product.image || FALLBACK_IMG}
          alt={product.name}
          width="400"
          height="300"
          loading="lazy"
          onError={(e) => { e.target.src = FALLBACK_IMG; }}
        />
        <span className="product-card__badge">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="12" height="12">
            <path d="m9 12 2 2 4-4" />
          </svg>
          {categoryBadge}
        </span>
        {isOutOfStock && <div className="product-card__overlay">Stok Habis</div>}
      </div>

      <div className="product-card__body">
        <h3 className="product-card__name">{product.name}</h3>
        <p className="product-card__desc">{product.description}</p>

        <div className="product-card__footer">
          <div>
            <span className="product-card__price">{formatRupiah(product.price)}</span>
            {isOutOfStock ? (
              <span className="product-card__stock product-card__stock--empty">Stok Habis</span>
            ) : (
              <span className="product-card__stock product-card__stock--available">Stok: {product.stock}</span>
            )}
          </div>

          {isOutOfStock ? (
            <span className="product-card__btn product-card__btn--disabled">Stok Habis</span>
          ) : (
            <a
              href={getWhatsAppURL(product.name)}
              target="_blank"
              rel="noopener noreferrer"
              className="product-card__btn"
              aria-label={`Pesan ${product.name} via WhatsApp`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
              Pesan Sekarang
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
