'use client';
import { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { GalleryItem } from '../types/gallery';

const GalleryCard = ({ item, onClick }: { item: GalleryItem; onClick: () => void }) => (
  <div onClick={onClick} className="cursor-pointer group rounded-[7px] overflow-hidden border border-border shadow-sm hover:shadow-md transition-all duration-300">
    <div className="h-56 bg-background-section overflow-hidden relative">
      {item.cover_image_url
        ? <img src={item.cover_image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        : <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">No image</div>
      }
      {item.images && item.images.length > 0 && (
        <span className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">{item.images.length} photos</span>
      )}
    </div>
    <div className="p-4">
      <h3 className="font-bold text-text">{item.title}</h3>
      {item.description && <p className="text-text-secondary text-sm mt-1 line-clamp-2">{item.description}</p>}
    </div>
  </div>
);

export const GalleryModal = ({ item, onClose }: { item: GalleryItem; onClose: () => void }) => {
  const images = item.images?.map(i => i.image_url).filter(Boolean) || (item.cover_image_url ? [item.cover_image_url] : []);
  const [current, setCurrent] = useState(0);

  if (!item) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[7px] max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex justify-between items-center p-6 border-b border-border">
          <h3 className="text-xl font-bold text-text">{item.title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
        </div>
        <div className="p-6">
          {images.length > 0 ? (
            <div className="relative">
              <img src={images[current]} alt={`${item.title} ${current + 1}`} className="w-full h-72 object-cover rounded-[7px]" />
              {images.length > 1 && (
                <>
                  <button onClick={() => setCurrent(p => (p - 1 + images.length) % images.length)} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors">
                    <ChevronLeft size={20} />
                  </button>
                  <button onClick={() => setCurrent(p => (p + 1) % images.length)} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors">
                    <ChevronRight size={20} />
                  </button>
                  <div className="flex justify-center gap-1.5 mt-3">
                    {images.map((_, i) => <button key={i} onClick={() => setCurrent(i)} className={`w-2 h-2 rounded-full transition-colors ${i === current ? 'bg-primary' : 'bg-gray-300'}`} />)}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="h-48 bg-background-section rounded-[7px] flex items-center justify-center text-gray-400">No images available</div>
          )}
          {item.description && <p className="text-text-secondary mt-4">{item.description}</p>}
        </div>
      </div>
    </div>
  );
};

export default GalleryCard;
