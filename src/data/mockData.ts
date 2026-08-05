import { Pharmacy, Medicine, PharmacyMedicine, SearchLog } from '../types';

export const INITIAL_PHARMACIES: Pharmacy[] = [
  {
    id: 'pharm-1',
    name: 'MediCare Central Pharmacy',
    address: '142 Main Street, City Centre',
    latitude: -26.2041,
    longitude: 28.0473,
    phone: '+27 11 555 0101',
    opening_hours: { open: '07:30', close: '21:00', days: 'Mon - Sun' },
    medical_aids: ['Discovery Health', 'Bonitas', 'Momentum', 'Medshield', 'GEMS'],
    status: 'active',
    rating: 4.8,
    featured: true,
  },
  {
    id: 'pharm-2',
    name: 'Clicks Pharmacy - Northside Mall',
    address: 'Shop 24, Northside Shopping Centre, Northern Heights',
    latitude: -26.1850,
    longitude: 28.0550,
    phone: '+27 11 555 0102',
    opening_hours: { open: '08:00', close: '19:00', days: 'Mon - Sat' },
    medical_aids: ['Discovery Health', 'Bonitas', 'Bestmed', 'Fedhealth'],
    status: 'active',
    rating: 4.6,
  },
  {
    id: 'pharm-3',
    name: 'Dis-Chem Pharmacy - West End',
    address: '45 Sunset Boulevard, West End',
    latitude: -26.2100,
    longitude: 28.0200,
    phone: '+27 11 555 0103',
    opening_hours: { open: '08:00', close: '20:00', days: 'Mon - Sun' },
    medical_aids: ['Discovery Health', 'Momentum', 'Medshield', 'GEMS', 'Keyhealth'],
    status: 'active',
    rating: 4.7,
  },
  {
    id: 'pharm-4',
    name: 'HealthPlus Community Chemist',
    address: '88 Oak Avenue, Eastside District',
    latitude: -26.1950,
    longitude: 28.0800,
    phone: '+27 11 555 0104',
    opening_hours: { open: '08:30', close: '18:00', days: 'Mon - Fri' },
    medical_aids: ['Bonitas', 'GEMS', 'Sizamake Health'],
    status: 'active',
    rating: 4.4,
  },
  {
    id: 'pharm-5',
    name: '24/7 LifeLine Emergency Pharmacy',
    address: '12 Hospital Drive, Medical Precinct',
    latitude: -26.1990,
    longitude: 28.0400,
    phone: '+27 11 555 9999',
    opening_hours: { open: '00:00', close: '23:59', days: '24/7 Every Day' },
    medical_aids: ['Discovery Health', 'Bonitas', 'Momentum', 'Medshield', 'GEMS', 'Bestmed', 'Fedhealth'],
    status: 'active',
    rating: 4.9,
    featured: true,
  },
  {
    id: 'pharm-6',
    name: 'GreenCross Wellness Pharmacy',
    address: '302 Park Road, Southside Suburbs',
    latitude: -26.2300,
    longitude: 28.0600,
    phone: '+27 11 555 0106',
    opening_hours: { open: '08:00', close: '18:30', days: 'Mon - Sat' },
    medical_aids: ['Discovery Health', 'Bonitas', 'Momentum'],
    status: 'active',
    rating: 4.5,
  }
];

