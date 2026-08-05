import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Save, X, Building2, Package, TrendingUp, Search, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import { Pharmacy, Medicine, PharmacyMedicine } from '../types';
import { COMMON_MEDICAL_AIDS } from '../data/locations';
import {
  fetchPharmaciesApi,
  fetchPharmacyDetailApi,
  createPharmacyApi,
  togglePharmacyStatusApi,
  saveInventoryItemApi,
} from '../services/api';

export const AdminPortal: React.FC = () => {
  const [pharmaciesList, setPharmaciesList] = useState<Pharmacy[]>([]);
  const [selectedPharmacyId, setSelectedPharmacyId] = useState<string>('');
  const [selectedPharmacyDetail, setSelectedPharmacyDetail] = useState<{ pharmacy: Pharmacy; inventory: PharmacyMedicine[] } | null>(null);
  const [loading, setLoading] = useState(false);

  // Modal forms
  const [showAddPharmacyModal, setShowAddPharmacyModal] = useState(false);
  const [showAddInventoryModal, setShowAddInventoryModal] = useState(false);

  // New Pharmacy Form state
  const [newPharmName, setNewPharmName] = useState('');
  const [newPharmAddress, setNewPharmAddress] = useState('');
  const [newPharmPhone, setNewPharmPhone] = useState('');
  const [newPharmLat, setNewPharmLat] = useState('-26.2041');
  const [newPharmLng, setNewPharmLng] = useState('28.0473');
  const [newPharmOpen, setNewPharmOpen] = useState('08:00');
  const [newPharmClose, setNewPharmClose] = useState('18:00');
  const [newPharmAids, setNewPharmAids] = useState<string[]>(['Discovery Health', 'Bonitas']);

  // Inventory Item Form state
  const [invMedName, setInvMedName] = useState('');
  const [invGenericName, setInvGenericName] = useState('');
  const [invCategory, setInvCategory] = useState<'Prescription' | 'Over-the-Counter' | 'Chronic Care' | 'First Aid' | 'Vitamins'>('Over-the-Counter');
  const [invPrice, setInvPrice] = useState('5.50');
  const [invStockQty, setInvStockQty] = useState('20');
  const [invStockStatus, setInvStockStatus] = useState<'in_stock' | 'low_stock' | 'out_of_stock'>('in_stock');

  // Load pharmacies
  const loadPharmacies = async () => {
    setLoading(true);
    try {
      const data = await fetchPharmaciesApi();
      setPharmaciesList(data);
      if (data.length > 0 && !selectedPharmacyId) {
        setSelectedPharmacyId(data[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPharmacies();
  }, []);

  // Load selected pharmacy details & inventory
  useEffect(() => {
    if (!selectedPharmacyId) return;

    fetchPharmacyDetailApi(selectedPharmacyId)
      .then(data => {
        setSelectedPharmacyDetail(data);
      })
      .catch(err => console.error(err));
  }, [selectedPharmacyId]);

  const handleCreatePharmacy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPharmName || !newPharmAddress) return;

    try {
      const created = await createPharmacyApi({
        name: newPharmName,
        address: newPharmAddress,
        phone: newPharmPhone,
        latitude: parseFloat(newPharmLat),
        longitude: parseFloat(newPharmLng),
        opening_hours: { open: newPharmOpen, close: newPharmClose, days: 'Mon - Sat' },
        medical_aids: newPharmAids,
      });

      setShowAddPharmacyModal(false);
      await loadPharmacies();
      if (created.id) setSelectedPharmacyId(created.id);
      // Reset
      setNewPharmName('');
      setNewPharmAddress('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveInventoryItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPharmacyId || !invMedName) return;

    try {
      await saveInventoryItemApi(selectedPharmacyId, {
        medicine_name: invMedName,
        generic_name: invGenericName,
        category: invCategory,
        price: parseFloat(invPrice),
        stock_quantity: parseInt(invStockQty),
        stock_status: invStockStatus,
      });

      setShowAddInventoryModal(false);
      const data = await fetchPharmacyDetailApi(selectedPharmacyId);
      setSelectedPharmacyDetail(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleTogglePharmacyStatus = async (id: string) => {
    await togglePharmacyStatusApi(id);
    await loadPharmacies();
    if (selectedPharmacyId === id) {
      const data = await fetchPharmacyDetailApi(id);
      setSelectedPharmacyDetail(data);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-2xl font-extrabold text-slate-900">
              Pharmacy Owners & Admin Portal
            </h2>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded-full border border-emerald-300">
              Staff Portal
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Register new branches, manage medicine prices, update real-time stock levels, and review search appearance analytics.
          </p>
        </div>

        <button
          onClick={() => setShowAddPharmacyModal(true)}
          className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-2.5 rounded-xl shadow transition-all text-xs sm:text-sm flex items-center space-x-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Pharmacy</span>
        </button>
      </div>

      {/* Main Admin Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Registered Pharmacies List */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-emerald-700" />
              <span>Registered Branches ({pharmaciesList.length})</span>
            </h3>
          </div>

          <div className="space-y-2.5">
            {pharmaciesList.map((pharm) => (
              <div
                key={pharm.id}
                onClick={() => setSelectedPharmacyId(pharm.id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  selectedPharmacyId === pharm.id
                    ? 'bg-emerald-50 border-emerald-500 shadow-sm'
                    : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div>
                  <div className="font-bold text-slate-900 text-sm">{pharm.name}</div>
                  <div className="text-xs text-slate-500 line-clamp-1">{pharm.address}</div>
                  <div className="flex items-center space-x-2 text-[11px] mt-1">
                    <span className={`font-semibold ${pharm.status === 'active' ? 'text-emerald-700' : 'text-slate-400'}`}>
                      {pharm.status === 'active' ? '● Active' : '○ Inactive'}
                    </span>
                    <span>•</span>
                    <span className="text-slate-600">{pharm.medical_aids.length} Medical Aids</span>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTogglePharmacyStatus(pharm.id);
                  }}
                  className={`text-[10px] font-bold px-2 py-1 rounded border transition-colors ${
                    pharm.status === 'active'
                      ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  {pharm.status === 'active' ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right 2 Columns: Inventory & Area Analytics */}
        <div className="lg:col-span-2 space-y-6">
          
          {selectedPharmacyDetail ? (
            <>
              {/* Analytics Summary Header Card */}
              <div className="bg-gradient-to-br from-emerald-900 to-emerald-950 text-white p-6 rounded-3xl shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-800 pb-4">
                  <div>
                    <h3 className="text-xl font-bold">{selectedPharmacyDetail.pharmacy.name}</h3>
                    <p className="text-xs text-emerald-200 mt-0.5">{selectedPharmacyDetail.pharmacy.address}</p>
                  </div>

                  <button
                    onClick={() => setShowAddInventoryModal(true)}
                    className="bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs shadow transition-all flex items-center space-x-1 shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add / Update Medicine</span>
                  </button>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-emerald-800/60 p-3 rounded-2xl border border-emerald-700/50">
                    <div className="text-xs text-emerald-200 font-medium">Search Appearances</div>
                    <div className="text-2xl font-extrabold text-white mt-1">284</div>
                    <div className="text-[10px] text-emerald-300">+18% this week</div>
                  </div>

                  <div className="bg-emerald-800/60 p-3 rounded-2xl border border-emerald-700/50">
                    <div className="text-xs text-emerald-200 font-medium">Stock Catalog</div>
                    <div className="text-2xl font-extrabold text-white mt-1">{selectedPharmacyDetail.inventory.length}</div>
                    <div className="text-[10px] text-emerald-300">Active medicines</div>
                  </div>

                  <div className="bg-emerald-800/60 p-3 rounded-2xl border border-emerald-700/50">
                    <div className="text-xs text-emerald-200 font-medium">Top Regional Demand</div>
                    <div className="text-base font-bold text-amber-300 mt-1 truncate">Panado & Flu</div>
                    <div className="text-[10px] text-emerald-300">Highest local searches</div>
                  </div>
                </div>
              </div>

              {/* Medicine Stock Inventory Editor Table */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                    <Package className="w-5 h-5 text-emerald-600" />
                    <span>Current Inventory Catalog ({selectedPharmacyDetail.inventory.length})</span>
                  </h4>
                </div>

                {selectedPharmacyDetail.inventory.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-dashed">
                    No medicine stock items registered for this branch yet. Tap 'Add / Update Medicine' to populate stock.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b text-slate-500 font-semibold bg-slate-50">
                          <th className="p-3">Medicine Name</th>
                          <th className="p-3">Category</th>
                          <th className="p-3">Price</th>
                          <th className="p-3">Stock Quantity</th>
                          <th className="p-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedPharmacyDetail.inventory.map((item) => (
                          <tr key={item.medicine_id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-3 font-bold text-slate-900">
                              {item.medicine?.name}
                              <div className="text-[11px] font-normal text-slate-500">{item.medicine?.generic_name}</div>
                            </td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                                {item.medicine?.category}
                              </span>
                            </td>
                            <td className="p-3 font-extrabold text-slate-900">
                              ${item.price.toFixed(2)}
                            </td>
                            <td className="p-3 font-semibold text-slate-700">
                              {item.stock_quantity} units
                            </td>
                            <td className="p-3">
                              {item.stock_status === 'in_stock' ? (
                                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold border border-emerald-200">In Stock</span>
                              ) : item.stock_status === 'low_stock' ? (
                                <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded font-bold border border-amber-200">Low Stock</span>
                              ) : (
                                <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded font-bold border border-rose-200">Out of Stock</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="py-20 text-center text-slate-400 bg-white rounded-3xl border">
              Select a pharmacy branch on the left to view and manage its inventory.
            </div>
          )}

        </div>

      </div>

      {/* Modal: Add Pharmacy */}
      {showAddPharmacyModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreatePharmacy} className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-slate-900">Register New Pharmacy Branch</h3>
              <button type="button" onClick={() => setShowAddPharmacyModal(false)} className="p-1 text-slate-400"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Pharmacy Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MedNest Express Pharmacy"
                  value={newPharmName}
                  onChange={(e) => setNewPharmName(e.target.value)}
                  className="w-full border p-2.5 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 52 Hospital Road, Northside"
                  value={newPharmAddress}
                  onChange={(e) => setNewPharmAddress(e.target.value)}
                  className="w-full border p-2.5 rounded-xl font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+27 11 555 1234"
                    value={newPharmPhone}
                    onChange={(e) => setNewPharmPhone(e.target.value)}
                    className="w-full border p-2.5 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Hours</label>
                  <div className="flex items-center space-x-1">
                    <input type="text" value={newPharmOpen} onChange={e => setNewPharmOpen(e.target.value)} className="w-1/2 border p-2 rounded-xl text-center" />
                    <span>-</span>
                    <input type="text" value={newPharmClose} onChange={e => setNewPharmClose(e.target.value)} className="w-1/2 border p-2 rounded-xl text-center" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Latitude</label>
                  <input type="text" value={newPharmLat} onChange={e => setNewPharmLat(e.target.value)} className="w-full border p-2.5 rounded-xl" />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Longitude</label>
                  <input type="text" value={newPharmLng} onChange={e => setNewPharmLng(e.target.value)} className="w-full border p-2.5 rounded-xl" />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end space-x-2">
              <button type="button" onClick={() => setShowAddPharmacyModal(false)} className="px-4 py-2 text-xs font-bold text-slate-500">Cancel</button>
              <button type="submit" className="bg-emerald-700 text-white font-bold px-5 py-2 rounded-xl text-xs">Save Pharmacy</button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Add Inventory Item */}
      {showAddInventoryModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSaveInventoryItem} className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-slate-900">Add / Update Medicine Stock</h3>
              <button type="button" onClick={() => setShowAddInventoryModal(false)} className="p-1 text-slate-400"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Brand Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Panado Extra"
                  value={invMedName}
                  onChange={(e) => setInvMedName(e.target.value)}
                  className="w-full border p-2.5 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Generic Name</label>
                <input
                  type="text"
                  placeholder="e.g. Paracetamol 500mg"
                  value={invGenericName}
                  onChange={(e) => setInvGenericName(e.target.value)}
                  className="w-full border p-2.5 rounded-xl font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category</label>
                  <select value={invCategory} onChange={(e: any) => setInvCategory(e.target.value)} className="w-full border p-2.5 rounded-xl">
                    <option value="Over-the-Counter">Over-the-Counter</option>
                    <option value="Prescription">Prescription</option>
                    <option value="Chronic Care">Chronic Care</option>
                    <option value="First Aid">First Aid</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Price ($)</label>
                  <input type="number" step="0.10" value={invPrice} onChange={e => setInvPrice(e.target.value)} className="w-full border p-2.5 rounded-xl font-bold" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Stock Quantity</label>
                  <input type="number" value={invStockQty} onChange={e => setInvStockQty(e.target.value)} className="w-full border p-2.5 rounded-xl" />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Stock Status</label>
                  <select value={invStockStatus} onChange={(e: any) => setInvStockStatus(e.target.value)} className="w-full border p-2.5 rounded-xl font-semibold">
                    <option value="in_stock">In Stock</option>
                    <option value="low_stock">Low Stock</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end space-x-2">
              <button type="button" onClick={() => setShowAddInventoryModal(false)} className="px-4 py-2 text-xs font-bold text-slate-500">Cancel</button>
              <button type="submit" className="bg-emerald-700 text-white font-bold px-5 py-2 rounded-xl text-xs">Save Stock Item</button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
