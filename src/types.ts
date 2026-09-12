export type TabType = 'home' | 'farmers' | 'fields' | 'surveys' | 'reports';

// --- LOCATION HIERARCHY MODELS ---
export interface District {
  id: string;
  name: string;
  state: string;
}

export interface Taluk {
  id: string;
  name: string;
  districtId: string;
  isCustom?: boolean;
  createdAt?: string;
}

export interface Village {
  id: string;
  name: string;
  talukId: string;
  districtId: string;
  isCustom?: boolean;
  createdAt?: string;
}

export interface LocationHierarchySelection {
  districtId: string;
  districtName: string;
  talukId: string;
  talukName: string;
  villageId: string;
  villageName: string;
}

// --- GEOTAGGED PHOTO MODEL ---
export interface GeotaggedPhoto {
  id: string;
  uri: string;
  base64?: string;
  timestamp: string;
  latitude: number | null;
  longitude: number | null;
  altitude?: number | null;
  accuracy?: number | null;
  caption?: string;
  category?: 'field_boundary' | 'soil_core' | 'crop_canopy' | 'pest_disease' | 'water_source' | 'general';
}

// --- CORE ENTITIES ---
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
  districtId?: string;
  talukId?: string;
  villageId?: string;
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
  districtId?: string;
  talukId?: string;
  villageId?: string;
}

export interface SurveyModuleItem {
  id: number;
  title: string;
  status: 'Completed' | 'Active' | 'Draft (70%)' | 'Not Started';
  icon: string;
  subtext?: string;
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

// ==========================================
// FORM 01 — FARMER / STAKEHOLDER SURVEY
// ==========================================
export interface FarmingPracticeRow {
  practice: string;
  method: string;
  frequency: string;
  quantity: string;
  remarks: string;
}

export interface ProblemConstraintRow {
  problem: string;
  severity: number; // 1-5
  frequency: string;
  solution: string;
}

export interface FarmerSurveyData {
  // A. Identification
  surveyId: string;
  date: string;
  farmerName: string;
  village: string;
  taluk: string;
  district: string;
  districtId?: string;
  talukId?: string;
  villageId?: string;
  contact: string;
  farmId: string;
  totalLandArea: string;
  surveyor: string;

  // B. Farmer & Farm Profile
  farmingExperienceYears: string;
  mainOccupation: string;
  farmOwnership: 'Owned' | 'Leased' | 'Both' | '';
  irrigatedAreaHa: string;
  rainfedAreaHa: string;
  numFields: string;
  mainCrops: string;
  croppingSystem: string;
  previousCrop: string;
  cropRotation: string;
  avgAnnualProduction: string;
  mainIrrigationSource: string;
  waterAvailability: 'Low' | 'Medium' | 'High' | '';
  majorMachinery: string;
  majorTechUsed: string;

  // C. Current Farming Practices (9 standard practices)
  practices: FarmingPracticeRow[];

  // D. Problems & Constraints (10 standard problems)
  problems: ProblemConstraintRow[];
  farmerPriorityProblem: string;
  expectedSupport: string;
}

// ==========================================
// FORM 02 — FIELD SURVEY & GEOMETRY
// ==========================================
export interface IrrigationComponentRow {
  component: string;
  type: string;
  quantity: string;
  sizeCapacity: string;
  condition: string;
}

export interface FieldGeometrySurveyData {
  // A. Field Identification & Geometry
  surveyId: string;
  fieldId: string;
  gpsLat: string;
  gpsLng: string;
  altitude: string;
  fieldAreaHa: string;
  fieldLengthM: string;
  fieldWidthM: string;
  perimeterM: string;
  boundaryType: string;
  fieldShape: string;
  slopePercent: string;
  slopeDirection: string;
  highestElevM: string;
  lowestElevM: string;

  // B. Soil Surface & Drainage
  surfaceCondition: string;
  soilErosion: 'None' | 'Low' | 'Medium' | 'High' | '';
  waterlogging: 'None' | 'Low' | 'Medium' | 'High' | '';
  naturalDrainage: 'Poor' | 'Moderate' | 'Good' | '';
  drainType: string;
  drainSpacingM: string;
  drainDepthM: string;
  runoffObserved: string;
  pondingLocations: string;
  cracksCompaction: string;

