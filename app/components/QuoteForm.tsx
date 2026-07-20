'use client';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { FiUpload, FiX } from 'react-icons/fi';
import { API_ENDPOINTS } from '../utils/api';
import { useToast } from './ToastContext';

const countryCodes = [
  { code: '+27', name: 'South Africa', flag: '🇿🇦' },
  { code: '+267', name: 'Botswana', flag: '🇧🇼' },
  { code: '+263', name: 'Zimbabwe', flag: '🇿🇼' },
  { code: '+260', name: 'Zambia', flag: '🇿🇲' },
  { code: '+264', name: 'Namibia', flag: '🇳🇦' },
  { code: '+258', name: 'Mozambique', flag: '🇲🇿' },
  { code: '+1', name: 'USA', flag: '🇺🇸' },
  { code: '+44', name: 'UK', flag: '🇬🇧' },
];

const FJ_SERVICES = [
  'Tree Felling & Rubble Removal',
  'Stump Removal & Grinding',
  'Tar Resurfacing',
  'Road Line Marking',
  'Sports Court Marking',
  'Pothole Filling & Speed Humps',
  'Wendy Houses',
  'Jacketed Pots & Boiler Making',
  'Other',
];

const QuoteForm = () => {
  const [selectedCountryCode, setSelectedCountryCode] = useState('+27');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { showToast } = useToast();

  const formik = useFormik({
    initialValues: { name: '', phone: '', email: '', service_required: '', location: '', message: '', images: [] as File[] },
    validationSchema: Yup.object({
      name: Yup.string().required('Name is required').matches(/^[a-zA-Z\s]*$/, 'Name cannot contain numbers'),
      phone: Yup.string().required('Phone is required').matches(/^[0-9]{9,10}$/, 'Must be 9-10 digits'),
      email: Yup.string().email('Invalid email'),
      service_required: Yup.string().required('Please select a service'),
      location: Yup.string().required('Location is required'),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        let formattedPhone = values.phone.startsWith('0') ? values.phone.substring(1) : values.phone;
        formattedPhone = selectedCountryCode + formattedPhone;

        const imageUrls: string[] = [];
        const total = values.images.length;

        for (let i = 0; i < total; i++) {
          const file = values.images[i];
          const ext = file.name.split('.').pop();
          const path = `quotes/${Date.now()}-${Math.random()}.${ext}`;
          const { error } = await supabase.storage.from('fj-images').upload(path, file);
          if (error) throw error;
          const { data } = supabase.storage.from('fj-images').getPublicUrl(path);
          imageUrls.push(data.publicUrl);
          setUploadProgress(Math.round(((i + 1) / total) * 100));
        }

        await axios.post(API_ENDPOINTS.PUBLIC_QUOTES, {
          name: values.name, phone: formattedPhone, email: values.email,
          service_required: values.service_required, location: values.location,
          message: values.message, images: imageUrls, status: 'pending',
        });

        showToast('Quote request sent! We will contact you within 24 hours.', 'success');
        resetForm();
        setUploadedImages([]);
        setUploadProgress(0);
      } catch (err) {
        console.error(err);
        showToast('Failed to send quote. Please try WhatsApp instead.', 'error');
      }
    },
  });

  const handleFiles = (files: FileList) => {
    const newFiles = Array.from(files).slice(0, 5 - formik.values.images.length);
    if (!newFiles.length) return;
    formik.setFieldValue('images', [...formik.values.images, ...newFiles]);
    setUploadedImages(prev => [...prev, ...newFiles.map(f => URL.createObjectURL(f))]);
  };

  const removeImage = (index: number) => {
    const imgs = [...formik.values.images]; imgs.splice(index, 1);
    formik.setFieldValue('images', imgs);
    const prev = [...uploadedImages]; URL.revokeObjectURL(prev[index]); prev.splice(index, 1);
    setUploadedImages(prev);
  };

  useEffect(() => () => uploadedImages.forEach(u => URL.revokeObjectURL(u)), []);

  const inputClass = 'w-full border border-border rounded-[7px] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors';
  const errorClass = 'text-red-500 text-xs mt-1';

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-text mb-1">Full Name *</label>
          <input name="name" type="text" onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.name} className={inputClass} placeholder="Your full name" />
          {formik.touched.name && formik.errors.name && <p className={errorClass}>{formik.errors.name}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-text mb-1">Phone Number *</label>
          <div className="flex gap-2">
            <select value={selectedCountryCode} onChange={e => setSelectedCountryCode(e.target.value)} className="border border-border rounded-[7px] px-2 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary">
              {countryCodes.map(c => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
            </select>
            <input name="phone" type="tel" onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.phone} className={`flex-1 ${inputClass}`} placeholder="812345678" />
          </div>
          {formik.touched.phone && formik.errors.phone && <p className={errorClass}>{formik.errors.phone}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-text mb-1">Email</label>
          <input name="email" type="email" onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.email} className={inputClass} placeholder="your@email.com" />
          {formik.touched.email && formik.errors.email && <p className={errorClass}>{formik.errors.email}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-text mb-1">Service Required *</label>
          <select name="service_required" onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.service_required} className={inputClass}>
            <option value="">Select a service...</option>
            {FJ_SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          {formik.touched.service_required && formik.errors.service_required && <p className={errorClass}>{formik.errors.service_required}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-text mb-1">Location *</label>
        <input name="location" type="text" onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.location} className={inputClass} placeholder="e.g. Alberton, Germiston, Pretoria..." />
        {formik.touched.location && formik.errors.location && <p className={errorClass}>{formik.errors.location}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-text mb-1">Message</label>
        <textarea name="message" rows={4} onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.message} className={inputClass} placeholder="Describe your project or job..." />
      </div>

      <div>
        <label className="block text-sm font-medium text-text mb-1">Upload Photos (Max 5)</label>
        <div
          className={`border-2 border-dashed rounded-[7px] p-6 text-center cursor-pointer transition-colors ${isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
          onDragEnter={e => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={e => { e.preventDefault(); setIsDragging(false); }}
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files) handleFiles(e.dataTransfer.files); }}
          onClick={() => document.getElementById('fj-file-upload')?.click()}
        >
          <FiUpload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
          <p className="text-sm text-text-muted">{isDragging ? 'Drop images here' : 'Drag & drop or click to upload'}</p>
          <p className="text-xs text-text-muted mt-1">PNG, JPG up to 5MB each</p>
          <input id="fj-file-upload" type="file" multiple accept="image/*" className="sr-only" onChange={e => e.target.files && handleFiles(e.target.files)} disabled={formik.values.images.length >= 5} />
        </div>

        {uploadedImages.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mt-3">
            {uploadedImages.map((src, i) => (
              <div key={i} className="relative group">
                <img src={src} alt={`Preview ${i + 1}`} className="h-20 w-full object-cover rounded-[7px] border border-border" />
                <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <FiX size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="mt-3">
            <div className="h-2 bg-gray-200 rounded-full"><div className="h-full bg-primary rounded-full transition-all" style={{ width: `${uploadProgress}%` }} /></div>
            <p className="text-xs text-text-muted mt-1">Uploading {uploadProgress}%...</p>
          </div>
        )}
      </div>

      <button type="submit" disabled={formik.isSubmitting} className="w-full bg-accent hover:bg-accent-dark text-white py-3 rounded-[7px] font-bold text-xs uppercase tracking-wide transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed">
        {formik.isSubmitting ? 'Sending...' : 'Send Quote Request'}
      </button>
    </form>
  );
};

export default QuoteForm;
