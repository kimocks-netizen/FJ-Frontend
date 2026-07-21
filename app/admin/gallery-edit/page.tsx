'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import AdminNavbar from '../../components/AdminNavbar';
import DeleteConfirmationModal from '../../components/DeleteConfirmationModal';
import { API_ENDPOINTS } from '../../utils/api';
import { getAdminToken } from '../../utils/auth';
import type { GalleryItem, GalleryFormData } from '../../types/gallery';
import { FaPlus, FaEdit, FaTrash, FaEye, FaEyeSlash, FaSpinner, FaCloudUploadAlt } from 'react-icons/fa';

const checkLandscape = (file: File): Promise<boolean> =>
  new Promise(resolve => {
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(img.src); resolve(img.naturalWidth >= img.naturalHeight); };
    img.src = URL.createObjectURL(file);
  });

const DropZone: React.FC<{ onFile: (f: File) => void; loading?: boolean; label: string }> = ({ onFile, loading, label }) => {
  const [dragging, setDragging] = useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const handle = (f: File) => { if (f && f.type.startsWith('image/')) onFile(f); };
  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handle(f); }}
      className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-[7px] p-6 cursor-pointer transition-colors ${dragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-background-section'}`}
    >
      {loading ? <FaSpinner className="animate-spin text-primary text-xl" /> : <FaCloudUploadAlt className="text-2xl text-text-muted" />}
      <p className="text-sm text-text-muted">{loading ? 'Uploading...' : label}</p>
      <p className="text-xs text-text-muted">Drag & drop or click to browse</p>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) handle(e.target.files[0]); e.target.value = ''; }} />
    </div>
  );
};

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
  const [landscapeWarning, setLandscapeWarning] = useState<{ file: File; onConfirm: (f: File) => void } | null>(null);
  const router = useRouter();

  const getToken = () => getAdminToken();

  useEffect(() => {
    const token = getToken();
    if (!token) { router.push('/admin'); return; }
    axios.get(API_ENDPOINTS.ADMIN_GALLERY, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => { if (res.data.status === 'success') setItems(res.data.data || []); })
      .catch(err => { console.error('Gallery fetch error:', err); })
      .finally(() => setIsLoading(false));
  }, [router]);

  const uploadImage = async (file: File, bucket: string, folder: string): Promise<string> => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('folder', folder);
    fd.append('bucket', bucket);
    const res = await axios.post(API_ENDPOINTS.ADMIN_UPLOAD, fd, { headers: { Authorization: `Bearer ${getToken()}` } });
    if (res.data.status !== 'success') throw new Error(res.data.message);
    return `${process.env.NEXT_PUBLIC_API_BASE_URL || 'https://fj-backend-mu.vercel.app'}${res.data.url}`;
  };

  const withLandscapeCheck = (file: File, onConfirm: (f: File) => void) =>
    checkLandscape(file).then(ok => ok ? onConfirm(file) : setLandscapeWarning({ file, onConfirm }));

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
        <div className="bg-primary px-6 py-4 text-white rounded-t-[7px] mb-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-xl font-bold">GALLERY MANAGEMENT</h1>
            <div className="flex justify-end">
              <button onClick={() => { setEditingItem(null); setFormData({ title: '', description: '', cover_image_url: '' }); setAdditionalImages([]); setIsModalOpen(true); }} disabled={items.length >= MAX_ITEMS} className="flex items-center gap-2 bg-accent hover:bg-accent-dark text-white px-4 py-2 rounded-[7px] text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                <FaPlus />New Item
              </button>
            </div>
          </div>
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
                  <DropZone label="Upload cover image" loading={uploadingCover} onFile={f => withLandscapeCheck(f, handleCoverUpload)} />
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
                  <DropZone label="Upload additional image" loading={uploadingExtra} onFile={f => withLandscapeCheck(f, handleExtraUpload)} />
                  <p className="text-xs text-text-muted mt-1">Upload one at a time. Hover an image and click &times; to remove.</p>
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

      {landscapeWarning && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-[7px] max-w-md w-full shadow-xl p-6">
            <h3 className="text-lg font-bold text-text mb-2">Portrait Image Detected</h3>
            <p className="text-sm text-text-secondary mb-1">This image appears to be in portrait orientation (taller than it is wide).</p>
            <p className="text-sm text-text-secondary mb-4">Landscape images are strongly recommended — portrait images may appear cropped, distorted, or poorly framed within the gallery layout, resulting in a suboptimal viewing experience for visitors.</p>
            <p className="text-sm font-medium text-text mb-4">Would you like to continue with this image anyway, or choose a different one?</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setLandscapeWarning(null)} className="px-4 py-2 bg-primary text-white rounded-[7px] text-sm font-semibold hover:bg-primary-dark transition-colors">Choose Again</button>
              <button onClick={() => { landscapeWarning.onConfirm(landscapeWarning.file); setLandscapeWarning(null); }} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-[7px] text-sm hover:bg-gray-200 transition-colors">Continue Anyway</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
