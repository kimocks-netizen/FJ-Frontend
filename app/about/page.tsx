import { CheckCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Link from 'next/link';

const values = [
  { title: 'Safety First', desc: 'Full PPE and OHS compliance on every site. No exceptions.' },
  { title: 'Reliability', desc: 'We show up when we say we will and deliver what we promise.' },
  { title: 'Quality', desc: 'Every job is finished to the highest standard, every time.' },
  { title: 'Integrity', desc: 'Honest pricing, clear communication and no hidden costs.' },
];

export default function About() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">

        <section className="relative h-52 flex items-center justify-center text-white overflow-hidden">
          <img src="/small-hero.png" alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative z-10 text-center px-6">
            <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-2">Who We Are</p>
            <h1 className="text-5xl font-black text-white" style={{textShadow:'0 2px 8px #000'}}>About <span className="text-primary">FJ</span></h1>
          </div>
        </section>

        <section className="py-20 bg-background">
          <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
            <div className="h-80 rounded-[7px] overflow-hidden border border-border">
              <img src="/hero_image.png" alt="FJ team at work" className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="text-4xl font-black text-primary mb-6">Built for Tough Jobs</h2>
              <p className="text-text-secondary text-lg leading-relaxed mb-4">
                FJ General & Engineering Services is a Gauteng-based company delivering safe, fast and reliable civil, landscaping and engineering solutions.
              </p>
              <p className="text-text-secondary leading-relaxed mb-4">
                From clearing dangerous trees and resurfacing tar to fabricating food-grade SS304 jacketed pots, we handle the jobs others walk away from.
              </p>
              <p className="text-text-secondary leading-relaxed">
                Our team is equipped, insured, and focused on one thing: getting it done right, on time. We are CIDB registered and OHS compliant, serving Johannesburg, Alberton, Germiston, Ekurhuleni and Pretoria.
              </p>
            </div>
          </div>
        </section>

        <section className="py-20 bg-background-section">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-black text-primary">Our Values</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map(v => (
                <div key={v.title} className="bg-background-card border border-border rounded-[7px] p-6">
                  <CheckCircle className="text-primary w-8 h-8 mb-3" />
                  <h3 className="font-bold text-text mb-2">{v.title}</h3>
                  <p className="text-text-secondary text-sm">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Accent stripe */}
        <div className="h-1 w-full" style={{background:'linear-gradient(90deg,#5d9f0d 0%,#ff5a00 100%)'}} />

        <section className="py-16 bg-background-dark text-white text-center">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-3xl font-black mb-4">Ready to Work With Us?</h2>
            <p className="text-white/70 mb-8">Get a quote within 24 hours. No obligation.</p>
            <div className="flex flex-row gap-3 justify-center">
              <Link href="/contact" className="bg-accent hover:bg-accent-dark text-white px-5 py-2.5 rounded-[7px] font-bold text-xs uppercase tracking-wide transition-colors duration-200 inline-block">
                Get a Quote
              </Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
