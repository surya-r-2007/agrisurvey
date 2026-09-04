import React, { useState, useRef } from 'react';
import { SurveyModuleItem, SoilSampleData, TabType, SurveyRecord, FieldParcel, Farmer } from '../types';
import { INITIAL_MODULES, INITIAL_SOIL_DATA } from '../data/initialData';

interface SurveysScreenProps {
  surveys?: SurveyRecord[];
  parcels?: FieldParcel[];
  farmers?: Farmer[];
  onAddSurvey?: (survey: SurveyRecord) => void;
  onNavigate: (tab: TabType) => void;
  onShowToast: (msg: string) => void;
}

export const SurveysScreen: React.FC<SurveysScreenProps> = ({
  surveys = [],
  parcels = [],
  farmers = [],
  onAddSurvey,
  onNavigate,
  onShowToast
}) => {
  const [selectedSurveyId, setSelectedSurveyId] = useState<string | null>(null);
  const [isCreatingSurvey, setIsCreatingSurvey] = useState(false);
  const [newFarmerName, setNewFarmerName] = useState('');
  const [newFieldId, setNewFieldId] = useState('');
  const [newCrop, setNewCrop] = useState('Sugarcane');
  const [newHectares, setNewHectares] = useState('3.5');

  const activeSurvey = selectedSurveyId
    ? surveys.find((s) => s.id === selectedSurveyId) || surveys[0]
    : surveys.length > 0
    ? surveys[0]
    : null;

  const [modules, setModules] = useState<SurveyModuleItem[]>(INITIAL_MODULES);
  const [activeModuleId, setActiveModuleId] = useState<number>(3);
  const [isHubCollapsed, setIsHubCollapsed] = useState(false);
  const [soilData, setSoilData] = useState<SoilSampleData>(INITIAL_SOIL_DATA);
  const [isValidated, setIsValidated] = useState(false);
  const [isDraftSaved, setIsDraftSaved] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(soilData.photoUrl);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeModule = modules.find((m) => m.id === activeModuleId) || modules[2];

  const completedModulesCount = modules.filter((m) => m.status === 'Completed').length;
  const progressPercent = Math.round((completedModulesCount / modules.length) * 100);

  const handleModuleClick = (mod: SurveyModuleItem) => {
    setActiveModuleId(mod.id);
    onShowToast(`Switched to Module ${mod.id}: ${mod.title.replace(/^\d+\.\s*/, '')}`);
  };

  const handleSaveDraft = () => {
    setIsDraftSaved(true);
    onShowToast(`Module ${activeModuleId} draft committed to local storage.`);
    setTimeout(() => setIsDraftSaved(false), 2000);
  };

  const handleValidate = () => {
    setIsValidated(true);
    setModules((prev) =>
      prev.map((m) => (m.id === activeModuleId ? { ...m, status: 'Completed' } : m))
    );
    onShowToast(`Module ${activeModuleId}: ${activeModule.title} validated A+!`);
  };

  const handleNextModule = () => {
    const nextId = activeModuleId < 10 ? activeModuleId + 1 : 1;
    setActiveModuleId(nextId);
    onShowToast(`Navigated to Module ${nextId}`);
  };

  const handleCreateSurvey = (e: React.FormEvent) => {
    e.preventDefault();
    const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const created: SurveyRecord = {
      id: `SRV-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
      timeOrDate: dateStr,
      farmerName: newFarmerName.trim() || (farmers[0]?.name ?? 'Registered Farmer'),
      fieldId: newFieldId.trim() || (parcels[0]?.id ?? 'FLD-01'),
      crop: newCrop,
      village: 'Huligere',
      auditedDate: dateStr,
      hectares: parseFloat(newHectares) || 3.0,
      completedModules: 1,
      totalModules: 10,
      status: 'Draft',
      date: dateStr
    };
    onAddSurvey?.(created);
    setSelectedSurveyId(created.id);
    setIsCreatingSurvey(false);
    onShowToast(`Survey dossier ${created.id} initiated!`);
  };

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      onShowToast('Please select a valid image file');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setPhotoPreview(result);
        onShowToast('Soil photo geotagged & EXIF metadata embedded.');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRetakePhoto = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  if (!activeSurvey && !isCreatingSurvey) {
    return (
      <div className="flex flex-col w-full pb-16 max-w-2xl mx-auto space-y-4">
        <div className="bg-surface-container-lowest rounded-2xl p-8 shadow-sm border border-outline-variant/15 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-surface-container text-primary flex items-center justify-center mb-3">
            <span className="material-symbols-outlined text-[32px]">assignment</span>
          </div>
          <h2 className="text-[20px] font-bold text-on-surface">No Survey Dossiers Recorded</h2>
          <p className="text-[13px] text-on-surface-variant mt-1.5 max-w-md">
            Field surveys guide the 10 systematic agronomic modules: soil physical & chemical tests, irrigation hydraulics, crop stage, and pest metrics.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2.5 mt-5">
            <button
              onClick={() => {
                setIsCreatingSurvey(true);
                setNewFieldId(parcels[0]?.id || '');
                setNewFarmerName(farmers[0]?.name || '');
              }}
              className="h-11 px-5 rounded-xl bg-primary hover:bg-primary-container text-on-primary text-[13px] font-bold flex items-center gap-2 shadow-sm cursor-pointer active:scale-95 transition-transform"
            >
              <span className="material-symbols-outlined text-[20px]">add_circle</span>
              <span>+ Start New Survey Dossier</span>
            </button>
            <button
              onClick={() => onNavigate('fields')}
              className="h-11 px-4 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-[13px] font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">polyline</span>
              <span>Field Boundaries</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full pb-16 max-w-2xl mx-auto space-y-4">
      {/* Multiple Surveys Switcher */}
      {surveys.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-pad-card px-pad-card scrollbar-none">
          {surveys.map((srv) => {
            const isSelected = activeSurvey && srv.id === activeSurvey.id && !isCreatingSurvey;
            return (
              <button
                key={srv.id}
                onClick={() => {
                  setIsCreatingSurvey(false);
                  setSelectedSurveyId(srv.id);
                }}
                className={`h-9 px-3.5 rounded-full text-[12px] font-bold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">assignment</span>
                <span>{srv.id}</span>
                <span className="text-[11px] opacity-75">({srv.farmerName})</span>
              </button>
            );
          })}
          <button
            onClick={() => {
              setIsCreatingSurvey(true);
              setNewFieldId(parcels[0]?.id || '');
              setNewFarmerName(farmers[0]?.name || '');
            }}
            className={`h-9 px-3.5 rounded-full text-[12px] font-bold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
              isCreatingSurvey
                ? 'bg-secondary text-on-secondary shadow-xs'
                : 'bg-surface-container-highest text-primary hover:bg-surface-container-high'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>+ New Survey</span>
          </button>
        </div>
      )}

      {/* Creation Modal / Inline Box */}
      {isCreatingSurvey && (
        <form onSubmit={handleCreateSurvey} className="bg-secondary-container/20 rounded-xl p-pad-card border border-secondary/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-[22px]">assignment_add</span>
              <h2 className="text-[16px] font-bold text-on-surface">Initiate New Survey Dossier</h2>
            </div>
            {surveys.length > 0 && (
              <button
                type="button"
                onClick={() => setIsCreatingSurvey(false)}
                className="text-[12px] font-bold text-on-surface-variant hover:text-on-surface cursor-pointer"
              >
                Cancel
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-bold text-on-surface-variant block mb-1">Farmer Name</label>
              {farmers.length > 0 ? (
                <select
                  value={newFarmerName}
                  onChange={(e) => setNewFarmerName(e.target.value)}
                  className="w-full h-10 px-2.5 rounded-lg bg-surface-container-lowest text-[13px] font-bold text-on-surface border border-outline-variant/30 focus:border-secondary outline-none"
                >
                  <option value="">Select farmer...</option>
                  {farmers.map((f) => (
                    <option key={f.id} value={f.name}>{f.name} ({f.code})</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={newFarmerName}
                  onChange={(e) => setNewFarmerName(e.target.value)}
                  placeholder="e.g. Ramesh Patil"
                  className="w-full h-10 px-2.5 rounded-lg bg-surface-container-lowest text-[13px] font-bold text-on-surface border border-outline-variant/30 focus:border-secondary outline-none"
                />
              )}
            </div>
            <div>
              <label className="text-[11px] font-bold text-on-surface-variant block mb-1">Field Parcel</label>
              {parcels.length > 0 ? (
                <select
                  value={newFieldId}
                  onChange={(e) => setNewFieldId(e.target.value)}
                  className="w-full h-10 px-2.5 rounded-lg bg-surface-container-lowest text-[13px] font-bold text-on-surface border border-outline-variant/30 focus:border-secondary outline-none"
                >
                  <option value="">Select field...</option>
                  {parcels.map((p) => (
                    <option key={p.id} value={p.id}>{p.id} ({p.crop})</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={newFieldId}
                  onChange={(e) => setNewFieldId(e.target.value)}
                  placeholder="e.g. FLD-01"
                  className="w-full h-10 px-2.5 rounded-lg bg-surface-container-lowest text-[13px] font-bold text-on-surface border border-outline-variant/30 focus:border-secondary outline-none"
                />
              )}
            </div>
            <div>
              <label className="text-[11px] font-bold text-on-surface-variant block mb-1">Primary Crop</label>
              <select
                value={newCrop}
                onChange={(e) => setNewCrop(e.target.value)}
                className="w-full h-10 px-2.5 rounded-lg bg-surface-container-lowest text-[13px] font-bold text-on-surface border border-outline-variant/30 focus:border-secondary outline-none"
              >
                <option>Sugarcane</option>
                <option>Paddy</option>
                <option>Cotton</option>
                <option>Maize</option>
                <option>Pulses</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-bold text-on-surface-variant block mb-1">Hectares</label>
              <input
                type="number"
                step="0.1"
                value={newHectares}
                onChange={(e) => setNewHectares(e.target.value)}
                placeholder="e.g. 3.5"
                className="w-full h-10 px-2.5 rounded-lg bg-surface-container-lowest text-[13px] font-bold text-on-surface border border-outline-variant/30 focus:border-secondary outline-none"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full h-11 bg-primary text-on-primary rounded-lg text-[13px] font-bold hover:bg-primary-container cursor-pointer transition-colors"
          >
            Start 10-Module Survey Process
          </button>
        </form>
      )}

      {/* Top Meta & Progress Surface */}
      {activeSurvey && (
        <section className="bg-surface-container-lowest rounded-xl p-pad-card shadow-sm flex flex-col gap-3 border border-outline-variant/15">
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[20px] font-bold text-primary truncate">{activeSurvey.id}</span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container">
                  Field Sync
                </span>
              </div>
              <p className="text-[13px] text-on-surface-variant flex items-center gap-1.5 mt-0.5 font-medium">
                <span className="material-symbols-outlined text-[16px] text-secondary">calendar_today</span>
                <span>{activeSurvey.date}</span>
                <span className="inline-block w-1 h-1 rounded-full bg-outline-variant"></span>
                <span className="font-semibold text-on-surface">{activeSurvey.farmerName}</span>
              </p>
            </div>
            <div className="flex flex-col items-end flex-shrink-0">
              <span className="text-[16px] font-bold text-primary">{progressPercent}%</span>
              <span className="text-[11px] text-on-surface-variant font-medium">{completedModulesCount} of 10 Done</span>
            </div>
          </div>

          {/* Micro Context Strip */}
          <div className="bg-surface-container p-2.5 rounded-lg flex items-center justify-between gap-2 text-on-surface border border-outline-variant/10">
            <div className="flex items-center gap-2 min-w-0">
              <span className="material-symbols-outlined text-secondary text-[20px] flex-shrink-0">
                agriculture
              </span>
              <div className="truncate">
                <span className="text-[13px] font-bold text-on-surface">{activeSurvey.fieldId}</span>
                <span className="text-[13px] text-on-surface-variant"> · {activeSurvey.crop}, {activeSurvey.hectares} Ha</span>
              </div>
            </div>
            <span className="text-[11px] text-secondary bg-surface-container-lowest px-2 py-0.5 rounded font-bold flex-shrink-0">
              Active Dossier
            </span>
          </div>

          {/* Systematic Progress Bar */}
          <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden flex">
            <div
              className="bg-secondary h-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </section>
      )}

      {/* Accordion Toggle Hub Trigger */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[20px]">view_timeline</span>
          <h2 className="text-[18px] font-bold text-primary">Survey Modules</h2>
        </div>
        <button
          onClick={() => setIsHubCollapsed(!isHubCollapsed)}
          className="h-10 px-3 rounded-lg text-secondary flex items-center gap-1 text-[13px] font-bold hover:bg-surface-container transition-colors cursor-pointer"
          type="button"
        >
          <span>{isHubCollapsed ? 'Expand 10 Modules' : 'Collapse Hub'}</span>
          <span className="material-symbols-outlined text-[18px]">
            {isHubCollapsed ? 'expand_more' : 'expand_less'}
          </span>
        </button>
      </div>

      {/* 10 Modules List / Overview Card */}
      {!isHubCollapsed && (
        <div className="flex flex-col gap-2 mb-6 transition-all duration-300">
          {modules.map((mod) => {
            const isActive = mod.id === activeModuleId;
            return (
              <div
                key={mod.id}
                onClick={() => handleModuleClick(mod)}
                className={`p-3 rounded-xl shadow-sm flex items-center justify-between gap-3 cursor-pointer transition-all ${
                  isActive
                    ? 'bg-primary-container text-on-primary shadow-md shadow-[0_4px_12px_rgba(27,67,50,0.18)]'
                    : 'bg-surface-container-lowest hover:bg-surface-container border border-outline-variant/15 text-on-surface'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {mod.status === 'Completed' ? (
                    <div className="w-7 h-7 rounded-full bg-secondary text-on-secondary flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-[16px]">check</span>
                    </div>
                  ) : isActive ? (
                    <div className="w-7 h-7 rounded-full bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center flex-shrink-0 animate-pulse">
                      <span className="material-symbols-outlined text-[16px]">edit</span>
                    </div>
                  ) : mod.status.includes('Draft') ? (
                    <div className="w-7 h-7 rounded-full bg-tertiary-fixed-dim text-on-tertiary-fixed-variant flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-[16px]">hourglass_top</span>
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-surface-container-highest text-outline flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-[16px]">radio_button_unchecked</span>
                    </div>
                  )}
                  <span className={`text-[13px] truncate ${isActive ? 'font-bold text-white' : 'font-semibold'}`}>
                    {mod.title}
                  </span>
                </div>

                {mod.status === 'Completed' ? (
                  <span className="text-[11px] bg-secondary-fixed text-on-secondary-fixed px-2 py-0.5 rounded-full font-bold flex-shrink-0">
                    Completed
                  </span>
                ) : isActive ? (
                  <span className="text-[11px] bg-tertiary-fixed text-on-tertiary-fixed px-2 py-0.5 rounded-full font-bold flex-shrink-0">
                    Active
                  </span>
                ) : mod.status.includes('Draft') ? (
                  <span className="text-[11px] bg-surface-container-high text-on-surface-variant px-2 py-0.5 rounded-full font-semibold flex-shrink-0">
                    {mod.status}
                  </span>
                ) : (
                  <span className="text-[11px] bg-surface-container-high text-outline px-2 py-0.5 rounded-full font-medium flex-shrink-0">
                    Not Started
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Active Module Card: Module 3 Soil Survey */}
      <section className="bg-surface-container-lowest rounded-xl shadow-sm p-pad-card flex flex-col gap-4 mb-6 border border-outline-variant/15">
        {/* Active Header */}
        <div className="flex items-start justify-between gap-2 pb-2 border-b border-outline-variant/15">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 text-secondary">
              <span className="material-symbols-outlined text-[18px]">file_open</span>
              <span className="text-[11px] uppercase tracking-wide font-bold">Active Survey Step</span>
            </div>
            <h3 className="text-[18px] font-bold text-primary mt-0.5">
              {activeModule.id === 3
                ? 'Module 3: Soil Physical & Chemical'
                : activeModule.title}
            </h3>
          </div>
          <div className="h-8 px-2.5 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center gap-1 text-[11px] font-bold flex-shrink-0">
            <span className="w-2 h-2 rounded-full bg-secondary"></span>
            In-Field
          </div>
        </div>

        {/* Sample Meta Block */}
        <div className="bg-surface-container-low rounded-lg p-3 flex flex-col gap-2 border border-outline-variant/10">
          <div className="flex justify-between items-center text-on-surface">
            <span className="text-[13px] text-on-surface-variant">Core ID</span>
            <span className="text-[13px] font-bold text-primary">{soilData.coreId}</span>
          </div>
          <div className="flex justify-between items-center text-on-surface">
            <span className="text-[13px] text-on-surface-variant">Horizon Depth</span>
            <span className="text-[13px] font-bold text-on-surface">{soilData.horizonDepth}</span>
          </div>
          <div className="flex justify-between items-center text-on-surface">
            <span className="text-[13px] text-on-surface-variant">Subsamples</span>
            <span className="text-[13px] font-medium text-on-surface">{soilData.subsamples}</span>
          </div>
        </div>

        {/* Physical Properties Section */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-primary font-bold uppercase tracking-wider">
              Physical Properties
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-semibold">
              Hydrometer Calibrated
            </span>
          </div>

          {/* Soil Texture Callout */}
          <div className="bg-surface-container p-3 rounded-lg flex items-center justify-between border border-outline-variant/10">
            <div className="flex flex-col">
              <span className="text-[11px] text-on-surface-variant font-medium">USDA Classification</span>
              <span className="text-[18px] font-bold text-primary leading-tight">
                {soilData.usdaClassification}
              </span>
            </div>
            <div className="flex gap-1.5 text-center text-[12px]">
              <div className="bg-surface-container-lowest px-2 py-1 rounded shadow-xs">
                <p className="text-on-surface-variant text-[10px]">Sand</p>
                <p className="font-bold text-on-surface">{soilData.sandPercent}%</p>
              </div>
              <div className="bg-surface-container-lowest px-2 py-1 rounded shadow-xs">
                <p className="text-on-surface-variant text-[10px]">Silt</p>
                <p className="font-bold text-on-surface">{soilData.siltPercent}%</p>
              </div>
              <div className="bg-surface-container-lowest px-2 py-1 rounded shadow-xs">
                <p className="text-on-surface-variant text-[10px]">Clay</p>
                <p className="font-bold text-on-surface">{soilData.clayPercent}%</p>
              </div>
            </div>
          </div>

          {/* Physical Grid Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-surface-container-low p-3 rounded-lg flex flex-col border border-outline-variant/10">
              <span className="text-[11px] text-on-surface-variant font-medium">Bulk Density</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-[20px] font-bold text-primary">{soilData.bulkDensity}</span>
                <span className="text-[11px] text-on-surface-variant font-sans">g/cm³</span>
              </div>
              <span className="text-[11px] text-secondary font-semibold mt-1">Optimal aeration</span>
            </div>

            <div className="bg-surface-container-low p-3 rounded-lg flex flex-col border border-outline-variant/10">
              <span className="text-[11px] text-on-surface-variant font-medium">Porosity</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-[20px] font-bold text-primary">{soilData.porosity}</span>
                <span className="text-[11px] text-on-surface-variant font-sans">%</span>
              </div>
              <span className="text-[11px] text-secondary font-semibold mt-1">High retention</span>
            </div>

            <div className="bg-surface-container-low p-3 rounded-lg flex flex-col border border-outline-variant/10">
              <span className="text-[11px] text-on-surface-variant font-medium">Soil Moisture (TDR)</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-[20px] font-bold text-primary">{soilData.soilMoistureVwc}</span>
                <span className="text-[11px] text-on-surface-variant font-sans">% VWC</span>
              </div>
              <span className="text-[11px] text-on-surface-variant mt-1 font-medium">
                Field capacity {soilData.fieldCapacity}%
              </span>
            </div>

            <div className="bg-surface-container-low p-3 rounded-lg flex flex-col border border-outline-variant/10">
              <span className="text-[11px] text-on-surface-variant font-medium">Infiltration Rate</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-[20px] font-bold text-primary">{soilData.infiltrationRate}</span>
                <span className="text-[11px] text-on-surface-variant font-sans">mm/hr</span>
              </div>
              <span className="text-[11px] text-secondary font-semibold mt-1">Moderate intake</span>
            </div>
          </div>
        </div>

        {/* Chemical & Nutrient Bar Graph / Range Section */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-primary font-bold uppercase tracking-wider">
              Chemical & Nutrients
            </span>
            <span className="text-[11px] text-secondary font-bold">Optical Spectro Validated</span>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-surface-container-low p-2.5 rounded-lg flex flex-col items-center text-center border border-outline-variant/10">
              <span className="text-[11px] text-on-surface-variant font-medium">pH Level</span>
              <span className="text-[18px] font-bold text-primary mt-0.5">{soilData.ph}</span>
              <span className="text-[11px] text-secondary font-bold">Optimal</span>
            </div>

            <div className="bg-surface-container-low p-2.5 rounded-lg flex flex-col items-center text-center border border-outline-variant/10">
              <span className="text-[11px] text-on-surface-variant font-medium">Elec. Cond.</span>
              <span className="text-[18px] font-bold text-primary mt-0.5">{soilData.ec}</span>
              <span className="text-[11px] text-on-surface-variant font-medium">dS/m</span>
            </div>

            <div className="bg-surface-container-low p-2.5 rounded-lg flex flex-col items-center text-center border border-outline-variant/10">
              <span className="text-[11px] text-on-surface-variant font-medium">Org. Carbon</span>
              <span className="text-[18px] font-bold text-primary mt-0.5">{soilData.orgCarbon}</span>
              <span className="text-[11px] text-tertiary font-bold">Moderate</span>
            </div>
          </div>

          {/* N-P-K Visual Range Meters */}
          <div className="flex flex-col gap-2.5 bg-surface-container-low p-3 rounded-lg border border-outline-variant/10">
            {/* Nitrogen Meter */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-on-surface text-[12px]">
                <span className="font-semibold">Available Nitrogen (N)</span>
                <span className="font-bold text-tertiary">
                  {soilData.nitrogenKgHa} kg/ha · {soilData.nitrogenStatus}
                </span>
              </div>
              <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden flex">
                <div className="h-full bg-on-tertiary-container rounded-full" style={{ width: '58%' }}></div>
              </div>
            </div>

            {/* Phosphorus Meter */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-on-surface text-[12px]">
                <span className="font-semibold">Phosphorus (P₂O₅)</span>
                <span className="font-bold text-secondary">
                  {soilData.phosphorusKgHa} kg/ha · {soilData.phosphorusStatus}
                </span>
              </div>
              <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden flex">
                <div className="h-full bg-secondary rounded-full" style={{ width: '82%' }}></div>
              </div>
            </div>

            {/* Potassium Meter */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-on-surface text-[12px]">
                <span className="font-semibold">Potassium (K₂O)</span>
                <span className="font-bold text-primary">
                  {soilData.potassiumKgHa} kg/ha · {soilData.potassiumStatus}
                </span>
              </div>
              <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden flex">
                <div className="h-full bg-primary-container rounded-full" style={{ width: '70%' }}></div>
              </div>
            </div>
          </div>

          {/* Micronutrient Pills */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            <span className="text-[11px] bg-surface-container px-2.5 py-1 rounded text-on-surface font-medium border border-outline-variant/10">
              Zn: <strong className="text-primary">{soilData.micronutrients.zn.val} ppm</strong> ({soilData.micronutrients.zn.status})
            </span>
            <span className="text-[11px] bg-surface-container px-2.5 py-1 rounded text-on-surface font-medium border border-outline-variant/10">
              Fe: <strong className="text-primary">{soilData.micronutrients.fe.val} ppm</strong> ({soilData.micronutrients.fe.status})
            </span>
            <span className="text-[11px] bg-surface-container px-2.5 py-1 rounded text-on-surface font-medium border border-outline-variant/10">
              Mn: <strong className="text-primary">{soilData.micronutrients.mn.val} ppm</strong> ({soilData.micronutrients.mn.status})
            </span>
            <span className="text-[11px] bg-surface-container px-2.5 py-1 rounded text-on-surface font-medium border border-outline-variant/10">
              Cu: <strong className="text-primary">{soilData.micronutrients.cu.val} ppm</strong>
            </span>
            <span className="text-[11px] bg-surface-container px-2.5 py-1 rounded text-on-surface font-medium border border-outline-variant/10">
              B: <strong className="text-primary">{soilData.micronutrients.b.val} ppm</strong>
            </span>
          </div>
        </div>

        {/* Soil Condition Observation */}
        <div className="bg-surface-container p-3 rounded-lg flex flex-col gap-1.5 border border-outline-variant/10">
          <div className="flex items-center gap-1.5 text-primary">
            <span className="material-symbols-outlined text-[18px]">lens_blur</span>
            <span className="text-[13px] font-bold">Field Inspector Diagnostic</span>
          </div>
          <p className="text-[13px] text-on-surface leading-relaxed">
            Compaction: <span className="font-semibold text-tertiary">{soilData.compaction}</span> · Salinity:{' '}
            <span className="font-semibold text-secondary">{soilData.salinity}</span> · Root-Zone:{' '}
            <span className="font-semibold">{soilData.rootZone}</span>
          </p>
        </div>

        {/* Geo-Tagged Core Attachment */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-primary font-bold uppercase tracking-wider">
              Core Cross-Section Photo
            </span>
            <span className="text-[11px] text-secondary flex items-center gap-1 font-bold">
              <span className="material-symbols-outlined text-[14px]">gps_fixed</span> GPS Locked
            </span>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file);
            }}
            accept="image/*"
            className="hidden"
          />

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              const file = e.dataTransfer.files?.[0];
              if (file) handleFileUpload(file);
            }}
            className={`relative rounded-xl overflow-hidden shadow-sm aspect-[16/9] w-full bg-surface-container-high border transition-all ${
              isDragging
                ? 'border-primary ring-2 ring-primary/40'
                : 'border-outline-variant/20'
            }`}
          >
            <img
              className="w-full h-full object-cover cursor-pointer"
              alt="Soil auger core sample"
              src={photoPreview}
              onClick={handleRetakePhoto}
              title="Click or drag new field photo here"
            />
            {isDragging && (
              <div className="absolute inset-0 bg-primary/20 backdrop-blur-xs flex items-center justify-center pointer-events-none">
                <span className="bg-surface text-primary font-bold px-3 py-1.5 rounded-lg text-[13px] shadow">
                  Drop image to attach photo
                </span>
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-primary/95 via-primary/60 to-transparent p-2.5 text-on-primary flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[12px] font-bold">{soilData.coreId} Core Sample</span>
                <span className="text-[11px] opacity-90 font-mono">
                  {soilData.gpsCoords} · {soilData.gpsAccuracy}
                </span>
              </div>
              <button
                aria-label="Upload or take Soil Photo"
                onClick={handleRetakePhoto}
                className="h-9 w-9 rounded-full bg-surface-container-lowest text-primary flex items-center justify-center shadow hover:scale-105 active:scale-95 transition-all cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">photo_camera</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Persistent Bottom Action Area */}
      <footer className="bg-surface-container-lowest rounded-xl shadow-lg p-pad-card flex flex-col gap-3 border border-outline-variant/15">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span>
            <span className="text-[12px] text-on-surface font-bold">SQLite Auto-commit Staged</span>
          </div>
          <span className="text-[11px] text-on-surface-variant font-medium">Last saved: 10:44 AM</span>
        </div>

        {/* Action Buttons Stack */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleSaveDraft}
            className={`h-12 rounded-lg text-[14px] font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
              isDraftSaved
                ? 'bg-secondary text-white'
                : 'bg-surface-container text-primary hover:bg-surface-container-high'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">
              {isDraftSaved ? 'done' : 'save'}
            </span>
            <span>{isDraftSaved ? 'Saved!' : 'Save Draft'}</span>
          </button>

          <button
            onClick={handleValidate}
            className={`h-12 rounded-lg text-[14px] font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer ${
              isValidated
                ? 'bg-primary text-white'
                : 'bg-secondary text-on-secondary hover:bg-secondary/90'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">
              {isValidated ? 'verified' : 'check_circle'}
            </span>
            <span>{isValidated ? 'Validated' : 'Validate'}</span>
          </button>
        </div>

        <button
          onClick={handleNextModule}
          className="w-full h-12 rounded-lg bg-primary-container hover:bg-primary text-[14px] font-bold text-on-primary flex items-center justify-center gap-2 transition-colors cursor-pointer"
          type="button"
        >
          <span>Next: Water & Hydraulic Survey</span>
          <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
        </button>
      </footer>
    </div>
  );
};
