'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, Bell } from 'lucide-react';
import { useToast } from './ToastContext';
import { clearAdminAuth } from '../utils/auth';

const adminLinks = [
  { href: '/admin/dashboard', label: 'Dashboard' },
  { href: '/admin/quotes', label: 'Quotes' },
  { href: '/admin/invoices', label: 'Invoices' },
  { href: '/admin/gallery-edit', label: 'Gallery' },
  { href: '/admin/services-edit', label: 'Services' },
];

const AdminNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const mobileNavRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { showToast } = useToast();

  const handleLogout = () => {
    clearAdminAuth();
    showToast('Logged out successfully', 'success');
    router.push('/');
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (mobileNavRef.current && !mobileNavRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'auto';
    return () => { document.body.style.overflow = 'auto'; };
  }, [isOpen]);

  return (
    <>
      <nav className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/admin/dashboard" className="flex items-center gap-2">
              <img src="/big-logo.png" alt="FJ Logo" className="h-8 w-auto" />
              <span className="text-charcoal font-semibold text-sm tracking-widest">ADMIN</span>
            </Link>

            <div className="hidden md:flex items-center space-x-1">
              {adminLinks.map(l => (
                <Link key={l.href} href={l.href} className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${pathname === l.href ? 'text-primary font-semibold bg-background-section' : 'text-gray-700 hover:text-primary'}`}>
                  {l.label}
                </Link>
              ))}
              <button className="relative p-2 rounded-full hover:bg-gray-100 transition ml-2">
                <Bell className="h-5 w-5 text-gray-600" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-accent rounded-full" />
              </button>
              <button onClick={handleLogout} className="ml-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-[7px] text-sm font-semibold transition-colors duration-200">
                Logout
              </button>
            </div>

            <div className="md:hidden flex items-center space-x-3">
              <button className="relative p-2 rounded-full hover:bg-gray-100 transition">
                <Bell className="h-5 w-5 text-gray-600" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-accent rounded-full" />
              </button>
              <button onClick={() => setIsOpen(!isOpen)} className="text-charcoal" aria-label="Toggle menu">
                {isOpen ? <X size={26} /> : <Menu size={26} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="h-16" />

      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setIsOpen(false)} />
          <div ref={mobileNavRef} className="fixed top-16 left-0 right-0 bg-white border-t border-border shadow-lg z-50">
            <div className="flex flex-col px-4 py-4 space-y-1">
              {adminLinks.map(l => (
                <Link key={l.href} href={l.href} onClick={() => setIsOpen(false)} className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${pathname === l.href ? 'text-primary font-semibold bg-background-section' : 'text-gray-700 hover:text-primary'}`}>
                  {l.label}
                </Link>
              ))}
              <button onClick={() => { handleLogout(); setIsOpen(false); }} className="mt-2 bg-primary hover:bg-primary-dark text-white py-2 rounded-[7px] font-semibold transition-colors duration-200">
                Logout
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default AdminNavbar;
