import { Pharmacy, Medicine, PharmacyMedicine, SearchResponse, SearchResultItem, SearchLog, OutbreakData } from '../types';
import { INITIAL_PHARMACIES, INITIAL_MEDICINES, INITIAL_INVENTORY, INITIAL_SEARCH_LOGS, calculateDistance } from '../data/mockData';

// Local storage state keys for purely static client execution (GitHub Pages)
const PHARMACIES_KEY = 'mednest_local_pharmacies';
const MEDICINES_KEY = 'mednest_local_medicines';
const INVENTORY_KEY = 'mednest_local_inventory';
const SEARCH_LOGS_KEY = 'mednest_local_search_logs';

function getLocalPharmacies(): Pharmacy[] {
  try {
    const saved = localStorage.getItem(PHARMACIES_KEY);
    return saved ? JSON.parse(saved) : INITIAL_PHARMACIES;
  } catch {
    return INITIAL_PHARMACIES;
  }
}

function saveLocalPharmacies(list: Pharmacy[]) {
  try {
    localStorage.setItem(PHARMACIES_KEY, JSON.stringify(list));
  } catch {}
}

function getLocalMedicines(): Medicine[] {
  try {
    const saved = localStorage.getItem(MEDICINES_KEY);
    return saved ? JSON.parse(saved) : INITIAL_MEDICINES;
  } catch {
    return INITIAL_MEDICINES;
  }
}

function saveLocalMedicines(list: Medicine[]) {
  try {
    localStorage.setItem(MEDICINES_KEY, JSON.stringify(list));
  } catch {}
}

function getLocalInventory(): PharmacyMedicine[] {
  try {
    const saved = localStorage.getItem(INVENTORY_KEY);
    return saved ? JSON.parse(saved) : INITIAL_INVENTORY;
  } catch {
    return INITIAL_INVENTORY;
  }
}

function saveLocalInventory(list: PharmacyMedicine[]) {
  try {
    localStorage.setItem(INVENTORY_KEY, JSON.stringify(list));
  } catch {}
}

function getLocalSearchLogs(): SearchLog[] {
  try {
    const saved = localStorage.getItem(SEARCH_LOGS_KEY);
    return saved ? JSON.parse(saved) : INITIAL_SEARCH_LOGS;
  } catch {
    return INITIAL_SEARCH_LOGS;
  }
}

function saveLocalSearchLogs(logs: SearchLog[]) {
  try {
    localStorage.setItem(SEARCH_LOGS_KEY, JSON.stringify(logs));
  } catch {}
}

