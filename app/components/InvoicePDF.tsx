'use client';
import React, { useRef } from 'react';
import { FaDownload, FaPrint, FaTimes } from 'react-icons/fa';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const InvoicePDF: React.FC<{ invoice: any; onClose: () => void }> = ({ invoice, onClose }) => {
  const pdfRef = useRef<HTMLDivElement>(null);

  const fmt = (n: number) => new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(n);
  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' });

  const handleDownload = async () => {
    if (!pdfRef.current) return;
    const html2pdf = (await import('html2pdf.js')).default;
    html2pdf().from(pdfRef.current).set({ margin: 0.5, filename: `${invoice.invoice_number}.pdf`, image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2 }, jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' } }).save();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[7px] w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col shadow-xl">
        <div className="flex justify-between items-center p-4 border-b border-border">
          <h2 className="font-bold text-text">{invoice.invoice_number}</h2>
          <div className="flex gap-2">
            <button onClick={handleDownload} className="flex items-center gap-2 px-3 py-2 bg-primary text-white rounded-[7px] text-sm hover:bg-primary-dark transition-colors"><FaDownload /><span>Download</span></button>
            <button onClick={() => window.print()} className="flex items-center gap-2 px-3 py-2 bg-charcoal text-white rounded-[7px] text-sm hover:bg-black transition-colors"><FaPrint /><span>Print</span></button>
            <button onClick={onClose} className="flex items-center gap-2 px-3 py-2 bg-gray-200 text-gray-700 rounded-[7px] text-sm hover:bg-gray-300 transition-colors"><FaTimes /><span>Close</span></button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <div ref={pdfRef} className="max-w-3xl mx-auto bg-white p-8">
            <div className="text-center border-b-2 border-gray-200 pb-6 mb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-primary font-black text-4xl">FJ</span>
                <span className="text-charcoal font-bold text-lg leading-tight">GENERAL &<br />ENGINEERING SERVICES</span>
              </div>
              <p className="text-sm text-text-muted">Civil · Landscaping · Engineering Solutions</p>
              <p className="text-sm text-text-muted mt-1">Tel: +27 00 000 0000 | info@fjengineering.co.za</p>
              <p className="text-sm text-text-muted">Serving Johannesburg, Ekurhuleni & Pretoria | CIDB Registered | OHS Compliant</p>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-6">
              <div>
                <h3 className="font-bold text-text mb-2">{invoice.document_type === 'quote' ? 'Quote To:' : 'Invoice To:'}</h3>
                <p className="font-semibold">{invoice.customer_name}</p>
                <p className="text-sm text-text-muted">{invoice.customer_phone}</p>
                {invoice.service_type && <p className="text-sm text-text-muted">Service: {invoice.service_type}</p>}
              </div>
              <div className="text-right">
                <h3 className="font-bold text-text mb-2">{invoice.document_type === 'quote' ? 'Quote Details:' : 'Invoice Details:'}</h3>
                <p className="text-sm"><strong>Number:</strong> {invoice.invoice_number}</p>
                <p className="text-sm"><strong>Date:</strong> {fmtDate(invoice.invoice_date)}</p>
                {invoice.document_type === 'invoice' && <p className="text-sm"><strong>Status:</strong> {invoice.status?.toUpperCase()}</p>}
              </div>
            </div>

            <table className="w-full border-collapse border border-gray-200 mb-6 text-sm">
              <thead><tr className="bg-gray-50"><th className="border border-gray-200 p-3 text-left">Description</th><th className="border border-gray-200 p-3 text-right">Amount</th></tr></thead>
              <tbody>
                {invoice.invoice_items?.length ? invoice.invoice_items.map((item: { service_type?: string; repair_type?: string; description: string; amount: number }, i: number) => (
                  <tr key={i}><td className="border border-gray-200 p-3"><div className="font-medium">{item.service_type || item.repair_type}</div>{item.description && <div className="text-text-muted text-xs">{item.description}</div>}</td><td className="border border-gray-200 p-3 text-right">{fmt(item.amount)}</td></tr>
                )) : (
                  <tr><td className="border border-gray-200 p-3">{invoice.service_type || 'Service'}</td><td className="border border-gray-200 p-3 text-right">{fmt(invoice.total_amount)}</td></tr>
                )}
              </tbody>
            </table>

            <div className="text-right mb-6"><p className="text-xl font-bold border-t-2 border-gray-200 pt-2">Total: {fmt(invoice.total_amount)}</p></div>

            <div className="bg-background-section rounded-[7px] p-4 mb-6">
              <h3 className="font-bold text-text mb-2">Banking Details</h3>
              <div className="text-sm text-text-secondary grid grid-cols-2 gap-1">
                <span className="font-medium">Bank:</span><span>FNB</span>
                <span className="font-medium">Account Name:</span><span>FJ General & Engineering Services</span>
                <span className="font-medium">Account Number:</span><span>XXXXXXXXXX</span>
                <span className="font-medium">Branch Code:</span><span>250655</span>
                <span className="font-medium">Reference:</span><span>{invoice.invoice_number}</span>
              </div>
            </div>

            <div className="text-center border-t-2 border-gray-200 pt-4">
              <p className="font-semibold text-text">Thank you for choosing FJ General & Engineering Services!</p>
              <p className="text-sm text-text-muted mt-1">© 2026 FJ General & Engineering Services. CIDB Registered. OHS Compliant.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePDF;
