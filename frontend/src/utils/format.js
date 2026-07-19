/* ===================================================
   Format Utilities
   =================================================== */

/**
 * Format number to Indonesian Rupiah
 */
export function formatRupiah(amount) {
  return 'Rp ' + Number(amount).toLocaleString('id-ID');
}

/**
 * Generate WhatsApp URL with pre-filled message
 */
export function getWhatsAppURL(productName, waNumber = '6281219477977') {
  const message = productName
    ? `Halo, saya tertarik dengan ${productName}. Apakah masih tersedia?`
    : `Halo, saya ingin bertanya tentang koleksi bonsai`;
  return `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;
}
