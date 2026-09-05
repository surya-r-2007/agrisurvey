export type TabType = 'home' | 'farmers' | 'fields' | 'surveys' | 'reports';

export interface Farmer {
  id: string;
  code: string;
  name: string;
  initials: string;
  phone: string;
  location: string;
  village: string;
  taluk: string;
  district: string;
  totalAcres: number;
  irrigatedAcres: number;
  rainfedAcres: number;
  numFarms: number;
  numFields: number;
  numSurveys: number;
  date: string;
  surveyRef: string;
  kycVerified: boolean;
  cropsRotation: string;
  rotationScheme: string;
  irrigationMode: string;
  machinery: string[];
  farmId: string;
}

export interface Farm {
  id: string;
  ownerName: string;
  ownerCode: string;
  totalArea: string;
  fieldsCount: number;
  mainCrop: string;
  location: string;
  activeCycle: boolean;
}

export interface FieldParcel {
  id: string;
  name: string;
  crop: string;
  hectares: number;
  vigourPercent?: number;
  vigourStatus?: string;
  status: 'Optimal' | 'Alert' | 'Normal';
  owner: string;
  ownerCode: string;
  farmId: string;
  imageUrl: string;
  perimeterMeters: number;
  gpsAccuracy: string;
  shape: string;
  boundaryStructure: string;
  highestElev: string;
  lowestElev: string;
  slope: string;
  slopeFlow: string;
  surfaceTilth: string;
  tilthNote: string;
  erosionRisk: string;
  erosionNote: string;
  waterlogging: string;
  waterloggingNote: string;
  drainage: string;
  drainageNote: string;
  waterSource: string;
  pumpingUnit: string;
  lateralSpecs: string;
  primaryFiltration: string;
}

export interface SurveyRecord {
  id: string;
  timeOrDate: string;
  farmerName: string;
  crop: string;
  fieldId: string;
  village: string;
  auditedDate: string;
  date?: string;
  hectares?: number;
  completedModules?: number;
  totalModules?: number;
  status: 'Completed' | 'Draft' | 'Flagged';
  statusDetail?: string;
  moduleName?: string;
  ph?: number;
  moisturePercent?: number;
  passedCertification?: string;
  stepProgress?: string;
  hasPdfReady?: boolean;
}

export interface SurveyModuleItem {
  id: number;
  title: string;
  status: 'Completed' | 'Active' | 'Draft (70%)' | 'Not Started';
  icon: string;
  subtext?: string;
}

export interface SoilSampleData {
  coreId: string;
  horizonDepth: string;
  subsamples: string;
  usdaClassification: string;
  sandPercent: number;
  siltPercent: number;
  clayPercent: number;
  bulkDensity: number;
  porosity: number;
  soilMoistureVwc: number;
  fieldCapacity: number;
  infiltrationRate: number;
  ph: number;
  ec: number;
  orgCarbon: number;
  nitrogenKgHa: number;
  nitrogenStatus: string;
  phosphorusKgHa: number;
  phosphorusStatus: string;
  potassiumKgHa: number;
  potassiumStatus: string;
  micronutrients: {
    zn: { val: number; status: string };
    fe: { val: number; status: string };
    mn: { val: number; status: string };
    cu: { val: number; status: string };
    b: { val: number; status: string };
  };
  compaction: string;
  salinity: string;
  rootZone: string;
  photoUrl: string;
  gpsCoords: string;
  gpsAccuracy: string;
}

export interface ArchivedReport {
  id: string;
  docId: string;
  farmerName: string;
  farmerCode: string;
  plotRef: string;
  crop: string;
  hectares: number;
  date: string;
  fileSize: string;
  status: string;
}
