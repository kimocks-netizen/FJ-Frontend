'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import AdminNavbar from '../../components/AdminNavbar';
import NewInvoiceModal from '../../components/NewInvoiceModal';
import InvoicePDF from '../../components/InvoicePDF';
import { API_ENDPOINTS } from '../../utils/api';
import { getAdminToken } from '../../utils/auth';
import type { Quote } from '../../types';

type QuoteStatus = 'Pending' | 'Contacted' | 'Completed';
type FilterStatus = QuoteStatus | 'All';

const statusColors: Record<QuoteStatus, string> = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Contacted: 'bg-blue-100 text-blue-800',
  Completed: 'bg-green-100 text-green-800',
};

export default function AdminQuotes() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('All');
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isPDFOpen, setIsPDFOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [currentInvoice, setCurrentInvoice] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;
  const router = useRouter();

  useEffect(() => {
    const token = getAdminToken();
    if (!token) { router.push('/admin'); return; }
    axios.get(API_ENDPOINTS.ADMIN_QUOTES, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => { if (res.data.status === 'success') setQuotes(res.data.data.map((q: Quote) => ({ ...q, status: (q.status.charAt(0).toUpperCase() + q.status.slice(1)) as QuoteStatus }))); })
      .catch(() => router.push('/admin'));
  }, [router]);

  const handleStatusChange = async (id: string, status: QuoteStatus) => {
    setQuotes(prev => prev.map(q => q.id === id ? { ...q, status } : q));
    try {
      const token = getAdminToken();
      await axios.put(API_ENDPOINTS.getQuoteStatusEndpoint(id), { status }, { headers: { Authorization: `Bearer ${token}` } });
    } catch { setQuotes(prev => prev.map(q => q.id === id ? { ...q } : q)); }
  };

  const filtered = quotes.filter(q => filterStatus === 'All' || q.status === filterStatus);
  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  return (
    <div className="min-h-screen bg-background-section">
      <AdminNavbar />
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-primary px-6 py-4 text-white rounded-t-[7px] flex justify-between items-center">
          <h1 className="text-xl font-bold">QUOTE REQUESTS</h1>
          <div className="flex items-center gap-3">
            <label className="text-sm text-white/80">Filter:</label>
            <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value as FilterStatus); setCurrentPage(1); }} className="border border-white/30 bg-white/10 text-white rounded-[7px] px-3 py-1.5 text-sm focus:outline-none">
              {['All', 'Pending', 'Contacted', 'Completed'].map(s => <option key={s} value={s} className="text-text">{s}</option>)}
            </select>
          </div>
        </div>

        <div className="bg-white shadow rounded-b-[7px] overflow-hidden border border-border border-t-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-background-section">
                <tr>
                  {['Name', 'Phone', 'Service', 'Location', 'Status', 'Images', 'Invoice', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginated.map(q => (
                  <tr key={q.id} className="hover:bg-background-section transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-text">{q.name}</td>
                    <td className="px-4 py-3 text-sm"><a href={`tel:${q.phone}`} className="text-primary hover:underline">{q.phone}</a></td>
                    <td className="px-4 py-3 text-sm text-text-secondary max-w-[140px] truncate">{q.service_required}</td>
                    <td className="px-4 py-3 text-sm text-text-secondary">{q.location}</td>
                    <td className="px-4 py-3">
                      <select value={q.status} onChange={e => handleStatusChange(q.id, e.target.value as QuoteStatus)} className={`px-2 py-1 rounded-[7px] text-xs font-semibold cursor-pointer ${statusColors[q.status]}`}>
                        <option value="Pending">Pending</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <button onClick={() => { setSelectedQuote(q); setIsImageModalOpen(true); }} className="text-primary hover:underline text-sm">
                        View ({q.images?.length || 0})
                      </button>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <button onClick={() => { setSelectedQuote(q); setIsInvoiceModalOpen(true); }} className="text-primary hover:underline text-sm">Generate</button>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <a href={`https://wa.me/${q.phone}`} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-800 font-medium">WhatsApp</a>
                    </td>
                  </tr>
                ))}
                {paginated.length === 0 && (
                  <tr><td colSpan={8} className="text-center py-8 text-text-muted">No quotes found.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center px-4 py-3 border-t border-border bg-background-section text-sm text-text-muted">
            <span>Page {currentPage} of {totalPages || 1}</span>
            <div className="space-x-2">
              <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="px-3 py-1.5 border border-border rounded-[7px] bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors">Previous</button>
              <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="px-3 py-1.5 border border-border rounded-[7px] bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors">Next</button>
            </div>
          </div>
        </div>
      </div>

      {isImageModalOpen && selectedQuote && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[7px] max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-start mb-4">
              <div><h3 className="text-xl font-bold text-text">{selectedQuote.name}</h3><p className="text-text-muted text-sm">{selectedQuote.service_required} · {selectedQuote.location}</p></div>
              <button onClick={() => setIsImageModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            {selectedQuote.message && <p className="text-text-secondary text-sm mb-4 bg-background-section rounded-[7px] p-3">{selectedQuote.message}</p>}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {selectedQuote.images?.length ? selectedQuote.images.map((img, i) => (
                <div key={i} className="relative group">
                  <img src={img} alt={`Image ${i + 1}`} className="w-full h-36 object-cover rounded-[7px] border border-border" />
                  <button onClick={() => window.open(img, '_blank')} className="absolute inset-0 bg-black/0 group-hover:bg-black/30 rounded-[7px] transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <span className="text-white text-xs font-semibold">View</span>
                  </button>
                </div>
              )) : <p className="text-text-muted col-span-3 text-center py-4">No images uploaded.</p>}
            </div>
          </div>
        </div>
      )}

      {isInvoiceModalOpen && selectedQuote && (
        <NewInvoiceModal quote={selectedQuote} isOpen={isInvoiceModalOpen} onClose={() => setIsInvoiceModalOpen(false)} onDocumentCreated={() => setIsInvoiceModalOpen(false)} setCurrentInvoice={setCurrentInvoice} setIsInvoicePDFOpen={setIsPDFOpen} />
      )}
      {isPDFOpen && currentInvoice && <InvoicePDF invoice={currentInvoice} onClose={() => setIsPDFOpen(false)} />}
    </div>
  );
}
