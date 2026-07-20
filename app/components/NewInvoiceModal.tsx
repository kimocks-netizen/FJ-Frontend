'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../utils/api';
import type { Quote } from '../types';

const FJ_SERVICES = ['Tree Felling & Rubble Removal', 'Stump Removal & Grinding', 'Tar Resurfacing', 'Road Line Marking', 'Sports Court Marking', 'Pothole Filling & Speed Humps', 'Wendy Houses', 'Jacketed Pots & Boiler Making', 'Other'];

interface Invoice {
  id: string; invoice_number: string; customer_name: string; customer_phone: string;
  service_type: string; description?: string; invoice_date: string;
  total_amount: number; status: string; document_type: 'invoice' | 'quote';
  created_at: string; repair_items?: { repair_type: string; description: string; amount: string }[];
}

interface Props {
  quote?: Quote; isOpen: boolean; onClose: () => void; onDocumentCreated: () => void;
  setCurrentInvoice: (inv: Invoice) => void; setIsInvoicePDFOpen: (open: boolean) => void;
  editInvoice?: Invoice; isEditing?: boolean;
}

const NewInvoiceModal: React.FC<Props> = ({ quote, isOpen, onClose, onDocumentCreated, setCurrentInvoice, setIsInvoicePDFOpen, editInvoice, isEditing = false }) => {
  const [documentType, setDocumentType] = useState<'invoice' | 'quote'>(editInvoice?.document_type || 'invoice');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: editInvoice?.customer_name || quote?.name || '',
    customer_phone: editInvoice?.customer_phone || quote?.phone || '',
    service_type: editInvoice?.service_type || quote?.service_required || '',
    description: editInvoice?.description || quote?.message || '',
    invoice_date: editInvoice?.invoice_date || new Date().toISOString().split('T')[0],
  });
  const [repairItems, setRepairItems] = useState(() => {
    if (editInvoice?.repair_items?.length) return editInvoice.repair_items;
    return [{ repair_type: '', description: '', amount: '' }, { repair_type: 'Labour', description: 'Labour charge', amount: '' }];
  });

  useEffect(() => {
    if (editInvoice && isEditing) {
      setDocumentType(editInvoice.document_type);
      setFormData({ customer_name: editInvoice.customer_name, customer_phone: editInvoice.customer_phone, service_type: editInvoice.service_type, description: editInvoice.description || '', invoice_date: editInvoice.invoice_date });
      setRepairItems(editInvoice.repair_items?.length ? editInvoice.repair_items : [{ repair_type: '', description: '', amount: '' }, { repair_type: 'Labour', description: 'Labour charge', amount: '' }]);
    }
  }, [editInvoice, isEditing]);

  const calcTotal = () => repairItems.reduce((t, i) => t + (parseFloat(i.amount) || 0), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setIsLoading(true);
    try {
      const auth = JSON.parse(localStorage.getItem('auth') || '{}');
      const endpoint = isEditing ? API_ENDPOINTS.getInvoiceUpdateEndpoint(editInvoice?.id || '') : API_ENDPOINTS.ADMIN_INVOICES;
      const method = isEditing ? 'put' : 'post';
      const res = await axios[method](endpoint, { quote_id: quote?.id, ...formData, total_amount: calcTotal(), repair_items: repairItems, document_type: documentType }, { headers: { Authorization: `Bearer ${auth.token}` } });
      if (res.data.status === 'success') { setCurrentInvoice(res.data.data); setIsInvoicePDFOpen(true); onDocumentCreated(); onClose(); }
    } catch (err) { console.error(err); } finally { setIsLoading(false); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[7px] max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-text">Generate {documentType === 'quote' ? 'Quote' : 'Invoice'}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1">Document Type</label>
              <select value={documentType} onChange={e => setDocumentType(e.target.value as 'invoice' | 'quote')} className="w-full border border-border rounded-[7px] px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                <option value="invoice">Invoice</option>
                <option value="quote">Quote</option>
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[['customer_name', 'Customer Name', 'text'], ['customer_phone', 'Phone', 'tel']].map(([name, label, type]) => (
                <div key={name}>
                  <label className="block text-sm font-medium text-text mb-1">{label} *</label>
                  <input type={type} value={(formData as Record<string, string>)[name]} onChange={e => setFormData(p => ({ ...p, [name]: e.target.value }))} className="w-full border border-border rounded-[7px] px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" required />
                </div>
              ))}
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">Service Type</label>
              <select value={formData.service_type} onChange={e => setFormData(p => ({ ...p, service_type: e.target.value }))} className="w-full border border-border rounded-[7px] px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                <option value="">Select service...</option>
                {FJ_SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">Date *</label>
              <input type="date" value={formData.invoice_date} onChange={e => setFormData(p => ({ ...p, invoice_date: e.target.value }))} className="w-full border border-border rounded-[7px] px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" required />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-text">Line Items *</label>
                <button type="button" onClick={() => setRepairItems(p => { const n = [...p]; n.splice(n.length - 1, 0, { repair_type: '', description: '', amount: '' }); return n; })} className="text-primary text-sm hover:text-primary-dark">+ Add Item</button>
              </div>
              {repairItems.map((item, i) => {
                const isLabour = i === repairItems.length - 1;
                return (
                <div key={i} className="border border-border rounded-[7px] p-4 mb-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs text-text-muted mb-1 block">Type</label>
                      {isLabour ? (
                        <input value="Labour" disabled className="w-full border border-border rounded-[7px] px-2 py-1.5 text-sm bg-gray-50 text-text-muted" />
                      ) : (
                        <select value={item.repair_type} onChange={e => { const n = [...repairItems]; n[i] = { ...n[i], repair_type: e.target.value }; setRepairItems(n); }} className="w-full border border-border rounded-[7px] px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                          <option value="">Select...</option>
                          {FJ_SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      )}
                    </div>
                    <div>
                      <label className="text-xs text-text-muted mb-1 block">Description</label>
                      <input type="text" value={item.description} onChange={e => { const n = [...repairItems]; n[i] = { ...n[i], description: e.target.value }; setRepairItems(n); }} className="w-full border border-border rounded-[7px] px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    </div>
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <label className="text-xs text-text-muted mb-1 block">Amount (R)</label>
                        <input type="number" value={item.amount} onChange={e => { const n = [...repairItems]; n[i] = { ...n[i], amount: e.target.value }; setRepairItems(n); }} min="0" step="0.01" className="w-full border border-border rounded-[7px] px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" required />
                      </div>
                      {!isLabour && repairItems.length > 2 && (
                        <button type="button" onClick={() => setRepairItems(p => p.filter((_, idx) => idx !== i))} className="text-red-500 hover:text-red-700 pb-1">&times;</button>
                      )}
                    </div>
                  </div>
                </div>
                );
              })}
              <div className="text-right font-semibold text-text">Total: R {calcTotal().toFixed(2)}</div>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-[7px] hover:bg-gray-200 transition-colors">Cancel</button>
              <button type="submit" disabled={isLoading} className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-[7px] transition-colors disabled:opacity-50">
                {isLoading ? 'Saving...' : `Generate ${documentType === 'quote' ? 'Quote' : 'Invoice'}`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewInvoiceModal;
