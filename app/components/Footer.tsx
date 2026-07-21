import Link from 'next/link';
import { FaFacebookF, FaWhatsapp, FaInstagram } from 'react-icons/fa';
import { Phone, Mail, MapPin } from 'lucide-react';

const col1 = ['Tree Felling & Rubble Removal', 'Stump Removal & Grinding', 'Tar Resurfacing', 'Road Line Marking'];
const col2 = ['Sports Court Marking', 'Pothole Filling', 'Wendy Houses', 'Jacketed Pots & Boiler Making'];

const Footer = () => (
  <footer style={{ background: '#0d1f0a' }} className="text-white">
    {/* Main grid */}
    <div className="max-w-[1120px] mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">

      {/* Brand */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <img src="/big-logo.png" alt="FJ Logo" className="h-11 w-auto" />
          <div className="text-xs font-black uppercase leading-tight tracking-tight">
            <div><span className="text-primary">FJ General &amp; </span><span className="text-accent">Engineering</span></div>
            <div className="text-white">Services</div>
          </div>
        </div>
        <p className="text-white/50 text-xs leading-relaxed mb-2">
          Trusted civil, landscaping and engineering solutions across Gauteng. CIDB Registered · OHS Compliant.
        </p>
        <p className="text-white/40 text-[11px] leading-relaxed mb-4">
          Registered as FJ Engineering<br />
          Reg No: 2026/265021/07
        </p>
        <div className="flex gap-2 mb-3">
          {[
            { href: 'https://wa.me/27737869066', icon: <FaWhatsapp className="w-4 h-4" /> },
            { href: 'https://facebook.com',      icon: <FaFacebookF className="w-3.5 h-3.5" /> },
            { href: 'https://instagram.com',     icon: <FaInstagram className="w-4 h-4" /> },
          ].map(({ href, icon }) => (
            <a key={href} href={href} target="_blank" rel="noopener noreferrer"
              className="w-8 h-8 bg-white/10 hover:bg-accent flex items-center justify-center transition-colors duration-200">
              {icon}
            </a>
          ))}
        </div>
        <a href="https://maps.app.goo.gl/eV64EgxKA3MNZCs96" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-white/70 text-[11px] hover:text-white transition-colors">
          <MapPin className="w-3 h-3 text-accent shrink-0" /> Bornite Industries, 22 Meyer Street, Germiston, 1400
        </a>
      </div>

      {/* Services col 1 */}
      <div>
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-primary mb-4">Services</h3>
        <ul className="space-y-2">
          {col1.map(s => (
            <li key={s}>
              <Link href="/services" className="text-white/60 hover:text-white text-xs transition-colors duration-150">{s}</Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Services col 2 */}
      <div>
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-primary mb-4 invisible">Services</h3>
        <ul className="space-y-2">
          {col2.map(s => (
            <li key={s}>
              <Link href="/services" className="text-white/60 hover:text-white text-xs transition-colors duration-150">{s}</Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Quick Links */}
      <div>
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-primary mb-4">Quick Links</h3>
        <ul className="space-y-2">
          {([['/', 'Home'], ['/about', 'About Us'], ['/services', 'Services'], ['/gallery', 'Gallery'], ['/contact', 'Contact']] as [string,string][]).map(([href, label]) => (
            <li key={href}>
              <Link href={href} className="text-white/60 hover:text-white text-xs transition-colors duration-150">{label}</Link>
            </li>
          ))}
        </ul>
      </div>
    </div>

    {/* Contact strip */}
    <div className="border-t border-white/10">
      <div className="max-w-[1120px] mx-auto px-6 py-3 flex flex-wrap items-center gap-x-6 gap-y-2">
        <span className="text-[11px] font-bold uppercase tracking-widest text-primary">Contact</span>
        <a href="tel:+27737869066" className="flex items-center gap-1.5 text-white/60 hover:text-white text-xs transition-colors duration-150">
          <Phone className="w-3 h-3 text-accent" /> +27 73 786 9066
        </a>
        <a href="mailto:info@fjservices.co.za" className="flex items-center gap-1.5 text-white/60 hover:text-white text-xs transition-colors duration-150">
          <Mail className="w-3 h-3 text-accent" /> info@fjservices.co.za
        </a>
        <span className="flex items-center gap-1.5 text-white/60 text-xs">
          <MapPin className="w-3 h-3 text-accent" /> JHB, Alberton, Germiston, Ekurhuleni &amp; Pretoria
        </span>
      </div>
    </div>

    {/* Copyright */}
    <div className="border-t border-white/10 py-3 text-center text-[11px] text-white/30">
      © 2026 FJ General &amp; <span className="text-accent">Engineering</span> Services · CIDB Registered · OHS Compliant · Developed by{' '}
      <a href="https://wa.me/27616583827" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-white transition-colors">Kimocks Labs</a>
    </div>
  </footer>
);

export default Footer;
