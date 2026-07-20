'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminNavbar from '../../components/AdminNavbar';
import { getAdminToken } from '../../utils/auth';
import { FileText, Image, Wrench, MessageSquare } from 'lucide-react';

const sections = [
  {
    href: '/admin/quotes',
    icon: <MessageSquare className="w-8 h-8" />,
    label: 'Quote Requests',
    desc: 'View and manage incoming quote requests from customers.',
    color: 'bg-primary',
  },
  {
    href: '/admin/invoices',
    icon: <FileText className="w-8 h-8" />,
    label: 'Invoices & Quotes',
    desc: 'Create, edit and manage invoices and quote documents.',
    color: 'bg-accent',
  },
  {
    href: '/admin/gallery-edit',
    icon: <Image className="w-8 h-8" />,
    label: 'Gallery',
    desc: 'Upload and manage project gallery images.',
    color: 'bg-primary',
  },
  {
    href: '/admin/services-edit',
    icon: <Wrench className="w-8 h-8" />,
    label: 'Services',
    desc: 'Add, edit or remove services shown on the website.',
    color: 'bg-accent',
  },
];

export default function AdminDashboard() {
  const router = useRouter();

  useEffect(() => {
    if (!getAdminToken()) router.push('/admin');
  }, [router]);

  return (
    <div className="min-h-screen bg-background-section">
      <AdminNavbar />

      <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6">
        {/* Welcome */}
        <div className="mb-10">
          <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-1">Admin Portal</p>
          <h1 className="text-4xl font-black text-text">Welcome back, <span className="text-primary">Admin</span></h1>
          <p className="text-text-secondary mt-2 text-sm">Select a section below to get started.</p>
        </div>

        {/* Accent stripe */}
        <div className="h-1 w-full rounded-full mb-10" style={{background:'linear-gradient(90deg,#5d9f0d 0%,#ff5a00 100%)'}} />

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {sections.map(s => (
            <Link key={s.href} href={s.href} className="group bg-white border border-border rounded-[7px] p-6 shadow-sm hover:shadow-md transition-all duration-200 flex items-start gap-5">
              <div className={`${s.color} text-white rounded-[7px] p-3 flex-shrink-0 group-hover:scale-105 transition-transform duration-200`}>
                {s.icon}
              </div>
              <div>
                <h2 className="font-bold text-text text-lg mb-1">{s.label}</h2>
                <p className="text-text-secondary text-sm">{s.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
