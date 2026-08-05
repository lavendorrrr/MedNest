export interface Pharmacy {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  opening_hours: {
    open: string;
    close: string;
    days: string;
  };
  medical_aids: string[];
  status: 'active' | 'inactive';
  rating: number;
  featured?: boolean;
}

export interface Medicine {
  id: string;
  name: string;
  generic_name: string;
  category: 'Prescription' | 'Over-the-Counter' | 'Chronic Care' | 'First Aid' | 'Vitamins';
  description?: string;
  dosage?: string;
}

export interface PharmacyMedicine {
  pharmacy_id: string;
  medicine_id: string;
  price: number;
  stock_quantity: number;
  stock_status: 'in_stock' | 'low_stock' | 'out_of_stock';
  last_updated: string;
  medicine?: Medicine;
}

export interface SearchResultItem {
  pharmacy: Pharmacy;
  distance_km: number;
  inventory_matches: PharmacyMedicine[];
  matched_medicine: Medicine | null;
  lowest_price: number | null;
}

export interface SearchResponse {
  query: string;
  user_location: { latitude: number; longitude: number };
  matched_medicines: Medicine[];
  total_pharmacies: number;
  results: SearchResultItem[];
}

export interface SearchLog {
  id: string;
  medicine_name: string;
  category?: string;
  latitude: number;
  longitude: number;
  region: string;
  timestamp: string;
  session_id: string;
}

export interface OutbreakAlert {
  region: string;
  severity: 'HIGH' | 'MODERATE' | 'LOW';
  title: string;
  description: string;
  primary_symptoms: string[];
  total_triggers: number;
}

export interface OutbreakData {
  total_logs: number;
  regional_breakdown: Record<string, {
    total_searches: number;
    top_medicines: Record<string, number>;
    categories: Record<string, number>;
  }>;
  outbreak_alerts: OutbreakAlert[];
}

export interface UserLocation {
  name: string;
  latitude: number;
  longitude: number;
}
