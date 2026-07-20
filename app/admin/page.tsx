'use client';
import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { API_ENDPOINTS } from '../utils/api';
import { useToast } from '../components/ToastContext';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await axios.post(API_ENDPOINTS.ADMIN_LOGIN, { email, password }, { headers: { 'Content-Type': 'application/json' } });
      if (res.data.status === 'success' && res.data.token) {
        const token = res.data.token;
        localStorage.setItem('adminToken', token);
        localStorage.setItem('auth', JSON.stringify({ token, expiresAt: Date.now() + 8 * 60 * 60 * 1000 }));
        showToast(`Welcome back, ${res.data.data?.name || 'Admin'}!`, 'success');
        router.push('/admin/dashboard');
      } else {
        showToast('Login failed. Please try again.', 'error');
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        showToast(err.response?.data?.message || 'Invalid credentials', 'error');
      } else {
        showToast('An error occurred. Please try again.', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = 'w-full border border-border rounded-[7px] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors';

  return (
    <div className="min-h-screen bg-background-section flex flex-col">
      {/* Mini nav */}
      <nav className="bg-[#0a0a0a] shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <img src="/big-logo.png" alt="FJ Logo" className="h-8 w-auto" />
            <span className="text-sm font-black uppercase leading-tight tracking-tight hidden sm:block">
              <span className="text-primary">FJ General &amp; <span className="text-accent">Engineering</span></span>
            </span>
          </Link>
          <Link href="/" className="flex items-center gap-1.5 text-white/60 hover:text-white text-xs font-semibold uppercase tracking-wide transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Site
          </Link>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-[7px] shadow-lg overflow-hidden border border-border">
        <div className="bg-primary px-6 py-6 text-center flex flex-col items-center gap-2">
          <img src="/big-logo.png" alt="FJ Logo" className="h-14 w-auto" />
          <p className="text-white/80 text-sm font-semibold uppercase tracking-widest">Admin Portal</p>
        </div>
        <form onSubmit={handleLogin} className="p-8 space-y-5">
          <div>
            <label className="block text-sm font-medium text-text mb-1">Username</label>
            <input type="text" value={email} onChange={e => setEmail(e.target.value)} className={inputClass} placeholder="admin" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1">Password</label>
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} className={`${inputClass} pr-11`} required />
              <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={isLoading} className="w-full bg-accent hover:bg-accent-dark text-white py-3 rounded-[7px] font-bold text-xs uppercase tracking-wide transition-colors duration-200 disabled:opacity-60">
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
      </div>
    </div>
  );
}
