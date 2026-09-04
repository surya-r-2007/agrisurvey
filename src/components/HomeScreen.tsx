import React, { useState } from 'react';
import { TabType, FieldParcel, SurveyRecord, Farmer, Farm } from '../types';
import { APP_ASSETS } from '../data/initialData';

interface HomeScreenProps {
  onNavigate: (tab: TabType) => void;
  onOpenAddFarmer: () => void;
  onSelectParcel: (parcel: FieldParcel) => void;
  onSelectSurvey: (surveyId: string) => void;
  onShowToast: (msg: string) => void;
  parcels: FieldParcel[];
  surveys: SurveyRecord[];
  farmers?: Farmer[];
  farms?: Farm[];
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigate,
  onOpenAddFarmer,
  onSelectParcel,
  onSelectSurvey,
  onShowToast,
  parcels,
  surveys,
  farmers = [],
  farms = []
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'drafts' | 'today' | 'flagged'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  const totalFarmers = farmers.length;
  const totalFarms = farms.length;
  const totalFields = parcels.length;
  const totalSurveys = surveys.length;
  const completedSurveys = surveys.filter((s) => s.status === 'Completed').length;
  const draftSurveys = surveys.filter((s) => s.status === 'Draft').length;
  const todaySurveys = surveys.filter((s) => s.timeOrDate.includes('AM') || s.timeOrDate.includes('PM') || s.timeOrDate.toLowerCase().includes('today')).length;
  const totalRecords = totalFarmers + totalFarms + totalFields + totalSurveys;

  const handleSyncDb = () => {
    setIsSyncing(true);
    onShowToast('Syncing local SQLite table with Cloud Central...');
    setTimeout(() => {
      setIsSyncing(false);
      onShowToast(`Database synchronized! ${totalRecords} records up to date.`);
    }, 1200);
  };

