'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import AdminNavbar from '../../components/AdminNavbar';
import NewInvoiceModal from '../../components/NewInvoiceModal';
import InvoicePDF from '../../components/InvoicePDF';
import DeleteConfirmationModal from '../../components/DeleteConfirmationModal';
import ConversionConfirmationModal from '../../components/ConversionConfirmationModal';
import { FaEllipsisV, FaEye, FaEdit, FaExchangeAlt, FaWhatsapp, FaTrash } from 'react-icons/fa';
import { API_ENDPOINTS } from '../../utils/api';
import { getAdminToken } from '../../utils/auth';

interface Invoice {
  id: string; invoice_number: string; customer_name: string; customer_phone: string;
  service_type: string; description?: string; invoice_date: string;
  total_amount: number; status: string; document_type: 'invoice' | 'quote';
  created_at: string; repair_items?: { repair_type: string; description: string; amount: string }[];
}

export default function InvoiceManagement() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isPDFOpen, setIsPDFOpen] = useState(false);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isConversionModalOpen, setIsConversionModalOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<{ id: string; type: 'invoice' | 'quote'; name: string } | null>(null);
  const [conversionItem, setConversionItem] = useState<{ id: string; currentType: 'invoice' | 'quote'; documentNumber: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; right: number }>({ top: 0, right: 0 });
  const btnRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;
  const router = useRouter();

  const getToken = () => getAdminToken();

  useEffect(() => {
    const token = getToken();
    if (!token) { router.push('/admin'); return; }
    axios.get(API_ENDPOINTS.ADMIN_INVOICES, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setInvoices(res.data.data || []))
      .catch(console.error);
  }, [router]);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (dropdownOpen && !(e.target as Element).closest('.dropdown-container')) setDropdownOpen(null); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [dropdownOpen]);

  const fmt = (n: number) => new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(n);
  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-ZA');

  const handleStatusChange = async (id: string, status: string) => {
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status } : inv));
    try { await axios.put(API_ENDPOINTS.getInvoiceUpdateEndpoint(id), { status }, { headers: { Authorization: `Bearer ${getToken()}` } }); }
    catch { setInvoices(prev => [...prev]); }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteItem) return;
    setIsDeleting(true);
    try {
      setInvoices(prev => prev.filter(inv => inv.id !== deleteItem.id));
      await axios.delete(API_ENDPOINTS.getInvoiceDeleteEndpoint(deleteItem.id), { headers: { Authorization: `Bearer ${getToken()}` } });
      setIsDeleteModalOpen(false); setDeleteItem(null);
    } catch { window.location.reload(); } finally { setIsDeleting(false); }
  };

  const handleConvertConfirm = async () => {
    if (!conversionItem) return;
    setIsConverting(true);
    try {
      await axios.post(API_ENDPOINTS.getInvoiceConvertEndpoint(conversionItem.id), { newType: conversionItem.currentType === 'invoice' ? 'quote' : 'invoice' }, { headers: { Authorization: `Bearer ${getToken()}` } });
      window.location.reload();
    } catch { console.error('Conversion failed'); } finally { setIsConverting(false); setIsConversionModalOpen(false); setConversionItem(null); }
  };

  const totalPages = Math.ceil(invoices.length / perPage);
  const paginated = invoices.slice((currentPage - 1) * perPage, currentPage * perPage);

  return (
    <div className="min-h-screen bg-background-section">
      <AdminNavbar />
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-primary px-6 py-4 text-white rounded-t-[7px] flex justify-between items-center">
          <h1 className="text-xl font-bold">INVOICE & QUOTE MANAGEMENT</h1>
          <button onClick={() => setIsNewModalOpen(true)} className="bg-accent hover:bg-accent-dark text-white px-4 py-2 rounded-[7px] text-sm font-semibold transition-colors">New Document</button>
        </div>

        <div className="bg-white shadow rounded-b-[7px] overflow-hidden border border-border border-t-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-background-section">
                <tr>
                  {['Doc #', 'Type', 'Customer', 'Service', 'Date', 'Total', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginated.map(inv => (
                  <tr key={inv.id} className="hover:bg-background-section transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-text">{inv.invoice_number}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${inv.document_type === 'quote' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                        {inv.document_type === 'quote' ? 'Quote' : 'Invoice'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm"><div className="font-medium text-text">{inv.customer_name}</div><div className="text-text-muted text-xs">{inv.customer_phone}</div></td>
                    <td className="px-4 py-3 text-sm text-text-secondary max-w-[120px] truncate">{inv.service_type}</td>
                    <td className="px-4 py-3 text-sm text-text-secondary">{fmtDate(inv.invoice_date)}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-text">{fmt(inv.total_amount)}</td>
                    <td className="px-4 py-3">
                      {inv.document_type === 'invoice' ? (
                        <select value={inv.status} onChange={e => handleStatusChange(inv.id, e.target.value)} className={`px-2 py-1 rounded-lg text-xs font-semibold cursor-pointer ${inv.status === 'paid' ? 'bg-green-100 text-green-800' : inv.status === 'sent' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          <option value="draft">Draft</option>
                          <option value="sent">Sent</option>
                          <option value="paid">Paid</option>
                        </select>
                      ) : <span className="text-text-muted text-xs">N/A</span>}
                    </td>
                    <td className="px-4 py-3 dropdown-container">
                      <button
                        ref={el => { btnRefs.current[inv.id] = el; }}
                        onClick={() => {
                          if (dropdownOpen === inv.id) { setDropdownOpen(null); return; }
                          const rect = btnRefs.current[inv.id]?.getBoundingClientRect();
                          if (rect) setDropdownPos({ top: rect.bottom + window.scrollY + 4, right: window.innerWidth - rect.right });
                          setDropdownOpen(inv.id);
                        }}
                        className="text-gray-400 hover:text-gray-600 p-1 rounded">
                        <FaEllipsisV />
                      </button>
                    </td>
                  </tr>
                ))}
                {paginated.length === 0 && <tr><td colSpan={8} className="text-center py-8 text-text-muted">No documents found.</td></tr>}
              </tbody>
            </table>
          </div>
          <div className="flex justify-between items-center px-4 py-3 border-t border-border bg-background-section text-sm text-text-muted">
            <span>Page {currentPage} of {totalPages || 1}</span>
            <div className="space-x-2">
              <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="px-3 py-1.5 border border-border rounded-[7px] bg-white hover:bg-gray-50 disabled:opacity-50">Previous</button>
              <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="px-3 py-1.5 border border-border rounded-[7px] bg-white hover:bg-gray-50 disabled:opacity-50">Next</button>
            </div>
          </div>
        </div>
      </div>

      {isNewModalOpen && <NewInvoiceModal isOpen={isNewModalOpen} onClose={() => setIsNewModalOpen(false)} onDocumentCreated={() => { setIsNewModalOpen(false); window.location.reload(); }} setCurrentInvoice={setSelectedInvoice as (inv: unknown) => void} setIsInvoicePDFOpen={setIsPDFOpen} />}
      {isEditModalOpen && editingInvoice && <NewInvoiceModal isOpen={isEditModalOpen} editInvoice={editingInvoice} isEditing onClose={() => { setIsEditModalOpen(false); setEditingInvoice(null); }} onDocumentCreated={() => { setIsEditModalOpen(false); window.location.reload(); }} setCurrentInvoice={setSelectedInvoice as (inv: unknown) => void} setIsInvoicePDFOpen={setIsPDFOpen} />}
      {selectedInvoice && isPDFOpen && <InvoicePDF invoice={selectedInvoice} onClose={() => { setIsPDFOpen(false); setSelectedInvoice(null); }} />}
      {isDeleteModalOpen && deleteItem && <DeleteConfirmationModal isOpen={isDeleteModalOpen} onClose={() => { setIsDeleteModalOpen(false); setDeleteItem(null); }} onConfirm={handleDeleteConfirm} title="Delete Document" message={`Are you sure you want to delete this ${deleteItem.type}?`} itemName={deleteItem.name} isLoading={isDeleting} />}
      {isConversionModalOpen && conversionItem && <ConversionConfirmationModal isOpen={isConversionModalOpen} onClose={() => { setIsConversionModalOpen(false); setConversionItem(null); }} onConfirm={handleConvertConfirm} currentType={conversionItem.currentType} documentNumber={conversionItem.documentNumber} isLoading={isConverting} />}

      {/* Fixed dropdown portal — never clipped by overflow-hidden */}
      {dropdownOpen && (() => { const inv = invoices.find(i => i.id === dropdownOpen); if (!inv) return null; return (
        <div className="fixed z-[9999] w-48 bg-white rounded-[7px] shadow-xl border border-border py-1" style={{ top: dropdownPos.top, right: dropdownPos.right }}>
          {[
            { icon: <FaEye />, label: 'View PDF', action: () => { setSelectedInvoice(inv); setDropdownOpen(null); setTimeout(() => setIsPDFOpen(true), 0); } },
            { icon: <FaEdit />, label: 'Edit', action: () => { setEditingInvoice(inv); setIsEditModalOpen(true); setDropdownOpen(null); } },
            { icon: <FaExchangeAlt />, label: `Convert to ${inv.document_type === 'invoice' ? 'Quote' : 'Invoice'}`, action: () => { setConversionItem({ id: inv.id, currentType: inv.document_type, documentNumber: inv.invoice_number }); setIsConversionModalOpen(true); setDropdownOpen(null); } },
            { icon: <FaWhatsapp />, label: 'WhatsApp', action: () => { window.open(`https://wa.me/${inv.customer_phone}`, '_blank'); setDropdownOpen(null); } },
          ].map(item => (
            <button key={item.label} onClick={item.action} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-text hover:bg-background-section transition-colors">
              {item.icon}{item.label}
            </button>
          ))}
          <button onClick={() => { setDeleteItem({ id: inv.id, type: inv.document_type, name: `${inv.document_type === 'invoice' ? 'Invoice' : 'Quote'} ${inv.invoice_number}` }); setIsDeleteModalOpen(true); setDropdownOpen(null); }} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
            <FaTrash /> Delete
          </button>
        </div>
      ); })()}
    </div>
  );
}
