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
  const [activeModuleId, setActiveModuleId] = useState<number>(1);
  const [isHubCollapsed, setIsHubCollapsed] = useState(false);
  const [soilData, setSoilData] = useState<SoilSampleData>(INITIAL_SOIL_DATA);
  const [isValidated, setIsValidated] = useState(false);
  const [isDraftSaved, setIsDraftSaved] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(soilData.photoUrl);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeModule = modules.find((m) => m.id === activeModuleId) || modules[0];

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

      {/* Empty State Banner when no surveys exist */}
      {surveys.length === 0 && !isCreatingSurvey && (
        <div className="w-full bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/15 text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-xl bg-surface-container text-primary flex items-center justify-center mb-2">
            <span className="material-symbols-outlined text-[24px]">assignment_late</span>
          </div>
          <h4 className="text-[16px] font-bold text-on-surface">No Survey Dossiers Recorded</h4>
          <p className="text-[12px] text-on-surface-variant mt-1 max-w-sm">
            Start a new 10-module survey evaluation dossier for a registered farmer or field plot.
          </p>
          <button
            onClick={() => {
              setIsCreatingSurvey(true);
              setNewFieldId(parcels[0]?.id || '');
              setNewFarmerName(farmers[0]?.name || '');
            }}
            className="mt-3.5 h-10 px-5 rounded-xl bg-primary text-on-primary text-[13px] font-bold flex items-center gap-1.5 shadow-sm hover:opacity-95 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">assignment_add</span>
            <span>+ Initiate New Survey Dossier</span>
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

      {/* Active Module Card: Dynamic 10-Module Red-Knight Survey Forms */}
      <section className="bg-surface-container-lowest rounded-xl shadow-sm p-pad-card flex flex-col gap-4 mb-6 border border-outline-variant/15">
        {/* Active Header */}
        <div className="flex items-start justify-between gap-2 pb-2 border-b border-outline-variant/15">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 text-secondary">
              <span className="material-symbols-outlined text-[18px]">file_open</span>
              <span className="text-[11px] uppercase tracking-wide font-bold">
                Red-Knight Survey Form {activeModule.id.toString().padStart(2, '0')}
              </span>
            </div>
            <h3 className="text-[18px] font-bold text-primary mt-0.5">
              {activeModule.title}
            </h3>
          </div>
          <div className="h-8 px-2.5 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center gap-1 text-[11px] font-bold flex-shrink-0">
            <span className="w-2 h-2 rounded-full bg-secondary"></span>
            Field Active
          </div>
        </div>

        {/* Dynamic Form Render Strategy based on activeModuleId (1 - 10) */}
        {activeModuleId === 1 && (
          <div className="flex flex-col gap-4">
            <span className="text-[13px] text-primary font-bold uppercase tracking-wider">FORM 01 — Farmer / Stakeholder Survey</span>
            <div className="grid grid-cols-2 gap-2 text-[12px] bg-surface-container-low p-3 rounded-lg border border-outline-variant/10">
              <div><span className="text-on-surface-variant font-medium block">Survey ID:</span> <strong className="text-on-surface">{activeSurvey?.id || 'New Survey'}</strong></div>
              <div><span className="text-on-surface-variant font-medium block">Village / Sector:</span> <strong className="text-on-surface">{activeSurvey?.village || 'N/A'}</strong></div>
              <div><span className="text-on-surface-variant font-medium block">District / Zone:</span> <strong className="text-on-surface">Field Zone</strong></div>
              <div><span className="text-on-surface-variant font-medium block">Farming Experience:</span> <strong className="text-on-surface">18 Years</strong></div>
              <div><span className="text-on-surface-variant font-medium block">Ownership:</span> <strong className="text-on-surface">Owned (8.5 Acres)</strong></div>
            </div>

            <div className="space-y-2">
              <span className="text-[12px] text-on-surface-variant font-bold uppercase">C. Current Farming Practices</span>
              <div className="overflow-x-auto text-[11px]">
                <table className="w-full text-left border-collapse border border-outline-variant/20">
                  <thead className="bg-surface-container font-bold text-on-surface">
                    <tr><th className="p-1.5 border">Practice</th><th className="p-1.5 border">Method</th><th className="p-1.5 border">Frequency</th><th className="p-1.5 border">Remarks</th></tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10 text-on-surface">
                    <tr><td className="p-1.5 border font-semibold">Land Preparation</td><td className="p-1.5 border">Tractor Mouldboard Plough</td><td className="p-1.5 border">Bi-annual</td><td className="p-1.5 border">Deep tilled</td></tr>
                    <tr><td className="p-1.5 border font-semibold">Seed Selection</td><td className="p-1.5 border">Certified Co-86032 Setts</td><td className="p-1.5 border">Per Season</td><td className="p-1.5 border">Hot water treated</td></tr>
                    <tr><td className="p-1.5 border font-semibold">Irrigation</td><td className="p-1.5 border">Inline Drip (16mm, 40cm)</td><td className="p-1.5 border">Alternate Days</td><td className="p-1.5 border">Automated solenoid</td></tr>
                    <tr><td className="p-1.5 border font-semibold">Fertilization</td><td className="p-1.5 border">Venturi Drip Fertigation</td><td className="p-1.5 border">Weekly Split</td><td className="p-1.5 border">19-19-19 + Urea</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[12px] text-on-surface-variant font-bold uppercase">D. Priority Problems & Constraints</span>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-surface-container rounded border text-[11px]">
                  <span className="text-secondary font-bold">1. Water Shortage</span>
                  <p className="text-outline">Severity: 4/5 · Solution: Borewell recharge pit</p>
                </div>
                <div className="p-2 bg-surface-container rounded border text-[11px]">
                  <span className="text-tertiary font-bold">2. Labour Shortage</span>
                  <p className="text-outline">Severity: 4/5 · Solution: Mechanical harvester rent</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeModuleId === 2 && (
          <div className="flex flex-col gap-4">
            <span className="text-[13px] text-primary font-bold uppercase tracking-wider">FORM 02 — Field Survey & Cadastral Geometry</span>
            <div className="grid grid-cols-3 gap-2 text-[11px] bg-surface-container-low p-3 rounded-lg border border-outline-variant/10">
              <div><span className="text-on-surface-variant block font-medium">GPS Latitude</span><strong className="text-primary font-mono">12.584219° N</strong></div>
              <div><span className="text-on-surface-variant block font-medium">GPS Longitude</span><strong className="text-primary font-mono">77.042831° E</strong></div>
              <div><span className="text-on-surface-variant block font-medium">Altitude / Elev</span><strong className="text-on-surface font-mono">662.4m MSL</strong></div>
              <div><span className="text-on-surface-variant block font-medium">Field Area</span><strong className="text-on-surface">3.2 Ha (7.9 Acres)</strong></div>
              <div><span className="text-on-surface-variant block font-medium">Perimeter</span><strong className="text-on-surface">640 meters</strong></div>
              <div><span className="text-on-surface-variant block font-medium">Slope Gradient</span><strong className="text-secondary font-bold">3.8% Eastward</strong></div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[12px]">
              <div className="p-2.5 bg-surface-container rounded-lg border">
                <span className="font-bold text-primary block mb-1">Soil Surface & Drainage</span>
                <p className="text-[11px] text-on-surface-variant">Erosion: <strong>Low</strong> · Waterlogging: <strong>Nil</strong></p>
                <p className="text-[11px] text-on-surface-variant">Natural Drainage: <strong>Moderate (Swale)</strong></p>
              </div>
              <div className="p-2.5 bg-surface-container rounded-lg border">
                <span className="font-bold text-primary block mb-1">Field Mapping & Drone Status</span>
                <p className="text-[11px] text-on-surface-variant">GPS Boundary: <strong className="text-secondary">Recorded (RTK)</strong></p>
                <p className="text-[11px] text-on-surface-variant">Drone Survey: <strong>Required (NDVI)</strong></p>
              </div>
            </div>
          </div>
        )}

        {activeModuleId === 3 && (
          <div className="flex flex-col gap-4">
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
                <span className="text-[13px] text-primary font-bold uppercase tracking-wider">Physical Properties</span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-semibold">Hydrometer Calibrated</span>
              </div>
              <div className="bg-surface-container p-3 rounded-lg flex items-center justify-between border border-outline-variant/10">
                <div className="flex flex-col">
                  <span className="text-[11px] text-on-surface-variant font-medium">USDA Classification</span>
                  <span className="text-[18px] font-bold text-primary leading-tight">{soilData.usdaClassification}</span>
                </div>
                <div className="flex gap-1.5 text-center text-[12px]">
                  <div className="bg-surface-container-lowest px-2 py-1 rounded shadow-xs"><p className="text-on-surface-variant text-[10px]">Sand</p><p className="font-bold text-on-surface">{soilData.sandPercent}%</p></div>
                  <div className="bg-surface-container-lowest px-2 py-1 rounded shadow-xs"><p className="text-on-surface-variant text-[10px]">Silt</p><p className="font-bold text-on-surface">{soilData.siltPercent}%</p></div>
                  <div className="bg-surface-container-lowest px-2 py-1 rounded shadow-xs"><p className="text-on-surface-variant text-[10px]">Clay</p><p className="font-bold text-on-surface">{soilData.clayPercent}%</p></div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-surface-container-low p-3 rounded-lg flex flex-col border border-outline-variant/10">
                  <span className="text-[11px] text-on-surface-variant font-medium">Bulk Density</span>
                  <div className="flex items-baseline gap-1 mt-1"><span className="text-[20px] font-bold text-primary">{soilData.bulkDensity}</span><span className="text-[11px] text-on-surface-variant font-sans">g/cm³</span></div>
                </div>
                <div className="bg-surface-container-low p-3 rounded-lg flex flex-col border border-outline-variant/10">
                  <span className="text-[11px] text-on-surface-variant font-medium">Soil Moisture (TDR)</span>
                  <div className="flex items-baseline gap-1 mt-1"><span className="text-[20px] font-bold text-primary">{soilData.soilMoistureVwc}</span><span className="text-[11px] text-on-surface-variant font-sans">% VWC</span></div>
                </div>
              </div>
            </div>

            {/* Chemical & Nutrient Section */}
            <div className="flex flex-col gap-3">
              <span className="text-[13px] text-primary font-bold uppercase tracking-wider">Chemical & Nutrients</span>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-surface-container-low p-2.5 rounded-lg flex flex-col items-center text-center border border-outline-variant/10"><span className="text-[11px] text-on-surface-variant font-medium">pH Level</span><span className="text-[18px] font-bold text-primary mt-0.5">{soilData.ph}</span></div>
                <div className="bg-surface-container-low p-2.5 rounded-lg flex flex-col items-center text-center border border-outline-variant/10"><span className="text-[11px] text-on-surface-variant font-medium">Elec. Cond.</span><span className="text-[18px] font-bold text-primary mt-0.5">{soilData.ec} dS/m</span></div>
                <div className="bg-surface-container-low p-2.5 rounded-lg flex flex-col items-center text-center border border-outline-variant/10"><span className="text-[11px] text-on-surface-variant font-medium">Org. Carbon</span><span className="text-[18px] font-bold text-primary mt-0.5">{soilData.orgCarbon}%</span></div>
              </div>
            </div>

            {/* Geotagged Photo Upload */}
            <div className="flex flex-col gap-2">
              <span className="text-[13px] text-primary font-bold uppercase tracking-wider">Core Cross-Section Photo</span>
              <input type="file" ref={fileInputRef} onChange={(e) => { const file = e.target.files?.[0]; if (file) handleFileUpload(file); }} accept="image/*" className="hidden" />
              <div onClick={handleRetakePhoto} className="relative rounded-xl overflow-hidden shadow-sm aspect-[16/9] w-full bg-surface-container-high cursor-pointer">
                <img className="w-full h-full object-cover" alt="Soil auger core" src={photoPreview} />
                <div className="absolute inset-x-0 bottom-0 bg-primary/80 p-2 text-white text-[11px] font-mono flex justify-between">
                  <span>{soilData.coreId} Core Sample</span>
                  <span>{soilData.gpsCoords}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeModuleId === 4 && (
          <div className="flex flex-col gap-4">
            <span className="text-[13px] text-primary font-bold uppercase tracking-wider">FORM 04 — Water & Hydraulic Survey</span>
            <div className="grid grid-cols-2 gap-2 text-[12px] bg-surface-container-low p-3 rounded-lg border border-outline-variant/10">
              <div><span className="text-on-surface-variant font-medium block">Water Source:</span><strong className="text-primary">Deep Borewell (180 ft)</strong></div>
              <div><span className="text-on-surface-variant font-medium block">Pump Capacity:</span><strong className="text-on-surface">7.5 HP Submersible</strong></div>
              <div><span className="text-on-surface-variant font-medium block">Pump Discharge:</span><strong className="text-on-surface">220 L/min</strong></div>
              <div><span className="text-on-surface-variant font-medium block">Daily Availability:</span><strong className="text-on-surface">6.5 hours / day</strong></div>
              <div><span className="text-on-surface-variant font-medium block">System Pressure:</span><strong className="text-secondary font-bold">180 kPa (2.5 bar)</strong></div>
              <div><span className="text-on-surface-variant font-medium block">Distribution Uniformity:</span><strong className="text-secondary font-bold">92% (Optimal)</strong></div>
            </div>

            <div className="space-y-2">
              <span className="text-[12px] text-on-surface-variant font-bold uppercase">C. Water Quality Parameters</span>
              <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                <div className="p-2 bg-surface-container rounded border"><p className="text-outline">pH</p><p className="font-bold text-primary text-[15px]">7.2</p></div>
                <div className="p-2 bg-surface-container rounded border"><p className="text-outline">TDS</p><p className="font-bold text-primary text-[15px]">420 mg/L</p></div>
                <div className="p-2 bg-surface-container rounded border"><p className="text-outline">Salinity</p><p className="font-bold text-secondary text-[15px]">0.35 ppt</p></div>
              </div>
            </div>
          </div>
        )}

        {activeModuleId === 5 && (
          <div className="flex flex-col gap-4">
            <span className="text-[13px] text-primary font-bold uppercase tracking-wider">FORM 05 — Crop & Plant Population Survey</span>
            <div className="grid grid-cols-2 gap-2 text-[12px] bg-surface-container-low p-3 rounded-lg border border-outline-variant/10">
              <div><span className="text-on-surface-variant font-medium block">Crop & Variety:</span><strong className="text-primary font-bold">Sugarcane (Co-86032)</strong></div>
              <div><span className="text-on-surface-variant font-medium block">Growth Stage:</span><strong className="text-on-surface">Grand Growth (160 Days)</strong></div>
              <div><span className="text-on-surface-variant font-medium block">Row Spacing:</span><strong className="text-on-surface">150 cm Dual-Row</strong></div>
              <div><span className="text-on-surface-variant font-medium block">Plant Population:</span><strong className="text-on-surface">62,000 canes / ha</strong></div>
              <div><span className="text-on-surface-variant font-medium block">Canopy Cover:</span><strong className="text-secondary font-bold">88% Intercepted</strong></div>
              <div><span className="text-on-surface-variant font-medium block">Plant Height:</span><strong className="text-on-surface">2.45 meters</strong></div>
            </div>

            <div className="p-3 bg-surface-container rounded-lg border text-[12px]">
              <span className="font-bold text-primary block mb-1">D. Yield Expectations & Quality</span>
              <div className="flex justify-between items-center mt-1">
                <span>Expected Yield Target:</span><strong className="text-secondary">110 Tonnes / Ha</strong>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span>Current Estimated Stalk Weight:</span><strong>1.45 kg / cane</strong>
              </div>
            </div>
          </div>
        )}

        {activeModuleId === 6 && (
          <div className="flex flex-col gap-4">
            <span className="text-[13px] text-primary font-bold uppercase tracking-wider">FORM 06 — Pest & Disease Spatial Survey</span>
            <div className="grid grid-cols-2 gap-2 text-[12px] bg-surface-container-low p-3 rounded-lg border border-outline-variant/10">
              <div><span className="text-on-surface-variant font-medium block">Top Pest Detected:</span><strong className="text-tertiary">Early Shoot Borer (Chilo infuscatellus)</strong></div>
              <div><span className="text-on-surface-variant font-medium block">Pest Incidence / Severity:</span><strong className="text-tertiary">12% Incidence (Low)</strong></div>
              <div><span className="text-on-surface-variant font-medium block">Top Disease Detected:</span><strong className="text-error">Red Rot (Colletotrichum falcatum)</strong></div>
              <div><span className="text-on-surface-variant font-medium block">Disease Severity:</span><strong className="text-error">4% Severity (Zone Z4)</strong></div>
            </div>

            <div className="space-y-1 text-[11px]">
              <span className="text-on-surface-variant font-bold uppercase">D. Spatial Distribution Zones</span>
              <div className="flex justify-between items-center p-2 bg-surface-container rounded"><span>Zone Z2 (Pest Hotspot):</span><strong className="text-tertiary font-mono">12.5843°N, 77.0429°E · 8% Severity</strong></div>
              <div className="flex justify-between items-center p-2 bg-surface-container rounded mt-1"><span>Zone Z4 (Disease Buffer):</span><strong className="text-error font-mono">12.5841°N, 77.0426°E · 4% Severity</strong></div>
            </div>
          </div>
        )}

        {activeModuleId === 7 && (
          <div className="flex flex-col gap-4">
            <span className="text-[13px] text-primary font-bold uppercase tracking-wider">FORM 07 — Microclimate & Atmospheric Survey</span>
            <div className="grid grid-cols-3 gap-2 text-center text-[12px]">
              <div className="p-2.5 bg-surface-container-low rounded border"><span className="text-on-surface-variant text-[11px] block">Air Temperature</span><strong className="text-primary text-[16px]">31.4 °C</strong></div>
              <div className="p-2.5 bg-surface-container-low rounded border"><span className="text-on-surface-variant text-[11px] block">Relative Humidity</span><strong className="text-primary text-[16px]">64% RH</strong></div>
              <div className="p-2.5 bg-surface-container-low rounded border"><span className="text-on-surface-variant text-[11px] block">Solar Radiation</span><strong className="text-secondary text-[16px]">780 W/m²</strong></div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] bg-surface-container p-3 rounded-lg border">
              <div><span className="text-on-surface-variant block">VPD (Vapour Pressure Deficit):</span><strong className="text-on-surface font-mono">1.42 kPa (Optimal)</strong></div>
              <div><span className="text-on-surface-variant block">Evapotranspiration (ET0):</span><strong className="text-secondary font-mono">5.2 mm / day</strong></div>
              <div><span className="text-on-surface-variant block">Canopy Microclimate Temp:</span><strong className="text-on-surface font-mono">29.1 °C</strong></div>
              <div><span className="text-on-surface-variant block">Microclimate Risk Grade:</span><strong className="text-secondary font-bold">Low Stress Risk</strong></div>
            </div>
          </div>
        )}

        {activeModuleId === 8 && (
          <div className="flex flex-col gap-4">
            <span className="text-[13px] text-primary font-bold uppercase tracking-wider">FORM 08 — Existing Technology & Sensor Inventory</span>
            <div className="space-y-2 text-[11px]">
              <div className="p-2.5 bg-surface-container-low rounded-lg border flex justify-between items-center">
                <div><strong className="text-primary block text-[12px]">Capacitive Soil Moisture Probe</strong><span className="text-on-surface-variant">LoRaWAN 865 MHz · Depth 0-40cm</span></div>
                <span className="bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded font-bold">Active</span>
              </div>
              <div className="p-2.5 bg-surface-container-low rounded-lg border flex justify-between items-center">
                <div><strong className="text-primary block text-[12px]">RTK GNSS Field Rover</strong><span className="text-on-surface-variant">Dual Frequency L1/L5 · ±0.02m</span></div>
                <span className="bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded font-bold">Calibrated</span>
              </div>
            </div>

            <div className="p-3 bg-surface-container rounded-lg border text-[11px]">
              <span className="font-bold text-primary block mb-1 uppercase">D. Technology Gap Priority</span>
              <p className="text-on-surface-variant">Priority 1: <strong>Automated Solenoid Drip Valves</strong></p>
              <p className="text-on-surface-variant">Priority 2: <strong>Thermal Multispectral Drone Mapping</strong></p>
            </div>
          </div>
        )}

        {activeModuleId === 9 && (
          <div className="flex flex-col gap-4">
            <span className="text-[13px] text-primary font-bold uppercase tracking-wider">FORM 09 — Agronomic Economic & Financial Audit</span>
            <div className="grid grid-cols-2 gap-2 text-[12px] bg-surface-container-low p-3 rounded-lg border border-outline-variant/10">
              <div><span className="text-on-surface-variant font-medium block">Gross Revenue (Est.):</span><strong className="text-primary text-[15px]">₹ 3,52,000 / ha</strong></div>
              <div><span className="text-on-surface-variant font-medium block">Total Input Cost:</span><strong className="text-on-surface text-[15px]">₹ 1,18,000 / ha</strong></div>
              <div><span className="text-on-surface-variant font-medium block">Labour Expenditure:</span><strong className="text-on-surface">₹ 42,000 (35 Days)</strong></div>
              <div><span className="text-on-surface-variant font-medium block">Net Income Target:</span><strong className="text-secondary text-[15px] font-bold">₹ 2,34,000 / ha</strong></div>
            </div>

            <div className="p-3 bg-surface-container rounded-lg border text-[11px]">
              <span className="font-bold text-primary block mb-1 uppercase">D. Drip & Tech ROI Metrics</span>
              <div className="flex justify-between items-center mt-1"><span>Input Saving with Drip:</span><strong className="text-secondary">28% Fertilizer / Water</strong></div>
              <div className="flex justify-between items-center mt-1"><span>Expected ROI %:</span><strong className="text-secondary font-bold">142% Over 3 Cycles</strong></div>
            </div>
          </div>
        )}

        {activeModuleId === 10 && (
          <div className="flex flex-col gap-4">
            <span className="text-[13px] text-primary font-bold uppercase tracking-wider">FORM 10 — Temporal & Crop-Cycle Timeline Survey</span>
            <div className="grid grid-cols-2 gap-2 text-[12px] bg-surface-container-low p-3 rounded-lg border border-outline-variant/10">
              <div><span className="text-on-surface-variant font-medium block">Sowing / Planting Date:</span><strong className="text-on-surface">15 March 2026</strong></div>
              <div><span className="text-on-surface-variant font-medium block">Expected Harvest Date:</span><strong className="text-on-surface">10 February 2027</strong></div>
              <div><span className="text-on-surface-variant font-medium block">Survey Frequency:</span><strong className="text-primary font-bold">Fortnightly (Every 14 days)</strong></div>
              <div><span className="text-on-surface-variant font-medium block">Total Logged Audits:</span><strong className="text-secondary font-bold">12 Cycles Completed</strong></div>
            </div>

            <div className="space-y-1.5 text-[11px]">
              <span className="text-on-surface-variant font-bold uppercase">C. Management Events History</span>
              <div className="p-2 bg-surface-container rounded flex justify-between items-center">
                <span>02 Aug: <strong>Fertigation Split #4</strong></span><span className="text-secondary font-bold">19-19-19 (45 kg)</span>
              </div>
              <div className="p-2 bg-surface-container rounded flex justify-between items-center">
                <span>18 Aug: <strong>Earthing Up & Trash Mulch</strong></span><span className="text-primary font-bold">Completed</span>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Persistent Bottom Action Area */}
      <footer className="bg-surface-container-lowest rounded-xl shadow-lg p-pad-card flex flex-col gap-3 border border-outline-variant/15">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span>
            <span className="text-[12px] text-on-surface font-bold">Red-Knight Form {activeModule.id} Sync Staged</span>
          </div>
          <span className="text-[11px] text-on-surface-variant font-medium">Last saved: Just now</span>
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
          <span>Next: {modules.find(m => m.id === (activeModuleId < 10 ? activeModuleId + 1 : 1))?.title || 'Next Module'}</span>
          <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
        </button>
      </footer>
    </div>
  );
};
