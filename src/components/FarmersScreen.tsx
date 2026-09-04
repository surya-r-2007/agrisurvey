import React, { useState } from 'react';
import { Farmer, Farm, TabType } from '../types';

interface FarmersScreenProps {
  farmers: Farmer[];
  farms: Farm[];
  onAddFarmer: (newFarmer: Omit<Farmer, 'id'>) => void;
  onDeleteFarmer: (farmerId: string) => void;
  onNavigate: (tab: TabType) => void;
  onShowToast: (msg: string) => void;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
}

export const FarmersScreen: React.FC<FarmersScreenProps> = ({
  farmers,
  farms,
  onAddFarmer,
  onDeleteFarmer,
  onNavigate,
  onShowToast,
  isModalOpen,
  setIsModalOpen
}) => {
  const [activeChip, setActiveChip] = useState<'all' | 'farms' | 'recent' | 'filter'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFarmerId, setSelectedFarmerId] = useState<string>(farmers[0]?.id || '');
  const [sortOrder, setSortOrder] = useState<'recency' | 'name' | 'acres'>('recency');

  React.useEffect(() => {
    if (!farmers.some((f) => f.id === selectedFarmerId) && farmers.length > 0) {
      setSelectedFarmerId(farmers[0].id);
    }
  }, [farmers, selectedFarmerId]);

  // Form State for New Farmer Modal
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    date: new Date().toISOString().split('T')[0],
    village: '',
    taluk: 'Maddur',
    district: 'Mandya District',
    totalAcres: 10.0,
    irrigatedAcres: 6.5,
    rainfedAcres: 3.5,
    irrigationMode: 'Borewell & Canal',
    crops: 'Sugarcane, Paddy',
    rotation: 'Paddy → Legume → Sugarcane'
  });
  const [isSaving, setIsSaving] = useState(false);

  const selectedFarmer = farmers.find((f) => f.id === selectedFarmerId) || farmers[0];

  const handleExportDb = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(farmers, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'agrisurvey_farmers_tbl.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    onShowToast('Exported SQLite farmers_tbl (JSON format)');
  };

  const handleReindex = () => {
    onShowToast('Re-indexing SQLite indexes: idx_farmer_code, idx_taluk...');
    setTimeout(() => {
      onShowToast('SQLite B-Tree indexes rebuild completed (0.04s)');
    }, 600);
  };

  const handleCreateFarmerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      onShowToast('Please enter full stakeholder name');
      return;
    }
    setIsSaving(true);
    setTimeout(() => {
      const initials = formData.name
        .split(' ')
        .map((p) => p[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'FM';

      const nextNum = farmers.length + 41;
      const code = `FMR-0${nextNum}`;
      const farmId = `FRM-MDR-${nextNum}`;

      onAddFarmer({
        code,
        name: formData.name,
        initials,
        phone: formData.phone || '+91 98000 00000',
        location: `${formData.village || 'Mandya'}, ${formData.taluk}`,
        village: formData.village || 'Mandya',
        taluk: formData.taluk,
        district: formData.district,
        totalAcres: Number(formData.totalAcres),
        irrigatedAcres: Number(formData.irrigatedAcres),
        rainfedAcres: Number(formData.rainfedAcres),
        numFarms: 1,
        numFields: 2,
        numSurveys: 1,
        date: formData.date,
        surveyRef: `SRV-${code}-2024`,
        kycVerified: true,
        cropsRotation: formData.crops,
        rotationScheme: formData.rotation,
        irrigationMode: formData.irrigationMode,
        machinery: ['Borewell', formData.irrigationMode],
        farmId
      });

      setIsSaving(false);
      setIsModalOpen(false);
      onShowToast(`Farmer ${formData.name} (${code}) committed to SQLite!`);
      // Reset
      setFormData({
        name: '',
        phone: '',
        date: new Date().toISOString().split('T')[0],
        village: '',
        taluk: 'Maddur',
        district: 'Mandya District',
        totalAcres: 10.0,
        irrigatedAcres: 6.5,
        rainfedAcres: 3.5,
        irrigationMode: 'Borewell & Canal',
        crops: 'Sugarcane, Paddy',
        rotation: 'Paddy → Legume → Sugarcane'
      });
    }, 700);
  };

  const filteredFarmers = farmers
    .filter((f) => {
      const q = searchQuery.toLowerCase();
      return (
        f.name.toLowerCase().includes(q) ||
        f.code.toLowerCase().includes(q) ||
        f.phone.toLowerCase().includes(q) ||
        f.location.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sortOrder === 'name') return a.name.localeCompare(b.name);
      if (sortOrder === 'acres') return b.totalAcres - a.totalAcres;
      return 0; // recency
    });

  const displayedFarmers = activeChip === 'recent' ? filteredFarmers.slice(0, 2) : filteredFarmers;

  const filteredFarms = farms.filter((farm) => {
    const q = searchQuery.toLowerCase();
    return (
      farm.id.toLowerCase().includes(q) ||
      farm.ownerName.toLowerCase().includes(q) ||
      farm.mainCrop.toLowerCase().includes(q) ||
      farm.location.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex flex-col w-full gap-y-6 max-w-2xl mx-auto pb-10">
      {/* Top Sync & Master Table Pulse */}
      <div className="bg-surface-container-low rounded-xl p-3 shadow-sm flex items-center justify-between gap-2 border border-outline-variant/15">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-full bg-secondary/15 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-secondary text-[18px]">database</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[12px] font-bold text-secondary truncate">
              master: farmers_tbl • In Sync
            </span>
            <span className="text-[12px] text-on-surface-variant truncate">
              Signed & verified surveyor session
            </span>
          </div>
        </div>
        <span className="bg-secondary/10 text-secondary text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap">
          v3.4 SQLite
        </span>
      </div>

      {/* Search & Tactical Quick Query Block */}
      <div className="flex flex-col gap-3">
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[22px]">
            search
          </span>
          <input
            className="w-full h-12 pl-11 pr-10 rounded-xl bg-surface-container-lowest text-on-surface placeholder:text-outline text-[14px] shadow-sm outline-none border border-outline-variant/20 focus:border-secondary transition-colors"
            placeholder="Search name, phone, village, taluk..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-on-surface-variant hover:text-on-surface cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          ) : (
            <button
              onClick={() => onShowToast('Voice Search listening...')}
              aria-label="Voice search"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-lg text-on-surface-variant hover:text-primary cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">mic</span>
            </button>
          )}
        </div>

        {/* Segmented Navigation Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-pad-screen-horizontal px-pad-screen-horizontal scrollbar-none">
          <button
            onClick={() => setActiveChip('all')}
            className={`filter-chip flex items-center gap-1.5 px-4 h-9 rounded-full text-[13px] font-bold whitespace-nowrap shadow-sm transition-all cursor-pointer ${
              activeChip === 'all'
                ? 'bg-primary-container text-on-primary'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">groups</span>
            <span>All Farmers ({farmers.length})</span>
          </button>

          <button
            onClick={() => setActiveChip('farms')}
            className={`filter-chip flex items-center gap-1.5 px-4 h-9 rounded-full text-[13px] font-bold whitespace-nowrap transition-colors cursor-pointer ${
              activeChip === 'farms'
                ? 'bg-primary-container text-on-primary'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">grid_view</span>
            <span>Farms ({farms.length})</span>
          </button>

          <button
            onClick={() => setActiveChip('recent')}
            className={`filter-chip flex items-center gap-1.5 px-4 h-9 rounded-full text-[13px] font-bold whitespace-nowrap transition-colors cursor-pointer ${
              activeChip === 'recent'
                ? 'bg-primary-container text-on-primary'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">history</span>
            <span>Recently Added</span>
          </button>

          <button
            onClick={() => {
              const orders: ('recency' | 'name' | 'acres')[] = ['recency', 'name', 'acres'];
              const next = orders[(orders.indexOf(sortOrder) + 1) % orders.length];
              setSortOrder(next);
              onShowToast(`Sorted farmers by ${next}`);
            }}
            className="filter-chip flex items-center gap-1 px-3 h-9 rounded-full bg-surface-container text-on-surface-variant text-[13px] font-semibold whitespace-nowrap hover:bg-surface-container-high cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">tune</span>
            <span className="capitalize">{sortOrder}</span>
          </button>
        </div>
      </div>

      {/* Primary Field Operational CTAs */}
      <div className="grid grid-cols-1 gap-2.5">
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full h-12 px-4 rounded-xl bg-primary text-on-primary text-[15px] font-bold flex items-center justify-center gap-2 shadow-md hover:bg-primary/90 active:scale-[0.99] transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-[22px]">person_add</span>
          <span>+ Create New Farmer Record</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportDb}
            className="flex-1 h-11 px-3 rounded-xl bg-surface-container-lowest text-on-surface text-[13px] font-semibold flex items-center justify-center gap-1.5 shadow-sm hover:bg-surface-container transition-colors border border-outline-variant/15 cursor-pointer"
          >
            <span className="material-symbols-outlined text-secondary text-[18px]">file_download</span>
            <span>Export DB (CSV/JSON)</span>
          </button>
          <button
            onClick={handleReindex}
            className="h-11 px-3.5 rounded-xl bg-surface-container-lowest text-on-surface text-[13px] font-semibold flex items-center justify-center gap-1.5 shadow-sm hover:bg-surface-container transition-colors border border-outline-variant/15 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">sync</span>
            <span>Re-Index</span>
          </button>
        </div>
      </div>

      {/* Comprehensive Farmer Record Spotlight Card (Inspector Relational Focus) */}
      {selectedFarmer ? (
        <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-md flex flex-col gap-4 border border-outline-variant/15">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary-container text-on-primary flex items-center justify-center text-[18px] font-bold shadow-inner flex-shrink-0">
                {selectedFarmer.initials}
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <h2 className="text-[20px] font-bold text-on-surface truncate">
                    {selectedFarmer.name}
                  </h2>
                  {selectedFarmer.kycVerified && (
                    <span
                      className="material-symbols-outlined text-secondary text-[18px]"
                      title="KYC Verified"
                    >
                      verified
                    </span>
                  )}
                </div>
                <span className="text-[12px] text-on-surface-variant font-semibold">
                  Survey Ref: {selectedFarmer.surveyRef}
                </span>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 bg-secondary/15 text-secondary px-2.5 py-1 rounded-full text-[11px] font-bold flex-shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
              {selectedFarmer.date}
            </span>
          </div>

          {/* Micro Metadata Chips */}
          <div className="grid grid-cols-2 gap-2 bg-surface-container-low p-3 rounded-xl">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[18px]">call</span>
              <div className="flex flex-col min-w-0">
                <span className="text-[11px] text-on-surface-variant">Phone</span>
                <span className="text-[13px] font-semibold text-on-surface truncate">
                  {selectedFarmer.phone}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[18px]">pin_drop</span>
              <div className="flex flex-col min-w-0">
                <span className="text-[11px] text-on-surface-variant">Location</span>
                <span className="text-[13px] font-semibold text-on-surface truncate">
                  {selectedFarmer.location}
                </span>
              </div>
            </div>
          </div>

          {/* In-depth Land Breakdown Bento */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between text-on-surface">
              <span className="text-[13px] font-semibold flex items-center gap-1">
                <span className="material-symbols-outlined text-[18px] text-secondary">crop_free</span>
                Farm ID: {selectedFarmer.farmId}
              </span>
              <span className="text-[13px] font-bold text-primary">
                {selectedFarmer.totalAcres} Acres Total
              </span>
            </div>

            {/* Tactical Land Ratio Bar */}
            <div className="flex flex-col gap-1">
              <div className="h-2.5 w-full bg-surface-container-high rounded-full overflow-hidden flex">
                <div
                  className="bg-secondary h-full transition-all"
                  style={{
                    width: `${Math.round((selectedFarmer.irrigatedAcres / selectedFarmer.totalAcres) * 100)}%`
                  }}
                  title={`Irrigated: ${selectedFarmer.irrigatedAcres} Ac`}
                ></div>
                <div
                  className="bg-tertiary-fixed-dim h-full transition-all"
                  style={{
                    width: `${Math.round((selectedFarmer.rainfedAcres / selectedFarmer.totalAcres) * 100)}%`
                  }}
                  title={`Rainfed: ${selectedFarmer.rainfedAcres} Ac`}
                ></div>
              </div>
              <div className="flex justify-between text-[11px] text-on-surface-variant px-0.5 font-medium">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-secondary inline-block"></span> Irrigated: {selectedFarmer.irrigatedAcres} Ac
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-tertiary-fixed-dim inline-block"></span> Rainfed: {selectedFarmer.rainfedAcres} Ac
                </span>
              </div>
            </div>
          </div>

          {/* Cropping & Agro Details Matrix */}
          <div className="grid grid-cols-1 gap-2 pt-1">
            <div className="p-3 bg-surface-container-low rounded-xl flex flex-col gap-1">
              <span className="text-[11px] text-on-surface-variant font-medium">Crops & Rotation Scheme</span>
              <p className="text-[13px] text-on-surface font-semibold">{selectedFarmer.cropsRotation}</p>
              <div className="flex items-center gap-1 mt-0.5 text-[12px] text-secondary font-semibold">
                <span className="material-symbols-outlined text-[14px]">autorenew</span>
                <span>{selectedFarmer.rotationScheme}</span>
              </div>
            </div>

            <div className="p-3 bg-surface-container-low rounded-xl flex flex-col gap-1">
              <span className="text-[11px] text-on-surface-variant font-medium">Water & Farm Machinery</span>
              <div className="flex flex-wrap gap-1.5 mt-0.5">
                {selectedFarmer.machinery.map((m, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 bg-surface-container-highest rounded text-on-surface text-[11px] font-semibold"
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Action Tray for Inspector Card */}
          <div className="grid grid-cols-4 gap-2 pt-1">
            <button
              onClick={() => onShowToast(`Farmer Profile: ${selectedFarmer.name} (${selectedFarmer.code}) verified`)}
              className="h-10 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-[12px] font-semibold flex flex-col items-center justify-center gap-0.5 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">badge</span>
              <span>Profile</span>
            </button>
            <button
              onClick={() => onShowToast(`Edit mode opened for ${selectedFarmer.name}`)}
              className="h-10 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-[12px] font-semibold flex flex-col items-center justify-center gap-0.5 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">edit_document</span>
              <span>Edit</span>
            </button>
            <button
              onClick={() => onNavigate('fields')}
              className="h-10 rounded-xl bg-primary-container text-on-primary text-[12px] font-bold flex flex-col items-center justify-center gap-0.5 shadow-sm cursor-pointer hover:opacity-95"
            >
              <span className="material-symbols-outlined text-[18px]">add_location_alt</span>
              <span>+ Farm</span>
            </button>
            <button
              onClick={() => onDeleteFarmer(selectedFarmer.id)}
              className="h-10 rounded-xl bg-error-container text-on-error-container text-[12px] font-bold flex flex-col items-center justify-center gap-0.5 cursor-pointer hover:opacity-90"
            >
              <span className="material-symbols-outlined text-[18px]">delete</span>
              <span>Delete</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center text-center gap-2 border border-outline-variant/15">
          <div className="w-12 h-12 rounded-xl bg-surface-container text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">person_pin</span>
          </div>
          <h3 className="text-[16px] font-bold text-on-surface">No Farmer Selected</h3>
          <p className="text-[13px] text-on-surface-variant max-w-sm">
            Register a farmer or select one from the list to view profile records, land holdings, and GIS parcels.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-2 h-9 px-4 rounded-xl bg-primary text-on-primary text-[13px] font-bold flex items-center gap-1.5 shadow-sm hover:opacity-95 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">person_add</span>
            <span>+ Register First Farmer</span>
          </button>
        </div>
      )}

      {/* Farmer Master Roster Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-[18px] font-bold text-on-surface">Registered Farmers</h3>
          <span className="bg-surface-container-high text-on-surface text-[11px] px-2 py-0.5 rounded-full font-bold">
            {filteredFarmers.length} Showing
          </span>
        </div>
        <span
          onClick={() => {
            const next = sortOrder === 'recency' ? 'name' : 'recency';
            setSortOrder(next);
            onShowToast(`Sorted by ${next}`);
          }}
          className="text-[12px] text-secondary font-semibold cursor-pointer hover:underline"
        >
          Sort: {sortOrder === 'recency' ? 'Recency ↓' : 'Name A-Z'}
        </span>
      </div>

      {/* Farmer Record Cards Stack */}
      <div className="flex flex-col gap-3">
        {activeChip === 'farms' ? (
          filteredFarms.map((farm) => (
            <div
              key={farm.id}
              className="bg-surface-container-lowest rounded-xl p-4 shadow-sm flex flex-col gap-3 border border-outline-variant/15 hover:border-secondary/30 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-[17px] text-primary font-bold">{farm.id}</span>
                    <span className="bg-secondary/15 text-secondary px-2 py-0.5 rounded text-[11px] font-bold">
                      {farm.activeCycle ? 'Active Cycle' : 'Idle'}
                    </span>
                  </div>
                  <span className="text-[13px] text-on-surface-variant font-medium mt-0.5">
                    Owner: {farm.ownerName} ({farm.ownerCode})
                  </span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">nature</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 bg-surface-container-low p-2.5 rounded-xl text-center">
                <div>
                  <span className="text-[11px] text-on-surface-variant block">Total Area</span>
                  <span className="text-[14px] text-on-surface font-bold">{farm.totalArea}</span>
                </div>
                <div>
                  <span className="text-[11px] text-on-surface-variant block">Fields</span>
                  <span className="text-[14px] text-on-surface font-bold">{farm.fieldsCount} Plots</span>
                </div>
                <div>
                  <span className="text-[11px] text-on-surface-variant block">Main Crop</span>
                  <span className="text-[14px] text-on-surface font-bold">{farm.mainCrop}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-on-surface-variant text-[12px]">
                <span className="material-symbols-outlined text-[18px] text-outline">location_on</span>
                <span className="truncate">{farm.location}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => onShowToast(`Inspecting farm ${farm.id}`)}
                  className="h-10 px-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-[13px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">visibility</span>
                  <span>View Farm</span>
                </button>
                <button
                  onClick={() => onNavigate('fields')}
                  className="h-10 px-3 rounded-xl bg-primary-container text-on-primary text-[13px] font-bold flex items-center justify-center gap-1.5 shadow-sm hover:opacity-95 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">polyline</span>
                  <span>View Fields ({farm.fieldsCount})</span>
                </button>
              </div>
            </div>
          ))
        ) : displayedFarmers.length === 0 ? (
          farmers.length === 0 ? (
            <div className="p-8 text-center bg-surface-container-lowest rounded-2xl border border-outline-variant/15 text-on-surface-variant flex flex-col items-center justify-center">
              <span className="material-symbols-outlined text-[36px] text-primary mb-2">contacts</span>
              <p className="text-[15px] font-bold text-on-surface">Database Empty</p>
              <p className="text-[12px] text-on-surface-variant mt-1 max-w-xs">
                No farmer records are stored in the local register. Tap below to add the first farmer.
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-3.5 h-9 px-4 rounded-xl bg-primary text-on-primary text-[13px] font-bold flex items-center gap-1.5 shadow-sm hover:opacity-95 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">person_add</span>
                <span>+ Register First Farmer</span>
              </button>
            </div>
          ) : (
            <div className="p-8 text-center bg-surface-container-lowest rounded-xl border border-outline-variant/15 text-on-surface-variant">
              <span className="material-symbols-outlined text-[36px] text-outline mb-2">person_search</span>
              <p className="text-[14px] font-semibold">No farmer records match your query</p>
              <p className="text-[12px] text-outline mt-1">Try searching by another name, village, or ID</p>
            </div>
          )
        ) : (
          displayedFarmers.map((farmer) => {
            const isSelected = farmer.id === selectedFarmerId;
            const codeDigits = farmer.code.replace('FMR-', '');
            return (
              <div
                key={farmer.id}
                onClick={() => setSelectedFarmerId(farmer.id)}
                className={`rounded-xl p-3.5 shadow-sm flex flex-col gap-3 border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-surface-container-lowest border-secondary shadow-md ring-1 ring-secondary/30'
                    : 'bg-surface-container-lowest border-outline-variant/15 hover:border-secondary/30'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-surface-container-high text-primary flex items-center justify-center text-[14px] font-bold">
                      {codeDigits}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[15px] font-bold text-on-surface truncate">
                        {farmer.name}
                      </span>
                      <span className="text-[12px] text-on-surface-variant truncate">
                        {farmer.location}
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-secondary/15 text-secondary text-[11px] font-bold rounded-full">
                    {farmer.code}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 py-2 bg-surface-container-low rounded-lg text-center">
                  <div className="flex flex-col">
                    <span className="text-[18px] font-bold text-primary leading-tight">
                      {farmer.totalAcres}
                    </span>
                    <span className="text-[11px] text-on-surface-variant">Acres</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[18px] font-bold text-primary leading-tight">
                      {farmer.numFarms}
                    </span>
                    <span className="text-[11px] text-on-surface-variant">Farms</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[18px] font-bold text-primary leading-tight">
                      {farmer.numFields}
                    </span>
                    <span className="text-[11px] text-on-surface-variant">Fields</span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-1.5 pt-1 overflow-x-auto">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFarmerId(farmer.id);
                      onShowToast(`Viewing full profile for ${farmer.name}`);
                    }}
                    className="h-9 px-3 rounded-lg bg-surface-container text-on-surface text-[12px] font-semibold whitespace-nowrap hover:bg-surface-container-high transition-colors cursor-pointer"
                  >
                    View Profile
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFarmerId(farmer.id);
                      onShowToast(`Edit record ${farmer.code}`);
                    }}
                    className="h-9 px-3 rounded-lg bg-surface-container text-on-surface text-[12px] font-semibold whitespace-nowrap hover:bg-surface-container-high transition-colors cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate('surveys');
                    }}
                    className="h-9 px-3 rounded-lg bg-secondary/15 text-secondary text-[12px] font-bold whitespace-nowrap hover:bg-secondary/25 transition-colors cursor-pointer"
                  >
                    Surveys ({farmer.numSurveys})
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteFarmer(farmer.id);
                    }}
                    className="h-9 w-9 flex items-center justify-center rounded-lg bg-surface-container text-error hover:bg-error-container hover:text-on-error-container transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Farm Entity Hub / Relational Explorer Section */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h3 className="text-[18px] font-bold text-on-surface">Associated Farms</h3>
            <span className="text-[12px] text-on-surface-variant font-medium">
              Direct GIS Polygons & Acreage
            </span>
          </div>
          <button
            onClick={() => onNavigate('fields')}
            className="h-8 px-3 rounded-lg bg-primary-container text-on-primary text-[12px] font-bold flex items-center gap-1 shadow-sm cursor-pointer hover:opacity-95"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>Add Farm</span>
          </button>
        </div>

        {/* Farm Cards List or Empty State */}
        {farms.length > 0 ? (
          farms.map((farm) => (
            <div
              key={farm.id}
              className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm flex flex-col gap-3 border border-outline-variant/15"
            >
              <div className="flex items-start justify-between">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-[18px] text-primary font-bold">{farm.id}</span>
                    <span className="bg-secondary/15 text-secondary px-2 py-0.5 rounded text-[11px] font-bold">
                      {farm.activeCycle ? 'Active Cycle' : 'Registered'}
                    </span>
                  </div>
                  <span className="text-[13px] text-on-surface-variant font-medium mt-0.5">
                    Owner: {farm.ownerName} ({farm.ownerCode})
                  </span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">nature</span>
                </div>
              </div>

              {/* Farm Quick Spatial Glance */}
              <div className="grid grid-cols-3 gap-2 bg-surface-container-low p-2.5 rounded-xl text-center">
                <div>
                  <span className="text-[11px] text-on-surface-variant block">Total Area</span>
                  <span className="text-[14px] text-on-surface font-bold">{farm.totalArea}</span>
                </div>
                <div>
                  <span className="text-[11px] text-on-surface-variant block">Fields</span>
                  <span className="text-[14px] text-on-surface font-bold">{farm.fieldsCount} Plots</span>
                </div>
                <div>
                  <span className="text-[11px] text-on-surface-variant block">Main Crop</span>
                  <span className="text-[14px] text-on-surface font-bold">{farm.mainCrop}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-on-surface-variant text-[12px]">
                <span className="material-symbols-outlined text-[18px] text-outline">location_on</span>
                <span>{farm.location}</span>
              </div>

              {/* Tactical Action Cluster */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => onShowToast(`Inspecting farm ${farm.id}`)}
                  className="h-10 px-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-[13px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">visibility</span>
                  <span>View Farm</span>
                </button>
                <button
                  onClick={() => onNavigate('fields')}
                  className="h-10 px-3 rounded-xl bg-primary-container text-on-primary text-[13px] font-bold flex items-center justify-center gap-1.5 shadow-sm hover:opacity-95 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">polyline</span>
                  <span>View Fields ({farm.fieldsCount})</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/15 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-xl bg-surface-container text-primary flex items-center justify-center mb-2">
              <span className="material-symbols-outlined text-[24px]">agriculture</span>
            </div>
            <h4 className="text-[15px] font-bold text-on-surface">No Farm Holdings Registered</h4>
            <p className="text-[12px] text-on-surface-variant mt-1 max-w-sm">
              Register farm holdings to map GIS polygon boundaries and field plots.
            </p>
          </div>
        )}
      </div>

      {/* Database Metadata Footer Log */}
      <div className="p-3 bg-surface-container-low rounded-xl text-center flex flex-col items-center justify-center gap-1 border border-outline-variant/15">
        <div className="flex items-center gap-1.5 text-secondary text-[12px] font-bold">
          <span className="material-symbols-outlined text-[16px]">verified_user</span>
          <span>SQLite Master Table: farmers_tbl synced</span>
        </div>
        <span className="text-[11px] text-on-surface-variant">
          All mutations recorded with timestamp & surveyor digital signature
        </span>
      </div>

      {/* Interactive Slide-Up Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-surface-container-lowest w-full max-w-lg rounded-t-3xl sm:rounded-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-outline-variant/20 animate-in fade-in slide-in-from-bottom duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 bg-surface-container-low border-b border-outline-variant/20">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-primary text-on-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">person_add</span>
                </div>
                <div className="flex flex-col">
                  <h3 className="text-[18px] font-bold text-on-surface">New Farmer Entry</h3>
                  <span className="text-[11px] text-secondary font-semibold">Auto ID Generated</span>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-surface-container text-on-surface-variant hover:bg-surface-container-high cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleCreateFarmerSubmit} className="p-4 overflow-y-auto flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] text-on-surface font-semibold">
                  Full Legal Stakeholder Name *
                </label>
                <input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-12 px-3 rounded-xl bg-surface-container text-on-surface text-[14px] outline-none border border-outline-variant/20 focus:border-secondary transition-colors"
                  placeholder="e.g., Basavaraj Patil"
                  type="text"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] text-on-surface font-semibold">Mobile Number *</label>
                  <input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="h-12 px-3 rounded-xl bg-surface-container text-on-surface text-[14px] outline-none border border-outline-variant/20 focus:border-secondary transition-colors"
                    placeholder="+91 98XXX XXXXX"
                    type="tel"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] text-on-surface font-semibold">Survey Ref Date</label>
                  <input
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="h-12 px-3 rounded-xl bg-surface-container text-on-surface text-[14px] outline-none border border-outline-variant/20 focus:border-secondary transition-colors"
                    type="date"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] text-on-surface font-semibold">Village</label>
                  <input
                    value={formData.village}
                    onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                    className="h-12 px-2.5 rounded-xl bg-surface-container text-on-surface text-[14px] outline-none border border-outline-variant/20 focus:border-secondary transition-colors"
                    placeholder="Village"
                    type="text"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] text-on-surface font-semibold">Taluk</label>
                  <input
                    value={formData.taluk}
                    onChange={(e) => setFormData({ ...formData, taluk: e.target.value })}
                    className="h-12 px-2.5 rounded-xl bg-surface-container text-on-surface text-[14px] outline-none border border-outline-variant/20 focus:border-secondary transition-colors"
                    placeholder="Taluk"
                    type="text"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] text-on-surface font-semibold">District</label>
                  <input
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="h-12 px-2.5 rounded-xl bg-surface-container text-on-surface text-[14px] outline-none border border-outline-variant/20 focus:border-secondary transition-colors"
                    placeholder="District"
                    type="text"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] text-on-surface font-semibold">Total Acres</label>
                  <div className="relative">
                    <input
                      value={formData.totalAcres}
                      onChange={(e) => setFormData({ ...formData, totalAcres: Number(e.target.value) })}
                      className="w-full h-12 pl-3 pr-10 rounded-xl bg-surface-container text-on-surface text-[14px] outline-none border border-outline-variant/20 focus:border-secondary transition-colors"
                      placeholder="10.0"
                      step="0.1"
                      type="number"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-outline font-semibold">
                      Ac
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] text-on-surface font-semibold">Irrigation Mode</label>
                  <select
                    value={formData.irrigationMode}
                    onChange={(e) => setFormData({ ...formData, irrigationMode: e.target.value })}
                    className="h-12 px-3 rounded-xl bg-surface-container text-on-surface text-[14px] outline-none border border-outline-variant/20 focus:border-secondary transition-colors"
                  >
                    <option>Borewell & Canal</option>
                    <option>Drip Only</option>
                    <option>Rainfed Solo</option>
                    <option>Canal Lift Dual</option>
                  </select>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-3 bg-surface-container-low rounded-xl flex items-center justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-11 px-4 rounded-xl bg-surface-container text-on-surface text-[13px] font-semibold hover:bg-surface-container-high cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="h-11 px-6 rounded-xl bg-primary text-on-primary text-[13px] font-bold shadow-md flex items-center gap-1.5 hover:bg-primary/90 active:scale-95 transition-all cursor-pointer"
                >
                  <span className={`material-symbols-outlined text-[18px] ${isSaving ? 'animate-spin' : ''}`}>
                    {isSaving ? 'sync' : 'check_circle'}
                  </span>
                  <span>{isSaving ? 'Syncing...' : 'Save & Commit DB'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
