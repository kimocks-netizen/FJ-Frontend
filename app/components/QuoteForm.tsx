'use client';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useState, useEffect } from 'react';
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

        await axios.post(API_ENDPOINTS.PUBLIC_QUOTES, {
          name: values.name, phone: formattedPhone, email: values.email,
          service_required: values.service_required, location: values.location,
          message: values.message, images: [], status: 'pending',
        });

        showToast('Quote request sent! We will contact you within 24 hours.', 'success');
        resetForm();
      } catch (err) {
        console.error(err);
        showToast('Failed to send quote. Please try WhatsApp instead.', 'error');
      }
    },
  });

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

      {/* Image upload hidden — admin can request photos via WhatsApp */}

      <button type="submit" disabled={formik.isSubmitting} className="w-full bg-accent hover:bg-accent-dark text-white py-3 rounded-[7px] font-bold text-xs uppercase tracking-wide transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed">
        {formik.isSubmitting ? 'Sending...' : 'Send Quote Request'}
      </button>
    </form>
  );
};

export default QuoteForm;
