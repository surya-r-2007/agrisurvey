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

// Form 01 - Farmer / Stakeholder Survey Data Schema
export interface FarmerSurveyData {
  surveyId: string;
  date: string;
  farmerName: string;
  village: string;
  taluk: string;
  district: string;
  contact: string;
  farmId: string;
  totalLandArea: string;
  surveyor: string;
  farmingExperienceYears: string;
  mainOccupation: string;
  farmOwnership: 'Owned' | 'Leased' | 'Both';
  irrigatedAreaHa: string;
  rainfedAreaHa: string;
  numFields: string;
  mainCrops: string;
  croppingSystem: string;
  previousCrop: string;
  cropRotation: string;
  avgAnnualProduction: string;
  mainIrrigationSource: string;
  waterAvailability: 'Low' | 'Medium' | 'High';
  majorMachinery: string;
  majorTechUsed: string;
  practices: {
    practice: string;
    method: string;
    frequency: string;
    quantity: string;
    remarks: string;
  }[];
  problems: {
    problem: string;
    severity: number;
    frequency: string;
    solution: string;
  }[];
  farmerPriorityProblem: string;
  expectedSupport: string;
}

// Form 02 - Field Survey & Geometry Schema
export interface FieldGeometrySurveyData {
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
  surfaceCondition: string;
  soilErosion: 'None' | 'Low' | 'Medium' | 'High';
  waterlogging: 'None' | 'Low' | 'Medium' | 'High';
  naturalDrainage: 'Poor' | 'Moderate' | 'Good';
  drainType: string;
  drainSpacingM: string;
  drainDepthM: string;
  runoffObserved: string;
  pondingLocations: string;
  cracksCompaction: string;
  irrigationComponents: {
    component: string;
    type: string;
    quantity: string;
    sizeCapacity: string;
    condition: string;
  }[];
  gpsBoundaryRecorded: boolean;
  fieldMapAvailable: boolean;
  irrigationZones: string;
  problemZones: string;
  samplingPoints: string;
  photographsTaken: string;
  droneSurveyRequired: boolean;
  remarks: string;
}

// Form 04 - Water & Hydraulic Survey Schema
export interface WaterSurveyData {
  surveyId: string;
  fieldId: string;
  waterSource: 'Borewell' | 'Open well' | 'Canal' | 'Pond' | 'Other';
  sourceDepthM: string;
  waterLevelM: string;
  pumpCapacityKwHp: string;
  pumpDischargeLmin: string;
  dailyAvailabilityH: string;
  seasonalAvailability: string;
  storageCapacityL: string;
  flowRateLmin: string;
  pressureKpa: string;
  waterTempC: string;
  pipeDiameterMm: string;
  irrigationDurationMin: string;
  emitterDischargeLh: string;
  distributionUniformityPercent: string;
  waterQuality: {
    parameter: string;
    value: string;
    unit: string;
    status: string;
  }[];
  irrigationMethod: string;
  irrigationFrequency: string;
  waterShortagePeriod: string;
  filtrationRequired: string;
  treatmentRequired: string;
  majorWaterProblem: string;
}

// Form 05 - Crop Survey Schema
export interface CropSurveyData {
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
  healthObservations: {
    parameter: string;
    observation: string;
    severityPercent: string;
  }[];
  expectedYieldKgHa: string;
  previousYieldKgHa: string;
  currentYieldEstimateKgHa: string;
  fruitsGramsPerPlant: string;
  avgFruitWeightG: string;
  harvestQuantityKg: string;
  qualityGrade: string;
  yieldLimitingFactor: string;
}

// Form 06 - Pest / Disease Survey Schema
export interface PestDiseaseSurveyData {
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
  pestName: string;
  scientificName: string;
  pestType: 'Insect' | 'Mite' | 'Nematode' | 'Other';
  lifeStage: string;
  hostPlantPart: string;
  populationDensity: string;
  pestIncidencePercent: string;
  pestSeverityPercent: string;
  damageSymptom: string;
  economicThresholdStatus: string;
  diseaseName: string;
  causalOrganism: string;
  diseaseType: 'Fungal' | 'Bacterial' | 'Viral' | 'Other';
  affectedPlantPart: string;
  diseaseIncidencePercent: string;
  diseaseSeverityPercent: string;
  diseaseSymptomDesc: string;
  diseaseProgression: string;
  diagnosticMethod: string;
  spatialDistribution: {
    zone: string;
    gps: string;
    pestDisease: string;
    incidence: string;
    severity: string;
    remarks: string;
  }[];
  controlMeasureApplied: string;
  recommendedIntervention: string;
}

// Form 07 - Microclimate Survey Schema
export interface MicroclimateSurveyData {
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
  airTemperatureC: string;
  relativeHumidityPercent: string;
  atmosphericPressureKpa: string;
  rainfallMm: string;
  solarRadiationWm2: string;
  windSpeedMs: string;
  windDirectionDeg: string;
  vapourPressureKpa: string;
  vpdKpa: string;
  dewPointC: string;
  canopyTempC: string;
  soilTempC: string;
  soilMoisturePercent: string;
  leafWetnessIndex: string;
  canopyHumidityPercent: string;
  parUmol: string;
  groundTempC: string;
  evapotranspirationMmDay: string;
  stressObservations: {
    stress: string;
    observation: string;
  }[];
  microclimateRisk: 'Low' | 'Medium' | 'High';
}

// Form 08 - Existing Technology Survey Schema
export interface TechInventorySurveyData {
  techInventory: {
    equipment: string;
    makeModel: string;
    qty: string;
    condition: string;
  }[];
  sensorInventory: {
    sensor: string;
    paramMeasured: string;
    range: string;
    accuracy: string;
    communication: string;
  }[];
  farmSystems: {
    system: string;
    present: boolean;
    specification: string;
    usageFreq: string;
    problems: string;
  }[];
  techGaps: {
    requirement: string;
    presentStatus: string;
    priority: number;
  }[];
}

// Form 09 - Economic Survey Schema
export interface EconomicSurveyData {
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
  labourBreakdown: {
    activity: string;
    days: string;
    male: string;
    female: string;
    costInr: string;
  }[];
  lossAssessment: {
    source: string;
    qtyLost: string;
    percentLoss: string;
    financialLossInr: string;
  }[];
  techEconomics: {
    investmentInr: string;
    operatingCostInrYr: string;
    inputSavingPercent: string;
    labourSavingPercent: string;
    yieldIncreasePercent: string;
    revenueIncreaseInr: string;
    netBenefitInr: string;
    roiPercent: string;
    paybackPeriodYears: string;
  };
}

// Form 10 - Temporal / Crop-Cycle Survey Schema
export interface CropCycleSurveyData {
  surveyId: string;
  fieldId: string;
  crop: string;
  variety: string;
  sowingDate: string;
  expectedHarvest: string;
  surveyFrequency: 'Daily' | 'Weekly' | 'Fortnightly';
  numObservations: string;
  monitoringSystem: 'Manual' | 'Sensor' | 'Drone' | 'Hybrid';
  observer: string;
  repeatedObservations: {
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
  }[];
  managementEvents: {
    date: string;
    event: string;
    action: string;
    quantity: string;
    reason: string;
    result: string;
  }[];
  temporalSummary: {
    parameter: string;
    beginning: string;
    middle: string;
    end: string;
    maxMin: string;
  }[];
  majorTrendObserved: string;
  criticalInterventionStage: string;
  finalConclusion: string;
}
