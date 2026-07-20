export interface ServiceItem {
  id: string;
  title: string;
  description?: string;
  image_url?: string;
  details?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServiceFormData {
  title: string;
  description: string;
  image_url: string;
  details: string;
}
