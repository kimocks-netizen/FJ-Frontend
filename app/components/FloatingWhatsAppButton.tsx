'use client';
import { FaWhatsapp } from 'react-icons/fa';

const FloatingWhatsAppButton = () => (
  <a
    href="https://wa.me/27000000000?text=Hello%20FJ%20General%20%26%20Engineering%20Services%2C%20I%20would%20like%20to%20request%20a%20quote."
    target="_blank"
    rel="noopener noreferrer"
    className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
    aria-label="Chat on WhatsApp"
  >
    <FaWhatsapp size={24} />
  </a>
);

export default FloatingWhatsAppButton;