export const INITIAL_MEDICINES: Medicine[] = [
  { id: 'med-1', name: 'Panado', generic_name: 'Paracetamol', category: 'Over-the-Counter', dosage: '500mg (24 Tablets)', description: 'Fast relief for mild to moderate pain and fever reduction.' },
  { id: 'med-2', name: 'Nurofen Express', generic_name: 'Ibuprofen', category: 'Over-the-Counter', dosage: '400mg (12 Softgels)', description: 'Anti-inflammatory pain relief for headaches, fever, and muscle aches.' },
  { id: 'med-3', name: 'Amoxil', generic_name: 'Amoxicillin', category: 'Prescription', dosage: '500mg Capsules', description: 'Broad-spectrum penicillin antibiotic for bacterial infections.' },
  { id: 'med-4', name: 'Zyrtec', generic_name: 'Cetirizine HCI', category: 'Over-the-Counter', dosage: '10mg (10 Tablets)', description: 'Non-drowsy 24-hour allergy relief for hay fever and sneezing.' },
  { id: 'med-5', name: 'Ventolin Inhaler', generic_name: 'Salbutamol', category: 'Prescription', dosage: '100mcg (200 Doses)', description: 'Bronchodilator for rapid relief of asthma symptoms and wheezing.' },
  { id: 'med-6', name: 'Glucophage', generic_name: 'Metformin Hydrochloride', category: 'Chronic Care', dosage: '850mg (56 Tablets)', description: 'Oral antidiabetic medication for Type 2 diabetes management.' },
  { id: 'med-7', name: 'Losec', generic_name: 'Omeprazole', category: 'Over-the-Counter', dosage: '20mg (14 Capsules)', description: 'Proton pump inhibitor for heartburn and acid reflux relief.' },
  { id: 'med-8', name: 'Benylin 4-Flu', generic_name: 'Paracetamol / Pseudoephedrine', category: 'Over-the-Counter', dosage: '200ml Syrup', description: 'Multi-symptom relief for flu, severe congestion, and body aches.' },
  { id: 'med-9', name: 'Adco-Co-Codamol', generic_name: 'Codeine / Paracetamol', category: 'Prescription', dosage: '20 Tablets', description: 'Analgesic combination for moderate to severe pain.' },
  { id: 'med-10', name: 'Co-Diovan', generic_name: 'Valsartan / Hydrochlorothiazide', category: 'Chronic Care', dosage: '160mg/12.5mg (28 Tablets)', description: 'Antihypertensive combination for high blood pressure control.' },
  { id: 'med-11', name: 'Corenza C', generic_name: 'Phenylephrine / Vitamin C', category: 'Over-the-Counter', dosage: '10 Effervescent Tablets', description: 'Effervescent fizzy tablets for rapid cold and flu symptom relief.' },
  { id: 'med-12', name: 'Augmentin', generic_name: 'Amoxicillin / Clavulanate', category: 'Prescription', dosage: '1000mg (14 Tablets)', description: 'Potent combination antibiotic for complex respiratory and sinus infections.' },
];

export const INITIAL_INVENTORY: PharmacyMedicine[] = [
  // Pharm 1 - MediCare Central
  { pharmacy_id: 'pharm-1', medicine_id: 'med-1', price: 4.50, stock_quantity: 45, stock_status: 'in_stock', last_updated: '2026-08-03T08:00:00Z' },
  { pharmacy_id: 'pharm-1', medicine_id: 'med-2', price: 6.20, stock_quantity: 18, stock_status: 'in_stock', last_updated: '2026-08-03T08:00:00Z' },
  { pharmacy_id: 'pharm-1', medicine_id: 'med-3', price: 12.80, stock_quantity: 8, stock_status: 'low_stock', last_updated: '2026-08-03T08:00:00Z' },
  { pharmacy_id: 'pharm-1', medicine_id: 'med-5', price: 15.00, stock_quantity: 30, stock_status: 'in_stock', last_updated: '2026-08-03T08:00:00Z' },
  { pharmacy_id: 'pharm-1', medicine_id: 'med-8', price: 8.90, stock_quantity: 5, stock_status: 'low_stock', last_updated: '2026-08-03T08:00:00Z' },
  { pharmacy_id: 'pharm-1', medicine_id: 'med-11', price: 5.50, stock_quantity: 0, stock_status: 'out_of_stock', last_updated: '2026-08-03T08:00:00Z' },

  // Pharm 2 - Clicks Northside
  { pharmacy_id: 'pharm-2', medicine_id: 'med-1', price: 4.20, stock_quantity: 3, stock_status: 'low_stock', last_updated: '2026-08-03T09:00:00Z' },
  { pharmacy_id: 'pharm-2', medicine_id: 'med-2', price: 5.90, stock_quantity: 0, stock_status: 'out_of_stock', last_updated: '2026-08-03T09:00:00Z' },
  { pharmacy_id: 'pharm-2', medicine_id: 'med-8', price: 8.50, stock_quantity: 0, stock_status: 'out_of_stock', last_updated: '2026-08-03T09:00:00Z' },
  { pharmacy_id: 'pharm-2', medicine_id: 'med-11', price: 5.20, stock_quantity: 2, stock_status: 'low_stock', last_updated: '2026-08-03T09:00:00Z' },

  // Pharm 3 - Dis-Chem West End
  { pharmacy_id: 'pharm-3', medicine_id: 'med-1', price: 4.10, stock_quantity: 80, stock_status: 'in_stock', last_updated: '2026-08-03T07:30:00Z' },
  { pharmacy_id: 'pharm-3', medicine_id: 'med-4', price: 7.50, stock_quantity: 25, stock_status: 'in_stock', last_updated: '2026-08-03T07:30:00Z' },
  { pharmacy_id: 'pharm-3', medicine_id: 'med-6', price: 14.20, stock_quantity: 40, stock_status: 'in_stock', last_updated: '2026-08-03T07:30:00Z' },
  { pharmacy_id: 'pharm-3', medicine_id: 'med-7', price: 9.80, stock_quantity: 19, stock_status: 'in_stock', last_updated: '2026-08-03T07:30:00Z' },

  // Pharm 4 - HealthPlus Eastside
  { pharmacy_id: 'pharm-4', medicine_id: 'med-1', price: 4.80, stock_quantity: 12, stock_status: 'in_stock', last_updated: '2026-08-02T16:00:00Z' },
  { pharmacy_id: 'pharm-4', medicine_id: 'med-3', price: 13.50, stock_quantity: 15, stock_status: 'in_stock', last_updated: '2026-08-02T16:00:00Z' },
  { pharmacy_id: 'pharm-4', medicine_id: 'med-12', price: 21.00, stock_quantity: 6, stock_status: 'low_stock', last_updated: '2026-08-02T16:00:00Z' },

  // Pharm 5 - 24/7 LifeLine
  { pharmacy_id: 'pharm-5', medicine_id: 'med-1', price: 4.90, stock_quantity: 120, stock_status: 'in_stock', last_updated: '2026-08-03T10:00:00Z' },
  { pharmacy_id: 'pharm-5', medicine_id: 'med-2', price: 6.80, stock_quantity: 50, stock_status: 'in_stock', last_updated: '2026-08-03T10:00:00Z' },
  { pharmacy_id: 'pharm-5', medicine_id: 'med-5', price: 16.50, stock_quantity: 35, stock_status: 'in_stock', last_updated: '2026-08-03T10:00:00Z' },
  { pharmacy_id: 'pharm-5', medicine_id: 'med-8', price: 9.50, stock_quantity: 28, stock_status: 'in_stock', last_updated: '2026-08-03T10:00:00Z' },
  { pharmacy_id: 'pharm-5', medicine_id: 'med-11', price: 5.90, stock_quantity: 40, stock_status: 'in_stock', last_updated: '2026-08-03T10:00:00Z' },

  // Pharm 6 - GreenCross Southside
  { pharmacy_id: 'pharm-6', medicine_id: 'med-1', price: 4.40, stock_quantity: 20, stock_status: 'in_stock', last_updated: '2026-08-03T08:15:00Z' },
  { pharmacy_id: 'pharm-6', medicine_id: 'med-6', price: 13.90, stock_quantity: 15, stock_status: 'in_stock', last_updated: '2026-08-03T08:15:00Z' },
  { pharmacy_id: 'pharm-6', medicine_id: 'med-10', price: 18.50, stock_quantity: 10, stock_status: 'in_stock', last_updated: '2026-08-03T08:15:00Z' },
];

