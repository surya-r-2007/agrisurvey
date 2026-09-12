import React, { useState, useRef } from 'react';
import { SurveyModuleItem, SoilSampleData, TabType, SurveyRecord, FieldParcel, Farmer } from '../types';
import { INITIAL_MODULES, INITIAL_SOIL_DATA } from '../data/initialData';
import { generateAndDownloadPdf } from '../utils/pdfGenerator';

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
            <div className="flex flex-col items-end flex-shrink-0 gap-1">
              <div className="flex items-center gap-2">
                <span className="text-[16px] font-bold text-primary">{progressPercent}%</span>
                <button
                  onClick={() => {
                    const docId = `RPT-${activeSurvey.id}`;
                    generateAndDownloadPdf({
                      docId,
                      farmerName: activeSurvey.farmerName,
                      farmerCode: 'FMR-REG-01',
                      plotRef: activeSurvey.fieldId,
                      crop: activeSurvey.crop,
                      hectares: activeSurvey.hectares || 3.5,
                      date: activeSurvey.auditedDate || activeSurvey.date || activeSurvey.timeOrDate,
                      village: activeSurvey.village,
                      status: activeSurvey.status,
                      statusDetail: activeSurvey.statusDetail || '10-Module Evaluation',
                      ph: activeSurvey.ph,
                      moisturePercent: activeSurvey.moisturePercent,
                      completedModules: completedModulesCount,
                      totalModules: 10
                    });
                    onShowToast(`Downloading PDF for ${activeSurvey.id}...`);
                  }}
                  className="h-7 px-2.5 rounded-lg bg-primary text-on-primary text-[11px] font-bold flex items-center gap-1 shadow-xs hover:bg-primary/90 cursor-pointer"
                  title="Download Survey PDF"
                >
                  <span className="material-symbols-outlined text-[14px]">download</span>
                  <span>PDF</span>
                </button>
              </div>
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
            <div className="grid grid-cols-2 gap-3 text-[12px]">
              <div>
                <label className="text-[11px] font-bold text-on-surface-variant block mb-1">Farmer / Stakeholder Name</label>
                <input type="text" placeholder="Enter farmer name" className="w-full h-10 px-3 rounded-lg bg-surface-container text-on-surface font-semibold border border-outline-variant/20 outline-none focus:border-primary" />
              </div>
              <div>
                <label className="text-[11px] font-bold text-on-surface-variant block mb-1">Village / Sector</label>
                <input type="text" placeholder="e.g. Huligere" className="w-full h-10 px-3 rounded-lg bg-surface-container text-on-surface border border-outline-variant/20 outline-none focus:border-primary" />
              </div>
              <div>
                <label className="text-[11px] font-bold text-on-surface-variant block mb-1">Taluk / Block</label>
                <input type="text" placeholder="e.g. Mandya" className="w-full h-10 px-3 rounded-lg bg-surface-container text-on-surface border border-outline-variant/20 outline-none focus:border-primary" />
              </div>
              <div>
                <label className="text-[11px] font-bold text-on-surface-variant block mb-1">District</label>
                <input type="text" placeholder="District name" className="w-full h-10 px-3 rounded-lg bg-surface-container text-on-surface border border-outline-variant/20 outline-none focus:border-primary" />
              </div>
              <div>
                <label className="text-[11px] font-bold text-on-surface-variant block mb-1">Farming Experience (Years)</label>
                <input type="number" placeholder="e.g. 15" className="w-full h-10 px-3 rounded-lg bg-surface-container text-on-surface border border-outline-variant/20 outline-none focus:border-primary" />
              </div>
              <div>
                <label className="text-[11px] font-bold text-on-surface-variant block mb-1">Farm Ownership</label>
                <select className="w-full h-10 px-3 rounded-lg bg-surface-container text-on-surface border border-outline-variant/20 outline-none focus:border-primary">
                  <option value="">Select Ownership</option>
                  <option value="Owned">Owned</option>
                  <option value="Leased">Leased</option>
                  <option value="Both">Both Owned & Leased</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[12px] text-on-surface-variant font-bold uppercase">C. Priority Constraints & Farmer Feedback</span>
              <div className="grid grid-cols-2 gap-2">
                <input type="text" placeholder="Primary Constraint (e.g. Water Shortage)" className="h-10 px-3 rounded-lg bg-surface-container text-[12px] border border-outline-variant/20 outline-none" />
                <input type="text" placeholder="Expected Support (e.g. Drip Subsidy)" className="h-10 px-3 rounded-lg bg-surface-container text-[12px] border border-outline-variant/20 outline-none" />
              </div>
            </div>
          </div>
        )}

        {activeModuleId === 2 && (
          <div className="flex flex-col gap-4">
            <span className="text-[13px] text-primary font-bold uppercase tracking-wider">FORM 02 — Field Survey & Cadastral Geometry</span>
            <div className="grid grid-cols-3 gap-3 text-[12px]">
              <div>
                <label className="text-[11px] font-bold text-on-surface-variant block mb-1">Field ID / Plot Ref</label>
                <input type="text" placeholder="e.g. FLD-01" className="w-full h-10 px-3 rounded-lg bg-surface-container text-on-surface font-semibold border border-outline-variant/20 outline-none" />
              </div>
              <div>
                <label className="text-[11px] font-bold text-on-surface-variant block mb-1">GPS Latitude (°N)</label>
                <input type="number" step="0.000001" placeholder="Latitude e.g. 12.5842" className="w-full h-10 px-3 rounded-lg bg-surface-container text-on-surface border border-outline-variant/20 outline-none" />
              </div>
              <div>
                <label className="text-[11px] font-bold text-on-surface-variant block mb-1">GPS Longitude (°E)</label>
                <input type="number" step="0.000001" placeholder="Longitude e.g. 77.0428" className="w-full h-10 px-3 rounded-lg bg-surface-container text-on-surface border border-outline-variant/20 outline-none" />
              </div>
              <div>
                <label className="text-[11px] font-bold text-on-surface-variant block mb-1">Field Length (m)</label>
                <input type="number" placeholder="Meters" className="w-full h-10 px-3 rounded-lg bg-surface-container text-on-surface border border-outline-variant/20 outline-none" />
              </div>
              <div>
                <label className="text-[11px] font-bold text-on-surface-variant block mb-1">Field Width (m)</label>
                <input type="number" placeholder="Meters" className="w-full h-10 px-3 rounded-lg bg-surface-container text-on-surface border border-outline-variant/20 outline-none" />
              </div>
              <div>
                <label className="text-[11px] font-bold text-on-surface-variant block mb-1">Slope (%)</label>
                <input type="number" step="0.1" placeholder="Slope %" className="w-full h-10 px-3 rounded-lg bg-surface-container text-on-surface border border-outline-variant/20 outline-none" />
              </div>
            </div>
          </div>
        )}

        {activeModuleId === 3 && (
          <div className="flex flex-col gap-4">
            <span className="text-[13px] text-primary font-bold uppercase tracking-wider">FORM 03 — Physical & Chemical Soil Testing</span>
            <div className="grid grid-cols-3 gap-3 text-[12px]">
              <div>
                <label className="text-[11px] font-bold text-on-surface-variant block mb-1">USDA Soil Texture</label>
                <input type="text" placeholder="e.g. Clay Loam" className="w-full h-10 px-3 rounded-lg bg-surface-container text-on-surface border border-outline-variant/20 outline-none" />
              </div>
              <div>
                <label className="text-[11px] font-bold text-on-surface-variant block mb-1">pH Level</label>
                <input type="number" step="0.1" placeholder="e.g. 6.8" className="w-full h-10 px-3 rounded-lg bg-surface-container text-on-surface border border-outline-variant/20 outline-none" />
              </div>
              <div>
                <label className="text-[11px] font-bold text-on-surface-variant block mb-1">Electrical Cond (dS/m)</label>
                <input type="number" step="0.01" placeholder="e.g. 0.42" className="w-full h-10 px-3 rounded-lg bg-surface-container text-on-surface border border-outline-variant/20 outline-none" />
              </div>
              <div>
                <label className="text-[11px] font-bold text-on-surface-variant block mb-1">Nitrogen (N kg/ha)</label>
                <input type="number" placeholder="kg/ha" className="w-full h-10 px-3 rounded-lg bg-surface-container text-on-surface border border-outline-variant/20 outline-none" />
              </div>
              <div>
                <label className="text-[11px] font-bold text-on-surface-variant block mb-1">Phosphorus (P kg/ha)</label>
                <input type="number" placeholder="kg/ha" className="w-full h-10 px-3 rounded-lg bg-surface-container text-on-surface border border-outline-variant/20 outline-none" />
              </div>
              <div>
                <label className="text-[11px] font-bold text-on-surface-variant block mb-1">Potassium (K kg/ha)</label>
                <input type="number" placeholder="kg/ha" className="w-full h-10 px-3 rounded-lg bg-surface-container text-on-surface border border-outline-variant/20 outline-none" />
              </div>
            </div>
          </div>
        )}

        {activeModuleId === 4 && (
          <div className="flex flex-col gap-4">
            <span className="text-[13px] text-primary font-bold uppercase tracking-wider">FORM 04 — Water Source & Hydraulic Setup</span>
            <div className="grid grid-cols-2 gap-3 text-[12px]">
              <div>
                <label className="text-[11px] font-bold text-on-surface-variant block mb-1">Water Source Type</label>
                <select className="w-full h-10 px-3 rounded-lg bg-surface-container text-on-surface border border-outline-variant/20 outline-none">
                  <option value="">Select Water Source</option>
                  <option value="Borewell">Borewell</option>
                  <option value="Open well">Open well</option>
                  <option value="Canal">Canal</option>
                  <option value="Pond">Pond</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-bold text-on-surface-variant block mb-1">Pump Capacity (HP)</label>
                <input type="number" step="0.5" placeholder="e.g. 7.5 HP" className="w-full h-10 px-3 rounded-lg bg-surface-container text-on-surface border border-outline-variant/20 outline-none" />
              </div>
              <div>
                <label className="text-[11px] font-bold text-on-surface-variant block mb-1">Water pH</label>
                <input type="number" step="0.1" placeholder="e.g. 7.2" className="w-full h-10 px-3 rounded-lg bg-surface-container text-on-surface border border-outline-variant/20 outline-none" />
              </div>
              <div>
                <label className="text-[11px] font-bold text-on-surface-variant block mb-1">TDS (mg/L)</label>
                <input type="number" placeholder="e.g. 420" className="w-full h-10 px-3 rounded-lg bg-surface-container text-on-surface border border-outline-variant/20 outline-none" />
              </div>
            </div>
          </div>
        )}

        {activeModuleId === 5 && (
          <div className="flex flex-col gap-4">
            <span className="text-[13px] text-primary font-bold uppercase tracking-wider">FORM 05 — Crop Identification & Plant Geometry</span>
            <div className="grid grid-cols-2 gap-3 text-[12px]">
              <div>
                <label className="text-[11px] font-bold text-on-surface-variant block mb-1">Crop & Variety</label>
                <input type="text" placeholder="e.g. Sugarcane Co-86032" className="w-full h-10 px-3 rounded-lg bg-surface-container text-on-surface border border-outline-variant/20 outline-none" />
              </div>
              <div>
                <label className="text-[11px] font-bold text-on-surface-variant block mb-1">Plant Population (plants/ha)</label>
                <input type="number" placeholder="e.g. 62000" className="w-full h-10 px-3 rounded-lg bg-surface-container text-on-surface border border-outline-variant/20 outline-none" />
              </div>
              <div>
                <label className="text-[11px] font-bold text-on-surface-variant block mb-1">Row Spacing (cm)</label>
                <input type="number" placeholder="e.g. 150" className="w-full h-10 px-3 rounded-lg bg-surface-container text-on-surface border border-outline-variant/20 outline-none" />
              </div>
              <div>
                <label className="text-[11px] font-bold text-on-surface-variant block mb-1">Expected Yield Target (kg/ha)</label>
                <input type="number" placeholder="e.g. 110000" className="w-full h-10 px-3 rounded-lg bg-surface-container text-on-surface border border-outline-variant/20 outline-none" />
              </div>
            </div>
          </div>
        )}

        {activeModuleId === 6 && (
          <div className="flex flex-col gap-4">
            <span className="text-[13px] text-primary font-bold uppercase tracking-wider">FORM 06 — Pest & Disease Spatial Survey</span>
            <div className="grid grid-cols-2 gap-3 text-[12px]">
              <div>
                <label className="text-[11px] font-bold text-on-surface-variant block mb-1">Pest Name</label>
                <input type="text" placeholder="e.g. Early Shoot Borer" className="w-full h-10 px-3 rounded-lg bg-surface-container text-on-surface border border-outline-variant/20 outline-none" />
              </div>
              <div>
                <label className="text-[11px] font-bold text-on-surface-variant block mb-1">Pest Incidence (%)</label>
                <input type="number" placeholder="Incidence %" className="w-full h-10 px-3 rounded-lg bg-surface-container text-on-surface border border-outline-variant/20 outline-none" />
              </div>
              <div>
                <label className="text-[11px] font-bold text-on-surface-variant block mb-1">Disease Name</label>
                <input type="text" placeholder="e.g. Red Rot" className="w-full h-10 px-3 rounded-lg bg-surface-container text-on-surface border border-outline-variant/20 outline-none" />
              </div>
              <div>
                <label className="text-[11px] font-bold text-on-surface-variant block mb-1">Disease Severity (%)</label>
                <input type="number" placeholder="Severity %" className="w-full h-10 px-3 rounded-lg bg-surface-container text-on-surface border border-outline-variant/20 outline-none" />
              </div>
            </div>
          </div>
        )}

        {activeModuleId === 7 && (
          <div className="flex flex-col gap-4">
            <span className="text-[13px] text-primary font-bold uppercase tracking-wider">FORM 07 — Weather & Crop Microclimate</span>
            <div className="grid grid-cols-2 gap-3 text-[12px]">
              <div>
                <label className="text-[11px] font-bold text-on-surface-variant block mb-1">Air Temperature (°C)</label>
                <input type="number" step="0.1" placeholder="°C" className="w-full h-10 px-3 rounded-lg bg-surface-container text-on-surface border border-outline-variant/20 outline-none" />
              </div>
              <div>
                <label className="text-[11px] font-bold text-on-surface-variant block mb-1">Relative Humidity (%)</label>
                <input type="number" step="0.1" placeholder="%" className="w-full h-10 px-3 rounded-lg bg-surface-container text-on-surface border border-outline-variant/20 outline-none" />
              </div>
              <div>
                <label className="text-[11px] font-bold text-on-surface-variant block mb-1">Wind Speed (m/s)</label>
                <input type="number" step="0.1" placeholder="m/s" className="w-full h-10 px-3 rounded-lg bg-surface-container text-on-surface border border-outline-variant/20 outline-none" />
              </div>
              <div>
                <label className="text-[11px] font-bold text-on-surface-variant block mb-1">Canopy Temperature (°C)</label>
                <input type="number" step="0.1" placeholder="°C" className="w-full h-10 px-3 rounded-lg bg-surface-container text-on-surface border border-outline-variant/20 outline-none" />
              </div>
            </div>
          </div>
        )}

        {activeModuleId === 8 && (
          <div className="flex flex-col gap-4">
            <span className="text-[13px] text-primary font-bold uppercase tracking-wider">FORM 08 — Sensors & Tech Inventory</span>
            <div className="grid grid-cols-2 gap-3 text-[12px]">
              <div>
                <label className="text-[11px] font-bold text-on-surface-variant block mb-1">Sensors / Tech Present</label>
                <input type="text" placeholder="Describe equipment" className="w-full h-10 px-3 rounded-lg bg-surface-container text-on-surface border border-outline-variant/20 outline-none" />
              </div>
              <div>
                <label className="text-[11px] font-bold text-on-surface-variant block mb-1">Irrigation Automation</label>
                <input type="text" placeholder="Drip solenoids / controller" className="w-full h-10 px-3 rounded-lg bg-surface-container text-on-surface border border-outline-variant/20 outline-none" />
              </div>
            </div>
          </div>
        )}

        {activeModuleId === 9 && (
          <div className="flex flex-col gap-4">
            <span className="text-[13px] text-primary font-bold uppercase tracking-wider">FORM 09 — Farm Economics & Financial Audit</span>
            <div className="grid grid-cols-3 gap-3 text-[12px]">
              <div>
                <label className="text-[11px] font-bold text-on-surface-variant block mb-1">Gross Revenue (₹ / Ha)</label>
                <input type="number" placeholder="Enter ₹" className="w-full h-10 px-3 rounded-lg bg-surface-container text-on-surface border border-outline-variant/20 outline-none" />
              </div>
              <div>
                <label className="text-[11px] font-bold text-on-surface-variant block mb-1">Total Input Cost (₹ / Ha)</label>
                <input type="number" placeholder="Enter ₹" className="w-full h-10 px-3 rounded-lg bg-surface-container text-on-surface border border-outline-variant/20 outline-none" />
              </div>
              <div>
                <label className="text-[11px] font-bold text-on-surface-variant block mb-1">Labour Cost (₹ / Ha)</label>
                <input type="number" placeholder="Enter ₹" className="w-full h-10 px-3 rounded-lg bg-surface-container text-on-surface border border-outline-variant/20 outline-none" />
              </div>
            </div>
          </div>
        )}

        {activeModuleId === 10 && (
          <div className="flex flex-col gap-4">
            <span className="text-[13px] text-primary font-bold uppercase tracking-wider">FORM 10 — Temporal & Crop-Cycle Timeline Survey</span>
            <div className="grid grid-cols-2 gap-3 text-[12px]">
              <div>
                <label className="text-[11px] font-bold text-on-surface-variant block mb-1">Observation Stage</label>
                <input type="text" placeholder="e.g. Tillering / Grand Growth" className="w-full h-10 px-3 rounded-lg bg-surface-container text-on-surface border border-outline-variant/20 outline-none" />
              </div>
              <div>
                <label className="text-[11px] font-bold text-on-surface-variant block mb-1">Survey Frequency</label>
                <select className="w-full h-10 px-3 rounded-lg bg-surface-container text-on-surface border border-outline-variant/20 outline-none">
                  <option value="Fortnightly">Fortnightly (Every 14 days)</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Daily">Daily</option>
                </select>
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
