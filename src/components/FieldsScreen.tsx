import React, { useState } from 'react';
import { FieldParcel, TabType } from '../types';
import { APP_ASSETS } from '../data/initialData';

interface FieldsScreenProps {
  currentParcel?: FieldParcel;
  parcels?: FieldParcel[];
  onSelectParcel?: (parcel: FieldParcel) => void;
  onSaveParcel?: (parcel: FieldParcel) => void;
  onNavigate: (tab: TabType) => void;
  onShowToast: (msg: string) => void;
}

export const FieldsScreen: React.FC<FieldsScreenProps> = ({
  currentParcel,
  parcels = [],
  onSelectParcel,
  onSaveParcel,
  onNavigate,
  onShowToast
}) => {
  const activeParcel = currentParcel || (parcels.length > 0 ? parcels[0] : undefined);
  const [isCreatingParcel, setIsCreatingParcel] = useState(false);

  // New parcel form fields
  const [newParcelId, setNewParcelId] = useState('');
  const [newOwner, setNewOwner] = useState('');
  const [newFarmId, setNewFarmId] = useState('');
  const [newCrop, setNewCrop] = useState('Sugarcane');
  const [newHectares, setNewHectares] = useState('3.2');

  const [lat, setLat] = useState('12.584219');
  const [lng, setLng] = useState('77.042831');
  const [altitude, setAltitude] = useState('662.4');
  const [capturedPointsCount, setCapturedPointsCount] = useState(5);
  const [showGpsSuccess, setShowGpsSuccess] = useState(false);
  const [activeLayers, setActiveLayers] = useState({
    polygon: true,
    drip: true,
    pest: true,
    disease: true,
    soil: true
  });
  const [selectedSoilPin, setSelectedSoilPin] = useState<{ id: string; depth: string; ec: string; ph: string } | null>(null);

  const simulateGpsCapture = () => {
    // Generate slight realistic jitter around coordinates
    const newLat = (12.584219 + (Math.random() - 0.5) * 0.00005).toFixed(6);
    const newLng = (77.042831 + (Math.random() - 0.5) * 0.00005).toFixed(6);
    const newAlt = (662.4 + (Math.random() - 0.5) * 0.4).toFixed(1);

    setLat(newLat);
    setLng(newLng);
    setAltitude(newAlt);
    setCapturedPointsCount((prev) => prev + 1);
    setShowGpsSuccess(true);
    setTimeout(() => setShowGpsSuccess(false), 3000);
    onShowToast(`Point logged! Vertex #${capturedPointsCount + 1} added to boundary buffer.`);
  };

  const parcel: FieldParcel = activeParcel || {
    id: newParcelId || 'FLD-001',
    name: newFarmId ? `${newFarmId} (${newOwner || 'Farmer'})` : (newOwner || 'New Field Plot'),
    crop: newCrop,
    hectares: parseFloat(newHectares) || 2.5,
    vigourPercent: 96,
    status: 'Optimal' as const,
    owner: newOwner || 'Farmer Operator',
    ownerCode: 'FMR-01',
    farmId: newFarmId || 'FRM-01',
    imageUrl: APP_ASSETS.maizeField,
    perimeterMeters: Math.round((parseFloat(newHectares) || 2.5) * 200),
    gpsAccuracy: '±1.2m',
    shape: 'Irregular Trapezoidal Polygon',
    boundaryStructure: 'Living Hedge + Concrete Bund Wall',
    highestElev: '668m MSL',
    lowestElev: '657m MSL',
    slope: '3.8% Slope',
    slopeFlow: 'Gentle Eastward Flow',
    surfaceTilth: 'Loose tilth',
    tilthNote: 'Calibrated boundary',
    erosionRisk: 'Low',
    erosionNote: 'Bund-stabilized runoff',
    waterlogging: 'Nil',
    waterloggingNote: 'Optimal percolation',
    drainage: 'Moderate',
    drainageNote: 'Perimeter swale equipped',
    waterSource: 'Deep Borewell (180 ft depth)',
    pumpingUnit: '7.5 HP Submersible Star-Delta',
    lateralSpecs: '16mm Inline (40cm Spacing)',
    primaryFiltration: 'Dual 2" High-Volume Disc Filter'
  };

  const handleSaveField = () => {
    const toSave: FieldParcel = {
      ...parcel,
      id: isCreatingParcel ? (newParcelId.trim() || `FLD-${Date.now().toString().slice(-4)}`) : parcel.id,
      name: isCreatingParcel ? (newFarmId ? `${newFarmId} (${newOwner || 'Farmer'})` : (newOwner || 'Field Plot')) : parcel.name,
      owner: isCreatingParcel ? (newOwner || 'Farmer Operator') : parcel.owner,
      crop: isCreatingParcel ? newCrop : parcel.crop,
      hectares: isCreatingParcel ? (parseFloat(newHectares) || 2.5) : parcel.hectares
    };
    onSaveParcel?.(toSave);
    setIsCreatingParcel(false);
    onShowToast(`Field ${toSave.id} geometry & attributes synced to database!`);
  };

  if (!activeParcel && !isCreatingParcel) {
    return (
      <div className="flex flex-col w-full space-y-4 max-w-2xl mx-auto pb-16">
        <div className="bg-surface-container-lowest rounded-2xl p-8 shadow-sm border border-outline-variant/15 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-surface-container text-primary flex items-center justify-center mb-3">
            <span className="material-symbols-outlined text-[32px]">polyline</span>
          </div>
          <h2 className="text-[20px] font-bold text-on-surface">No Field Parcels Mapped</h2>
          <p className="text-[13px] text-on-surface-variant mt-1.5 max-w-md">
            Field parcels represent mapped agricultural plots with GIS polygons, GPS boundaries, topography, and irrigation data.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2.5 mt-5">
            <button
              onClick={() => {
                setIsCreatingParcel(true);
                setNewParcelId(`FLD-${Date.now().toString().slice(-4)}`);
                onShowToast('GPS Boundary Mapper initialized for new field.');
              }}
              className="h-11 px-5 rounded-xl bg-primary hover:bg-primary-container text-on-primary text-[13px] font-bold flex items-center gap-2 shadow-sm cursor-pointer active:scale-95 transition-transform"
            >
              <span className="material-symbols-outlined text-[20px]">add_location_alt</span>
              <span>+ Map New Field Parcel (Live GPS)</span>
            </button>
            <button
              onClick={() => onNavigate('farmers')}
              className="h-11 px-4 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-[13px] font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">person</span>
              <span>Farmers Database</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full space-y-4 max-w-2xl mx-auto pb-16">
      {/* Parcel Selection Carousel / Switcher */}
      {parcels.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-pad-card px-pad-card scrollbar-none">
          {parcels.map((p) => {
            const isSelected = p.id === parcel.id && !isCreatingParcel;
            return (
              <button
                key={p.id}
                onClick={() => {
                  setIsCreatingParcel(false);
                  onSelectParcel?.(p);
                }}
                className={`h-9 px-3.5 rounded-full text-[12px] font-bold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">crop_free</span>
                <span>{p.id}</span>
                <span className="text-[11px] opacity-75">({p.crop})</span>
              </button>
            );
          })}
          <button
            onClick={() => {
              setIsCreatingParcel(true);
              setNewParcelId(`FLD-${Date.now().toString().slice(-4)}`);
            }}
            className={`h-9 px-3.5 rounded-full text-[12px] font-bold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
              isCreatingParcel
                ? 'bg-secondary text-on-secondary shadow-xs'
                : 'bg-surface-container-highest text-primary hover:bg-surface-container-high'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">add_location_alt</span>
            <span>+ Map New Field</span>
          </button>
        </div>
      )}

      {/* New Parcel Configuration Header (if creating) */}
      {isCreatingParcel && (
        <div className="bg-secondary-container/20 rounded-xl p-pad-card border border-secondary/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-[22px]">edit_location_alt</span>
              <h2 className="text-[16px] font-bold text-on-surface">Live Field Boundary Mapping</h2>
            </div>
            {parcels.length > 0 && (
              <button
                onClick={() => setIsCreatingParcel(false)}
                className="text-[12px] font-bold text-on-surface-variant hover:text-on-surface cursor-pointer"
              >
                Cancel
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-bold text-on-surface-variant block mb-1">Field ID</label>
              <input
                type="text"
                value={newParcelId}
                onChange={(e) => setNewParcelId(e.target.value)}
                placeholder="e.g. FLD-001"
                className="w-full h-10 px-2.5 rounded-lg bg-surface-container-lowest text-[13px] font-bold text-on-surface border border-outline-variant/30 focus:border-secondary outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-on-surface-variant block mb-1">Farmer / Owner</label>
              <input
                type="text"
                value={newOwner}
                onChange={(e) => setNewOwner(e.target.value)}
                placeholder="e.g. Anand Rao"
                className="w-full h-10 px-2.5 rounded-lg bg-surface-container-lowest text-[13px] font-bold text-on-surface border border-outline-variant/30 focus:border-secondary outline-none"
              />
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
                <option>Groundnut</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-bold text-on-surface-variant block mb-1">Area (Hectares)</label>
              <input
                type="number"
                step="0.1"
                value={newHectares}
                onChange={(e) => setNewHectares(e.target.value)}
                placeholder="e.g. 3.2"
                className="w-full h-10 px-2.5 rounded-lg bg-surface-container-lowest text-[13px] font-bold text-on-surface border border-outline-variant/30 focus:border-secondary outline-none"
              />
            </div>
          </div>
          <p className="text-[11px] text-on-surface-variant">
            Walk boundary or use the GPS tool below to log corner vertices, then click <strong>Save Field</strong>.
          </p>
        </div>
      )}

      {/* Field Identification Card */}
      <div className="bg-surface-container-lowest rounded-xl p-pad-card shadow-sm border border-outline-variant/15">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="bg-primary-container text-on-primary text-[12px] font-bold px-2.5 py-0.5 rounded-full tracking-wide">
                {parcel.id}
              </span>
              <span className="bg-secondary-container text-on-secondary-container text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                Active Sync
              </span>
            </div>
            <h2 className="text-[20px] font-bold text-on-surface mt-2 truncate">
              {parcel.name.includes('FRM') ? parcel.name : `${parcel.farmId} (${parcel.owner})`}
            </h2>
            <div className="flex items-center gap-1 mt-1 text-on-surface-variant text-[13px]">
              <span className="material-symbols-outlined text-[16px] text-secondary">location_on</span>
              <span className="truncate">Huligere, Mandya District • Karnataka</span>
            </div>
          </div>
          <button
            aria-label="Field overview menu"
            onClick={() => onShowToast(`Field options for ${parcel.id}`)}
            className="w-10 h-10 flex items-center justify-center rounded-lg bg-surface-container text-on-surface-variant active:scale-95 transition-transform cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">more_vert</span>
          </button>
        </div>

        {/* Quick Metrics Strip */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 bg-surface-container-low rounded-lg p-2.5 border border-outline-variant/10">
          <div className="flex flex-col">
            <span className="text-[11px] text-on-surface-variant font-medium">Gross Area</span>
            <span className="text-[15px] font-bold text-primary mt-0.5">{parcel.hectares.toFixed(2)} Ha</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] text-on-surface-variant font-medium">Perimeter</span>
            <span className="text-[15px] font-bold text-on-surface mt-0.5">{parcel.perimeterMeters} m</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] text-on-surface-variant font-medium">GPS Status</span>
            <span className="text-[15px] font-bold text-secondary mt-0.5 flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[14px]">satellite_alt</span> {parcel.gpsAccuracy}
            </span>
          </div>
        </div>

        {/* Quick Workflow Jumps */}
        <div className="flex items-center gap-2 mt-3 pt-2 border-t border-outline-variant/10">
          <button
            onClick={() => onNavigate('surveys')}
            className="flex-1 h-9 rounded-lg bg-primary/10 text-primary text-[12px] font-bold flex items-center justify-center gap-1.5 hover:bg-primary/15 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">assignment</span>
            <span>Survey Field</span>
          </button>
          <button
            onClick={() => onNavigate('farmers')}
            className="flex-1 h-9 rounded-lg bg-surface-container text-on-surface text-[12px] font-semibold flex items-center justify-center gap-1.5 hover:bg-surface-container-high transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">person</span>
            <span>Owner Record</span>
          </button>
          <button
            onClick={() => onNavigate('reports')}
            className="flex-1 h-9 rounded-lg bg-surface-container text-on-surface text-[12px] font-semibold flex items-center justify-center gap-1.5 hover:bg-surface-container-high transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">description</span>
            <span>Dossier</span>
          </button>
        </div>
      </div>

      {/* Interactive Map Display Preview Container */}
      <div className="relative w-full rounded-2xl overflow-hidden bg-surface-container-high shadow-md border border-outline-variant/20">
        <div
          className="w-full h-84 bg-cover bg-center relative"
          style={{ backgroundImage: `url('${APP_ASSETS.mapBackground}')` }}
        >
          {/* Topographic Graphic Layer Overlay (SVG Polygon & Spatial Assets) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" viewBox="0 0 380 320">
            {/* Field Polygon Boundary */}
            {activeLayers.polygon && (
              <polygon
                fill="#006c48"
                fillOpacity="0.22"
                points="50,45 320,30 350,225 110,280 40,190"
                stroke="#006c48"
                strokeDasharray="0"
                strokeLinejoin="round"
                strokeWidth="3.5"
              />
            )}
            {/* Drip Zone A */}
            {activeLayers.drip && (
              <polygon
                fill="#92f7c3"
                fillOpacity="0.28"
                points="65,65 210,55 190,160 80,170"
                stroke="#00734d"
                strokeDasharray="4,3"
                strokeWidth="1.5"
              />
            )}
            {/* Pest Zone Z2 */}
            {activeLayers.pest && (
              <polygon
                fill="#ffdcc3"
                fillOpacity="0.38"
                points="220,70 305,60 320,130 235,140"
                stroke="#f48c24"
                strokeDasharray="3,3"
                strokeWidth="2"
              />
            )}
            {/* Disease Zone Z4 */}
            {activeLayers.disease && (
              <polygon
                fill="#ffdad6"
                fillOpacity="0.45"
                points="120,200 240,185 270,250 140,265"
                stroke="#ba1a1a"
                strokeWidth="2"
              />
            )}
            {/* Survey Boundary Corner Vertices */}
            <circle cx="50" cy="45" fill="#012d1d" r="4.5" stroke="#ffffff" strokeWidth="2" />
            <circle cx="320" cy="30" fill="#012d1d" r="4.5" stroke="#ffffff" strokeWidth="2" />
            <circle cx="350" cy="225" fill="#012d1d" r="4.5" stroke="#ffffff" strokeWidth="2" />
            <circle cx="110" cy="280" fill="#012d1d" r="4.5" stroke="#ffffff" strokeWidth="2" />
            <circle cx="40" cy="190" fill="#012d1d" r="4.5" stroke="#ffffff" strokeWidth="2" />
          </svg>

          {/* Soil Sampling Pins (S1, S2, S3) */}
          {activeLayers.soil && (
            <>
              <div
                className="absolute left-[22%] top-[28%] -translate-x-1/2 -translate-y-full flex flex-col items-center cursor-pointer group hover:scale-110 transition-transform"
                onClick={() =>
                  setSelectedSoilPin({
                    id: 'S1',
                    depth: '0-30cm Topsoil',
                    ec: '0.42 dS/m (Normal)',
                    ph: '6.8 (Optimal)'
                  })
                }
              >
                <div className="bg-primary text-on-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                  S1
                </div>
                <span className="material-symbols-outlined text-[26px] text-primary drop-shadow-md -mt-1" style={{ fontVariationSettings: "'FILL' 1" }}>
                  location_on
                </span>
              </div>

              <div
                className="absolute left-[48%] top-[42%] -translate-x-1/2 -translate-y-full flex flex-col items-center cursor-pointer group hover:scale-110 transition-transform"
                onClick={() =>
                  setSelectedSoilPin({
                    id: 'S2',
                    depth: '0-30cm Subsoil',
                    ec: '0.38 dS/m (Normal)',
                    ph: '6.9 (Optimal)'
                  })
                }
              >
                <div className="bg-primary text-on-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                  S2
                </div>
                <span className="material-symbols-outlined text-[26px] text-primary drop-shadow-md -mt-1" style={{ fontVariationSettings: "'FILL' 1" }}>
                  location_on
                </span>
              </div>

              <div
                className="absolute left-[32%] top-[72%] -translate-x-1/2 -translate-y-full flex flex-col items-center cursor-pointer group hover:scale-110 transition-transform"
                onClick={() =>
                  setSelectedSoilPin({
                    id: 'S3',
                    depth: '0-30cm Furrow Bottom',
                    ec: '0.45 dS/m (Normal)',
                    ph: '6.7 (Optimal)'
                  })
                }
              >
                <div className="bg-primary text-on-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                  S3
                </div>
                <span className="material-symbols-outlined text-[26px] text-primary drop-shadow-md -mt-1" style={{ fontVariationSettings: "'FILL' 1" }}>
                  location_on
                </span>
              </div>
            </>
          )}

          {/* Spatial Layer Badges Floating on Map */}
          {activeLayers.pest && (
            <div className="absolute right-[18%] top-[30%] bg-surface-container-lowest/90 backdrop-blur-md rounded px-2 py-1 shadow-sm flex items-center gap-1 pointer-events-none border border-outline-variant/20">
              <span className="w-2.5 h-2.5 rounded-xs bg-tertiary-container"></span>
              <span className="text-[11px] font-bold text-on-surface">Pest Zone Z2</span>
            </div>
          )}

          {activeLayers.disease && (
            <div className="absolute right-[22%] bottom-[22%] bg-surface-container-lowest/90 backdrop-blur-md rounded px-2 py-1 shadow-sm flex items-center gap-1 pointer-events-none border border-outline-variant/20">
              <span className="w-2.5 h-2.5 rounded-xs bg-error"></span>
              <span className="text-[11px] font-bold text-on-surface">Disease Z4</span>
            </div>
          )}

          {activeLayers.drip && (
            <div className="absolute left-[14%] top-[14%] bg-surface-container-lowest/90 backdrop-blur-md rounded px-2 py-1 shadow-sm flex items-center gap-1 pointer-events-none border border-outline-variant/20">
              <span className="w-2.5 h-2.5 rounded-xs bg-secondary"></span>
              <span className="text-[11px] font-bold text-on-surface">Drip Zone A</span>
            </div>
          )}

          {/* Map View Mode Controls */}
          <div className="absolute top-3 right-3 flex flex-col gap-1.5">
            <button
              aria-label="Toggle layers"
              onClick={() => {
                setActiveLayers((prev) => ({
                  ...prev,
                  drip: !prev.drip,
                  pest: !prev.pest,
                  disease: !prev.disease
                }));
                onShowToast('Toggled thematic GIS overlay layers');
              }}
              className="w-10 h-10 rounded-lg bg-surface-container-lowest shadow-md flex items-center justify-center text-on-surface active:scale-90 transition-transform cursor-pointer border border-outline-variant/20"
              type="button"
            >
              <span className="material-symbols-outlined text-[22px]">layers</span>
            </button>
            <button
              aria-label="Center GPS"
              onClick={() => onShowToast(`Centered on current GNSS coordinate ${lat}° N, ${lng}° E`)}
              className="w-10 h-10 rounded-lg bg-surface-container-lowest shadow-md flex items-center justify-center text-secondary active:scale-90 transition-transform cursor-pointer border border-outline-variant/20"
              type="button"
            >
              <span className="material-symbols-outlined text-[22px]">my_location</span>
            </button>
          </div>

          {/* Compass Indicator */}
          <div className="absolute top-3 left-3 bg-surface-container-lowest/90 backdrop-blur-sm rounded-full w-9 h-9 flex items-center justify-center shadow-sm border border-outline-variant/20">
            <div className="flex flex-col items-center text-[9px] font-bold text-error leading-none">
              <span>N</span>
              <span className="material-symbols-outlined text-[14px] text-outline -mt-0.5">navigation</span>
            </div>
          </div>
        </div>

        {/* Map Legend Tray */}
        <div className="bg-surface-container-lowest px-3 py-2.5 flex items-center justify-between overflow-x-auto text-on-surface-variant text-[11px] font-semibold border-t border-outline-variant/20">
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="w-3 h-3 rounded-full bg-primary border-2 border-surface-container-lowest shadow-xs"></span>
            <span>Soil (S1-S3)</span>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="w-3 h-3 rounded-xs bg-secondary-fixed-dim"></span>
            <span>Irrig. Zone</span>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="w-3 h-3 rounded-xs bg-tertiary-fixed"></span>
            <span>Pest (Z2)</span>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="w-3 h-3 rounded-xs bg-error-container"></span>
            <span>Disease (Z4)</span>
          </div>
        </div>
      </div>

      {/* Soil Pin Modal / Popup */}
      {selectedSoilPin && (
        <div className="bg-surface-container-lowest rounded-xl p-3.5 shadow-md border border-secondary flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-primary text-on-primary rounded text-[11px] font-bold">
                Soil Node {selectedSoilPin.id}
              </span>
              <span className="text-[13px] font-bold text-primary">Core Profile</span>
            </div>
            <div className="text-[12px] text-on-surface flex gap-3 mt-1">
              <span>Depth: <strong>{selectedSoilPin.depth}</strong></span>
              <span>EC: <strong>{selectedSoilPin.ec}</strong></span>
              <span>pH: <strong>{selectedSoilPin.ph}</strong></span>
            </div>
          </div>
          <button
            onClick={() => setSelectedSoilPin(null)}
            className="text-on-surface-variant hover:text-on-surface p-1"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}

      {/* Prominent Real-time GPS Capture Card */}
      <div className="bg-surface-container-lowest rounded-xl p-pad-card shadow-sm border border-outline-variant/15">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-secondary animate-ping"></div>
            <span className="text-[14px] font-bold text-on-surface">Live High-Precision GNSS</span>
          </div>
          <span className="text-[11px] text-secondary bg-secondary-container px-2 py-0.5 rounded font-bold">
            Accuracy: ±1.2m (RTK Fix)
          </span>
        </div>

        {/* Live Readout Box */}
        <div className="bg-surface-container-low rounded-lg p-3 font-mono text-on-surface text-[13px] flex flex-col gap-1 border border-outline-variant/10">
          <div className="flex items-center justify-between">
            <span className="text-on-surface-variant font-sans">Latitude</span>
            <span className="font-bold text-primary">{lat}° N</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-on-surface-variant font-sans">Longitude</span>
            <span className="font-bold text-primary">{lng}° E</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-on-surface-variant font-sans">Orthometric Alt</span>
            <span className="font-bold text-on-surface">{altitude} m MSL</span>
          </div>
        </div>

        {/* Primary Action Button */}
        <button
          onClick={simulateGpsCapture}
          className="w-full mt-3 h-12 bg-primary-container text-on-primary rounded-lg text-[14px] font-bold flex items-center justify-center gap-2 shadow-sm hover:bg-primary active:scale-[0.99] transition-all cursor-pointer"
          type="button"
        >
          <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            add_location_alt
          </span>
          <span>CAPTURE CURRENT GPS POINT</span>
        </button>

        {showGpsSuccess && (
          <p className="text-center text-[12px] font-bold text-secondary mt-2 animate-in fade-in">
            Point logged! Boundary vertex #{capturedPointsCount} added to buffer.
          </p>
        )}
      </div>

      {/* Field Spatial & Topographic Attributes Panel */}
      <div className="bg-surface-container-lowest rounded-xl p-pad-card shadow-sm space-y-4 border border-outline-variant/15">
        <div className="flex items-center justify-between">
          <h3 className="text-[18px] font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[24px]">architecture</span>
            Spatial & Topographic Attributes
          </h3>
          <span className="text-[11px] font-bold text-on-surface-variant bg-surface-container px-2 py-0.5 rounded">
            Cadastral V2
          </span>
        </div>

        {/* Data Grid Bento */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-surface-container-low p-3 rounded-lg flex flex-col border border-outline-variant/10">
            <span className="text-[11px] text-on-surface-variant font-medium">Total Calculated Area</span>
            <span className="text-[20px] font-bold text-primary mt-1">{parcel.hectares} Ha</span>
            <span className="text-[12px] text-on-surface-variant">{(parcel.hectares * 2.471).toFixed(2)} Acres</span>
          </div>
          <div className="bg-surface-container-low p-3 rounded-lg flex flex-col border border-outline-variant/10">
            <span className="text-[11px] text-on-surface-variant font-medium">Field Perimeter</span>
            <span className="text-[20px] font-bold text-on-surface mt-1">{parcel.perimeterMeters} m</span>
            <span className="text-[12px] text-on-surface-variant">Span: 280m × 150m</span>
          </div>
          <div className="bg-surface-container-low p-3 rounded-lg flex flex-col border border-outline-variant/10">
            <span className="text-[11px] text-on-surface-variant font-medium">Geometry Shape</span>
            <span className="text-[15px] font-bold text-on-surface mt-1">{parcel.shape}</span>
            <span className="text-[12px] text-on-surface-variant">{capturedPointsCount} Closed Vertices</span>
          </div>
          <div className="bg-surface-container-low p-3 rounded-lg flex flex-col border border-outline-variant/10">
            <span className="text-[11px] text-on-surface-variant font-medium">Boundary Structure</span>
            <span className="text-[14px] font-bold text-on-surface mt-1 truncate">
              {parcel.boundaryStructure.split('+')[0]}
            </span>
            <span className="text-[12px] text-on-surface-variant truncate">
              {parcel.boundaryStructure.split('+')[1] ? `+ ${parcel.boundaryStructure.split('+')[1]}` : 'Surveyed Wall'}
            </span>
          </div>
        </div>

        {/* Elevation & Gradient Block */}
        <div className="bg-surface-container-high rounded-xl p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-on-surface font-bold flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-tertiary">terrain</span>
              Elevation & Slope Gradient
            </span>
            <span className="text-[11px] font-bold text-on-tertiary-container bg-tertiary-fixed px-2 py-0.5 rounded">
              {parcel.slope}
            </span>
          </div>

          <div className="flex items-center justify-between text-[12px] text-on-surface-variant pt-1">
            <div>
              <span className="text-outline text-[11px]">Highest Point:</span>
              <span className="font-bold text-on-surface ml-1">{parcel.highestElev}</span>
            </div>
            <div className="flex items-center gap-1 text-secondary font-bold">
              <span className="material-symbols-outlined text-[16px]">east</span>
              <span>{parcel.slopeFlow}</span>
            </div>
            <div>
              <span className="text-outline text-[11px]">Lowest:</span>
              <span className="font-bold text-on-surface ml-1">{parcel.lowestElev}</span>
            </div>
          </div>

          <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
            <div className="bg-secondary h-full rounded-full w-3/4"></div>
          </div>
        </div>
      </div>

      {/* Soil Surface & Drainage Section */}
      <div className="bg-surface-container-lowest rounded-xl p-pad-card shadow-sm space-y-3 border border-outline-variant/15">
        <div className="flex items-center justify-between">
          <h3 className="text-[18px] font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[24px]">landslide</span>
            Soil Surface & Hydrology
          </h3>
          <span className="material-symbols-outlined text-on-surface-variant text-[20px]">water_drop</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-surface-container-low p-2.5 rounded-lg border border-outline-variant/10">
            <span className="text-[11px] text-on-surface-variant block font-medium">Surface Tilth</span>
            <span className="text-[13px] text-on-surface mt-0.5 block font-bold">{parcel.surfaceTilth}</span>
            <span className="text-[11px] text-outline">{parcel.tilthNote}</span>
          </div>
          <div className="bg-surface-container-low p-2.5 rounded-lg border border-outline-variant/10">
            <span className="text-[11px] text-on-surface-variant block font-medium">Erosion Risk</span>
            <span className="text-[13px] text-secondary mt-0.5 block font-bold">{parcel.erosionRisk}</span>
            <span className="text-[11px] text-outline">{parcel.erosionNote}</span>
          </div>
          <div className="bg-surface-container-low p-2.5 rounded-lg border border-outline-variant/10">
            <span className="text-[11px] text-on-surface-variant block font-medium">Waterlogging Hazard</span>
            <span className="text-[13px] text-secondary mt-0.5 block font-bold">{parcel.waterlogging}</span>
            <span className="text-[11px] text-outline">{parcel.waterloggingNote}</span>
          </div>
          <div className="bg-surface-container-low p-2.5 rounded-lg border border-outline-variant/10">
            <span className="text-[11px] text-on-surface-variant block font-medium">Natural Drainage</span>
            <span className="text-[13px] text-on-surface mt-0.5 block font-bold">{parcel.drainage}</span>
            <span className="text-[11px] text-outline">{parcel.drainageNote}</span>
          </div>
        </div>
      </div>

      {/* Irrigation Layout Overview */}
      <div className="bg-surface-container-lowest rounded-xl p-pad-card shadow-sm space-y-3 border border-outline-variant/15">
        <div className="flex items-center justify-between">
          <h3 className="text-[18px] font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[24px]">valve</span>
            Irrigation Layout Overview
          </h3>
          <span className="bg-secondary-container text-on-secondary-container text-[11px] px-2 py-0.5 rounded-full font-bold">
            Pressurized Drip
          </span>
        </div>

        <div className="divide-y divide-surface-container-high">
          <div className="py-2 flex items-center justify-between text-[13px]">
            <span className="text-on-surface-variant flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-primary">water</span>
              Water Source
            </span>
            <span className="font-bold text-on-surface">{parcel.waterSource}</span>
          </div>
          <div className="py-2 flex items-center justify-between text-[13px]">
            <span className="text-on-surface-variant flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-primary">bolt</span>
              Pumping Unit
            </span>
            <span className="font-bold text-on-surface">{parcel.pumpingUnit}</span>
          </div>
          <div className="py-2 flex items-center justify-between text-[13px]">
            <span className="text-on-surface-variant flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-primary">linear_scale</span>
              Lateral Specs
            </span>
            <span className="font-bold text-on-surface">{parcel.lateralSpecs}</span>
          </div>
          <div className="py-2 flex items-center justify-between text-[13px]">
            <span className="text-on-surface-variant flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-primary">filter_alt</span>
              Primary Filtration
            </span>
            <span className="font-bold text-on-surface">{parcel.primaryFiltration}</span>
          </div>
        </div>
      </div>

      {/* Field Action Tools Palette */}
      <div className="bg-surface-container-lowest rounded-xl p-pad-card shadow-sm space-y-3 border border-outline-variant/15">
        <span className="text-[12px] text-on-surface-variant font-bold block uppercase tracking-wider">
          Boundary & Survey Operations
        </span>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            className="h-20 bg-surface-container hover:bg-surface-container-high rounded-xl p-3 flex flex-col justify-center text-left active:scale-[0.98] transition-all cursor-pointer"
            onClick={() => onShowToast('Multi-point Walk Log initialized. GPS tracking active.')}
            type="button"
          >
            <span className="material-symbols-outlined text-[24px] text-primary">polyline</span>
            <span className="text-[13px] font-bold text-on-surface mt-1">Multi-Point Path</span>
            <span className="text-[11px] text-on-surface-variant">Walk boundary log</span>
          </button>

          <button
            className="h-20 bg-surface-container hover:bg-surface-container-high rounded-xl p-3 flex flex-col justify-center text-left active:scale-[0.98] transition-all cursor-pointer"
            onClick={() => onShowToast('Sub-field partition wizard opened')}
            type="button"
          >
            <span className="material-symbols-outlined text-[24px] text-primary">splitscreen</span>
            <span className="text-[13px] font-bold text-on-surface mt-1">Add Sub-Field</span>
            <span className="text-[11px] text-on-surface-variant">Zonal partition</span>
          </button>

          <button
            className="h-20 bg-surface-container hover:bg-surface-container-high rounded-xl p-3 flex flex-col justify-center text-left active:scale-[0.98] transition-all cursor-pointer"
            onClick={() => onShowToast('Field Camera ready: Geo-tagging photo with EXIF metadata')}
            type="button"
          >
            <span className="material-symbols-outlined text-[24px] text-primary">add_a_photo</span>
            <span className="text-[13px] font-bold text-on-surface mt-1">Geo-Tagged Photo</span>
            <span className="text-[11px] text-on-surface-variant">Attach EXIF metadata</span>
          </button>

          <button
            className="h-20 bg-surface-container hover:bg-surface-container-high rounded-xl p-3 flex flex-col justify-center text-left active:scale-[0.98] transition-all cursor-pointer"
            onClick={() => onShowToast('GPS base station sync calibrated (Accuracy: ±0.03m)')}
            type="button"
          >
            <span className="material-symbols-outlined text-[24px] text-primary">tune</span>
            <span className="text-[13px] font-bold text-on-surface mt-1">Recalibrate GPS</span>
            <span className="text-[11px] text-on-surface-variant">Base station sync</span>
          </button>
        </div>

        {/* Final Save Field to Database Primary Action */}
        <div className="pt-2">
          <button
            className="w-full h-14 bg-primary hover:bg-primary-container text-on-primary rounded-xl text-[15px] font-bold flex items-center justify-center gap-2 shadow-md active:scale-[0.99] transition-all cursor-pointer"
            onClick={handleSaveField}
            type="button"
          >
            <span className="material-symbols-outlined text-[24px]">save</span>
            <span>SAVE FIELD TO DATABASE</span>
          </button>
        </div>
      </div>
    </div>
  );
};