  // C. Irrigation Layout (8 components)
  irrigationComponents: IrrigationComponentRow[];

  // D. Field Mapping
  gpsBoundaryRecorded: boolean;
  fieldMapAvailable: boolean;
  irrigationZones: string;
  problemZones: string;
  samplingPoints: string;
  photographsTaken: string;
  droneSurveyRequired: boolean;
  remarks: string;
  photos?: GeotaggedPhoto[];
}

// ==========================================
// FORM 03 — SOIL SURVEY (PHYSICAL & CHEMICAL)
// ==========================================
export interface PhysicalPropertySampleRow {
  parameter: string;
  sample1: string;
  sample2: string;
  sample3: string;
  unit: string;
}

export interface ChemicalPropertyRow {
  parameter: string;
  value: string;
  unit: string;
  status: string;
}

export interface SoilSurveyData {
  // A. Soil Sampling Information
  surveyId: string;
  fieldId: string;
  sampleId: string;
  samplingDate: string;
  gpsLat: string;
  gpsLng: string;
  samplingDepthCm: string;
  numSubsamples: string;
  samplingZone: string;
  previousCrop: string;

  // B. Physical Properties (10 standard parameters across 3 samples)
  physicalProperties: PhysicalPropertySampleRow[];

  // C. Chemical Properties (14 standard parameters)
  chemicalProperties: ChemicalPropertyRow[];

  // D. Soil Condition
  salinity: string;
  sodicity: string;
  compaction: string;
  rootZoneCondition: string;
  nutrientDeficiencySymptoms: string;
  soilColour: string;
  organicResidue: string;
  recommendedAction: string;
  photos?: GeotaggedPhoto[];
  photoUrl?: string;
}

// Legacy alias for compatibility
export type SoilSampleData = SoilSurveyData;

// ==========================================
// FORM 04 — WATER & HYDRAULIC SURVEY
// ==========================================
export interface HydraulicPointRow {
  parameter: string;
  point1: string;
  point2: string;
  point3: string;
  unit: string;
}

export interface WaterQualityRow {
  parameter: string;
  value: string;
  unit: string;
  status: 'Acceptable' | 'Concern' | '';
}

export interface WaterSurveyData {
  // A. Water Source
  surveyId: string;
  fieldId: string;
  waterSource: 'Borewell' | 'Open well' | 'Canal' | 'Pond' | 'Other' | '';
  sourceDepthM: string;
  waterLevelM: string;
  pumpCapacityKwHp: string;
  pumpDischargeLmin: string;
  dailyAvailabilityH: string;
  seasonalAvailability: string;
  storageCapacityL: string;

  // B. Hydraulic Measurements (7 parameters across 3 points)
  hydraulicMeasurements: HydraulicPointRow[];

  // C. Water Quality (14 parameters)
  waterQuality: WaterQualityRow[];

  // D. Irrigation Assessment
  irrigationMethod: string;
  irrigationFrequency: string;
  irrigationUniformity: string;
  waterShortagePeriod: string;
  waterlogging: string;
  filtrationRequired: string;
  treatmentRequired: string;
  majorWaterProblem: string;
}

// ==========================================
// FORM 05 — CROP SURVEY
// ==========================================
export interface CropHealthObservationRow {
  parameter: string;
  observation: string;
  severityPercent: string;
}

export interface CropSurveyData {
  // A. Crop Identification
  surveyId: string;
  fieldId: string;
  crop: string;
  variety: string;
  seedSource: string;
  sowingDate: string;
  transplantDate: string;
  expectedHarvestDate: string;
  cropAgeDays: string;
  growthStage: string;

  // B. Plant Population & Geometry
  rowSpacingCm: string;
  plantSpacingCm: string;
  plantPopulationPerHa: string;
  plantHeightCm: string;
  stemDiameterMm: string;
  numLeaves: string;
  leafAreaCm2: string;
  canopyWidthCm: string;
  canopyCoverPercent: string;
  rootDepthCm: string;

  // C. Crop Health (10 parameters)
  cropHealth: CropHealthObservationRow[];

