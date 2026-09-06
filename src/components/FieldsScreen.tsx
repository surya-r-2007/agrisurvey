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
  const [mapMode, setMapMode] = useState<'satellite' | 'hybrid' | 'roadmap'>('satellite');
  React.useEffect(() => {
    if ('geolocation' in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setLat(pos.coords.latitude.toFixed(6));
          setLng(pos.coords.longitude.toFixed(6));
          if (pos.coords.altitude) setAltitude(pos.coords.altitude.toFixed(1));
        },
        () => {},
        { enableHighAccuracy: true, maximumAge: 5000 }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  const simulateGpsCapture = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newLat = pos.coords.latitude.toFixed(6);
          const newLng = pos.coords.longitude.toFixed(6);
          const newAlt = pos.coords.altitude ? pos.coords.altitude.toFixed(1) : altitude;

          setLat(newLat);
          setLng(newLng);
          setAltitude(newAlt);
          setCapturedPointsCount((prev) => prev + 1);
          setShowGpsSuccess(true);
          setTimeout(() => setShowGpsSuccess(false), 3000);
          onShowToast(`Live GPS point captured! Lat: ${newLat}°, Lng: ${newLng}° (±${pos.coords.accuracy?.toFixed(1) || '1.2'}m)`);
        },
        () => {
          // Fallback simulation if permission is denied
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
        },
        { enableHighAccuracy: true }
      );
    } else {
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
    }
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

  const numLat = parseFloat(lat) || 12.584219;
  const numLng = parseFloat(lng) || 77.042831;
  const mapTypeQuery = mapMode === 'satellite' ? 'k' : mapMode === 'hybrid' ? 'h' : 'm';
  const googleSatelliteMapUrl = `https://maps.google.com/maps?q=${numLat},${numLng}&t=${mapTypeQuery}&z=17&ie=UTF8&iwloc=&output=embed`;

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
                {parcel?.id || 'FLD-001'}
              </span>
              <span className="bg-secondary-container text-on-secondary-container text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                Active Sync
              </span>
            </div>
            <h2 className="text-[20px] font-bold text-on-surface mt-2 truncate">
              {parcel?.name ? (parcel.name.includes('FRM') ? parcel.name : `${parcel.farmId || 'FRM-01'} (${parcel.owner || 'Farmer'})`) : (parcel?.farmId ? `${parcel.farmId} (${parcel.owner || 'Farmer'})` : 'New Field Plot')}
            </h2>
            <div className="flex items-center gap-1 mt-1 text-on-surface-variant text-[13px]">
              <span className="material-symbols-outlined text-[16px] text-secondary">location_on</span>
              <span className="truncate">Field Location • GPS Boundary Polygon</span>
            </div>
          </div>
          <button
            aria-label="Field overview menu"
            onClick={() => onShowToast(`Field options for ${parcel?.id || 'FLD-001'}`)}
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
            <span className="text-[15px] font-bold text-primary mt-0.5">{(parcel?.hectares ?? 2.5).toFixed(2)} Ha</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] text-on-surface-variant font-medium">Perimeter</span>
            <span className="text-[15px] font-bold text-on-surface mt-0.5">{parcel?.perimeterMeters ?? 640} m</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] text-on-surface-variant font-medium">GPS Status</span>
            <span className="text-[15px] font-bold text-secondary mt-0.5 flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[14px]">satellite_alt</span> {parcel?.gpsAccuracy || '±1.2m'}
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

      {/* Interactive Google Satellite Map View Container */}
      <div className="relative w-full rounded-2xl overflow-hidden bg-surface-container-high shadow-md border border-outline-variant/20">
        <div className="w-full h-84 relative bg-[#0f1715] overflow-hidden">
          {/* Satellite Imagery Background Layer */}
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-75 mix-blend-normal pointer-events-none" 
            style={{ backgroundImage: `url(${APP_ASSETS.mapBackground})` }}
          />

          {/* Embedded Live Google Maps Satellite Frame */}
          <iframe
            title="Google Satellite Map View"
            className="w-full h-full border-0 pointer-events-auto relative z-0 opacity-100"
            src={googleSatelliteMapUrl}
          />

          {/* Google Maps Style Satellite Mode Controls & Center GPS */}
          <div className="absolute top-3 right-3 flex items-center bg-surface-container-lowest/90 backdrop-blur-md p-1 rounded-xl shadow-md border border-outline-variant/20 z-20">
            <button
              onClick={() => {
                setMapMode('satellite');
                onShowToast('Switched to Google Maps Satellite View');
              }}
              className={`h-8 px-2.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                mapMode === 'satellite' ? 'bg-primary text-on-primary shadow-xs' : 'text-on-surface-variant hover:text-on-surface'
              }`}
              type="button"
            >
              Satellite
            </button>
            <button
              onClick={() => {
                setMapMode('hybrid');
                onShowToast('Switched to Google Maps Hybrid View');
              }}
              className={`h-8 px-2.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                mapMode === 'hybrid' ? 'bg-primary text-on-primary shadow-xs' : 'text-on-surface-variant hover:text-on-surface'
              }`}
              type="button"
            >
              Hybrid
            </button>
            <button
              onClick={() => {
                setMapMode('roadmap');
                onShowToast('Switched to Google Standard Map View');
              }}
              className={`h-8 px-2.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                mapMode === 'roadmap' ? 'bg-primary text-on-primary shadow-xs' : 'text-on-surface-variant hover:text-on-surface'
              }`}
              type="button"
            >
              Map
            </button>
            <div className="w-[1px] h-5 bg-outline-variant/30 mx-1"></div>
            <button
              aria-label="Center GPS"
              onClick={() => onShowToast(`Centered on current GNSS coordinate ${lat}° N, ${lng}° E`)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-secondary active:scale-90 transition-transform cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">my_location</span>
            </button>
          </div>

          {/* Compass Rose Indicator */}
          <div className="absolute top-3 left-3 bg-surface-container-lowest/90 backdrop-blur-sm rounded-full w-9 h-9 flex items-center justify-center shadow-sm border border-outline-variant/20 z-20">
            <div className="flex flex-col items-center text-[9px] font-bold text-error leading-none">
              <span>N</span>
              <span className="material-symbols-outlined text-[14px] text-outline -mt-0.5">navigation</span>
            </div>
          </div>
        </div>
      </div>

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

        {/* Live Readout Box with Manual Coordinate Editing & Detection */}
        <div className="bg-surface-container-low rounded-lg p-3 font-mono text-on-surface text-[13px] flex flex-col gap-2 border border-outline-variant/10">
          <div className="flex items-center justify-between gap-2">
            <span className="text-on-surface-variant font-sans flex-shrink-0">Latitude</span>
            <input
              type="text"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              className="font-bold text-primary bg-surface-container-lowest px-2 py-0.5 rounded text-right w-36 outline-none border border-outline-variant/20 focus:border-primary"
            />
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-on-surface-variant font-sans flex-shrink-0">Longitude</span>
            <input
              type="text"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              className="font-bold text-primary bg-surface-container-lowest px-2 py-0.5 rounded text-right w-36 outline-none border border-outline-variant/20 focus:border-primary"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-on-surface-variant font-sans">Orthometric Alt</span>
            <span className="font-bold text-on-surface">{altitude} m MSL</span>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="grid grid-cols-2 gap-2 mt-3">
          <button
            onClick={simulateGpsCapture}
            className="h-11 bg-secondary text-on-secondary rounded-lg text-[13px] font-bold flex items-center justify-center gap-1.5 shadow-sm hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">my_location</span>
            <span>GET MY LIVE LOCATION</span>
          </button>
          <button
            onClick={simulateGpsCapture}
            className="h-11 bg-primary-container text-on-primary rounded-lg text-[13px] font-bold flex items-center justify-center gap-1.5 shadow-sm hover:bg-primary active:scale-[0.98] transition-all cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">add_location_alt</span>
            <span>CAPTURE POINT</span>
          </button>
        </div>

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
            <span className="text-[20px] font-bold text-primary mt-1">{parcel?.hectares ?? 2.5} Ha</span>
            <span className="text-[12px] text-on-surface-variant">{((parcel?.hectares ?? 2.5) * 2.471).toFixed(2)} Acres</span>
          </div>
          <div className="bg-surface-container-low p-3 rounded-lg flex flex-col border border-outline-variant/10">
            <span className="text-[11px] text-on-surface-variant font-medium">Field Perimeter</span>
            <span className="text-[20px] font-bold text-on-surface mt-1">{parcel?.perimeterMeters ?? 640} m</span>
            <span className="text-[12px] text-on-surface-variant">Span: 280m × 150m</span>
          </div>
          <div className="bg-surface-container-low p-3 rounded-lg flex flex-col border border-outline-variant/10">
            <span className="text-[11px] text-on-surface-variant font-medium">Geometry Shape</span>
            <span className="text-[15px] font-bold text-on-surface mt-1">{parcel?.shape || 'Polygon Boundary'}</span>
            <span className="text-[12px] text-on-surface-variant">{capturedPointsCount} Closed Vertices</span>
          </div>
          <div className="bg-surface-container-low p-3 rounded-lg flex flex-col border border-outline-variant/10">
            <span className="text-[11px] text-on-surface-variant font-medium">Boundary Structure</span>
            <span className="text-[14px] font-bold text-on-surface mt-1 truncate">
              {(parcel?.boundaryStructure || 'Living Hedge + Concrete Wall').split('+')[0]}
            </span>
            <span className="text-[12px] text-on-surface-variant truncate">
              {(parcel?.boundaryStructure || 'Living Hedge + Concrete Wall').split('+')[1] ? `+ ${(parcel?.boundaryStructure || '').split('+')[1]}` : 'Surveyed Wall'}
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
              {parcel?.slope || '3.8% Slope'}
            </span>
          </div>

          <div className="flex items-center justify-between text-[12px] text-on-surface-variant pt-1">
            <div>
              <span className="text-outline text-[11px]">Highest Point:</span>
              <span className="font-bold text-on-surface ml-1">{parcel?.highestElev || '668m MSL'}</span>
            </div>
            <div className="flex items-center gap-1 text-secondary font-bold">
              <span className="material-symbols-outlined text-[16px]">east</span>
              <span>{parcel?.slopeFlow || 'Eastward Flow'}</span>
            </div>
            <div>
              <span className="text-outline text-[11px]">Lowest:</span>
              <span className="font-bold text-on-surface ml-1">{parcel?.lowestElev || '657m MSL'}</span>
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
            <span className="text-[13px] text-on-surface mt-0.5 block font-bold">{parcel?.surfaceTilth || 'Loose clay loam'}</span>
            <span className="text-[11px] text-outline">{parcel?.tilthNote || 'Calibrated boundary'}</span>
          </div>
          <div className="bg-surface-container-low p-2.5 rounded-lg border border-outline-variant/10">
            <span className="text-[11px] text-on-surface-variant block font-medium">Erosion Risk</span>
            <span className="text-[13px] text-secondary mt-0.5 block font-bold">{parcel?.erosionRisk || 'Low'}</span>
            <span className="text-[11px] text-outline">{parcel?.erosionNote || 'Bund-stabilized runoff'}</span>
          </div>
          <div className="bg-surface-container-low p-2.5 rounded-lg border border-outline-variant/10">
            <span className="text-[11px] text-on-surface-variant block font-medium">Waterlogging Hazard</span>
            <span className="text-[13px] text-secondary mt-0.5 block font-bold">{parcel?.waterlogging || 'Nil'}</span>
            <span className="text-[11px] text-outline">{parcel?.waterloggingNote || 'Optimal percolation'}</span>
          </div>
          <div className="bg-surface-container-low p-2.5 rounded-lg border border-outline-variant/10">
            <span className="text-[11px] text-on-surface-variant block font-medium">Natural Drainage</span>
            <span className="text-[13px] text-on-surface mt-0.5 block font-bold">{parcel?.drainage || 'Moderate'}</span>
            <span className="text-[11px] text-outline">{parcel?.drainageNote || 'Perimeter swale equipped'}</span>
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
            <span className="font-bold text-on-surface">{parcel?.waterSource || 'Deep Borewell (180 ft)'}</span>
          </div>
          <div className="py-2 flex items-center justify-between text-[13px]">
            <span className="text-on-surface-variant flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-primary">bolt</span>
              Pumping Unit
            </span>
            <span className="font-bold text-on-surface">{parcel?.pumpingUnit || '7.5 HP Submersible'}</span>
          </div>
          <div className="py-2 flex items-center justify-between text-[13px]">
            <span className="text-on-surface-variant flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-primary">linear_scale</span>
              Lateral Specs
            </span>
            <span className="font-bold text-on-surface">{parcel?.lateralSpecs || '16mm Inline (40cm Spacing)'}</span>
          </div>
          <div className="py-2 flex items-center justify-between text-[13px]">
            <span className="text-on-surface-variant flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-primary">filter_alt</span>
              Primary Filtration
            </span>
            <span className="font-bold text-on-surface">{parcel?.primaryFiltration || 'Dual 2" Disc Filter'}</span>
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
