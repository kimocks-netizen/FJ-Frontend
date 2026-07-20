'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { Shield, Clock, Users, Wrench, Star, CheckCircle, Leaf, HardHat, BadgeCheck, ShieldCheck, MapPin, Building2, Phone } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ServiceCard from './components/ServiceCard';
import { API_ENDPOINTS } from './utils/api';
import { mockServices } from './lib/mockData';
import type { ServiceItem } from './types/services';

const trustItems = [
  { label: 'Licensed',                           icon: <BadgeCheck className="w-3.5 h-3.5" /> },
  { label: 'Insured',                            icon: <ShieldCheck className="w-3.5 h-3.5" /> },
  { label: 'OHS Compliant',                      icon: <HardHat className="w-3.5 h-3.5" /> },
  { label: 'CIDB Registered',                    icon: <Building2 className="w-3.5 h-3.5" /> },
  { label: 'Serving JHB, Ekurhuleni & Pretoria', icon: <MapPin className="w-3.5 h-3.5" /> },
];

const whyUs = [
  { icon: <Users className="w-6 h-6" />, title: 'One Team, 8 Services', desc: 'Save time and cost by using one trusted contractor for all your needs.' },
  { icon: <Wrench className="w-6 h-6" />, title: 'Professional Equipment', desc: 'We invest in the right tools for every job — no shortcuts.' },
  { icon: <HardHat className="w-6 h-6" />, title: 'Safety First', desc: 'Full PPE and OHS compliance on every site, every time.' },
  { icon: <Clock className="w-6 h-6" />, title: 'Fast Quotes', desc: 'Get a WhatsApp quote with photos within 24 hours.' },
  { icon: <Star className="w-6 h-6" />, title: 'Experienced Team', desc: 'Years of hands-on experience across civil and engineering work.' },
  { icon: <CheckCircle className="w-6 h-6" />, title: 'Quality Workmanship', desc: 'We take pride in finishing every job to the highest standard.' },
  { icon: <Shield className="w-6 h-6" />, title: 'Reliable Turnaround', desc: 'We show up on time and deliver on our commitments.' },
  { icon: <Leaf className="w-6 h-6" />, title: 'Customer Satisfaction', desc: 'Your satisfaction is our measure of success on every project.' },
];