export const INITIAL_SEARCH_LOGS: SearchLog[] = [
  ...Array.from({ length: 42 }).map((_, i) => ({
    id: `log-north-${i}`,
    medicine_name: i % 2 === 0 ? 'Benylin 4-Flu' : 'Panado',
    category: 'Over-the-Counter',
    latitude: -26.1850 + (Math.random() - 0.5) * 0.02,
    longitude: 28.0550 + (Math.random() - 0.5) * 0.02,
    region: 'Northern District',
    timestamp: new Date(Date.now() - Math.floor(Math.random() * 48 * 3600 * 1000)).toISOString(),
    session_id: `anon-sess-${Math.floor(Math.random() * 1000)}`,
  })),
  ...Array.from({ length: 15 }).map((_, i) => ({
    id: `log-central-${i}`,
    medicine_name: ['Zyrtec', 'Glucophage', 'Panado', 'Losec'][i % 4],
    category: 'General',
    latitude: -26.2041 + (Math.random() - 0.5) * 0.02,
    longitude: 28.0473 + (Math.random() - 0.5) * 0.02,
    region: 'Central District',
    timestamp: new Date(Date.now() - Math.floor(Math.random() * 72 * 3600 * 1000)).toISOString(),
    session_id: `anon-sess-${Math.floor(Math.random() * 1000)}`,
  })),
  ...Array.from({ length: 12 }).map((_, i) => ({
    id: `log-west-${i}`,
    medicine_name: ['Nurofen Express', 'Ventolin Inhaler', 'Panado'][i % 3],
    category: 'General',
    latitude: -26.2100 + (Math.random() - 0.5) * 0.02,
    longitude: 28.0200 + (Math.random() - 0.5) * 0.02,
    region: 'West End',
    timestamp: new Date(Date.now() - Math.floor(Math.random() * 72 * 3600 * 1000)).toISOString(),
    session_id: `anon-sess-${Math.floor(Math.random() * 1000)}`,
  })),
];

export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}
