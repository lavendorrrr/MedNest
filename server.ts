import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Shared Gemini AI setup
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// --- DATA STRUCTURES & SEED DATA ---

export interface Pharmacy {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  opening_hours: {
    open: string;  // e.g. "08:00"
    close: string; // e.g. "20:00"
    days: string;  // e.g. "Mon - Sat"
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
  price: number; // in USD or ZAR currency
  stock_quantity: number;
  stock_status: 'in_stock' | 'low_stock' | 'out_of_stock';
  last_updated: string;
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

// Initial Pharmacies
const pharmacies: Pharmacy[] = [
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

// Initial Medicines
const medicines: Medicine[] = [
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

// Inventory mappings
const inventory: PharmacyMedicine[] = [
  // Pharm 1 - MediCare Central
  { pharmacy_id: 'pharm-1', medicine_id: 'med-1', price: 4.50, stock_quantity: 45, stock_status: 'in_stock', last_updated: '2026-08-03T08:00:00Z' },
  { pharmacy_id: 'pharm-1', medicine_id: 'med-2', price: 6.20, stock_quantity: 18, stock_status: 'in_stock', last_updated: '2026-08-03T08:00:00Z' },
  { pharmacy_id: 'pharm-1', medicine_id: 'med-3', price: 12.80, stock_quantity: 8, stock_status: 'low_stock', last_updated: '2026-08-03T08:00:00Z' },
  { pharmacy_id: 'pharm-1', medicine_id: 'med-5', price: 15.00, stock_quantity: 30, stock_status: 'in_stock', last_updated: '2026-08-03T08:00:00Z' },
  { pharmacy_id: 'pharm-1', medicine_id: 'med-8', price: 8.90, stock_quantity: 5, stock_status: 'low_stock', last_updated: '2026-08-03T08:00:00Z' },
  { pharmacy_id: 'pharm-1', medicine_id: 'med-11', price: 5.50, stock_quantity: 0, stock_status: 'out_of_stock', last_updated: '2026-08-03T08:00:00Z' },

  // Pharm 2 - Clicks Northside (Notice high demand / low stock in Northern district for cold/flu)
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

// Pre-seeded anonymized search logs showing realistic outbreak spike in Northern District
const searchLogs: SearchLog[] = [
  // Spike in Northern Heights region over past 48h for flu/fever meds
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
  // Normal baseline searches in Central District
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
  // West End searches
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

// Distance helper (Haversine formula in KM)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
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

// --- API ENDPOINTS ---

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'MedNest API' });
});

// Search medicines (Autocomplete & catalogue)
app.get('/api/medicines', (req, res) => {
  const q = (req.query.q as string || '').toLowerCase().trim();
  if (!q) {
    return res.json(medicines);
  }
  const filtered = medicines.filter(m =>
    m.name.toLowerCase().includes(q) ||
    m.generic_name.toLowerCase().includes(q) ||
    m.category.toLowerCase().includes(q)
  );
  res.json(filtered);
});

// Get medicine search results with pharmacy listings & distance
app.get('/api/search', (req, res) => {
  const query = (req.query.q as string || '').toLowerCase().trim();
  const userLat = parseFloat(req.query.lat as string) || -26.2041;
  const userLng = parseFloat(req.query.lng as string) || 28.0473;
  const medicalAid = req.query.medical_aid as string;
  const maxDistance = parseFloat(req.query.max_distance as string) || 50;
  const inStockOnly = req.query.in_stock === 'true';
  const openNowOnly = req.query.open_now === 'true';
  const sortBy = req.query.sort as string || 'distance'; // 'distance' | 'price' | 'rating'

  // Match medicine first
  let matchedMeds = medicines.filter(m =>
    m.name.toLowerCase().includes(query) ||
    m.generic_name.toLowerCase().includes(query) ||
    m.category.toLowerCase().includes(query)
  );

  if (matchedMeds.length === 0 && query.length > 2) {
    // Partial substring fallback
    matchedMeds = medicines.filter(m =>
      m.name.toLowerCase().slice(0, 3) === query.slice(0, 3) ||
      m.generic_name.toLowerCase().slice(0, 3) === query.slice(0, 3)
    );
  }

  const matchedMedIds = new Set(matchedMeds.map(m => m.id));

  // Build results per pharmacy
  const results = pharmacies
    .filter(p => p.status === 'active')
    .map(pharmacy => {
      const distance = calculateDistance(userLat, userLng, pharmacy.latitude, pharmacy.longitude);

      // Find relevant inventory items
      const pharmacyItems = inventory
        .filter(inv => inv.pharmacy_id === pharmacy.id && (matchedMedIds.size === 0 || matchedMedIds.has(inv.medicine_id)))
        .map(inv => {
          const med = medicines.find(m => m.id === inv.medicine_id);
          return {
            ...inv,
            medicine: med,
          };
        });

      return {
        pharmacy,
        distance_km: distance,
        inventory_matches: pharmacyItems,
        matched_medicine: pharmacyItems[0]?.medicine || matchedMeds[0] || null,
        lowest_price: pharmacyItems.length > 0 ? Math.min(...pharmacyItems.map(i => i.price)) : null,
      };
    })
    .filter(resItem => {
      if (resItem.distance_km > maxDistance) return false;
      if (medicalAid && !resItem.pharmacy.medical_aids.includes(medicalAid)) return false;
      if (inStockOnly) {
        const hasStock = resItem.inventory_matches.some(i => i.stock_status === 'in_stock');
        if (!hasStock) return false;
      }
      return true;
    });

  // Sort
  if (sortBy === 'price') {
    results.sort((a, b) => (a.lowest_price || 999) - (b.lowest_price || 999));
  } else if (sortBy === 'rating') {
    results.sort((a, b) => b.pharmacy.rating - a.pharmacy.rating);
  } else {
    // default distance
    results.sort((a, b) => a.distance_km - b.distance_km);
  }

  res.json({
    query,
    user_location: { latitude: userLat, longitude: userLng },
    matched_medicines: matchedMeds,
    total_pharmacies: results.length,
    results,
  });
});

// Get all Pharmacies (with inventory count)
app.get('/api/pharmacies', (req, res) => {
  const userLat = parseFloat(req.query.lat as string) || -26.2041;
  const userLng = parseFloat(req.query.lng as string) || 28.0473;

  const list = pharmacies.map(p => {
    const pInventory = inventory.filter(i => i.pharmacy_id === p.id);
    const dist = calculateDistance(userLat, userLng, p.latitude, p.longitude);
    return {
      ...p,
      distance_km: dist,
      inventory_count: pInventory.length,
    };
  });
  res.json(list);
});

// Get single pharmacy details & full inventory catalog
app.get('/api/pharmacies/:id', (req, res) => {
  const pharmacy = pharmacies.find(p => p.id === req.params.id);
  if (!pharmacy) {
    return res.status(404).json({ error: 'Pharmacy not found' });
  }

  const pInventory = inventory
    .filter(i => i.pharmacy_id === pharmacy.id)
    .map(i => ({
      ...i,
      medicine: medicines.find(m => m.id === i.medicine_id),
    }));

  res.json({
    pharmacy,
    inventory: pInventory,
  });
});

// Admin: Register or update pharmacy
app.post('/api/pharmacies', (req, res) => {
  const { name, address, latitude, longitude, phone, opening_hours, medical_aids } = req.body;
  if (!name || !address) {
    return res.status(400).json({ error: 'Name and address are required' });
  }

  const newPharmacy: Pharmacy = {
    id: `pharm-${Date.now()}`,
    name,
    address,
    latitude: parseFloat(latitude) || -26.2041,
    longitude: parseFloat(longitude) || 28.0473,
    phone: phone || '+27 11 555 0000',
    opening_hours: opening_hours || { open: '08:00', close: '18:00', days: 'Mon - Sat' },
    medical_aids: Array.isArray(medical_aids) ? medical_aids : ['Discovery Health', 'Bonitas'],
    status: 'active',
    rating: 5.0,
  };

  pharmacies.push(newPharmacy);
  res.status(201).json(newPharmacy);
});

// Admin: Edit pharmacy
app.put('/api/pharmacies/:id', (req, res) => {
  const index = pharmacies.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Pharmacy not found' });
  }

  pharmacies[index] = {
    ...pharmacies[index],
    ...req.body,
  };

  res.json(pharmacies[index]);
});

// Admin: Toggle active/deactivate
app.delete('/api/pharmacies/:id', (req, res) => {
  const pharmacy = pharmacies.find(p => p.id === req.params.id);
  if (!pharmacy) {
    return res.status(404).json({ error: 'Pharmacy not found' });
  }
  pharmacy.status = pharmacy.status === 'active' ? 'inactive' : 'active';
  res.json({ message: `Pharmacy status updated to ${pharmacy.status}`, pharmacy });
});

// Admin: Update/Add Medicine in Pharmacy Inventory
app.post('/api/pharmacies/:id/inventory', (req, res) => {
  const pharmacyId = req.params.id;
  const { medicine_id, medicine_name, generic_name, category, price, stock_quantity, stock_status } = req.body;

  let medId = medicine_id;

  // If new medicine created on the fly
  if (!medId && medicine_name) {
    const existing = medicines.find(m => m.name.toLowerCase() === medicine_name.toLowerCase());
    if (existing) {
      medId = existing.id;
    } else {
      const newMed: Medicine = {
        id: `med-${Date.now()}`,
        name: medicine_name,
        generic_name: generic_name || medicine_name,
        category: category || 'Over-the-Counter',
      };
      medicines.push(newMed);
      medId = newMed.id;
    }
  }

  if (!medId) {
    return res.status(400).json({ error: 'Medicine ID or Name required' });
  }

  const existingIdx = inventory.findIndex(i => i.pharmacy_id === pharmacyId && i.medicine_id === medId);

  const priceNum = parseFloat(price) || 5.0;
  const qty = parseInt(stock_quantity) || 0;
  const computedStatus = stock_status || (qty > 10 ? 'in_stock' : qty > 0 ? 'low_stock' : 'out_of_stock');

  const invRecord: PharmacyMedicine = {
    pharmacy_id: pharmacyId,
    medicine_id: medId,
    price: priceNum,
    stock_quantity: qty,
    stock_status: computedStatus,
    last_updated: new Date().toISOString(),
  };

  if (existingIdx >= 0) {
    inventory[existingIdx] = invRecord;
  } else {
    inventory.push(invRecord);
  }

  res.json({ message: 'Inventory updated successfully', item: invRecord });
});

// Background Anonymized Search Logging (Disease Outbreak Prediction Telemetry)
app.post('/api/search-logs', (req, res) => {
  const { medicine_name, category, latitude, longitude, opt_out, session_id } = req.body;

  if (opt_out) {
    return res.json({ status: 'opted_out', message: 'Search logging skipped per user privacy settings' });
  }

  if (!medicine_name) {
    return res.status(400).json({ error: 'medicine_name is required' });
  }

  // Deduce approximate region from lat/lng
  const lat = parseFloat(latitude) || -26.2041;
  const lng = parseFloat(longitude) || 28.0473;
  let region = 'Central District';
  if (lat > -26.19) region = 'Northern District';
  else if (lng < 28.03) region = 'West End';
  else if (lng > 28.07) region = 'Eastside District';
  else if (lat < -26.22) region = 'Southside Suburbs';

  const log: SearchLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    medicine_name,
    category: category || 'General',
    latitude: lat,
    longitude: lng,
    region,
    timestamp: new Date().toISOString(),
    session_id: session_id || 'deidentified-device-session',
  };

  searchLogs.push(log);
  res.status(201).json({ status: 'logged', log_id: log.id, region });
});

