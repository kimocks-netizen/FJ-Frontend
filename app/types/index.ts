export interface Quote {
  id: string;
  name: string;
  phone: string;
  email?: string;
  service_required: string;
  location: string;
  message?: string;
  images?: string[];
  status: 'Pending' | 'Contacted' | 'Completed';
  created_at: string;
}

export interface Service {
  title: string;
  description: string;
  image: string;
  details: string;
}
