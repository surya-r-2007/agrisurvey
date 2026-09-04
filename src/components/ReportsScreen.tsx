import React, { useState } from 'react';
import { SurveyRecord, TabType } from '../types';
import { APP_ASSETS, INITIAL_ARCHIVE_REPORTS } from '../data/initialData';

interface ReportsScreenProps {
  surveys: SurveyRecord[];
  onNavigate: (tab: TabType) => void;
  onShowToast: (msg: string) => void;
  initialSubTab?: 'history' | 'generator' | 'archive';
}

export const ReportsScreen: React.FC<ReportsScreenProps> = ({
  surveys,
  onNavigate,
  onShowToast,
  initialSubTab = 'history'
}) => {
  const [subTab, setSubTab] = useState<'history' | 'generator' | 'archive'>(initialSubTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedCropFilter, setSelectedCropFilter] = useState('All Crops');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All 10 Modules');
  const [scope, setScope] = useState<'single-survey' | 'single-field' | 'farmer-dossier' | 'cycle-report'>('single-survey');
  const [archiveList, setArchiveList] = useState(INITIAL_ARCHIVE_REPORTS);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [selectedPhotoPreview, setSelectedPhotoPreview] = useState<string | null>(null);

  const safePrint = () => {
    try {
      window.print();
    } catch (err) {
      console.warn('Native print restricted in sandboxed preview:', err);
      onShowToast('Print command prepared. Note: In embedded browser previews, native print dialogs may be sandboxed.');
    }
  };

  const safeCopy = (text: string, message: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(() => {
          onShowToast(message);
        }).catch(() => {
          onShowToast(message);
        });
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        textarea.remove();
        onShowToast(message);
      }
    } catch (err) {
      console.warn('Clipboard write error:', err);
      onShowToast(message);
    }
  };

  const handleGeneratePdf = () => {
    setIsGeneratingPdf(true);
    onShowToast('Compiling high-resolution vector PDF dossier (ISO 19115 GIS)...');
    setTimeout(() => {
      setIsGeneratingPdf(false);
      const newReport = {
        id: `rep-${Date.now()}`,
        docId: `RPT-AGRI-2024-${Math.floor(800 + Math.random() * 199)}`,
        farmerName: 'Mallikarjun Patil',
        farmerCode: 'FMR-041',
        plotRef: 'FLD-882',
        crop: 'Sugarcane',
        hectares: 4.85,
        date: 'Exported Just now',
        fileSize: '4.8 MB',
        status: 'Verified & Digitally Signed'
      };
      setArchiveList([newReport, ...archiveList]);
      onShowToast('PDF compiled & digitally signed! Added to Report Archive.');
      safePrint();
    }, 1200);
  };

  const handleExportDownload = () => {
    onShowToast('Downloading RPT-AGRI-2024-882.pdf (4.8MB)...');
  };

  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator
        .share({
          title: 'AgriSurvey Evaluation Dossier',
          text: 'Field evaluation dossier for FLD-882 (Mallikarjun Patil)',
          url: window.location.href
        })
        .catch(() => {
          safeCopy(window.location.href, 'Dossier share link copied to clipboard!');
        });
    } else {
      safeCopy(window.location.href, 'Dossier share link copied to clipboard!');
    }
  };

  const filteredSurveys = surveys.filter((srv) => {
    const matchesQuery =
      srv.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      srv.farmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      srv.fieldId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      srv.crop.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesQuery) return false;

    if (selectedCropFilter !== 'All Crops') {
      if (srv.crop !== selectedCropFilter) return false;
    }
    return true;
  });

  return (
    <div className="flex flex-col w-full space-y-6 max-w-2xl mx-auto pb-16">
      {/* Segmented Top Control */}
      <div className="w-full bg-surface-container-high p-1.5 rounded-xl shadow-sm border border-outline-variant/15">
        <div className="grid grid-cols-3 gap-1" role="tablist">
          <button
            onClick={() => setSubTab('history')}
            className={`h-11 rounded-lg text-[13px] font-bold transition-all flex flex-col items-center justify-center cursor-pointer ${
              subTab === 'history'
                ? 'bg-surface-container-lowest text-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="truncate px-1">Surveys ({surveys.length})</span>
          </button>

          <button
            onClick={() => setSubTab('generator')}
            className={`h-11 rounded-lg text-[13px] font-bold transition-all flex flex-col items-center justify-center cursor-pointer ${
              subTab === 'generator'
                ? 'bg-surface-container-lowest text-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="truncate px-1">Generate PDF</span>
          </button>

          <button
            onClick={() => setSubTab('archive')}
            className={`h-11 rounded-lg text-[13px] font-bold transition-all flex flex-col items-center justify-center cursor-pointer ${
              subTab === 'archive'
                ? 'bg-surface-container-lowest text-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="truncate px-1">Report Archive</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: SURVEY HISTORY & DATABASE */}
      {subTab === 'history' && (
        <div className="flex flex-col space-y-4">
          {/* Advanced Search & Filter Bar (Expandable Filter Drawer) */}
          <div className="bg-surface-container-lowest rounded-2xl p-pad-card shadow-sm space-y-3 border border-outline-variant/15">
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[20px]">
                search
              </span>
              <input
                className="w-full h-12 pl-10 pr-12 rounded-lg bg-surface-container-low text-[14px] text-on-surface placeholder:text-on-surface-variant focus:outline-none border border-outline-variant/20 focus:border-secondary transition-colors"
                placeholder="Search survey ID, farmer, or parcel..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                aria-label="Toggle filters"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`absolute right-1.5 w-9 h-9 flex items-center justify-center rounded-lg cursor-pointer transition-colors ${
                  isFilterOpen
                    ? 'bg-primary text-white'
                    : 'bg-surface-container-high text-primary hover:bg-surface-container-highest'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">tune</span>
              </button>
            </div>

            {/* Quick Filter Chips Scrollable Row */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-pad-card px-pad-card scrollbar-none">
              <button
                onClick={() => onShowToast('Filtered by Last 30 Days')}
                className="h-8 px-3 rounded-full bg-primary-container text-on-primary text-[12px] font-bold whitespace-nowrap flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                <span>Last 30 Days</span>
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>

              <button
                onClick={() => setIsFilterOpen(true)}
                className="h-8 px-3 rounded-full bg-surface-container text-on-surface text-[12px] font-semibold whitespace-nowrap flex items-center gap-1 cursor-pointer hover:bg-surface-container-high"
              >
                <span>{selectedCategoryFilter}</span>
                <span className="material-symbols-outlined text-[14px]">expand_more</span>
              </button>

              <button
                onClick={() => setIsFilterOpen(true)}
                className="h-8 px-3 rounded-full bg-surface-container text-on-surface text-[12px] font-semibold whitespace-nowrap flex items-center gap-1 cursor-pointer hover:bg-surface-container-high"
              >
                <span>Status: All</span>
                <span className="material-symbols-outlined text-[14px]">expand_more</span>
              </button>

              <button
                onClick={() => onShowToast('Location: Huligere / Maddur selected')}
                className="h-8 px-3 rounded-full bg-surface-container text-on-surface text-[12px] font-semibold whitespace-nowrap flex items-center gap-1 cursor-pointer hover:bg-surface-container-high"
              >
                <span>Huligere / Maddur</span>
                <span className="material-symbols-outlined text-[14px]">location_on</span>
              </button>
            </div>

            {/* Expandable Filter Matrix Drawer */}
            {isFilterOpen && (
              <div className="pt-3 space-y-3 border-t border-outline-variant/15">
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col">
                    <label className="text-[11px] font-bold text-on-surface-variant mb-1">
                      Survey Category
                    </label>
                    <select
                      value={selectedCategoryFilter}
                      onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                      className="h-10 px-2 rounded-lg bg-surface-container-low text-[13px] text-on-surface outline-none border border-outline-variant/20"
                    >
                      <option>All 10 Modules</option>
                      <option>Crop Phenology</option>
                      <option>Pest & Pathogen</option>
                      <option>Soil Chemistry</option>
                      <option>Yield Audit</option>
                    </select>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-[11px] font-bold text-on-surface-variant mb-1">Target Crop</label>
                    <select
                      value={selectedCropFilter}
                      onChange={(e) => setSelectedCropFilter(e.target.value)}
                      className="h-10 px-2 rounded-lg bg-surface-container-low text-[13px] text-on-surface outline-none border border-outline-variant/20"
                    >
                      <option>All Crops</option>
                      <option>Sugarcane</option>
                      <option>Paddy</option>
                      <option>Cotton</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    className="h-8 px-3 rounded-lg text-[12px] font-semibold text-on-surface-variant hover:bg-surface-container cursor-pointer"
                    onClick={() => {
                      setSelectedCropFilter('All Crops');
                      setSelectedCategoryFilter('All 10 Modules');
                      setIsFilterOpen(false);
                      onShowToast('Filters reset');
                    }}
                  >
                    Reset
                  </button>
                  <button
                    className="h-8 px-4 rounded-lg bg-secondary text-on-secondary text-[12px] font-bold cursor-pointer hover:bg-secondary/90"
                    onClick={() => {
                      setIsFilterOpen(false);
                      onShowToast(`Filters applied (${selectedCropFilter}, ${selectedCategoryFilter})`);
                    }}
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Survey Records Cards Stack */}
          <div className="space-y-3">
            {filteredSurveys.length === 0 ? (
              <div className="p-8 text-center bg-surface-container-lowest rounded-2xl border border-outline-variant/15 text-on-surface-variant flex flex-col items-center justify-center">
                <span className="material-symbols-outlined text-[36px] text-primary mb-2">assignment_late</span>
                <p className="text-[15px] font-bold text-on-surface">
                  {surveys.length === 0 ? 'No Survey Records Available' : 'No Surveys Match Filters'}
                </p>
                <p className="text-[12px] text-on-surface-variant mt-1 max-w-xs">
                  {surveys.length === 0
                    ? 'Conduct field surveys or create a new survey dossier to view entries and export PDF reports.'
                    : 'Try resetting your search query or adjusting filter parameters.'}
                </p>
                {surveys.length === 0 && (
                  <button
                    onClick={() => onNavigate('surveys')}
                    className="mt-3.5 h-9 px-4 rounded-xl bg-primary text-on-primary text-[13px] font-bold flex items-center gap-1.5 shadow-sm hover:opacity-95 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">add_circle</span>
                    <span>+ Start Field Survey</span>
                  </button>
                )}
              </div>
            ) : (
              filteredSurveys.map((survey) => (
                <div
                  key={survey.id}
                  className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm space-y-3 relative overflow-hidden border border-outline-variant/15"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-bold text-primary truncate">{survey.id}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-outline-variant"></span>
                        <span className="text-[12px] text-on-surface-variant font-medium">
                          {survey.fieldId}
                        </span>
                      </div>
                      <span className="text-[18px] font-bold text-on-surface truncate mt-0.5">
                        {survey.farmerName}
                      </span>
                    </div>

                    {survey.status === 'Completed' ? (
                      <div className="flex-shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed">
                        <span className="w-2 h-2 rounded-full bg-secondary"></span>
                        <span className="text-[11px] font-bold">Completed</span>
                      </div>
                    ) : (
                      <div className="flex-shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed">
                        <span className="w-2 h-2 rounded-full bg-tertiary-container animate-pulse"></span>
                        <span className="text-[11px] font-bold">Draft • Pest</span>
                      </div>
                    )}
                  </div>

                  {/* Metadata Strip */}
                  <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-surface-container-low rounded-xl text-[12px] text-on-surface-variant border border-outline-variant/10">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">
                        Crop
                      </span>
                      <span className="font-bold text-on-surface truncate">{survey.crop}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">
                        Village
                      </span>
                      <span className="font-bold text-on-surface truncate">{survey.village}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">
                        Audited
                      </span>
                      <span className="font-bold text-on-surface truncate">{survey.auditedDate}</span>
                    </div>
                  </div>

                  {/* Action Row */}
                  <div className="flex items-center justify-between pt-1 gap-1">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setSubTab('generator')}
                        className="h-9 px-3 rounded-lg bg-surface-container text-[12px] font-semibold text-on-surface flex items-center gap-1 hover:bg-surface-container-high transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">visibility</span>
                        <span>View</span>
                      </button>
                      <button
                        onClick={() => {
                          onNavigate('surveys');
                          onShowToast(`Audit editor opened for ${survey.id}`);
                        }}
                        className="h-9 px-3 rounded-lg bg-surface-container text-[12px] font-semibold text-on-surface flex items-center gap-1 hover:bg-surface-container-high transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => safeCopy(survey.id, `Copied survey reference ${survey.id}`)}
                        className="w-9 h-9 rounded-lg bg-surface-container text-[12px] text-on-surface flex items-center justify-center hover:bg-surface-container-high transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[18px]">content_copy</span>
                      </button>
                    </div>

                    {survey.status === 'Completed' ? (
                      <button
                        onClick={() => setSubTab('generator')}
                        className="h-9 px-3 rounded-lg bg-primary text-on-primary text-[12px] font-bold flex items-center gap-1.5 shadow-sm hover:bg-primary/90 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
                        <span>Gen PDF</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => onShowToast('Resuming survey...')}
                        className="h-9 px-4 rounded-lg bg-secondary text-on-secondary text-[12px] font-bold flex items-center gap-1.5 shadow-sm hover:bg-secondary/90 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                        <span>Resume</span>
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SECTION 2: PDF REPORT GENERATOR & LIVE PREVIEW */}
      {subTab === 'generator' && (
        <div className="flex flex-col space-y-4">
          {/* Scope Selector Navigation Pills */}
          <div className="space-y-1.5">
            <span className="text-[13px] font-bold text-on-surface-variant px-1">
              Report Dossier Scope
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setScope('single-survey')}
                className={`h-11 px-3 rounded-xl text-[13px] font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer ${
                  scope === 'single-survey'
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container border border-outline-variant/15'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">description</span>
                <span>Single Survey</span>
              </button>

              <button
                onClick={() => setScope('single-field')}
                className={`h-11 px-3 rounded-xl text-[13px] font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer ${
                  scope === 'single-field'
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container border border-outline-variant/15'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">crop_free</span>
                <span>Single Field</span>
              </button>

              <button
                onClick={() => setScope('farmer-dossier')}
                className={`h-11 px-3 rounded-xl text-[13px] font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer ${
                  scope === 'farmer-dossier'
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container border border-outline-variant/15'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">folder_shared</span>
                <span>Farmer Dossier</span>
              </button>

              <button
                onClick={() => setScope('cycle-report')}
                className={`h-11 px-3 rounded-xl text-[13px] font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer ${
                  scope === 'cycle-report'
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container border border-outline-variant/15'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">bar_chart</span>
                <span>Crop-Cycle Report</span>
              </button>
            </div>
          </div>

          {/* Live Document Preview Container (Agricultural Audit Specimen) */}
          <div className="relative bg-surface-container-lowest rounded-2xl p-4 shadow-md space-y-4 border border-outline-variant/15">
            {/* Dossier Document Header */}
            <div className="bg-primary-container text-on-primary p-4 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-secondary-container text-[22px]">
                    verified_user
                  </span>
                  <span className="text-[11px] font-bold tracking-wider uppercase text-secondary-container">
                    Official Evaluation Audit
                  </span>
                </div>
                <span className="text-[11px] font-bold bg-surface-container-lowest/20 px-2 py-0.5 rounded text-surface-bright">
                  ISO 19115 GIS
                </span>
              </div>
              <div className="space-y-0.5">
                <h2 className="text-[18px] font-bold text-surface-bright leading-tight">
                  AgriSurvey Field Evaluation Dossier
                </h2>
                <div className="flex items-center justify-between text-on-primary-container text-[12px]">
                  <span>
                    Doc ID: <span className="font-semibold text-surface-bright">RPT-AGRI-2024-882</span>
                  </span>
                  <span>Generated: Oct 12, 2024</span>
                </div>
              </div>
            </div>

            {/* Farmer & Field Identification Grid */}
            <div className="grid grid-cols-2 gap-2 p-3 bg-surface-container-low rounded-xl text-on-surface border border-outline-variant/10">
              <div>
                <span className="text-[11px] text-on-surface-variant font-medium block">
                  Farmer / Operator
                </span>
                <span className="text-[14px] font-bold block">
                  {surveys[0]?.farmerName || 'No Active Survey Selected'}
                </span>
                <span className="text-[11px] text-on-surface-variant block">
                  {surveys[0] ? `ID: ${surveys[0].id}` : 'Select a survey to populate'}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-on-surface-variant font-medium block">Plot Reference</span>
                <span className="text-[14px] font-bold block">
                  {surveys[0] ? `${surveys[0].fieldId} (${surveys[0].village})` : 'Unassigned Plot'}
                </span>
                <span className="text-[11px] text-on-surface-variant block">
                  {surveys[0] ? `Crop: ${surveys[0].crop}` : 'Acreage: Pending Survey'}
                </span>
              </div>
            </div>

            {/* GIS Map & Field Boundary Preview Component */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between px-1">
                <span className="text-[13px] font-bold text-on-surface">
                  GIS Spatial Polygon & Cadastral Overlay
                </span>
                <span className="text-[11px] text-secondary font-bold">12 GPS Vertices (RTK)</span>
              </div>
              <div
                className="relative w-full h-44 rounded-xl overflow-hidden shadow-sm bg-cover bg-center border border-outline-variant/20"
                style={{ backgroundImage: `url('${APP_ASSETS.dossierMapBg}')` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-primary/85 via-transparent to-black/25 flex flex-col justify-between p-3">
                  <div className="self-end bg-surface-container-lowest/90 backdrop-blur-sm px-2 py-1 rounded-md text-[11px] font-bold text-primary">
                    Accuracy: ±0.04m
                  </div>
                  <div className="text-surface-bright flex items-center justify-between">
                    <div>
                      <span className="text-[12px] font-bold block">
                        Centroid: 12.8941° N, 77.0124° E
                      </span>
                      <span className="text-[11px] text-primary-fixed-dim">
                        Cadastral Survey Parcel #142/2A
                      </span>
                    </div>
                    <span className="material-symbols-outlined text-[24px] text-secondary-fixed">
                      layers
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Soil & Nutrient Chemistry Table */}
            <div className="space-y-1.5">
              <span className="text-[13px] font-bold text-on-surface px-1">
                Soil Chemical Composition & Horizon
              </span>
              <div className="bg-surface-container-low rounded-xl p-3 space-y-2 border border-outline-variant/10">
                <div className="grid grid-cols-4 gap-1 text-center text-[11px] font-bold text-on-surface-variant">
                  <span>pH (1:2.5)</span>
                  <span>N (kg/ha)</span>
                  <span>P (kg/ha)</span>
                  <span>K (kg/ha)</span>
                </div>
                <div className="grid grid-cols-4 gap-1 text-center text-[16px] font-bold text-primary">
                  <span className="bg-surface-container-lowest py-1 rounded shadow-xs">6.8</span>
                  <span className="bg-surface-container-lowest py-1 rounded shadow-xs">218</span>
                  <span className="bg-surface-container-lowest py-1 rounded shadow-xs">42</span>
                  <span className="bg-surface-container-lowest py-1 rounded shadow-xs">340</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-on-surface-variant pt-1 px-1">
                  <span>Organic Carbon: 0.72% (Optimal)</span>
                  <span className="text-secondary font-bold">EC: 0.45 dS/m (Normal)</span>
                </div>
              </div>
            </div>

            {/* Pest & Spatial Heatmap Section */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between px-1">
                <span className="text-[13px] font-bold text-on-surface">Pest Infestation Heatmap</span>
                <span className="text-[11px] text-tertiary font-bold">Zone B: Stem Borer (5%)</span>
              </div>
              <div className="h-16 rounded-xl bg-surface-container p-2 flex items-center justify-between gap-2 border border-outline-variant/10">
                <div className="flex-1 flex flex-col justify-center gap-1">
                  <div className="h-3 w-full rounded-full bg-surface-container-high flex overflow-hidden">
                    <div className="h-full bg-secondary w-3/4"></div>
                    <div className="h-full bg-tertiary-fixed-dim w-1/6"></div>
                    <div className="h-full bg-error w-1/12"></div>
                  </div>
                  <div className="flex justify-between text-[10px] text-on-surface-variant font-medium">
                    <span>Low Infestation (82%)</span>
                    <span>Moderate (12%)</span>
                    <span>Severe (6%)</span>
                  </div>
                </div>
                <div className="flex flex-col items-end pl-2">
                  <span className="text-[18px] font-bold text-primary leading-tight">94/100</span>
                  <span className="text-[10px] text-on-surface-variant">Crop Vigor Index</span>
                </div>
              </div>
            </div>

            {/* Economic ROI & Input Savings Calculation Card */}
            <div className="p-3.5 bg-surface-container rounded-xl flex items-center justify-between border border-outline-variant/10">
              <div className="space-y-0.5">
                <span className="text-[11px] text-on-surface-variant uppercase tracking-wider block font-semibold">
                  Estimated Economic ROI
                </span>
                <span className="text-[22px] text-secondary font-bold block leading-none">$2,840</span>
                <span className="text-[11px] text-on-surface-variant block">Net Margin / Hectare Saved</span>
              </div>
              <div className="text-right space-y-1">
                <span className="inline-block px-2 py-0.5 rounded bg-secondary-fixed text-on-secondary-fixed text-[11px] font-bold">
                  +18.4% Yield
                </span>
                <span className="text-[12px] text-on-surface-variant block font-medium">
                  Precision Urea -22%
                </span>
              </div>
            </div>

            {/* Geo-tagged Camera Inspection Thumbnails */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between px-1">
                <span className="text-[13px] font-bold text-on-surface">Geo-Tagged Field Photos (3)</span>
                <span className="text-[11px] text-primary font-bold">High-Res Included</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div
                  onClick={() => setSelectedPhotoPreview(APP_ASSETS.leafInspection)}
                  className="relative h-20 rounded-lg overflow-hidden shadow-sm cursor-pointer hover:opacity-95 transition-opacity"
                >
                  <img
                    className="w-full h-full object-cover"
                    alt="Leaf Vigor"
                    src={APP_ASSETS.leafInspection}
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-primary/80 text-surface-bright text-[9px] font-semibold p-0.5 text-center truncate">
                    #1 Leaf Vigor
                  </div>
                </div>

                <div
                  onClick={() => setSelectedPhotoPreview(APP_ASSETS.soilInspection)}
                  className="relative h-20 rounded-lg overflow-hidden shadow-sm cursor-pointer hover:opacity-95 transition-opacity"
                >
                  <img
                    className="w-full h-full object-cover"
                    alt="Soil Profile"
                    src={APP_ASSETS.soilInspection}
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-primary/80 text-surface-bright text-[9px] font-semibold p-0.5 text-center truncate">
                    #2 Soil Profile
                  </div>
                </div>

                <div
                  onClick={() => setSelectedPhotoPreview(APP_ASSETS.canalInspection)}
                  className="relative h-20 rounded-lg overflow-hidden shadow-sm cursor-pointer hover:opacity-95 transition-opacity"
                >
                  <img
                    className="w-full h-full object-cover"
                    alt="Canal Canal"
                    src={APP_ASSETS.canalInspection}
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-primary/80 text-surface-bright text-[9px] font-semibold p-0.5 text-center truncate">
                    #3 Irrigation Canal
                  </div>
                </div>
              </div>
            </div>

            {/* Live PDF Watermark / Specimen Badge */}
            <div className="flex items-center justify-center gap-1.5 py-1 text-on-surface-variant text-[11px] font-semibold">
              <span className="material-symbols-outlined text-[16px]">lock</span>
              <span>Cryptographically Signed • SHA-256 Checksum Verified</span>
            </div>
          </div>

          {/* Prominent Tactile Export Action Bar */}
          <div className="space-y-2 pt-2">
            <button
              disabled={isGeneratingPdf}
              onClick={handleGeneratePdf}
              className="w-full h-14 bg-primary hover:bg-primary-container text-on-primary text-[15px] font-bold rounded-xl flex items-center justify-center gap-2 shadow-md transition-transform active:scale-[0.99] cursor-pointer"
            >
              <span className={`material-symbols-outlined text-[24px] text-secondary-fixed ${isGeneratingPdf ? 'animate-spin' : ''}`}>
                {isGeneratingPdf ? 'sync' : 'bolt'}
              </span>
              <span className="tracking-wide">
                {isGeneratingPdf ? 'COMPILING VECTOR PDF...' : 'GENERATE AUDIT PDF'}
              </span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleExportDownload}
                className="h-12 bg-surface-container-lowest text-primary hover:bg-surface-container text-[13px] font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors border border-outline-variant/15 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px] text-secondary">download</span>
                <span>Export (4.8MB)</span>
              </button>
              <button
                onClick={handleShare}
                className="h-12 bg-surface-container-lowest text-primary hover:bg-surface-container text-[13px] font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors border border-outline-variant/15 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px] text-secondary">share</span>
                <span>Share Dossier</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: REPORT HISTORY ARCHIVE */}
      {subTab === 'archive' && (
        <div className="flex flex-col space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex flex-col">
              <h3 className="text-[18px] font-bold text-primary">Exported Dossiers</h3>
              <span className="text-[12px] text-on-surface-variant">
                Archived PDF files ready for print and re-sharing
              </span>
            </div>
            <span className="text-[11px] font-bold bg-surface-container-high px-2.5 py-1 rounded-full text-on-surface-variant">
              {archiveList.length} Files
            </span>
          </div>

          {archiveList.length === 0 ? (
            <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm border border-outline-variant/15 text-center flex flex-col items-center justify-center text-on-surface-variant">
              <div className="w-12 h-12 rounded-xl bg-surface-container text-primary flex items-center justify-center mb-2">
                <span className="material-symbols-outlined text-[26px]">folder_open</span>
              </div>
              <p className="text-[15px] font-bold text-on-surface">No Exported Dossiers in Archive</p>
              <p className="text-[12px] text-on-surface-variant mt-1 max-w-sm">
                Generated PDF reports and compliance dossiers will be archived here for instant download and re-sharing.
              </p>
              <button
                onClick={() => setSubTab('generator')}
                className="mt-3.5 h-9 px-4 rounded-xl bg-primary text-on-primary text-[13px] font-bold flex items-center gap-1.5 shadow-sm hover:opacity-95 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
                <span>Generate New PDF Report</span>
              </button>
            </div>
          ) : (
            archiveList.map((item) => (
              <div
                key={item.id}
                className="bg-surface-container-lowest p-4 rounded-2xl shadow-sm flex items-center justify-between gap-3 border border-outline-variant/15"
              >
                <div className="w-11 h-11 rounded-xl bg-primary-fixed flex items-center justify-center text-primary flex-shrink-0">
                  <span className="material-symbols-outlined text-[24px]">picture_as_pdf</span>
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-[14px] font-bold text-on-surface truncate">{item.docId}</span>
                  <span className="text-[12px] text-on-surface-variant truncate">
                    {item.farmerName} • {item.crop} ({item.hectares} Ha)
                  </span>
                  <span className="text-[11px] text-on-surface-variant mt-0.5">
                    {item.date} • {item.fileSize} • PDF
                  </span>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => onShowToast(`Downloading ${item.docId}.pdf...`)}
                    className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary hover:bg-surface-container-high cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[20px]">download</span>
                  </button>
                  <button
                    onClick={safePrint}
                    className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary hover:bg-surface-container-high cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[20px]">print</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Photo Zoom Modal */}
      {selectedPhotoPreview && (
        <div
          onClick={() => setSelectedPhotoPreview(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="max-w-md w-full bg-surface-container-lowest rounded-2xl overflow-hidden shadow-2xl p-2 relative">
            <img src={selectedPhotoPreview} alt="Field High-Res Preview" className="w-full h-auto rounded-xl" />
            <button
              onClick={() => setSelectedPhotoPreview(null)}
              className="absolute top-4 right-4 bg-primary/80 text-white rounded-full p-1.5 shadow"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