  const filteredSurveys = surveys.filter((srv) => {
    const matchesSearch =
      srv.farmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      srv.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      srv.crop.toLowerCase().includes(searchQuery.toLowerCase()) ||
      srv.fieldId.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeFilter === 'drafts') return srv.status === 'Draft';
    if (activeFilter === 'today') return srv.timeOrDate.includes('AM') || srv.timeOrDate.includes('PM') || srv.timeOrDate.toLowerCase().includes('today');
    if (activeFilter === 'flagged') return srv.status === 'Flagged';
    return true;
  });

  return (
    <div className="flex flex-col w-full space-y-5 max-w-2xl mx-auto">
      {/* Top Greeting & Inspector Identity Card */}
      <section className="bg-surface-container-lowest rounded-radius-card p-pad-card shadow-sm flex flex-col gap-3 relative overflow-hidden border border-outline-variant/15">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative flex-shrink-0">
              <img
                className="w-12 h-12 rounded-full object-cover shadow-sm ring-2 ring-secondary/20"
                alt="Field Inspector Dr. Rajesh Sharma"
                src={APP_ASSETS.inspector}
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-secondary rounded-full flex items-center justify-center ring-2 ring-white">
                <span className="w-1.5 h-1.5 rounded-full bg-surface-container-lowest"></span>
              </div>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] text-secondary uppercase tracking-wider font-bold">
                Field Inspector
              </span>
              <h2 className="text-[20px] font-bold text-on-surface truncate leading-tight">
                Dr. Rajesh Sharma
              </h2>
              <div className="flex items-center gap-1 text-on-surface-variant mt-0.5">
                <span className="material-symbols-outlined text-[16px] text-primary">location_on</span>
                <span className="text-[13px] truncate">Mandya District, Block 4</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end flex-shrink-0 bg-surface-container-low px-2.5 py-1.5 rounded-lg border border-outline-variant/20">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-secondary text-[16px]">database</span>
              <span className="text-[11px] text-secondary font-bold">SQLite v3</span>
            </div>
            <span className="text-on-surface-variant text-[11px] mt-0.5">Local Storage</span>
          </div>
        </div>

        {/* Storage and Local DB Synchronizer Banner */}
        <div className="bg-surface-container-low rounded-lg p-2.5 flex items-center justify-between gap-2 border border-outline-variant/10">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-secondary flex-shrink-0"></span>
            <span className="text-[13px] text-on-surface-variant truncate">
              <strong className="font-semibold text-on-surface">{totalRecords} Records</strong> Synced locally
            </span>
          </div>
          <div className="flex items-center gap-1 bg-surface-container-highest px-2 py-0.5 rounded text-on-surface text-[11px] font-semibold flex-shrink-0">
            <span className="material-symbols-outlined text-[13px] text-secondary">sync_saved_locally</span>
            <span>Ready</span>
          </div>
        </div>
      </section>

      {/* High Tactile Tactical Action Buttons (2x2 Grid) */}
      <section aria-label="Field Quick Actions" className="grid grid-cols-2 gap-2.5">
        {/* + Add Farmer */}
        <button
          onClick={onOpenAddFarmer}
          className="flex flex-col justify-between p-3.5 bg-primary-container text-on-primary rounded-xl h-[78px] text-left active:scale-[0.98] transition-transform shadow-sm cursor-pointer hover:opacity-95"
          type="button"
        >
          <div className="flex items-center justify-between w-full">
            <span className="material-symbols-outlined text-[24px] text-primary-fixed">person_add</span>
            <span className="text-[11px] text-on-primary-container font-bold">FORM 01</span>
          </div>
          <span className="text-[16px] font-bold tracking-tight text-white leading-tight">
            + Add Farmer
          </span>
        </button>

        {/* + Add Farm */}
        <button
          onClick={() => onNavigate('farmers')}
          className="flex flex-col justify-between p-3.5 bg-primary text-on-primary rounded-xl h-[78px] text-left active:scale-[0.98] transition-transform shadow-sm cursor-pointer hover:opacity-95"
          type="button"
        >
          <div className="flex items-center justify-between w-full">
            <span className="material-symbols-outlined text-[24px] text-secondary-fixed">agriculture</span>
            <span className="text-[11px] text-secondary-fixed-dim font-bold">FORM 02</span>
          </div>
          <span className="text-[16px] font-bold tracking-tight leading-tight text-white">
            + Add Farm
          </span>
        </button>

        {/* + Add Field */}
        <button
          onClick={() => onNavigate('fields')}
          className="flex flex-col justify-between p-3.5 bg-secondary text-on-secondary rounded-xl h-[78px] text-left active:scale-[0.98] transition-transform shadow-sm cursor-pointer hover:opacity-95"
          type="button"
        >
          <div className="flex items-center justify-between w-full">
            <span className="material-symbols-outlined text-[24px] text-surface-bright">polyline</span>
            <span className="text-[11px] text-primary-fixed-dim font-bold">GIS MESH</span>
          </div>
          <span className="text-[16px] font-bold tracking-tight leading-tight text-white">
            + Add Field
          </span>
        </button>

        {/* New Survey (Vibrant action) */}
        <button
          onClick={() => onNavigate('surveys')}
          className="relative overflow-hidden flex flex-col justify-between p-3.5 bg-secondary-container text-on-secondary-fixed rounded-xl h-[78px] text-left active:scale-[0.98] transition-transform shadow-sm cursor-pointer hover:opacity-95"
          type="button"
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[24px] text-on-secondary-fixed" style={{ fontVariationSettings: "'FILL' 1" }}>
                bolt
              </span>
              <span className="text-[11px] bg-primary-container text-on-primary px-1.5 py-0.2 rounded-full font-bold">
                LIVE
              </span>
            </div>
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
            </span>
          </div>
          <span className="text-[16px] font-bold text-on-secondary-fixed leading-tight tracking-tight">
            ⚡ New Survey
          </span>
        </button>
      </section>

      {/* Quick Stats Grid (2x3 Compact Mobile Cards) */}
      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-0.5">
          <h3 className="text-[18px] font-bold text-on-surface">Block Telemetry</h3>
          <span className="text-[12px] text-on-surface-variant font-medium">Real-time stats</span>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {/* Total Farmers */}
          <div
            onClick={() => onNavigate('farmers')}
            className="bg-surface-container-lowest p-3 rounded-xl shadow-sm flex flex-col justify-between h-24 border border-outline-variant/15 cursor-pointer hover:border-secondary/40 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-on-surface-variant uppercase font-bold tracking-wider">
                Total Farmers
              </span>
              <div className="w-7 h-7 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[18px]">group</span>
              </div>
            </div>
            <div>
              <div className="text-[24px] text-on-surface font-bold leading-none">{totalFarmers}</div>
              <div className="flex items-center gap-1 mt-1 text-secondary">
                <span className="material-symbols-outlined text-[14px]">trending_up</span>
                <span className="text-[11px] font-semibold">Active Database</span>
              </div>
            </div>
          </div>

          {/* Total Farms */}
          <div
            onClick={() => onNavigate('farmers')}
            className="bg-surface-container-lowest p-3 rounded-xl shadow-sm flex flex-col justify-between h-24 border border-outline-variant/15 cursor-pointer hover:border-secondary/40 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-on-surface-variant uppercase font-bold tracking-wider">
                Total Farms
              </span>
              <div className="w-7 h-7 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[18px]">domain</span>
              </div>
            </div>
            <div>
              <div className="text-[24px] text-on-surface font-bold leading-none">{totalFarms}</div>
              <span className="text-[11px] text-on-surface-variant mt-1 block font-medium">
                Holdings registered
              </span>
            </div>
          </div>

          {/* Total Fields */}
          <div
            onClick={() => onNavigate('fields')}
            className="bg-surface-container-lowest p-3 rounded-xl shadow-sm flex flex-col justify-between h-24 border border-outline-variant/15 cursor-pointer hover:border-secondary/40 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-on-surface-variant uppercase font-bold tracking-wider">
                Total Fields
              </span>
              <div className="w-7 h-7 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[18px]">grid_view</span>
              </div>
            </div>
            <div>
              <div className="text-[24px] text-on-surface font-bold leading-none">{totalFields}</div>
              <span className="text-[11px] text-on-surface-variant mt-1 block font-medium">
                Cadastral Parcels
              </span>
            </div>
          </div>

          {/* Total Surveys */}
          <div
            onClick={() => onNavigate('surveys')}
            className="bg-surface-container-lowest p-3 rounded-xl shadow-sm flex flex-col justify-between h-24 border border-outline-variant/15 cursor-pointer hover:border-secondary/40 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-on-surface-variant uppercase font-bold tracking-wider">
                Total Surveys
              </span>
              <div className="w-7 h-7 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[18px]">assignment_turned_in</span>
              </div>
            </div>
            <div>
              <div className="text-[24px] text-on-surface font-bold leading-none">{totalSurveys}</div>
              <span className="text-[11px] text-on-surface-variant mt-1 block font-medium">
                Dossiers on file
              </span>
            </div>
          </div>

          {/* Completed Surveys */}
          <div className="bg-surface-container-lowest p-3 rounded-xl shadow-sm flex flex-col justify-between h-24 border border-outline-variant/15">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-secondary uppercase font-bold tracking-wider">
                Completed
              </span>
              <div className="w-7 h-7 rounded-lg bg-primary-fixed flex items-center justify-center text-on-primary-fixed">
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
              </div>
            </div>
            <div>
              <div className="text-[24px] text-secondary font-bold leading-none">{completedSurveys}</div>
              <div className="w-full bg-surface-container-high rounded-full h-1.5 mt-2 overflow-hidden">
                <div
                  className="bg-secondary h-1.5 rounded-full"
                  style={{ width: totalSurveys > 0 ? `${Math.round((completedSurveys / totalSurveys) * 100)}%` : '0%' }}
                ></div>
              </div>
              <span className="text-[11px] text-secondary font-semibold mt-1 block">
                {totalSurveys > 0 ? `${Math.round((completedSurveys / totalSurveys) * 100)}% compliance` : '0% completed'}
              </span>
            </div>
          </div>

          {/* Draft Surveys */}
          <div
            onClick={() => {
              setActiveFilter('drafts');
              onShowToast('Filtered by Pending Draft Surveys');
            }}
            className="bg-surface-container-lowest p-3 rounded-xl shadow-sm flex flex-col justify-between h-24 border border-outline-variant/15 cursor-pointer hover:border-tertiary-container/40 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-tertiary uppercase font-bold tracking-wider">
                Draft Surveys
              </span>
              <div className="w-7 h-7 rounded-lg bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed">
                <span className="material-symbols-outlined text-[18px]">edit_note</span>
              </div>
            </div>
            <div>
              <div className="text-[24px] text-tertiary-container font-bold leading-none">{draftSurveys}</div>
              <span className="text-[11px] text-on-tertiary-container font-semibold mt-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-on-tertiary-container animate-pulse"></span>
                In-Progress
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Global Fast Search & Filter Segment */}
      <section className="flex flex-col gap-2.5">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-on-surface-variant">
            <span className="material-symbols-outlined text-[20px]">search</span>
          </div>
          <input
            className="w-full h-12 pl-10 pr-10 rounded-xl bg-surface-container-lowest text-on-surface text-[14px] placeholder:text-outline focus:outline-none shadow-sm border border-outline-variant/20 focus:border-secondary transition-colors"
            placeholder="Search Farmer, Survey ID, Farm ID, Village..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-on-surface-variant hover:text-on-surface cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          ) : (
            <button
              onClick={() => onShowToast('Voice Search active: listening for farmer or plot ID...')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-on-surface-variant hover:text-primary cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">mic</span>
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-pad-screen-horizontal px-pad-screen-horizontal scrollbar-none">
          <button
            onClick={() => setActiveFilter('all')}
            className={`filter-btn flex-shrink-0 h-9 px-4 rounded-full text-[13px] font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-primary-container text-on-primary'
                : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container'
            }`}
            type="button"
          >
            <span>All Surveys</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              activeFilter === 'all' ? 'bg-primary-fixed-dim text-on-primary-fixed' : 'bg-surface-container text-on-surface-variant'
            }`}>
              {totalSurveys}
            </span>
          </button>

          <button
            onClick={() => setActiveFilter('drafts')}
            className={`filter-btn flex-shrink-0 h-9 px-4 rounded-full text-[13px] font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer ${
              activeFilter === 'drafts'
                ? 'bg-primary-container text-on-primary'
                : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container'
            }`}
            type="button"
          >
            <span className="w-2 h-2 rounded-full bg-on-tertiary-container"></span>
            <span>Pending Drafts</span>
            <span className="bg-surface-container text-on-surface-variant px-1.5 py-0.2 rounded-full text-[10px] font-bold">
              {draftSurveys}
            </span>
          </button>

          <button
            onClick={() => setActiveFilter('today')}
            className={`filter-btn flex-shrink-0 h-9 px-4 rounded-full text-[13px] font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer ${
              activeFilter === 'today'
                ? 'bg-primary-container text-on-primary'
                : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container'
            }`}
            type="button"
          >
            <span className="w-2 h-2 rounded-full bg-secondary"></span>
            <span>Today's Surveys</span>
            <span className="bg-surface-container text-on-surface-variant px-1.5 py-0.2 rounded-full text-[10px] font-bold">
              {todaySurveys}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveFilter('flagged');
              onShowToast('Showing flagged audits requiring inspector review');
            }}
            className={`filter-btn flex-shrink-0 h-9 px-4 rounded-full text-[13px] font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer ${
              activeFilter === 'flagged'
                ? 'bg-primary-container text-on-primary'
                : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[16px] text-error">flag</span>
            <span>Flagged / Review</span>
          </button>
        </div>
      </section>

      {/* Quick Access Field Carousel */}
      <section className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between px-0.5">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-secondary text-[20px]">radar</span>
            <h3 className="text-[18px] font-bold text-on-surface">Active Parcels in Zone</h3>
          </div>
          <button
            onClick={() => onNavigate('fields')}
            className="text-[12px] text-secondary font-bold flex items-center hover:underline cursor-pointer"
          >
            Map View <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </button>
        </div>

        {parcels.length === 0 ? (
          <div className="w-full bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/15 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-xl bg-surface-container text-primary flex items-center justify-center mb-2">
              <span className="material-symbols-outlined text-[24px]">map</span>
            </div>
            <h4 className="text-[15px] font-bold text-on-surface">No Active Parcels Mapped</h4>
            <p className="text-[12px] text-on-surface-variant mt-1 max-w-sm">
              There are no cadastral field parcels recorded yet. Map your first field plot with GPS boundaries.
            </p>
            <button
              onClick={() => onNavigate('fields')}
              className="mt-3.5 h-9 px-4 rounded-xl bg-primary text-on-primary text-[13px] font-bold flex items-center gap-1.5 shadow-sm hover:opacity-95 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">add_location_alt</span>
              <span>+ Add Field Parcel</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3 overflow-x-auto pb-2 -mx-pad-screen-horizontal px-pad-screen-horizontal scrollbar-none">
            {parcels.map((parcel) => (
              <div
                key={parcel.id}
                className="flex-shrink-0 w-64 bg-surface-container-lowest rounded-xl p-3 shadow-sm flex flex-col justify-between border border-outline-variant/15 hover:border-secondary/30 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[11px] text-primary font-bold">{parcel.id}</span>
                    <h4 className="text-[15px] text-on-surface font-bold truncate max-w-[150px]">
                      {parcel.name}
                    </h4>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold flex items-center gap-1 ${
                    parcel.status === 'Alert'
                      ? 'bg-tertiary-fixed text-on-tertiary-fixed'
                      : 'bg-secondary-container text-on-secondary-container'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      parcel.status === 'Alert' ? 'bg-on-tertiary-container' : 'bg-secondary'
                    }`}></span>
                    {parcel.vigourPercent ? `${parcel.vigourPercent}% Vigour` : parcel.vigourStatus || 'Optimal'}
                  </span>
                </div>

                <div className="my-2.5 h-20 rounded-lg overflow-hidden relative group">
                  <img
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    alt={parcel.name}
                    src={parcel.imageUrl}
                  />
                  <div className="absolute bottom-1 right-1 bg-primary/80 backdrop-blur-sm text-on-primary px-1.5 py-0.5 rounded text-[10px] font-semibold">
                    {parcel.hectares} Hectares
                  </div>
                </div>

                <div className="flex items-center justify-between text-on-surface-variant text-[12px]">
                  <span className="truncate max-w-[130px]">Owner: {parcel.owner}</span>
                  <button
                    onClick={() => {
                      onSelectParcel(parcel);
                      onNavigate('fields');
                    }}
                    className="text-secondary font-bold flex items-center gap-0.5 hover:underline cursor-pointer"
                    type="button"
                  >
                    Inspect <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recent Activity Feed & Surveys List */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-0.5">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-primary text-[20px]">history_edu</span>
            <h3 className="text-[18px] font-bold text-on-surface">Recent Field Surveys</h3>
          </div>
          <button
            onClick={() => onNavigate('reports')}
            className="text-[12px] text-secondary font-bold hover:underline cursor-pointer"
            type="button"
          >
            View All ({totalSurveys})
          </button>
        </div>

        {filteredSurveys.length === 0 ? (
          <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/15 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-xl bg-surface-container text-primary flex items-center justify-center mb-2">
              <span className="material-symbols-outlined text-[24px]">assignment_turned_in</span>
            </div>
            <h4 className="text-[15px] font-bold text-on-surface">No Field Surveys Recorded</h4>
            <p className="text-[12px] text-on-surface-variant mt-1 max-w-sm">
              Initiate an agronomic survey across the 10 ISO cadastral modules to log soil, hydraulic, and crop telemetry.
            </p>
            <button
              onClick={() => onNavigate('surveys')}
              className="mt-3.5 h-9 px-4 rounded-xl bg-secondary text-on-secondary text-[13px] font-bold flex items-center gap-1.5 shadow-sm hover:opacity-95 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">bolt</span>
              <span>⚡ Start First Survey</span>
            </button>
          </div>
        ) : (
          filteredSurveys.map((survey) => (
            <article
              key={survey.id}
              className="bg-surface-container-lowest rounded-radius-card p-pad-card shadow-sm flex flex-col gap-3 border border-outline-variant/15"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-bold text-primary">{survey.id}</span>
                    <span className="text-[12px] text-on-surface-variant">• {survey.timeOrDate}</span>
                  </div>
                  <h4 className="text-[18px] font-bold text-on-surface truncate mt-0.5">
                    {survey.farmerName}
                  </h4>
                  <span className="text-[13px] text-on-surface-variant">
                    {survey.crop} • Field #{survey.fieldId}
                  </span>
                </div>

                {survey.status === 'Completed' ? (
                  <div className="flex items-center gap-1.5 bg-secondary-container text-on-secondary-container px-2.5 py-1 rounded-full text-[12px] font-bold flex-shrink-0">
                    <span className="w-2 h-2 rounded-full bg-secondary"></span>
                    <span>Completed</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 bg-tertiary-fixed text-on-tertiary-fixed px-2.5 py-1 rounded-full text-[12px] font-bold flex-shrink-0">
                    <span className="w-2 h-2 rounded-full bg-on-tertiary-container animate-pulse"></span>
                    <span>{survey.statusDetail || 'Draft'}</span>
                  </div>
                )}
              </div>

              {/* Scope tags & stats */}
              <div className="flex flex-wrap items-center justify-between gap-1.5 bg-surface-container-low p-2 rounded-lg text-on-surface text-[12px]">
                <div className="flex items-center gap-1.5 text-on-surface-variant">
                  <span className="material-symbols-outlined text-[16px] text-secondary">
                    {survey.status === 'Completed' ? 'science' : 'bug_report'}
                  </span>
                  <span>{survey.moduleName || 'Soil & Microclimate'}</span>
                </div>
                {survey.ph ? (
                  <div className="flex items-center gap-1.5 text-on-surface-variant">
                    <span>pH {survey.ph}</span>
                    <span className="text-outline-variant">•</span>
                    <span>Moisture {survey.moisturePercent}%</span>
                  </div>
                ) : survey.stepProgress ? (
                  <span className="text-tertiary-container font-semibold">{survey.stepProgress}</span>
                ) : survey.passedCertification ? (
                  <span className="font-semibold text-secondary">{survey.passedCertification}</span>
                ) : null}
              </div>

              <div className="flex items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-1.5 text-on-surface-variant text-[12px]">
                  <span className="material-symbols-outlined text-[16px] text-secondary">
                    {survey.status === 'Completed' ? 'cloud_done' : 'pending'}
                  </span>
                  <span>
                    {survey.status === 'Completed' ? 'Synced to Cloud' : 'Draft local cache saved'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {survey.status === 'Completed' ? (
                    <>
                      <button
                        onClick={() => {
                          onSelectSurvey(survey.id);
                          onNavigate('surveys');
                        }}
                        className="h-9 px-3 rounded-lg bg-surface-container text-on-surface text-[13px] font-semibold flex items-center gap-1 hover:bg-surface-container-high transition-colors cursor-pointer"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[16px]">visibility</span>
                        <span>View</span>
                      </button>
                      <button
                        onClick={() => {
                          onSelectSurvey(survey.id);
                          onNavigate('reports');
                        }}
                        className="h-9 px-3 rounded-lg bg-primary-container text-on-primary text-[13px] font-semibold flex items-center gap-1 hover:bg-primary transition-colors cursor-pointer"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
                        <span>PDF</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        onSelectSurvey(survey.id);
                        onNavigate('surveys');
                      }}
                      className="h-10 px-4 rounded-lg bg-secondary text-on-secondary text-[14px] font-bold flex items-center gap-1.5 shadow-sm active:scale-[0.98] transition-transform cursor-pointer"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                      <span>Resume Survey</span>
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))
        )}
      </section>

      {/* Persistent Bottom Field Hardware Telemetry Bar */}
      <section className="sticky bottom-20 w-full bg-primary text-on-primary rounded-xl p-3 shadow-xl flex items-center justify-between gap-2 z-40 border border-primary-fixed/20">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="material-symbols-outlined text-on-secondary text-[18px]">gps_fixed</span>
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[12px] font-bold text-secondary-fixed">GPS Accuracy: ±1.5m</span>
              <span className="w-1.5 h-1.5 rounded-full bg-secondary-fixed"></span>
              <span className="text-[11px] text-primary-fixed-dim">14 Sats</span>
            </div>
            <span className="text-[11px] text-primary-fixed truncate">
              Offline Auto-Save active • Ready for offline surveying
            </span>
          </div>
        </div>
        <button
          aria-label="Manual DB Sync Now"
          onClick={handleSyncDb}
          disabled={isSyncing}
          className="h-9 px-3 rounded-lg bg-secondary-container text-on-secondary-fixed text-[13px] font-bold flex items-center gap-1 flex-shrink-0 active:scale-95 transition-transform cursor-pointer hover:bg-secondary-fixed"
          type="button"
        >
          <span className={`material-symbols-outlined text-[16px] ${isSyncing ? 'animate-spin' : ''}`}>
            sync
          </span>
          <span>{isSyncing ? 'Syncing...' : 'Sync DB'}</span>
        </button>
      </section>
    </div>
  );
};