export default function Home() {
  const [services, setServices] = useState<ServiceItem[]>(mockServices);

  useEffect(() => {
    axios.get(API_ENDPOINTS.PUBLIC_SERVICES)
      .then(res => {
        if (res.data.status === 'success' && res.data.data?.length) {
          // Merge local fallback images for any service missing an image_url
          const merged = res.data.data.map((s: ServiceItem) => {
            if (!s.image_url) {
              const fallback = mockServices.find(m => m.title === s.title);
              return { ...s, image_url: fallback?.image_url || '' };
            }
            return s;
          });
          setServices(merged);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">

        {/* Hero */}
        <section className="relative text-white">
          <div className="h-[480px] relative flex items-center overflow-hidden">
            <img src="/hero_image.png" alt="FJ General & Engineering Services" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50" />
            <div className="relative z-10 w-full max-w-[1120px] mx-auto px-6">
              <div className="ml-0 md:ml-[8%]" style={{textShadow:'0 2px 7px #000'}}>
                <h1 className="text-5xl md:text-6xl font-black uppercase leading-[0.98] mb-3">
                  <span className="text-primary">FJ General &</span><br />
                  <span className="text-accent">Engineering</span><br />
                  <span className="text-white">Services</span>
                </h1>
                <p className="text-white font-semibold text-base leading-snug mb-5">
                  Your One-Stop Team for Tree Felling, Road Works, Tar &amp; Custom Fabrication in Gauteng
                </p>
                <div className="flex flex-row gap-3">
                  <a href="https://wa.me/27000000000?text=Hello%20FJ%2C%20I%20need%20a%20quote" target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-accent hover:bg-accent-dark text-white px-4 py-2.5 rounded-[7px] font-bold text-xs uppercase tracking-wide transition-colors duration-200">
                    <FaWhatsapp className="w-4 h-4" /> Get Quote on WhatsApp
                  </a>
                  <a href="tel:+27000000000"
                    className="flex items-center gap-2 bg-[#080808] text-white border border-[#649c19] hover:bg-[#649c19] px-4 py-2.5 rounded-[7px] font-bold text-xs uppercase tracking-wide transition-all duration-200">
                    <Phone className="w-4 h-4" /> Call Now
                  </a>
                </div>
              </div>
            </div>

            {/* Trust Bar — absolute bottom, overlays hero image */}
            <div className="absolute bottom-0 left-0 right-0 z-10 backdrop-blur-sm" style={{background:'rgba(0,0,0,0.30)'}}>
              <div className="max-w-[1120px] mx-auto">
                <div className="flex flex-wrap md:flex-nowrap divide-y md:divide-y-0 md:divide-x divide-white/10">
                  {trustItems.map(item => (
                    <div key={item.label} className="flex items-center justify-center gap-1.5 py-2.5 px-4 text-[11px] font-semibold uppercase tracking-wide flex-1 text-white/80">
                      <span className="text-white/50">{item.icon}</span>
                      {item.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* About */}
        <section className="py-20 bg-background">
          <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
            <div className="h-80 rounded-[7px] overflow-hidden border border-border">
              <img src="/hero_image.png" alt="FJ team at work" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-3">Who We Are</p>
              <h2 className="text-4xl font-black text-primary mb-6">Built for Tough Jobs</h2>
              <p className="text-text-secondary text-lg leading-relaxed mb-4">
                FJ General & Engineering Services is a Gauteng-based company delivering safe, fast and reliable civil, landscaping and engineering solutions.
              </p>
              <p className="text-text-secondary leading-relaxed mb-8">
                From clearing dangerous trees and resurfacing tar to fabricating food-grade SS304 jacketed pots, we handle the jobs others walk away from. Our team is equipped, insured, and focused on one thing: getting it done right, on time.
              </p>
              <Link href="/about" className="bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-[7px] font-bold text-xs uppercase tracking-wide transition-colors duration-200 inline-block">
                Learn More About Us
              </Link>
            </div>
          </div>
        </section>

        {/* Services */}
        <section className="py-20 bg-background-section">
          <div className="px-6">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-3 mb-3">
                <span className="h-px w-8 bg-accent" />
                <p className="text-accent font-semibold text-sm uppercase tracking-widest">What We Do</p>
                <span className="h-px w-8 bg-accent" />
              </div>
              <h2 className="text-4xl font-black">
                <span className="text-text">Everything You Need, </span>
                <span className="text-primary">All in One Place</span>
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {services.map(s => <ServiceCard key={s.id} service={s} />)}
            </div>
            <div className="text-center mt-10">
              <Link href="/services" className="border border-primary text-primary hover:bg-primary hover:text-white px-5 py-2.5 rounded-[7px] font-bold text-xs uppercase tracking-wide transition-all duration-200 inline-block">
                View All Services
              </Link>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-20 bg-background">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-12">
              <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-3">Why FJ</p>
              <h2 className="text-4xl font-black text-primary">Why Choose Us</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {whyUs.map(item => (
                <div key={item.title} className="bg-background-card border border-border rounded-[7px] p-6 hover:shadow-md transition-shadow duration-300">
                  <div className="text-primary mb-3">{item.icon}</div>
                  <h3 className="font-bold text-text mb-2">{item.title}</h3>
                  <p className="text-text-secondary text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Accent stripe */}
        <div className="h-1 w-full" style={{background:'linear-gradient(90deg,#5d9f0d 0%,#ff5a00 100%)'}} />

        {/* Contact CTA */}
        <section className="py-20 bg-background-dark text-white">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <h2 className="text-4xl font-black mb-4">Ready to Start Your Project?</h2>
            <p className="text-gray-400 text-base mb-8">Serving Johannesburg, Alberton, Germiston, Ekurhuleni and Pretoria.</p>
            <div className="flex flex-row gap-3 justify-center">
              <Link href="/contact" className="flex items-center gap-2 bg-accent hover:bg-accent-dark text-white px-5 py-2.5 rounded-[7px] font-bold text-xs uppercase tracking-wide transition-colors duration-200">
                Send Quote Request
              </Link>
              <a href="https://wa.me/27000000000" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-[#080808] border border-[#649c19] hover:bg-[#649c19] text-white px-5 py-2.5 rounded-[7px] font-bold text-xs uppercase tracking-wide transition-all duration-200">
                <FaWhatsapp className="w-4 h-4" /> Chat on WhatsApp
              </a>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
