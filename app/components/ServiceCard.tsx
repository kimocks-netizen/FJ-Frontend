'use client';
import { useState } from 'react';
import { TreePine, Shovel, Construction, PaintRoller, Trophy, AlertTriangle, Home, FlaskConical, Wrench } from 'lucide-react';
import type { ServiceItem } from '../types/services';

// green = general/landscaping, orange = civil/engineering
const SERVICE_MAP: Record<string, { icon: React.ReactNode; color: 'green' | 'orange' }> = {
  'Tree Felling & Rubble Removal':      { icon: <TreePine className="w-4 h-4" />,      color: 'green'  },
  'Stump Removal & Grinding':           { icon: <Shovel className="w-4 h-4" />,        color: 'green'  },
  'Tar Resurfacing':                    { icon: <Construction className="w-4 h-4" />,   color: 'orange' },
  'Road Line Marking':                  { icon: <PaintRoller className="w-4 h-4" />,   color: 'orange' },
  'Sports Court Marking':               { icon: <Trophy className="w-4 h-4" />,         color: 'orange' },
  'Tennis & Sports Court Marking':      { icon: <Trophy className="w-4 h-4" />,         color: 'orange' },
  'Pothole Filling & Speed Humps':      { icon: <AlertTriangle className="w-4 h-4" />, color: 'orange' },
  'Pothole Filling & Speed Hump Marking': { icon: <AlertTriangle className="w-4 h-4" />, color: 'orange' },
  'Wendy Houses':                       { icon: <Home className="w-4 h-4" />,           color: 'green'  },
  'Jacketed Pots & Boiler Making':      { icon: <FlaskConical className="w-4 h-4" />,  color: 'orange' },
};

const ServiceCard = ({ service }: { service: ServiceItem }) => {
  const [isOpen, setIsOpen] = useState(false);
  const entry = SERVICE_MAP[service.title] ?? { icon: <Wrench className="w-4 h-4" />, color: 'green' as const };
  const badgeBg = entry.color === 'orange' ? 'bg-accent' : 'bg-primary';

  return (
    <>
      <div className="bg-background-card border border-border rounded-[7px] shadow-sm hover:shadow-md transition-shadow duration-300 overflow-visible flex flex-col cursor-pointer" onClick={() => setIsOpen(true)}>
        <div className="h-48 bg-background-section relative overflow-hidden rounded-t-[7px]">
          {service.image_url
            ? <img src={service.image_url} alt={service.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
            : <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">No image</div>
          }
        </div>

        {/* Icon badge — half over image, half over text */}
        <div className="relative h-0 flex justify-start">
          <div className={`-mt-5 w-10 h-10 rounded-full ${badgeBg} text-white flex items-center justify-center shadow-md border-2 border-white z-10`}>
            {entry.icon}
          </div>
        </div>

        <div className="px-5 pb-5 pt-6 flex flex-col flex-1">
          <h3 className="font-bold text-text text-base mb-1.5">{service.title}</h3>
          <p className="text-text-secondary text-sm flex-1 line-clamp-3">{service.description}</p>
          <span className="mt-4 text-sm font-semibold text-primary hover:text-primary-dark transition-colors self-start">Learn More →</span>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setIsOpen(false)}>
          <div className="bg-white rounded-[7px] max-w-lg w-full p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-text">{service.title}</h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>
            {service.image_url && <img src={service.image_url} alt={service.title} className="w-full h-48 object-cover rounded-[7px] mb-4" />}
            <p className="text-text-secondary mb-3">{service.description}</p>
            {service.details && <p className="text-text-secondary text-sm">{service.details}</p>}
            <button onClick={() => setIsOpen(false)} className="mt-6 w-full bg-accent hover:bg-accent-dark text-white py-2.5 rounded-[7px] font-bold text-xs uppercase tracking-wide transition-colors duration-200">
              Get a Quote
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ServiceCard;