// 1. Search Medicines with Pharmacy Stock & Distances
export async function searchMedicinesApi(options: {
  q: string;
  userLat: number;
  userLng: number;
  medicalAid?: string;
  maxDistance?: number;
  inStockOnly?: boolean;
  openNowOnly?: boolean;
  sortBy?: string;
}): Promise<SearchResponse> {
  const query = options.q.trim();
  const maxDistance = options.maxDistance || 50;
  const sortBy = options.sortBy || 'distance';

  const params = new URLSearchParams({
    q: query,
    lat: String(options.userLat),
    lng: String(options.userLng),
    max_distance: String(maxDistance),
    in_stock: String(options.inStockOnly || false),
    open_now: String(options.openNowOnly || false),
    sort: sortBy,
  });
  if (options.medicalAid) params.append('medical_aid', options.medicalAid);

  try {
    const res = await fetch(`/api/search?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.results)) {
        return data;
      }
    }
  } catch (e) {
    console.warn('API route /api/search unavailable (running in static GitHub Pages mode). Falling back to client-side data.');
  }

  // --- CLIENT SIDE FALLBACK (For GitHub Pages / Static hosting) ---
  const pharmacies = getLocalPharmacies();
  const medicines = getLocalMedicines();
  const inventory = getLocalInventory();

  const qLower = query.toLowerCase();
  let matchedMeds = medicines.filter(m =>
    m.name.toLowerCase().includes(qLower) ||
    m.generic_name.toLowerCase().includes(qLower) ||
    m.category.toLowerCase().includes(qLower)
  );

  if (matchedMeds.length === 0 && qLower.length > 2) {
    matchedMeds = medicines.filter(m =>
      m.name.toLowerCase().slice(0, 3) === qLower.slice(0, 3) ||
      m.generic_name.toLowerCase().slice(0, 3) === qLower.slice(0, 3)
    );
  }

  const matchedMedIds = new Set(matchedMeds.map(m => m.id));

  const results: SearchResultItem[] = pharmacies
    .filter(p => p.status === 'active')
    .map(pharmacy => {
      const dist = calculateDistance(options.userLat, options.userLng, pharmacy.latitude, pharmacy.longitude);

      const pharmacyItems = inventory
        .filter(inv => inv.pharmacy_id === pharmacy.id && (matchedMedIds.size === 0 || matchedMedIds.has(inv.medicine_id)))
        .map(inv => ({
          ...inv,
          medicine: medicines.find(m => m.id === inv.medicine_id),
        }));

      return {
        pharmacy,
        distance_km: dist,
        inventory_matches: pharmacyItems,
        matched_medicine: pharmacyItems[0]?.medicine || matchedMeds[0] || null,
        lowest_price: pharmacyItems.length > 0 ? Math.min(...pharmacyItems.map(i => i.price)) : null,
      };
    })
    .filter(resItem => {
      if (resItem.distance_km > maxDistance) return false;
      if (options.medicalAid && !resItem.pharmacy.medical_aids.includes(options.medicalAid)) return false;
      if (options.inStockOnly) {
        const hasStock = resItem.inventory_matches.some(i => i.stock_status === 'in_stock');
        if (!hasStock) return false;
      }
      return true;
    });

  if (sortBy === 'price') {
    results.sort((a, b) => (a.lowest_price || 999) - (b.lowest_price || 999));
  } else if (sortBy === 'rating') {
    results.sort((a, b) => b.pharmacy.rating - a.pharmacy.rating);
  } else {
    results.sort((a, b) => a.distance_km - b.distance_km);
  }

  return {
    query,
    user_location: { latitude: options.userLat, longitude: options.userLng },
    matched_medicines: matchedMeds,
    total_pharmacies: results.length,
    results,
  };
}

// 2. Fetch all pharmacies
export async function fetchPharmaciesApi(userLat = -26.2041, userLng = 28.0473): Promise<Pharmacy[]> {
  try {
    const res = await fetch(`/api/pharmacies?lat=${userLat}&lng=${userLng}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) return data;
    }
  } catch (e) {
    console.warn('API route /api/pharmacies unavailable. Falling back to local data.');
  }

  const pharmacies = getLocalPharmacies();
  return pharmacies.map(p => ({
    ...p,
    distance_km: calculateDistance(userLat, userLng, p.latitude, p.longitude),
  }));
}

