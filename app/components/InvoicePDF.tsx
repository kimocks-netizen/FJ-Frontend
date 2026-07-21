'use client';
import React, { useRef } from 'react';
import { FaDownload, FaPrint, FaTimes } from 'react-icons/fa';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PDFBody = ({ invoice, fmt, fmtDate }: { invoice: any; fmt: (n: number) => string; fmtDate: (d: string) => string }) => (
  <div style={{maxWidth:'720px',background:'#fff',padding:'32px',fontFamily:'Arial,sans-serif',color:'#1a1a1a',textDecoration:'none'}}>
    <div style={{textAlign:'center',borderBottom:'2px solid #e5e7eb',paddingBottom:'24px',marginBottom:'24px'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'12px',marginBottom:'8px'}}>
        <img src="/big-logo.png" alt="FJ Logo" style={{height:'56px',width:'auto'}} />
        <div style={{textAlign:'left',lineHeight:'1.2'}}>
          <div style={{fontWeight:900,fontSize:'20px',textTransform:'uppercase'}}>
            <span style={{color:'#5d9f0d'}}>FJ General &amp; </span><span style={{color:'#ff5a00'}}>Engineering</span>
          </div>
          <div style={{fontWeight:900,fontSize:'20px',textTransform:'uppercase',color:'#374151',textAlign:'center'}}>Services</div>
        </div>
      </div>
      <p style={{fontSize:'13px',color:'#6b7280',margin:'4px 0'}}>Civil · Landscaping · Engineering Solutions</p>
      <p style={{fontSize:'13px',color:'#6b7280',margin:'4px 0'}}>Tel: <a href="tel:+27737869066" style={{color:'#2563eb',textDecoration:'none'}}>+27 73 786 9066</a> | <a href="mailto:vurayiephraim@gmail.com" style={{color:'#2563eb',textDecoration:'none'}}>vurayiephraim@gmail.com</a></p>
      <a href="https://maps.app.goo.gl/eV64EgxKA3MNZCs96" target="_blank" rel="noopener noreferrer" style={{fontSize:'13px',color:'#2563eb',margin:'4px 0',textDecoration:'none',display:'block'}}>Bornite Industries, 22 Meyer Street, Germiston, 1400 | CIDB Registered | OHS Compliant</a>
    </div>

    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'32px',marginBottom:'24px'}}>
      <div>
        <h3 style={{fontWeight:700,marginBottom:'8px'}}>{invoice.document_type === 'quote' ? 'Quote To:' : 'Invoice To:'}</h3>
        <p style={{fontWeight:600,margin:'2px 0'}}>{invoice.customer_name}</p>
        <p style={{fontSize:'13px',color:'#6b7280',margin:'2px 0'}}>{invoice.customer_phone}</p>
        {invoice.service_type && <p style={{fontSize:'13px',color:'#6b7280',margin:'2px 0'}}>Service: {invoice.service_type}</p>}
      </div>
      <div style={{textAlign:'right'}}>
        <h3 style={{fontWeight:700,marginBottom:'8px'}}>{invoice.document_type === 'quote' ? 'Quote Details:' : 'Invoice Details:'}</h3>
        <p style={{fontSize:'13px',margin:'2px 0'}}><strong>Number:</strong> {invoice.invoice_number}</p>
        <p style={{fontSize:'13px',margin:'2px 0'}}><strong>Date:</strong> {fmtDate(invoice.invoice_date)}</p>
        {invoice.document_type === 'invoice' && <p style={{fontSize:'13px',margin:'2px 0'}}><strong>Status:</strong> {invoice.status?.toUpperCase()}</p>}
      </div>
    </div>

    <table style={{width:'100%',borderCollapse:'collapse',marginBottom:'24px',fontSize:'13px'}}>
      <thead>
        <tr style={{background:'#f9fafb'}}>
          <th style={{border:'1px solid #e5e7eb',padding:'10px 12px',textAlign:'left'}}>Description</th>
          <th style={{border:'1px solid #e5e7eb',padding:'10px 12px',textAlign:'right'}}>Amount</th>
        </tr>
      </thead>
      <tbody>
        {invoice.invoice_items?.length ? invoice.invoice_items.map((item: {service_type?:string;repair_type?:string;description:string;amount:number}, i: number) => (
          <tr key={i}>
            <td style={{border:'1px solid #e5e7eb',padding:'10px 12px'}}>
              <div style={{fontWeight:600}}>{item.service_type || item.repair_type}</div>
              {item.description && <div style={{fontSize:'12px',color:'#6b7280'}}>{item.description}</div>}
            </td>
            <td style={{border:'1px solid #e5e7eb',padding:'10px 12px',textAlign:'right'}}>{fmt(item.amount)}</td>
          </tr>
        )) : (
          <tr>
            <td style={{border:'1px solid #e5e7eb',padding:'10px 12px'}}>{invoice.service_type || 'Service'}</td>
            <td style={{border:'1px solid #e5e7eb',padding:'10px 12px',textAlign:'right'}}>{fmt(invoice.total_amount)}</td>
          </tr>
        )}
      </tbody>
    </table>

    <div style={{textAlign:'right',marginBottom:'24px'}}>
      <p style={{fontSize:'18px',fontWeight:700,borderTop:'2px solid #e5e7eb',paddingTop:'8px',display:'inline-block'}}>Total: {fmt(invoice.total_amount)}</p>
    </div>

    <div style={{background:'#f9fafb',borderRadius:'7px',padding:'16px',marginBottom:'24px'}}>
      <h3 style={{fontWeight:700,marginBottom:'8px'}}>Banking Details</h3>
      <table style={{width:'100%',fontSize:'13px',borderCollapse:'collapse'}}>
        <tbody>
          {[['Bank','FNB'],['Account Name','FJ Engineering Services & Projects'],['Account Number','63146166615'],['Branch Code','250655'],['Reference',invoice.invoice_number]].map(([k,v]) => (
            <tr key={k}>
              <td style={{padding:'2px 8px 2px 0',fontWeight:600,width:'40%'}}>{k}:</td>
              <td style={{padding:'2px 0',color:'#374151'}}>{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <div style={{textAlign:'center',borderTop:'2px solid #e5e7eb',paddingTop:'16px'}}>
      <p style={{fontWeight:600,margin:'0 0 4px'}}>Thank you for choosing FJ General & Engineering Services!</p>
      <p style={{fontSize:'12px',color:'#6b7280',margin:0}}>© 2026 FJ General & Engineering Services. CIDB Registered. OHS Compliant.</p>
    </div>
  </div>
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const InvoicePDF: React.FC<{ invoice: any; onClose: () => void; autoDownload?: boolean }> = ({ invoice, onClose, autoDownload = false }) => {
  const pdfRef = useRef<HTMLDivElement>(null);

  const fmt = (n: number) => new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(n);
  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' });

  const handleDownload = React.useCallback(async () => {
    if (!pdfRef.current) return;
    const html2pdf = (await import('html2pdf.js')).default;
    await html2pdf().from(pdfRef.current).set({ margin: 0.5, filename: `${invoice.invoice_number}.pdf`, image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2, useCORS: true }, jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' } }).save();
    if (autoDownload) onClose();
  }, [invoice.invoice_number, autoDownload, onClose]);

  React.useEffect(() => {
    if (autoDownload) { const t = setTimeout(handleDownload, 400); return () => clearTimeout(t); }
  }, [autoDownload, handleDownload]);

  // Off-screen render for silent download
  if (autoDownload) return (
    <div style={{position:'fixed',left:'-9999px',top:0,width:'720px',pointerEvents:'none'}}>
      <div ref={pdfRef}><PDFBody invoice={invoice} fmt={fmt} fmtDate={fmtDate} /></div>
    </div>
  );

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
          <div ref={pdfRef}><PDFBody invoice={invoice} fmt={fmt} fmtDate={fmtDate} /></div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePDF;
