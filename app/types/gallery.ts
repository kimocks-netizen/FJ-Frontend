export interface GalleryItem {
  id: string;
  title: string;
  description?: string;
  cover_image_url?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  images?: GalleryImage[];
}

export interface GalleryImage {
  id: string;
  gallery_item_id: string;
  image_url: string;
  display_order: number;
  created_at: string;
}

export interface GalleryFormData {
  title: string;
  description: string;
  cover_image_url: string;
}