// 3. Fetch Pharmacy Details & Inventory
export async function fetchPharmacyDetailApi(pharmacyId: string): Promise<{ pharmacy: Pharmacy; inventory: PharmacyMedicine[] }> {
  try {
    const res = await fetch(`/api/pharmacies/${pharmacyId}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.pharmacy) return data;
    }
  } catch (e) {
    console.warn('API route /api/pharmacies/:id unavailable. Falling back to local data.');
  }

  const pharmacies = getLocalPharmacies();
  const medicines = getLocalMedicines();
  const inventory = getLocalInventory();

  const pharmacy = pharmacies.find(p => p.id === pharmacyId) || pharmacies[0];
  const pInventory = inventory
    .filter(i => i.pharmacy_id === pharmacy.id)
    .map(i => ({
      ...i,
      medicine: medicines.find(m => m.id === i.medicine_id),
    }));

  return { pharmacy, inventory: pInventory };
}

// 4. Admin Create Pharmacy
export async function createPharmacyApi(pharmData: Partial<Pharmacy>): Promise<Pharmacy> {
  try {
    const res = await fetch('/api/pharmacies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pharmData),
    });
    if (res.ok) {
      const created = await res.json();
      if (created && created.id) return created;
    }
  } catch (e) {
    console.warn('API /api/pharmacies POST unavailable. Saving locally.');
  }

  const pharmacies = getLocalPharmacies();
  const newPharmacy: Pharmacy = {
    id: `pharm-${Date.now()}`,
    name: pharmData.name || 'New Pharmacy Branch',
    address: pharmData.address || '123 Health Street',
    latitude: pharmData.latitude || -26.2041,
    longitude: pharmData.longitude || 28.0473,
    phone: pharmData.phone || '+27 11 555 0000',
    opening_hours: pharmData.opening_hours || { open: '08:00', close: '18:00', days: 'Mon - Sat' },
    medical_aids: pharmData.medical_aids || ['Discovery Health', 'Bonitas'],
    status: 'active',
    rating: 5.0,
  };

  pharmacies.push(newPharmacy);
  saveLocalPharmacies(pharmacies);
  return newPharmacy;
}

// 5. Admin Toggle Status
export async function togglePharmacyStatusApi(pharmacyId: string): Promise<void> {
  try {
    const res = await fetch(`/api/pharmacies/${pharmacyId}`, { method: 'DELETE' });
    if (res.ok) return;
  } catch (e) {
    console.warn('API DELETE /api/pharmacies unavailable. Updating locally.');
  }

  const pharmacies = getLocalPharmacies();
  const p = pharmacies.find(item => item.id === pharmacyId);
  if (p) {
    p.status = p.status === 'active' ? 'inactive' : 'active';
    saveLocalPharmacies(pharmacies);
  }
}

// 6. Admin Inventory Save Item
export async function saveInventoryItemApi(pharmacyId: string, itemData: any): Promise<void> {
  try {
    const res = await fetch(`/api/pharmacies/${pharmacyId}/inventory`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(itemData),
    });
    if (res.ok) return;
  } catch (e) {
    console.warn('API /api/pharmacies/:id/inventory POST unavailable. Saving locally.');
  }

  const medicines = getLocalMedicines();
  const inventory = getLocalInventory();

  let medId = itemData.medicine_id;
  if (!medId && itemData.medicine_name) {
    const existing = medicines.find(m => m.name.toLowerCase() === itemData.medicine_name.toLowerCase());
    if (existing) {
      medId = existing.id;
    } else {
      const newMed: Medicine = {
        id: `med-${Date.now()}`,
        name: itemData.medicine_name,
        generic_name: itemData.generic_name || itemData.medicine_name,
        category: itemData.category || 'Over-the-Counter',
      };
      medicines.push(newMed);
      saveLocalMedicines(medicines);
      medId = newMed.id;
    }
  }

  const idx = inventory.findIndex(i => i.pharmacy_id === pharmacyId && i.medicine_id === medId);
  const record: PharmacyMedicine = {
    pharmacy_id: pharmacyId,
    medicine_id: medId,
    price: parseFloat(itemData.price) || 5.0,
    stock_quantity: parseInt(itemData.stock_quantity) || 0,
    stock_status: itemData.stock_status || 'in_stock',
    last_updated: new Date().toISOString(),
  };

  if (idx >= 0) {
    inventory[idx] = record;
  } else {
    inventory.push(record);
  }
  saveLocalInventory(inventory);
}

// 7. Search Telemetry Log
export async function logSearchTelemetryApi(data: {
  medicine_name: string;
  latitude: number;
  longitude: number;
  opt_out: boolean;
  session_id: string;
}) {
  if (data.opt_out) return;

  try {
    await fetch('/api/search-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch (e) {
    // Local telemetry log
    const logs = getLocalSearchLogs();
    const lat = data.latitude;
    const lng = data.longitude;
    let region = 'Central District';
    if (lat > -26.19) region = 'Northern District';
    else if (lng < 28.03) region = 'West End';
    else if (lng > 28.07) region = 'Eastside District';
    else if (lat < -26.22) region = 'Southside Suburbs';

    logs.push({
      id: `log-${Date.now()}`,
      medicine_name: data.medicine_name,
      category: 'General',
      latitude: lat,
      longitude: lng,
      region,
      timestamp: new Date().toISOString(),
      session_id: data.session_id,
    });
    saveLocalSearchLogs(logs);
  }
}

// 8. Fetch Outbreak Radar Data
export async function fetchOutbreaksApi(): Promise<OutbreakData> {
  try {
    const res = await fetch('/api/outbreaks');
    if (res.ok) {
      const data = await res.json();
      if (data && data.regional_breakdown) return data;
    }
  } catch (e) {
    console.warn('API /api/outbreaks unavailable. Calculating locally.');
  }

  const logs = getLocalSearchLogs();
  const regionalStats: Record<string, { total_searches: number; top_medicines: Record<string, number>; categories: Record<string, number> }> = {};

  logs.forEach(log => {
    if (!regionalStats[log.region]) {
      regionalStats[log.region] = {
        total_searches: 0,
        top_medicines: {},
        categories: {},
      };
    }
    const r = regionalStats[log.region];
    r.total_searches += 1;
    r.top_medicines[log.medicine_name] = (r.top_medicines[log.medicine_name] || 0) + 1;
    const cat = log.category || 'General';
    r.categories[cat] = (r.categories[cat] || 0) + 1;
  });

  const alerts = Object.entries(regionalStats)
    .filter(([_, data]) => data.total_searches >= 15 || (data.top_medicines['Benylin 4-Flu'] || 0) >= 4)
    .map(([region, data]) => ({
      region,
      severity: (data.total_searches > 30 ? 'HIGH' : 'MODERATE') as 'HIGH' | 'MODERATE' | 'LOW',
      title: `Surge in Respiratory & Antipyretic Demand in ${region}`,
      description: `Surveillance spike detected: ${data.total_searches} anonymized search triggers. Top searched: ${Object.entries(data.top_medicines).map(([k, v]) => `${k} (${v})`).join(', ')}.`,
      primary_symptoms: ['Fever', 'Cough', 'Body Pain', 'Respiratory Congestion'],
      total_triggers: data.total_searches,
    }));

  return {
    total_logs: logs.length,
    regional_breakdown: regionalStats,
    outbreak_alerts: alerts,
  };
}

// 9. AI Symptom Assistant / Outbreak Report
export async function analyzeSymptomsWithAiApi(prompt: string, mode?: string): Promise<any> {
  try {
    const res = await fetch('/api/ai/symptom-assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, mode }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data) return data;
    }
  } catch (e) {
    console.warn('API /api/ai/symptom-assistant unavailable. Returning local AI guidance.');
  }

  if (mode === 'outbreak_report') {
    return {
      response: `1. Primary Suspected Condition: Upper Respiratory Viral Infection / Influenza A surge.\n2. Hotspot Region: Northern Heights District (High search volume for Benylin 4-Flu & Paracetamol).\n3. Recommendation: Local pharmacies should restock antipyretic suspensions and cold/flu remedies; public health clinics advised to monitor emergency room admissions.`
    };
  }

  // Local symptom assistant logic
  const pLower = prompt.toLowerCase();
  let guidance = "Common over-the-counter options for general pain and fever include Paracetamol (Panado) or Ibuprofen (Nurofen). Always consult a healthcare professional.";
  let recs = ['Panado', 'Nurofen Express'];

  if (pLower.includes('cough') || pLower.includes('flu') || pLower.includes('fever') || pLower.includes('sore throat')) {
    guidance = "For flu symptoms, body aches, and nasal congestion, Benylin 4-Flu or Corenza C provide multi-symptom relief, while Panado reduces fever.";
    recs = ['Benylin 4-Flu', 'Panado', 'Corenza C'];
  } else if (pLower.includes('allergy') || pLower.includes('sneez') || pLower.includes('itch')) {
    guidance = "For seasonal hay fever and allergy symptoms, Zyrtec (Cetirizine) provides non-drowsy 24-hour antihistamine relief.";
    recs = ['Zyrtec'];
  } else if (pLower.includes('reflux') || pLower.includes('heartburn') || pLower.includes('stomach')) {
    guidance = "For acid reflux and persistent heartburn, Losec (Omeprazole) helps control gastric acid production.";
    recs = ['Losec'];
  } else if (pLower.includes('wheez') || pLower.includes('asthma') || pLower.includes('breath')) {
    guidance = "For rapid relief of bronchospasm or wheezing, Ventolin Inhaler (Salbutamol) is commonly prescribed.";
    recs = ['Ventolin Inhaler'];
  }

  return {
    guidance: `${guidance} (Note: Always verify with a pharmacist).`,
    recommended_medicines: recs,
  };
}
