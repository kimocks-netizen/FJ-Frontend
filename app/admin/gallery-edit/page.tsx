'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import AdminNavbar from '../../components/AdminNavbar';
import DeleteConfirmationModal from '../../components/DeleteConfirmationModal';
import { supabase } from '../../lib/supabaseClient';
import { API_ENDPOINTS } from '../../utils/api';
import { getAdminToken } from '../../utils/auth';
import type { GalleryItem, GalleryFormData } from '../../types/gallery';
import { FaPlus, FaEdit, FaTrash, FaEye, FaEyeSlash, FaSpinner } from 'react-icons/fa';

const MAX_ITEMS = 24;

export default function GalleryEdit() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [formData, setFormData] = useState<GalleryFormData>({ title: '', description: '', cover_image_url: '' });
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingExtra, setUploadingExtra] = useState(false);
  const [togglingItem, setTogglingItem] = useState<string | null>(null);
  const [deleteItem, setDeleteItem] = useState<GalleryItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const getToken = () => getAdminToken();

  useEffect(() => {
    const token = getToken();
    if (!token) { router.push('/admin'); return; }
    axios.get(API_ENDPOINTS.ADMIN_GALLERY, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => { if (res.data.status === 'success') setItems(res.data.data || []); })
      .catch(() => router.push('/admin'))
      .finally(() => setIsLoading(false));
  }, [router]);

  const uploadImage = async (file: File, bucket: string, folder: string): Promise<string> => {
    const ext = file.name.split('.').pop();
    const path = `${folder}/${Date.now()}-${Math.random()}.${ext}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file);
    if (error) throw error;
    return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
  };

  const handleCoverUpload = async (file: File) => {
    setUploadingCover(true);
    try { setFormData(p => ({ ...p, cover_image_url: '' })); const url = await uploadImage(file, 'fj-gallery', 'covers'); setFormData(p => ({ ...p, cover_image_url: url })); }
    catch (e) { console.error(e); alert('Failed to upload cover image'); }
    finally { setUploadingCover(false); }
  };

  const handleExtraUpload = async (file: File) => {
    setUploadingExtra(true);
    try { const url = await uploadImage(file, 'fj-gallery', 'images'); setAdditionalImages(p => [...p, url]); }
    catch (e) { console.error(e); alert('Failed to upload image'); }
    finally { setUploadingExtra(false); }
  };

  const handleToggleActive = async (item: GalleryItem) => {
    if (!item.id) return;
    setTogglingItem(item.id);
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_active: !i.is_active } : i));
    try {
      const res = await axios.put(API_ENDPOINTS.getGalleryItemEndpoint(item.id), { ...item, is_active: !item.is_active }, { headers: { Authorization: `Bearer ${getToken()}` } });
      if (res.data.status !== 'success') setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_active: item.is_active } : i));
    } catch { setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_active: item.is_active } : i)); }
    finally { setTogglingItem(null); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSubmitting(true);
    try {
      const token = getToken();
      const payload = { ...formData, images: additionalImages };
      if (editingItem) {
        const res = await axios.put(API_ENDPOINTS.getGalleryItemEndpoint(editingItem.id), payload, { headers: { Authorization: `Bearer ${token}` } });
        if (res.data.status === 'success') setItems(prev => prev.map(i => i.id === editingItem.id ? res.data.data : i));
      } else {
        const res = await axios.post(API_ENDPOINTS.ADMIN_GALLERY, payload, { headers: { Authorization: `Bearer ${token}` } });
        if (res.data.status === 'success') setItems(prev => [...prev, res.data.data]);
      }
      setIsModalOpen(false); setEditingItem(null); setFormData({ title: '', description: '', cover_image_url: '' }); setAdditionalImages([]);
    } catch (e) { console.error(e); alert('Failed to save gallery item'); }
    finally { setIsSubmitting(false); }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteItem?.id) return;
    setIsDeleting(true);
    try {
      await axios.delete(API_ENDPOINTS.getGalleryItemEndpoint(deleteItem.id), { headers: { Authorization: `Bearer ${getToken()}` } });
      setItems(prev => prev.filter(i => i.id !== deleteItem.id));
      setDeleteItem(null);
    } catch { alert('Failed to delete item'); }
    finally { setIsDeleting(false); }
  };

  if (isLoading) return <div className="min-h-screen bg-background-section flex items-center justify-center"><FaSpinner className="animate-spin text-3xl text-primary" /></div>;

  return (
    <div className="min-h-screen bg-background-section">
      <AdminNavbar />
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-primary px-6 py-4 text-white rounded-t-[7px] flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold">GALLERY MANAGEMENT</h1>
          <button onClick={() => { setEditingItem(null); setFormData({ title: '', description: '', cover_image_url: '' }); setAdditionalImages([]); setIsModalOpen(true); }} disabled={items.length >= MAX_ITEMS} className="flex items-center gap-2 bg-accent hover:bg-accent-dark text-white px-4 py-2 rounded-[7px] text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            <FaPlus />New Item
          </button>
        </div>

        {items.length >= MAX_ITEMS && <div className="bg-yellow-50 border border-yellow-200 rounded-[7px] p-4 mb-6 text-yellow-800 text-sm">Maximum of {MAX_ITEMS} gallery items reached.</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(item => (
            <div key={item.id} className="bg-white rounded-[7px] shadow-sm border border-border overflow-hidden">
              <div className="relative">
                {item.cover_image_url
                  ? <img src={item.cover_image_url} alt={item.title} className="w-full h-48 object-cover" />
                  : <div className="w-full h-48 bg-background-section flex items-center justify-center text-gray-300 text-sm">No image</div>
                }
                <button onClick={() => handleToggleActive(item)} disabled={togglingItem === item.id} className={`absolute top-2 right-2 p-2 rounded-full transition-colors ${item.is_active ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-gray-400 text-white hover:bg-gray-500'} ${togglingItem === item.id ? 'opacity-50' : ''}`}>
                  {togglingItem === item.id ? <FaSpinner className="animate-spin" /> : item.is_active ? <FaEye /> : <FaEyeSlash />}
                </button>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-text mb-1">{item.title}</h3>
                <p className="text-text-muted text-sm line-clamp-2 mb-3">{item.description || 'No description'}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-text-muted">Order: {item.display_order}</span>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditingItem(item); setFormData({ title: item.title, description: item.description || '', cover_image_url: item.cover_image_url || '' }); setAdditionalImages(item.images?.map(i => i.image_url) || []); setIsModalOpen(true); }} className="p-2 text-primary hover:bg-background-section rounded-full transition-colors"><FaEdit /></button>
                    <button onClick={() => setDeleteItem(item)} className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"><FaTrash /></button>
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
                <h2 className="text-xl font-bold text-text">{editingItem ? 'Edit Gallery Item' : 'Add Gallery Item'}</h2>
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
                  <label className="block text-sm font-medium text-text mb-1">Cover Image</label>
                  {formData.cover_image_url && <img src={formData.cover_image_url} alt="Cover" className="w-full h-32 object-cover rounded-[7px] mb-2" />}
                  <div className="flex items-center gap-2">
                    <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && handleCoverUpload(e.target.files[0])} className="flex-1 text-sm" />
                    {uploadingCover && <FaSpinner className="animate-spin text-primary" />}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-1">Additional Images</label>
                  {additionalImages.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mb-2">
                      {additionalImages.map((url, i) => (
                        <div key={i} className="relative group">
                          <img src={url} alt={`Image ${i + 1}`} className="w-full h-20 object-cover rounded-[7px] border border-border" />
                          <button type="button" onClick={() => setAdditionalImages(p => p.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity text-xs">&times;</button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && handleExtraUpload(e.target.files[0])} className="flex-1 text-sm" />
                    {uploadingExtra && <FaSpinner className="animate-spin text-primary" />}
                  </div>
                  <p className="text-xs text-text-muted mt-1">Upload one at a time. Click the image to remove.</p>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-[7px] hover:bg-gray-200 transition-colors">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-[7px] transition-colors disabled:opacity-50 flex items-center gap-2">
                    {isSubmitting && <FaSpinner className="animate-spin" />}{isSubmitting ? 'Saving...' : editingItem ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {deleteItem && <DeleteConfirmationModal isOpen={!!deleteItem} onClose={() => setDeleteItem(null)} onConfirm={handleDeleteConfirm} title="Delete Gallery Item" message="Are you sure you want to delete this gallery item?" itemName={deleteItem.title} isLoading={isDeleting} />}
    </div>
  );
}
