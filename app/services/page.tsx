'use client';
import { FaWhatsapp } from 'react-icons/fa';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ServiceCard from '../components/ServiceCard';
import { API_ENDPOINTS } from '../utils/api';
import { mockServices } from '../lib/mockData';
import type { ServiceItem } from '../types/services';

export default function Services() {
  const [services, setServices] = useState<ServiceItem[]>(mockServices);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    axios.get(API_ENDPOINTS.PUBLIC_SERVICES)
      .then(res => {
        if (res.data.status === 'success' && res.data.data?.length) {
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
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">

        <section className="relative h-52 flex items-center justify-center text-white overflow-hidden">
          <img src="/small-hero.png" alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative z-10 text-center px-6">
            <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-2">What We Offer</p>
            <h1 className="text-5xl font-black text-white" style={{textShadow:'0 2px 8px #000'}}>Our <span className="text-primary">Services</span></h1>
            <p className="text-gray-300 mt-2 text-sm">Eight specialist services. One trusted team. Serving Gauteng.</p>
          </div>
        </section>

        <section className="py-20 bg-background-section">
          <div className="max-w-6xl mx-auto px-6">
            {isLoading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {services.map(s => <ServiceCard key={s.id} service={s} />)}
              </div>
            )}
          </div>
        </section>

        {/* Accent stripe */}
        <div className="h-1 w-full" style={{background:'linear-gradient(90deg,#5d9f0d 0%,#ff5a00 100%)'}} />

        <section className="py-16 bg-background-dark text-white text-center">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-3xl font-black mb-4">Ready to Start Your Project?</h2>
            <p className="text-white/70 mb-8">Serving Johannesburg, Alberton, Germiston, Ekurhuleni and Pretoria.</p>
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