// Outbreak Prediction Analytics Endpoint
app.get('/api/outbreaks', (req, res) => {
  // Aggregate search logs by region & medicine/category
  const regionalStats: Record<string, { total_searches: number; top_medicines: Record<string, number>; categories: Record<string, number>; logs: SearchLog[] }> = {};

  searchLogs.forEach(log => {
    if (!regionalStats[log.region]) {
      regionalStats[log.region] = {
        total_searches: 0,
        top_medicines: {},
        categories: {},
        logs: [],
      };
    }
    const r = regionalStats[log.region];
    r.total_searches += 1;
    r.top_medicines[log.medicine_name] = (r.top_medicines[log.medicine_name] || 0) + 1;
    const cat = log.category || 'General';
    r.categories[cat] = (r.categories[cat] || 0) + 1;
    r.logs.push(log);
  });

  // Calculate spike alerts (regions with > 25 searches or high volume of cold/flu meds)
  const alerts = Object.entries(regionalStats)
    .filter(([region, data]) => data.total_searches >= 20 || data.top_medicines['Benylin 4-Flu'] > 5 || data.top_medicines['Panado'] > 15)
    .map(([region, data]) => ({
      region,
      severity: data.total_searches > 35 ? 'HIGH' : 'MODERATE',
      title: `Surge in Respiratory & Antipyretic Demand in ${region}`,
      description: `Unusual spike detected: ${data.total_searches} anonymized search triggers in the past 48h. Top searched: ${Object.entries(data.top_medicines).map(([k, v]) => `${k} (${v})`).join(', ')}.`,
      primary_symptoms: ['Fever', 'Cough', 'Body Pain', 'Respiratory Congestion'],
      total_triggers: data.total_searches,
    }));

  res.json({
    total_logs: searchLogs.length,
    regional_breakdown: regionalStats,
    outbreak_alerts: alerts,
  });
});

