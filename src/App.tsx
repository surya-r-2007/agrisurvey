import React, { useState, useEffect } from 'react';
import { TabType, Farmer, Farm, FieldParcel, SurveyRecord } from './types';
import {
  INITIAL_FARMERS,
  INITIAL_FARMS,
  INITIAL_FIELDS,
  INITIAL_SURVEYS,
  APP_ASSETS
} from './data/initialData';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { HomeScreen } from './components/HomeScreen';
import { FarmersScreen } from './components/FarmersScreen';
import { FieldsScreen } from './components/FieldsScreen';
import { SurveysScreen } from './components/SurveysScreen';
import { ReportsScreen } from './components/ReportsScreen';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [farmers, setFarmers] = useState<Farmer[]>(INITIAL_FARMERS);
  const [farms, setFarms] = useState<Farm[]>(INITIAL_FARMS);
  const [parcels, setParcels] = useState<FieldParcel[]>(INITIAL_FIELDS);
  const [surveys, setSurveys] = useState<SurveyRecord[]>(INITIAL_SURVEYS);
  const [selectedParcel, setSelectedParcel] = useState<FieldParcel | undefined>(INITIAL_FIELDS[0]);

  // Modals & Sheets
  const [isAddFarmerModalOpen, setIsAddFarmerModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [isInspectorProfileOpen, setIsInspectorProfileOpen] = useState(false);

  // Toast System
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 3200);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const handleAddFarmer = (newFarmer: Omit<Farmer, 'id'>) => {
    const id = `fmr-${Date.now()}`;
    setFarmers([
      {
        id,
        ...newFarmer
      },
      ...farmers
    ]);
  };

  const handleDeleteFarmer = (farmerId: string) => {
    const target = farmers.find((f) => f.id === farmerId);
    setFarmers(farmers.filter((f) => f.id !== farmerId));
    showToast(`Farmer record ${target ? target.name : farmerId} deleted from database`);
  };

  const handleSelectParcel = (parcel: FieldParcel) => {
    setSelectedParcel(parcel);
    setActiveTab('fields');
    showToast(`Loaded field ${parcel.id} into GPS Boundary Mapper`);
  };

  const handleSaveParcel = (newParcel: FieldParcel) => {
    setParcels((prev) => {
      const idx = prev.findIndex((p) => p.id === newParcel.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = newParcel;
        return updated;
      }
      return [newParcel, ...prev];
    });
    setSelectedParcel(newParcel);
    showToast(`Field parcel ${newParcel.id} saved to database!`);
  };

  const handleAddSurvey = (newSurvey: SurveyRecord) => {
    setSurveys((prev) => [newSurvey, ...prev]);
    showToast(`Survey record ${newSurvey.id} saved to database!`);
  };

  const handleSelectSurvey = (surveyId: string) => {
    setActiveTab('surveys');
    showToast(`Loaded survey dossier ${surveyId}`);
  };

  const isFieldMapper = activeTab === 'fields';

  return (
    <div className="min-h-screen bg-surface flex flex-col text-on-surface antialiased selection:bg-secondary/30">
      {/* Top Fixed Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenInspector={() => setIsInspectorProfileOpen(true)}
        onShowToast={showToast}
      />

      {/* Main Content Area */}
      <main
        className={`flex-1 w-full px-pad-screen-horizontal transition-all duration-150 ${
          isFieldMapper ? 'pt-20' : 'pt-24'
        } pb-24`}
      >
        {activeTab === 'home' && (
          <HomeScreen
            onNavigate={setActiveTab}
            onOpenAddFarmer={() => {
              setActiveTab('farmers');
              setIsAddFarmerModalOpen(true);
            }}
            onSelectParcel={handleSelectParcel}
            onSelectSurvey={handleSelectSurvey}
            onShowToast={showToast}
            parcels={parcels}
            surveys={surveys}
          />
        )}

        {activeTab === 'farmers' && (
          <FarmersScreen
            farmers={farmers}
            farms={farms}
            onAddFarmer={handleAddFarmer}
            onDeleteFarmer={handleDeleteFarmer}
            onNavigate={setActiveTab}
            onShowToast={showToast}
            isModalOpen={isAddFarmerModalOpen}
            setIsModalOpen={setIsAddFarmerModalOpen}
          />
        )}

        {activeTab === 'fields' && (
          <FieldsScreen
            currentParcel={selectedParcel}
            parcels={parcels}
            onSelectParcel={setSelectedParcel}
            onSaveParcel={handleSaveParcel}
            onNavigate={setActiveTab}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'surveys' && (
          <SurveysScreen
            surveys={surveys}
            parcels={parcels}
            farmers={farmers}
            onAddSurvey={handleAddSurvey}
            onNavigate={setActiveTab}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsScreen
            surveys={surveys}
            onNavigate={setActiveTab}
            onShowToast={showToast}
          />
        )}
      </main>

      {/* Bottom 5-Tab Navigation Bar */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Toast Notification Container */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 max-w-md w-[92%] sm:w-auto bg-primary text-on-primary px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-outline-variant/30 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <span className="material-symbols-outlined text-secondary text-[22px] flex-shrink-0">
            check_circle
          </span>
          <span className="text-[13px] font-semibold flex-1 leading-snug">
            {toastMessage}
          </span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-on-primary/70 hover:text-on-primary ml-1"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}

      {/* Global Quick Search Modal */}
      {isSearchOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-start justify-center p-4 pt-16"
          onClick={() => setIsSearchOpen(false)}
        >
          <div
            className="bg-surface-container-lowest w-full max-w-lg rounded-2xl shadow-2xl p-4 flex flex-col gap-3 border border-outline-variant/20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 pb-2 border-b border-outline-variant/20">
              <span className="material-symbols-outlined text-primary text-[22px]">search</span>
              <input
                autoFocus
                value={globalSearchQuery}
                onChange={(e) => setGlobalSearchQuery(e.target.value)}
                placeholder="Quick find farmer, field ID, survey or taluk..."
                className="w-full bg-transparent text-[15px] text-on-surface outline-none placeholder:text-outline"
              />
              <button
                onClick={() => setIsSearchOpen(false)}
                className="text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-1 max-h-72 overflow-y-auto">
              <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider px-1 pt-1">
                {globalSearchQuery.trim() ? `Search Results (${
                  farmers.filter(f => f.name.toLowerCase().includes(globalSearchQuery.toLowerCase()) || f.code.toLowerCase().includes(globalSearchQuery.toLowerCase())).length +
                  parcels.filter(p => p.id.toLowerCase().includes(globalSearchQuery.toLowerCase()) || p.name.toLowerCase().includes(globalSearchQuery.toLowerCase())).length +
                  surveys.filter(s => s.id.toLowerCase().includes(globalSearchQuery.toLowerCase()) || s.farmerName.toLowerCase().includes(globalSearchQuery.toLowerCase())).length
                })` : 'Suggested Quick Jumps'}
              </span>

              {/* Dynamic Farmers Results */}
              {farmers
                .filter(f => !globalSearchQuery.trim() || f.name.toLowerCase().includes(globalSearchQuery.toLowerCase()) || f.code.toLowerCase().includes(globalSearchQuery.toLowerCase()) || f.location.toLowerCase().includes(globalSearchQuery.toLowerCase()))
                .slice(0, globalSearchQuery.trim() ? 3 : 1)
                .map(f => (
                  <button
                    key={f.id}
                    onClick={() => {
                      setActiveTab('farmers');
                      setIsSearchOpen(false);
                      showToast(`Opened ${f.name} record`);
                    }}
                    className="p-2.5 rounded-xl hover:bg-surface-container flex items-center justify-between text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-secondary/15 text-secondary flex items-center justify-center">
                        <span className="material-symbols-outlined text-[18px]">groups</span>
                      </div>
                      <div>
                        <span className="text-[13px] font-bold text-on-surface block">
                          {f.name} ({f.code})
                        </span>
                        <span className="text-[11px] text-on-surface-variant">
                          {f.location} • {f.totalAcres} Acres
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] text-primary font-bold">Farmer →</span>
                  </button>
                ))}

              {/* Dynamic Parcels Results */}
              {parcels
                .filter(p => !globalSearchQuery.trim() || p.id.toLowerCase().includes(globalSearchQuery.toLowerCase()) || p.name.toLowerCase().includes(globalSearchQuery.toLowerCase()) || p.crop.toLowerCase().includes(globalSearchQuery.toLowerCase()))
                .slice(0, globalSearchQuery.trim() ? 3 : 1)
                .map(p => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSelectedParcel(p);
                      setActiveTab('fields');
                      setIsSearchOpen(false);
                      showToast(`Mapped field ${p.id}`);
                    }}
                    className="p-2.5 rounded-xl hover:bg-surface-container flex items-center justify-between text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-primary/15 text-primary flex items-center justify-center">
                        <span className="material-symbols-outlined text-[18px]">polyline</span>
                      </div>
                      <div>
                        <span className="text-[13px] font-bold text-on-surface block">
                          {p.id} ({p.crop} {p.hectares} Ha)
                        </span>
                        <span className="text-[11px] text-on-surface-variant">
                          RTK GPS {p.gpsAccuracy} • {p.name}
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] text-primary font-bold">Field →</span>
                  </button>
                ))}

              {/* Dynamic Surveys Results */}
              {surveys
                .filter(s => !globalSearchQuery.trim() || s.id.toLowerCase().includes(globalSearchQuery.toLowerCase()) || s.farmerName.toLowerCase().includes(globalSearchQuery.toLowerCase()) || s.fieldId.toLowerCase().includes(globalSearchQuery.toLowerCase()))
                .slice(0, globalSearchQuery.trim() ? 3 : 1)
                .map(s => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setActiveTab('surveys');
                      setIsSearchOpen(false);
                      showToast(`Loaded survey ${s.id}`);
                    }}
                    className="p-2.5 rounded-xl hover:bg-surface-container flex items-center justify-between text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-tertiary/15 text-tertiary flex items-center justify-center">
                        <span className="material-symbols-outlined text-[18px]">assignment</span>
                      </div>
                      <div>
                        <span className="text-[13px] font-bold text-on-surface block">
                          {s.id} ({s.farmerName})
                        </span>
                        <span className="text-[11px] text-on-surface-variant">
                          {s.fieldId} • {s.crop} ({s.status})
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] text-primary font-bold">Survey →</span>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Inspector Profile & System Status Drawer */}
      {isInspectorProfileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setIsInspectorProfileOpen(false)}
        >
          <div
            className="bg-surface-container-lowest w-full max-w-md rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl flex flex-col gap-4 border border-outline-variant/20 animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
              <div className="flex items-center gap-3">
                <img
                  src={APP_ASSETS.inspector}
                  alt="Inspector Dr. Rajesh Sharma"
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-secondary/30 shadow-sm"
                />
                <div>
                  <h3 className="text-[17px] font-bold text-on-surface leading-tight">
                    Dr. Rajesh Sharma
                  </h3>
                  <span className="text-[12px] text-secondary font-bold">
                    Senior Cadastral Agronomist
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsInspectorProfileOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-container text-on-surface-variant"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[12px]">
              <div className="p-2.5 bg-surface-container-low rounded-xl flex flex-col">
                <span className="text-on-surface-variant">Badge ID</span>
                <span className="text-[14px] font-bold text-primary">AGRI-INSP-0419</span>
              </div>
              <div className="p-2.5 bg-surface-container-low rounded-xl flex flex-col">
                <span className="text-on-surface-variant">Assigned Sector</span>
                <span className="text-[14px] font-bold text-on-surface">Maddur Taluk</span>
              </div>
              <div className="p-2.5 bg-surface-container-low rounded-xl flex flex-col">
                <span className="text-on-surface-variant">GNSS Receiver</span>
                <span className="text-[14px] font-bold text-secondary">RTK L1/L5 (14 Sats)</span>
              </div>
              <div className="p-2.5 bg-surface-container-low rounded-xl flex flex-col">
                <span className="text-on-surface-variant">Device Battery</span>
                <span className="text-[14px] font-bold text-on-surface">88% Normal</span>
              </div>
            </div>

            <div className="p-3 bg-secondary/10 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[20px]">
                  cloud_done
                </span>
                <div className="flex flex-col">
                  <span className="text-[13px] font-bold text-secondary">
                    Local SQLite: In Sync
                  </span>
                  <span className="text-[11px] text-on-surface-variant">
                    Last push: 4 mins ago · SHA-256 Valid
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  showToast('Cloud database synchronized with local tables.');
                  setIsInspectorProfileOpen(false);
                }}
                className="h-8 px-3 rounded-lg bg-secondary text-white text-[12px] font-bold cursor-pointer"
              >
                Sync Now
              </button>
            </div>

            <button
              onClick={() => setIsInspectorProfileOpen(false)}
              className="w-full h-11 rounded-xl bg-surface-container text-on-surface text-[13px] font-semibold hover:bg-surface-container-high"
            >
              Close Inspector Sheet
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
