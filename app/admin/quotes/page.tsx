'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import AdminNavbar from '../../components/AdminNavbar';
import NewInvoiceModal from '../../components/NewInvoiceModal';
import InvoicePDF from '../../components/InvoicePDF';
import DeleteConfirmationModal from '../../components/DeleteConfirmationModal';
import { FaFilter, FaTrash } from 'react-icons/fa';
import { API_ENDPOINTS } from '../../utils/api';
import { getAdminToken } from '../../utils/auth';
import type { Quote } from '../../types';

type QuoteStatus = 'Pending' | 'Contacted' | 'Completed';

const statusColors: Record<QuoteStatus, string> = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Contacted: 'bg-blue-100 text-blue-800',
  Completed: 'bg-green-100 text-green-800',
};

const Spinner = () => (
  <tr><td colSpan={8}>
    <div className="flex justify-center items-center py-12">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  </td></tr>
);

export default function AdminQuotes() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 20;

  const [showFilters, setShowFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');

  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isPDFOpen, setIsPDFOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [currentInvoice, setCurrentInvoice] = useState<any>(null);
  const [deleteQuote, setDeleteQuote] = useState<Quote | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const fetchQuotes = useCallback(async (page: number) => {
    const token = getAdminToken();
    if (!token) { router.push('/admin'); return; }
    setIsLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), limit: String(perPage) };
      if (filterStatus) params.status = filterStatus;
      if (appliedSearch) params.search = appliedSearch;
      const res = await axios.get(API_ENDPOINTS.ADMIN_QUOTES, { headers: { Authorization: `Bearer ${token}` }, params });
      if (res.data.status === 'success') {
        setQuotes(res.data.data.map((q: Quote) => ({ ...q, status: (q.status.charAt(0).toUpperCase() + q.status.slice(1)) as QuoteStatus })));
        setTotal(res.data.total || 0);
      }
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  }, [filterStatus, appliedSearch, router]);

  useEffect(() => { fetchQuotes(currentPage); }, [currentPage, fetchQuotes]);

  const applyFilters = () => { setAppliedSearch(search); setCurrentPage(1); };
  const clearFilters = () => { setFilterStatus(''); setSearch(''); setAppliedSearch(''); setCurrentPage(1); };
  const hasActiveFilters = filterStatus || appliedSearch;
  const totalPages = Math.ceil(total / perPage);

  const handleStatusChange = async (id: string, status: QuoteStatus) => {
    setQuotes(prev => prev.map(q => q.id === id ? { ...q, status } : q));
    try {
      await axios.put(API_ENDPOINTS.getQuoteStatusEndpoint(id), { status }, { headers: { Authorization: `Bearer ${getAdminToken()}` } });
    } catch { fetchQuotes(currentPage); }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteQuote) return;
    setIsDeleting(true);
    try {
      await axios.delete(API_ENDPOINTS.getQuoteDeleteEndpoint(deleteQuote.id), { headers: { Authorization: `Bearer ${getAdminToken()}` } });
      setDeleteQuote(null);
      fetchQuotes(currentPage);
    } catch { console.error('Delete failed'); } finally { setIsDeleting(false); }
  };

  return (
    <div className="min-h-screen bg-background-section">
      <AdminNavbar />
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="bg-primary px-6 py-4 text-white rounded-t-[7px]">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold">QUOTE REQUESTS</h1>
            <button onClick={() => setShowFilters(p => !p)} className={`flex items-center gap-2 px-3 py-2 rounded-[7px] text-sm font-semibold transition-colors ${hasActiveFilters ? 'bg-accent text-white' : 'bg-white/10 hover:bg-white/20 text-white'}`}>
              <FaFilter /> Filters {hasActiveFilters ? '●' : ''}
            </button>
          </div>

          {showFilters && (
            <div className="mt-3 pt-3 border-t border-white/20 flex flex-wrap gap-2">
              <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && applyFilters()} placeholder="Search name or phone..." className="border border-white/30 bg-white/10 text-white placeholder-white/50 rounded-[7px] px-3 py-1.5 text-sm focus:outline-none flex-1 min-w-[160px]" />
              <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setCurrentPage(1); }} className="border border-white/30 bg-white/10 text-white rounded-[7px] px-3 py-1.5 text-sm focus:outline-none">
                <option value="" className="text-text">All Statuses</option>
                <option value="Pending" className="text-text">Pending</option>
                <option value="Contacted" className="text-text">Contacted</option>
                <option value="Completed" className="text-text">Completed</option>
              </select>
              <button onClick={applyFilters} className="bg-white text-primary px-3 py-1.5 rounded-[7px] text-sm font-semibold hover:bg-white/90 transition-colors">Apply</button>
              {hasActiveFilters && <button onClick={clearFilters} className="bg-white/10 text-white px-3 py-1.5 rounded-[7px] text-sm hover:bg-white/20 transition-colors">Clear</button>}
            </div>
          )}
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
                {isLoading ? <Spinner /> : quotes.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-8 text-text-muted">No quotes found.</td></tr>
                ) : quotes.map(q => (
                  <tr key={q.id} className="hover:bg-background-section transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-text">{q.name}</td>
                    <td className="px-4 py-3 text-sm"><a href={`tel:${q.phone}`} className="text-primary hover:underline">{q.phone}</a></td>
                    <td className="px-4 py-3 text-sm text-text-secondary max-w-[140px] truncate">{q.service_required}</td>
                    <td className="px-4 py-3 text-sm text-text-secondary">{q.location}</td>
                    <td className="px-4 py-3">
                      <select value={q.status} onChange={e => handleStatusChange(q.id, e.target.value as QuoteStatus)} className={`px-2 py-1 rounded-[7px] text-xs font-semibold cursor-pointer ${statusColors[q.status as QuoteStatus] || 'bg-gray-100 text-gray-800'}`}>
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
                      <div className="flex items-center gap-3">
                        <a href={`https://wa.me/${q.phone}`} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-800 font-medium">WhatsApp</a>
                        <button onClick={() => setDeleteQuote(q)} className="text-red-500 hover:text-red-700 transition-colors"><FaTrash /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center px-4 py-3 border-t border-border bg-background-section text-sm text-text-muted">
            <span>{total} result{total !== 1 ? 's' : ''} · Page {currentPage} of {totalPages || 1}</span>
            <div className="flex gap-2">
              <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="px-3 py-1.5 border border-border rounded-[7px] bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors">Previous</button>
              <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage >= totalPages} className="px-3 py-1.5 border border-border rounded-[7px] bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors">Next</button>
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
      {deleteQuote && <DeleteConfirmationModal isOpen={!!deleteQuote} onClose={() => setDeleteQuote(null)} onConfirm={handleDeleteConfirm} title="Delete Quote" message="Are you sure you want to delete this quote request?" itemName={deleteQuote.name} isLoading={isDeleting} />}
    </div>
  );
}
