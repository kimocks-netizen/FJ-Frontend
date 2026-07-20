'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';

const links = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About Us' },
  { href: '/services', label: 'Services' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/contact', label: 'Contact' },
  { href: '/admin', label: 'Admin' },
];

const NavItem = ({ href, label, onClick }: { href: string; label: string; onClick?: () => void }) => {
  const pathname = usePathname();
  const isActive = pathname === href;
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`group relative px-4 py-2 text-xs font-semibold tracking-widest uppercase transition-colors duration-200
        ${isActive ? 'text-accent' : 'text-white hover:text-white/70'}`}
    >
      {label}
      <span className={`absolute bottom-0 left-0 right-0 h-[2px] bg-accent transition-transform duration-200 origin-left
        ${isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} />
    </Link>
  );
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const mobileNavRef = useRef<HTMLDivElement>(null);

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
      <nav className="fixed top-0 left-0 w-full z-50 bg-[#0a0a0a] shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="flex items-center gap-3">
              <img src="/big-logo.png" alt="FJ Logo" className="h-10 w-auto" />
              <span className="hidden sm:block text-sm font-black uppercase leading-tight tracking-tight">
                <span className="text-primary">FJ General &amp; <span className="text-accent">Engineering</span></span><br />
                <span className="text-white">Services</span>
              </span>
            </Link>

            <div className="hidden md:flex items-center space-x-1">
              {links.map(l => <NavItem key={l.href} href={l.href} label={l.label} />)}
              <Link href="/contact" className="ml-4 flex items-center gap-1.5 bg-accent hover:bg-accent-dark text-white px-4 py-2 rounded-[7px] text-xs font-bold tracking-wide uppercase transition-colors duration-200 shadow-sm">
                <FaWhatsapp className="w-4 h-4" /> Get Quote
              </Link>
            </div>

            <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-white" aria-label="Toggle menu">
              {isOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>
      </nav>

      <div className="h-16" />

      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 z-40" onClick={() => setIsOpen(false)} />
          <div ref={mobileNavRef} className="fixed top-16 left-0 right-0 bg-black border-t border-primary/40 shadow-lg z-50">
            <div className="flex flex-col px-4 py-4 space-y-1">
              {links.map(l => <NavItem key={l.href} href={l.href} label={l.label} onClick={() => setIsOpen(false)} />)}
              <Link href="/contact" onClick={() => setIsOpen(false)} className="mt-2 flex items-center justify-center gap-1.5 bg-accent hover:bg-accent-dark text-white py-2 rounded-[7px] font-bold text-xs tracking-wide uppercase transition-colors duration-200">
                <FaWhatsapp className="w-4 h-4" /> Get Quote
              </Link>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Navbar;