  // D. Yield
  expectedYieldKgHa: string;
  previousYieldKgHa: string;
  currentYieldEstimateKgHa: string;
  fruitsGramsPerPlant: string;
  avgFruitWeightG: string;
  harvestQuantityKg: string;
  qualityGrade: string;
  yieldLimitingFactor: string;
}

// ==========================================
// FORM 06 — PEST / DISEASE SURVEY
// ==========================================
export interface SpatialDistributionZoneRow {
  zone: string; // Z1, Z2, Z3, Z4, Z5
  gps: string;
  pestDisease: string;
  incidencePercent: string;
  severityPercent: string;
  remarks: string;
}

export interface PestDiseaseSurveyData {
  // A. Observation Information
  surveyId: string;
  fieldId: string;
  observationDate: string;
  gpsLat: string;
  gpsLng: string;
  crop: string;
  variety: string;
  growthStage: string;
  samplingArea: string;
  observer: string;

  // B. Pest Identification
  pestName: string;
  scientificName: string;
  pestType: 'Insect' | 'Mite' | 'Nematode' | 'Other' | '';
  lifeStage: string;
  hostPlantPart: string;
  populationDensity: string;
  pestIncidencePercent: string;
  pestSeverityPercent: string;
  damageSymptom: string;
  economicThresholdStatus: string;

  // C. Disease Identification
  diseaseName: string;
  causalOrganism: string;
  diseaseType: 'Fungal' | 'Bacterial' | 'Viral' | 'Other' | '';
  affectedPlantPart: string;
  diseaseIncidencePercent: string;
  diseaseSeverityPercent: string;
  diseaseSymptomDesc: string;
  diseaseProgression: string;
  economicThreshold: string;
  diagnosticMethod: string;

  // D. Spatial Distribution (Z1 to Z5)
  spatialDistribution: SpatialDistributionZoneRow[];

  // E. Control
  controlMeasureApplied: string;
  recommendedIntervention: string;
  photos?: GeotaggedPhoto[];
}

// ==========================================
// FORM 07 — MICROCLIMATE SURVEY
// ==========================================
export interface AtmosphericReadingRow {
  parameter: string;
  reading1: string;
  reading2: string;
  reading3: string;
  unit: string;
}

export interface CropMicroclimateRow {
  parameter: string;
  reading: string;
  unit: string;
}

export interface WeatherStressObservationRow {
  parameter: string;
  observation: string;
}

export interface MicroclimateSurveyData {
  // A. Station Information
  surveyId: string;
  fieldId: string;
  stationId: string;
  date: string;
  time: string;
  latitude: string;
  longitude: string;
  elevationM: string;
  sensorHeightM: string;
  weatherStationType: string;

  // B. Atmospheric Parameters (10 parameters across 3 readings)
  atmosphericParameters: AtmosphericReadingRow[];

  // C. Crop Microclimate (8 parameters)
  cropMicroclimate: CropMicroclimateRow[];

  // D. Weather / Stress Observation (8 parameters)
  stressObservations: WeatherStressObservationRow[];
  microclimateRisk: 'Low' | 'Medium' | 'High' | '';
}

// ==========================================
// FORM 08 — EXISTING TECHNOLOGY SURVEY
// ==========================================
export interface TechEquipmentInventoryRow {
  equipment: string;
  makeModel: string;
  qty: string;
  condition: string;
}

export interface TechSensorInventoryRow {
  sensor: string;
  paramMeasured: string;
  range: string;
  accuracy: string;
  communication: string;
}

export interface FarmSystemRow {
  system: string;
  present: boolean;
  specification: string;
  usageFreq: string;
  problems: string;
}

export interface TechGapRow {
  requirement: string;
  presentStatus: string;
  priority: number; // 1-5
}

export interface TechInventorySurveyData {
  // A. Technology Inventory (10 items)
  techInventory: TechEquipmentInventoryRow[];
  // B. Sensor Inventory (10 sensors)
  sensorInventory: TechSensorInventoryRow[];
  // C. Farm Systems (9 systems)
  farmSystems: FarmSystemRow[];
  // D. Technology Gaps (10 gaps)
  techGaps: TechGapRow[];
}

// ==========================================
// FORM 09 — ECONOMIC SURVEY
// ==========================================
export interface LabourActivityRow {
  activity: string;
  days: string;
  male: string;
  female: string;
  costInr: string;
}

export interface LossAssessmentRow {
  source: string;
  qtyLost: string;
  percentLoss: string;
  financialLossInr: string;
}

export interface ProposedTechEconomics {
  investmentInr: string;
  operatingCostInrYr: string;
  inputSavingInr: string;
  labourSavingInr: string;
  yieldIncreasePercent: string;
  revenueIncreaseInr: string;
  netBenefitInr: string;
  roiPercent: string;
  paybackPeriodYears: string;
}

export interface EconomicSurveyData {
  // A. Farm Economics (15 parameters)
  farmAreaHa: string;
  cropAreaHa: string;
  totalProductionKg: string;
  yieldKgHa: string;
  marketPriceInrKg: string;
  grossRevenueInr: string;
  totalInputCostInr: string;
  labourCostInr: string;
  machineryCostInr: string;
  irrigationCostInr: string;
  fertilizerCostInr: string;
  pesticideCostInr: string;
  seedCostInr: string;
  otherCostInr: string;
  netIncomeInr: string;