// Gemini AI Symptom Assistant & Disease Outbreak Report Generation
app.post('/api/ai/symptom-assistant', async (req, res) => {
  const { prompt, mode } = req.body;
  const ai = getGeminiClient();

  if (!ai) {
    return res.json({
      fallback: true,
      text: "Based on common medical guidelines, for fever and body pain, Paracetamol (Panado) or Ibuprofen (Nurofen) are commonly recommended. Please consult a qualified doctor or pharmacist.",
      recommended_medicines: ['Panado', 'Nurofen Express', 'Benylin 4-Flu']
    });
  }

  try {
    if (mode === 'outbreak_report') {
      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: `You are an epidemiologist and public health analyst for MedNest.
Analyze the following medicine demand logs collected anonymized from user searches:
Total Logs: ${searchLogs.length}
Spike Data: ${JSON.stringify(searchLogs.slice(-30))}

Provide a brief, structured Public Health Outbreak Radar summary (max 3 short bullet points) explaining:
1. Primary suspected condition (e.g. Influenza A, Upper Respiratory Tract Infection).
2. Affected hotspot region.
3. Recommended public health advice and inventory stock recommendation for local pharmacies.`,
      });
      return res.json({ response: response.text });
    }

    // Default: Patient Symptom Helper
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `You are MedNest's AI Medicine Finder Assistant.
The user describes these symptoms or needs: "${prompt}".
Available medicines in MedNest catalog:
- Panado (Paracetamol) [Pain, Fever]
- Nurofen Express (Ibuprofen) [Pain, Inflammation]
- Zyrtec (Cetirizine) [Allergy, Sneezing]
- Benylin 4-Flu (Paracetamol/Pseudoephedrine) [Flu, Severe Congestion]
- Ventolin Inhaler (Salbutamol) [Asthma, Wheezing]
- Losec (Omeprazole) [Heartburn, Acid Reflux]

Respond with a friendly, helpful 2-sentence guidance note identifying candidate medicine names that match, and ALWAYS include a clear medical disclaimer to consult a healthcare practitioner. Return structured JSON with keys: 'guidance', 'recommended_medicines' (array of exact string names from catalog).`,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (err: any) {
    console.error('Gemini API Error:', err);
    res.status(500).json({
      error: 'AI assistant service temporary error',
      fallback_guidance: 'For symptom analysis, please consult your pharmacist or healthcare provider.',
      recommended_medicines: ['Panado', 'Nurofen Express'],
    });
  }
});

// Vite Integration for dev & production static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MedNest server active on http://localhost:${PORT}`);
  });
}

startServer();
