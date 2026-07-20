export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://fj-backend-mu.vercel.app';

export const API_ENDPOINTS = {
  // Public
  PUBLIC_QUOTES:   `${API_BASE_URL}/api/quotes`,
  PUBLIC_GALLERY:  `${API_BASE_URL}/api/gallery`,
  PUBLIC_SERVICES: `${API_BASE_URL}/api/services`,

  // Admin
  ADMIN_LOGIN:    `${API_BASE_URL}/api/admin/login`,
  ADMIN_QUOTES:   `${API_BASE_URL}/api/admin/quotes`,
  ADMIN_INVOICES: `${API_BASE_URL}/api/admin/invoices`,
  ADMIN_GALLERY:  `${API_BASE_URL}/api/admin/gallery`,
  ADMIN_SERVICES: `${API_BASE_URL}/api/admin/services`,

  // Helpers
  getQuoteStatusEndpoint:    (id: string) => `${API_BASE_URL}/api/admin/quotes/${id}/status`,
  getInvoiceEndpoint:        (id: string) => `${API_BASE_URL}/api/admin/invoices/${id}`,
  getInvoiceConvertEndpoint: (id: string) => `${API_BASE_URL}/api/admin/invoices/${id}/convert`,
  getInvoiceDeleteEndpoint:  (id: string) => `${API_BASE_URL}/api/admin/invoices/${id}`,
  getInvoiceUpdateEndpoint:  (id: string) => `${API_BASE_URL}/api/admin/invoices/${id}`,
  getGalleryItemEndpoint:    (id: string) => `${API_BASE_URL}/api/admin/gallery/${id}`,
  getGalleryImageEndpoint:   (id: string) => `${API_BASE_URL}/api/admin/gallery/images/${id}`,
  getServiceEndpoint:        (id: string) => `${API_BASE_URL}/api/admin/services/${id}`,
};
