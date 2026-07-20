'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import AdminNavbar from '../../components/AdminNavbar';
import DeleteConfirmationModal from '../../components/DeleteConfirmationModal';
import { supabase } from '../../lib/supabaseClient';
import { API_ENDPOINTS } from '../../utils/api';
import { getAdminToken } from '../../utils/auth';
import type { ServiceItem, ServiceFormData } from '../../types/services';
import { FaPlus, FaEdit, FaTrash, FaEye, FaEyeSlash, FaSpinner } from 'react-icons/fa';

const MAX_SERVICES = 12;

export default function ServicesEdit() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [formData, setFormData] = useState<ServiceFormData>({ title: '', description: '', image_url: '', details: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [togglingService, setTogglingService] = useState<string | null>(null);
  const [deleteService, setDeleteService] = useState<ServiceItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const getToken = () => getAdminToken();

  useEffect(() => {
    const token = getToken();
    if (!token) { router.push('/admin'); return; }
    axios.get(API_ENDPOINTS.ADMIN_SERVICES, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => { if (res.data.status === 'success') setServices(res.data.data || []); })
      .catch(() => router.push('/admin'))
      .finally(() => setIsLoading(false));
  }, [router]);

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `services/${Date.now()}-${Math.random()}.${ext}`;
      const { error } = await supabase.storage.from('fj-images').upload(path, file);
      if (error) throw error;
      const url = supabase.storage.from('fj-images').getPublicUrl(path).data.publicUrl;
      setFormData(p => ({ ...p, image_url: url }));
    } catch (e) { console.error(e); alert('Failed to upload image'); }
    finally { setUploadingImage(false); }
  };

  const handleToggleActive = async (service: ServiceItem) => {
    if (!service.id) return;
    setTogglingService(service.id);
    setServices(prev => prev.map(s => s.id === service.id ? { ...s, is_active: !s.is_active } : s));
    try {
      const res = await axios.put(API_ENDPOINTS.getServiceEndpoint(service.id), { ...service, is_active: !service.is_active }, { headers: { Authorization: `Bearer ${getToken()}` } });
      if (res.data.status !== 'success') setServices(prev => prev.map(s => s.id === service.id ? { ...s, is_active: service.is_active } : s));
    } catch { setServices(prev => prev.map(s => s.id === service.id ? { ...s, is_active: service.is_active } : s)); }
    finally { setTogglingService(null); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSubmitting(true);
    try {
      const token = getToken();
      if (editingService) {
        const res = await axios.put(API_ENDPOINTS.getServiceEndpoint(editingService.id), formData, { headers: { Authorization: `Bearer ${token}` } });
        if (res.data.status === 'success') setServices(prev => prev.map(s => s.id === editingService.id ? res.data.data : s));
      } else {
        const res = await axios.post(API_ENDPOINTS.ADMIN_SERVICES, formData, { headers: { Authorization: `Bearer ${token}` } });
        if (res.data.status === 'success') setServices(prev => [...prev, res.data.data]);
      }
      setIsModalOpen(false); setEditingService(null); setFormData({ title: '', description: '', image_url: '', details: '' });
    } catch (e) { console.error(e); alert('Failed to save service'); }
    finally { setIsSubmitting(false); }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteService?.id) return;
    setIsDeleting(true);
    try {
      await axios.delete(API_ENDPOINTS.getServiceEndpoint(deleteService.id), { headers: { Authorization: `Bearer ${getToken()}` } });
      setServices(prev => prev.filter(s => s.id !== deleteService.id));
      setDeleteService(null);
    } catch { alert('Failed to delete service'); }
    finally { setIsDeleting(false); }
  };

  if (isLoading) return <div className="min-h-screen bg-background-section flex items-center justify-center"><FaSpinner className="animate-spin text-3xl text-primary" /></div>;

  return (
    <div className="min-h-screen bg-background-section">
      <AdminNavbar />
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-primary px-6 py-4 text-white rounded-t-[7px] flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold">SERVICES MANAGEMENT</h1>
          <button onClick={() => { setEditingService(null); setFormData({ title: '', description: '', image_url: '', details: '' }); setIsModalOpen(true); }} disabled={services.length >= MAX_SERVICES} className="flex items-center gap-2 bg-accent hover:bg-accent-dark text-white px-4 py-2 rounded-[7px] text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            <FaPlus />New Service
          </button>
        </div>

        {services.length >= MAX_SERVICES && <div className="bg-yellow-50 border border-yellow-200 rounded-[7px] p-4 mb-6 text-yellow-800 text-sm">Maximum of {MAX_SERVICES} services reached.</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map(service => (
            <div key={service.id} className="bg-white rounded-[7px] shadow-sm border border-border overflow-hidden">
              <div className="relative">
                {service.image_url
                  ? <img src={service.image_url} alt={service.title} className="w-full h-48 object-cover" />
                  : <div className="w-full h-48 bg-background-section flex items-center justify-center text-gray-300 text-sm">No image</div>
                }
                <button onClick={() => handleToggleActive(service)} disabled={togglingService === service.id} className={`absolute top-2 right-2 p-2 rounded-full transition-colors ${service.is_active ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-gray-400 text-white hover:bg-gray-500'} ${togglingService === service.id ? 'opacity-50' : ''}`}>
                  {togglingService === service.id ? <FaSpinner className="animate-spin" /> : service.is_active ? <FaEye /> : <FaEyeSlash />}
                </button>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-text mb-1">{service.title}</h3>
                <p className="text-text-muted text-sm line-clamp-2 mb-3">{service.description || 'No description'}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-text-muted">Order: {service.display_order}</span>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditingService(service); setFormData({ title: service.title, description: service.description || '', image_url: service.image_url || '', details: service.details || '' }); setIsModalOpen(true); }} className="p-2 text-primary hover:bg-background-section rounded-full transition-colors"><FaEdit /></button>
                    <button onClick={() => setDeleteService(service)} className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"><FaTrash /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[7px] max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-text">{editingService ? 'Edit Service' : 'Add Service'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-1">Title *</label>
                  <input type="text" value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} className="w-full border border-border rounded-[7px] px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-1">Description</label>
                  <textarea value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} rows={3} className="w-full border border-border rounded-[7px] px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-1">Details</label>
                  <textarea value={formData.details} onChange={e => setFormData(p => ({ ...p, details: e.target.value }))} rows={3} className="w-full border border-border rounded-[7px] px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Additional details, pricing info, etc." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-1">Service Image</label>
                  {formData.image_url && <img src={formData.image_url} alt="Service" className="w-full h-32 object-cover rounded-[7px] mb-2" />}
                  <div className="flex items-center gap-2">
                    <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0])} className="flex-1 text-sm" />
                    {uploadingImage && <FaSpinner className="animate-spin text-primary" />}
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-[7px] hover:bg-gray-200 transition-colors">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-[7px] transition-colors disabled:opacity-50 flex items-center gap-2">
                    {isSubmitting && <FaSpinner className="animate-spin" />}{isSubmitting ? 'Saving...' : editingService ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {deleteService && <DeleteConfirmationModal isOpen={!!deleteService} onClose={() => setDeleteService(null)} onConfirm={handleDeleteConfirm} title="Delete Service" message="Are you sure you want to delete this service?" itemName={deleteService.title} isLoading={isDeleting} />}
    </div>
  );
}
