'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import GalleryCard, { GalleryModal } from '../components/GalleryCard';
import { API_ENDPOINTS } from '../utils/api';
import { mockGallery } from '../lib/mockData';
import type { GalleryItem } from '../types/gallery';

export default function Gallery() {
  const [items, setItems] = useState<GalleryItem[]>(mockGallery);
  const [selected, setSelected] = useState<GalleryItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    axios.get(API_ENDPOINTS.PUBLIC_GALLERY)
      .then(res => {
        if (res.data.status === 'success' && res.data.data?.length) {
          const merged = res.data.data.map((item: GalleryItem) => {
            if (!item.cover_image_url) {
              const fallback = mockGallery.find(m => m.title === item.title);
              return { ...item, cover_image_url: fallback?.cover_image_url || '' };
            }
            return item;
          });
          setItems(merged);
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
            <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-2">Our Work</p>
            <h1 className="text-5xl font-black text-white" style={{textShadow:'0 2px 8px #000'}}>Project <span className="text-primary">Gallery</span></h1>
            <p className="text-gray-300 mt-2 text-sm">Browse our completed projects across Gauteng.</p>
          </div>
        </section>

        <section className="py-20 bg-background-section">
          <div className="max-w-6xl mx-auto px-6">
            {isLoading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
              </div>
            ) : items.length === 0 ? (
              <p className="text-center text-text-muted py-20">No gallery items available yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map(item => <GalleryCard key={item.id} item={item} onClick={() => setSelected(item)} />)}
              </div>
            )}
          </div>
        </section>

        {/* Accent stripe */}
        <div className="h-1 w-full" style={{background:'linear-gradient(90deg,#5d9f0d 0%,#ff5a00 100%)'}} />

        <section className="py-16 bg-background-dark text-white text-center">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-3xl font-black mb-4">Have a Project to Share?</h2>
            <p className="text-white/70 mb-8">Contact us to get a quote or see more of our work.</p>
            <div className="flex flex-row gap-3 justify-center">
              <a href="/contact" className="flex items-center gap-2 bg-accent hover:bg-accent-dark text-white px-5 py-2.5 rounded-[7px] font-bold text-xs uppercase tracking-wide transition-colors duration-200">
                Get a Quote
              </a>
            </div>
          </div>
        </section>

      </main>
      <Footer />
      {selected && <GalleryModal item={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
