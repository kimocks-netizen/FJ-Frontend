import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import QuoteForm from '../components/QuoteForm';
import { FaWhatsapp, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

const contactDetails = [
  { icon: <FaPhoneAlt className="text-accent" />, label: 'Phone', value: '+27 73 786 9066', href: 'tel:+27737869066' },
  { icon: <FaWhatsapp className="text-accent" />, label: 'WhatsApp', value: '+27 73 786 9066', href: 'https://wa.me/27737869066' },
  { icon: <FaEnvelope className="text-accent" />, label: 'Email', value: 'vurayiephraim@gmail.com', href: 'mailto:vurayiephraim@gmail.com' },
  { icon: <FaMapMarkerAlt className="text-accent" />, label: 'Address', value: '23 Meyer Street, Germiston, 1400', href: undefined },
  { icon: <FaMapMarkerAlt className="text-accent" />, label: 'Service Area', value: 'JHB, Alberton, Germiston, Ekurhuleni, Pretoria', href: undefined },
];

export default function Contact() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">

        <section className="relative h-52 flex items-center justify-center text-white overflow-hidden">
          <img src="/small-hero.png" alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative z-10 text-center px-6">
            <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-2">Get In Touch</p>
            <h1 className="text-5xl font-black text-white" style={{textShadow:'0 2px 8px #000'}}>Contact <span className="text-primary">Us</span></h1>
            <p className="text-gray-300 mt-2 text-sm">Get a quote within 24 hours. No obligation.</p>
          </div>
        </section>

        <section className="py-20 bg-background-section">
          <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-10">
            <div className="md:col-span-2 bg-background-card border border-border rounded-[7px] p-8 shadow-sm">
              <h2 className="text-2xl font-black text-primary mb-6">Send Quote Request</h2>
              <QuoteForm />
            </div>

            <div className="space-y-6">
              <div className="bg-background-card border border-border rounded-[7px] p-6 shadow-sm">
                <h3 className="font-bold text-text mb-4">Contact Details</h3>
                <div className="space-y-4">
                  {contactDetails.map(c => (
                    <div key={c.label} className="flex items-start gap-3">
                      <span className="mt-0.5 flex-shrink-0">{c.icon}</span>
                      <div>
                        <p className="text-xs text-text-muted font-medium uppercase tracking-wider">{c.label}</p>
                        {c.href
                          ? <a href={c.href} target={c.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className="text-sm text-text hover:text-primary transition-colors">{c.value}</a>
                          : <p className="text-sm text-text">{c.value}</p>
                        }
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <a href="https://wa.me/27737869066?text=Hello%20FJ%2C%20I%20need%20a%20quote" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-[7px] font-bold text-xs uppercase tracking-wide transition-colors duration-200">
                <FaWhatsapp size={22} /> Chat on WhatsApp
              </a>
            </div>
          </div>
        </section>

        {/* Accent stripe */}
        <div className="h-1 w-full" style={{background:'linear-gradient(90deg,#5d9f0d 0%,#ff5a00 100%)'}} />

      </main>
      <Footer />
    </div>
  );
}