  // B. Labour (8 activities)
  labourBreakdown: LabourActivityRow[];

  // C. Loss Assessment (7 sources)
  lossAssessment: LossAssessmentRow[];

  // D. Technology Economics (Existing vs Proposed)
  techEconomics: ProposedTechEconomics;
}

// ==========================================
// FORM 10 — TEMPORAL / CROP-CYCLE SURVEY
// ==========================================
export interface RepeatedCropObservationRow {
  id: string;
  date: string;
  stage: string;
  tempC: string;
  rhPercent: string;
  soilMoisturePercent: string;
  ph: string;
  ec: string;
  pestPercent: string;
  diseasePercent: string;
  health: string;
}

export interface TemporalManagementEventRow {
  id: string;
  date: string;
  event: string; // Irrigation, Fertilizer, Pesticide, Disease control, Weed control, Other
  action: string;
  quantity: string;
  reason: string;
  result: string;
}

export interface CropCycleSummaryRow {
  parameter: string;
  beginning: string;
  middle: string;
  end: string;
  maxMin: string;
}

export interface CropCycleSurveyData {
  // A. Crop Cycle Information
  surveyId: string;
  fieldId: string;
  crop: string;
  variety: string;
  sowingDate: string;
  expectedHarvest: string;
  surveyFrequency: 'Daily' | 'Weekly' | 'Fortnightly' | '';
  numObservations: string;
  monitoringSystem: 'Manual' | 'Sensor' | 'Drone' | 'Hybrid' | '';
  observer: string;

  // B. Repeated Crop Observations (Dynamic rows with Add/Edit/Delete)
  repeatedObservations: RepeatedCropObservationRow[];

  // C. Temporal Management Events (6 standard events)
  managementEvents: TemporalManagementEventRow[];

  // D. Crop Cycle Summary (9 parameters)
  temporalSummary: CropCycleSummaryRow[];

  majorTrendObserved: string;
  criticalInterventionStage: string;
  finalConclusion: string;
}

// ==========================================
// COMPREHENSIVE SURVEY RECORD
// ==========================================
export interface SurveyRecord {
  id: string;
  timeOrDate: string;
  farmerName: string;
  crop: string;
  fieldId: string;
  village: string;
  taluk?: string;
  district?: string;
  auditedDate: string;
  status: 'Completed' | 'Draft' | 'Flagged';
  statusDetail?: string;
  moduleName?: string;
  completedModules?: number;
  totalModules?: number;
  stepProgress?: string;
  hasPdfReady?: boolean;

  // Relational location linkage
  locationHierarchy?: LocationHierarchySelection;

  // Complete data for all 10 forms
  form01?: FarmerSurveyData;
  form02?: FieldGeometrySurveyData;
  form03?: SoilSurveyData;
  form04?: WaterSurveyData;
  form05?: CropSurveyData;
  form06?: PestDiseaseSurveyData;
  form07?: MicroclimateSurveyData;
  form08?: TechInventorySurveyData;
  form09?: EconomicSurveyData;
  form10?: CropCycleSurveyData;
  photos?: GeotaggedPhoto[];

  // Legacy fields for backward compatibility
  date?: string;
  hectares?: number;
  ph?: number;
  moisturePercent?: number;
  passedCertification?: string;
}
