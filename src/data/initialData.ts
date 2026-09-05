import { Farmer, Farm, FieldParcel, SurveyRecord, SurveyModuleItem, SoilSampleData, ArchivedReport } from '../types';

export const APP_ASSETS = {
  logo: 'https://lh3.googleusercontent.com/aida/AEtjO1VMJQypEdYzrtwgC0R9wd8XLaqmlrMbh4gHU76mqqCQsyptaKKcgmlqeG2rjoiLmtmNt5HlEqLMf6L53ej4MxGT_SvwGBYzRhLUhSjPJTo1-IBqwLmuBcYz64S0ByQsNgxdbV3m7zO8-UZ872tPoDVXbT9NBk6hS03HRuMEWksO37-LpL7EYCpMClRo2kOZr9WdNxIb4zy4WrpO2CNsbg0j4AGjXl73u_vTId5zChaohFmfO8gDChyzgIU',
  inspector: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAGDHkfLoBA9VkwQn3oIi8QC-EO0VqrysxgmtaaobrUdUoq1Lt1J4YepO4TRSvlIH8ds4RL1_JX133bFt_cfnxWy7w9HNJc0zA8vqFAuBPiT_8AUleNaUI9gPeO_fTvo9c7wFqWUO384DRaJQGtvTQDBM53K1_gSkMaYgM6Njxdtd3TPEjM0yqgFWEbctLlecVUVGIoG06hlg1xrl3M0Zi5LAFCX6t4ml-4byyykRcZIzbCWMInsaOx',
  maizeField: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAGYkJZEFeg0bfjkIY059oPeRsd6vxkqlxzowk1PfQM6DLVqRPCE9R0dHhI7gLez7BdqXbHu6RjwNoD65pcRWVqWgM2LNkEV2Wsrn-Of2WMzg6yCWB1Fg8x78i9RSbauPLE9IOFLiRWWzDZ9dtLTL02BgRYuBjS1h9vOmIBzs7l1oowstfLd44Lktwt86FW22pOp0oCUNJlUWW02iH625rk90WS4kGI_MACQIkiPm3JIgoTuQxeKxVz',
  sugarcaneField: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAtifkS6dh3YRQ4xErgXOWt8z94WYbV8DoNi8mEH-lr-07qIB5r96Tw4Ok2z2OvgnjDeENhX_G_Ks7c3_uYcRaYQtJYIJbMIN5a-BfWVy2BRuzFD9nbDLVmoM9ltSm9KXGWS9KUwcEGJqlj2vWqzV6LdJdC8bmBDA-ZoX-G4EUaLxavt1L4WarSLmdsIuw9yNqjq7ApDhluauj7OzCDYpGapKFmsabu810481oX-k4guL-5IsYT73PK',
  paddyField: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBoyf0oEiSYde9pUHDb0j_375sTiRERVdut1GEzx9Dxyoqrrhvlo6JBcjUl2l5tx42Q3alc0tHGvlfIn1YGF9dC83Gz38ZksqcILZWUKwPkgPgQrw8ViD7-z7_vZi7OqDxR6Qu6nw839LH8Uop3bAJOZiuck5CtRnw1cYFL-H7NsiiB9yCfmHitQMmNUUwmyF09MTFy86yYrzU52qb5KTHlIN070SPMy1SdlaSwuPg5Q0tRfaQskwMn',
  mapBackground: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCyJop0NyR5tDQ-KbUdk3kMtl648q8eSst3uieFxGqlJJ95E1fIUapV2BbgvQq7lO8TF599FSFUSIhDjhh4btSE_iqFbsD0QVITNhrevd5C0TggN6cDwRWEqs6MByMZp-7XKPGuODD50jf3dKZ5jyix06EE9oyQ28kSTcvEyinFml2zLjJnCrnUCy7GB52O3_uyTOpUS10XVOO8q_jpv2fjOezNuFjkeUlY0TgO6BR9fK9tIjSMJ1sH',
  dossierMapBg: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC2tF8vBhD9KKrWXyCzJ-_Jev9U8_0Nvo8g-GLa7mZy351aQDdgKwxj4w-o2kphSWWMzGKlDE_OR_j4tNIpoMkURFKz6CTzIOW_vZArsYbDVQJpkT4LyBeMOVuIhhBnqwkFA2aj8grH1pdIApmRed1HaEx4UiVmLfAL6xsWa8m1nJaUpTUMYZKe4dNoTPhyFPdp--n7RYF3Kl08DgY7a_d_WFhFrOiTCtmL3SBJqVEtKqWZTL6K2q7I',
  leafInspection: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAku6izTQ7rHRSIUl43Uub_nqS-8cmqdgo7s-p3i-mUihB1j3cOsIRd_Fu_ecFdF-E2M-fAT0QldvP6xrQEb67ZgynTsp4Tx4UdjQNTrWCozIHBoShhYFIW62f-W9ep2ug6SMn2grMCzTrm94jltKabnSJAmk2DG9F0GlQbabBBXODe63IjwAwLWr-0jDpkcMDHywgkCG9-bfaHvg-CMzI7sjoN3gVg2Gr-FmZ-YpKUpQd8nbbmKv0k',
  soilInspection: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCEDcXHQ-d68PCt74CE8OriKdBsuMqImhYHDE_hP8VahE5DMC1RJ_pxldwHuP6PfoeEQ58-sFyA4AOHAYgarXGHF-DqtnPJEJzfo4NBEi-YWpNC9laig2U136a3c5FWRKTusAtEEWFL1nTnj3kLplTCTGnDVczg2YDvkSJqBYR2Izli0LTb1FNpAf9oOdBSBIdlzhyIfqez7OU67koeuQ71McLlC6HdBO5athS-kZL-9b4cdFZxTmsV',
  canalInspection: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA8gQH-52ijy5ZtV4_A9em5Ukcx02xnNGysaB68xi-Mfj0saM219sSVXaGSbYyF8qa6IidsPm948vFlTk-7L2LV0aY9AzgOmVsHvW6GwZT4QPue_rcMtuuklNq3msfGc6aymG3x6eZpBxdO5VdtDH-9r0Rq-kNfYWf7nCmgnADljp2Sbr2-SSWE9omtocqdtwJ7sxkeDdKNTIUtXbEIGpnpYhdYtaJHsvCCS1IxiiV82EtnMyppYS8B',
  soilCoreSample: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBY3MTKqrYcxANMjOd6WsPd3U9b_0jtBrUbW5GzupbRf_zmOvKkMQSEdhM3ZpxqJJD_4dUjmVCjGPESiJp0UnLIavpXRM4pXjykyF5rAS2aTUYbZ9DO8RUZ-0C8phk0Qt5GZ3BsnWX9MveCi6NLfbzC5fS_M9a-9wZEriOd4OZ7zJw_WgnLtTr2NHdq2GGw12jwL3Hsfp0xl1fB78JXMapWwgqZUL0B9s3skMKd4o2c3nYPAN3pzd7P'
};

export const INITIAL_FARMERS: Farmer[] = [];

export const INITIAL_FARMS: Farm[] = [];

export const INITIAL_FIELDS: FieldParcel[] = [];

export const INITIAL_SURVEYS: SurveyRecord[] = [];

export const INITIAL_MODULES: SurveyModuleItem[] = [
  { id: 1, title: '1. Farmer / Stakeholder Survey', status: 'Completed', icon: 'check_circle' },
  { id: 2, title: '2. Field Survey & Geometry', status: 'Completed', icon: 'check_circle' },
  { id: 3, title: '3. Soil Survey (Physical & Chemical)', status: 'Active', icon: 'play_circle' },
  { id: 4, title: '4. Water & Hydraulic Survey', status: 'Draft (70%)', icon: 'pending' },
  { id: 5, title: '5. Crop & Plant Population', status: 'Not Started', icon: 'radio_button_unchecked' },
  { id: 6, title: '6. Pest / Disease & Spatial Zones', status: 'Not Started', icon: 'radio_button_unchecked' },
  { id: 7, title: '7. Microclimate & Atmospheric', status: 'Not Started', icon: 'radio_button_unchecked' },
  { id: 8, title: '8. Existing Technology & Sensors', status: 'Not Started', icon: 'radio_button_unchecked' },
  { id: 9, title: '9. Economic & ROI Analysis', status: 'Not Started', icon: 'radio_button_unchecked' },
  { id: 10, title: '10. Crop-Cycle Timeline', status: 'Not Started', icon: 'radio_button_unchecked' }
];

export const INITIAL_SOIL_DATA: SoilSampleData = {
  coreId: 'SMP-001',
  horizonDepth: '0-30 cm (Topsoil)',
  subsamples: '4 cores logged',
  usdaClassification: 'Clay Loam (USDA)',
  sandPercent: 32,
  siltPercent: 28,
  clayPercent: 40,
  bulkDensity: 1.34,
  porosity: 49.5,
  soilMoistureVwc: 28.4,
  fieldCapacity: 34.0,
  infiltrationRate: 14.2,
  ph: 6.8,
  ec: 0.42,
  orgCarbon: 0.85,
  nitrogenKgHa: 280,
  nitrogenStatus: 'Medium',
  phosphorusKgHa: 34,
  phosphorusStatus: 'Optimal',
  potassiumKgHa: 310,
  potassiumStatus: 'High',
  micronutrients: {
    zn: { val: 1.2, status: 'Norm' },
    fe: { val: 8.5, status: 'Norm' },
    mn: { val: 4.1, status: 'Norm' },
    cu: { val: 0.9, status: 'Normal' },
    b: { val: 0.6, status: 'Normal' }
  },
  compaction: 'Optimal penetrometer resistance (<1.5 MPa)',
  salinity: 'Normal',
  rootZone: 'Healthy root depth up to 45cm logged.',
  photoUrl: APP_ASSETS.soilCoreSample,
  gpsCoords: "12°35'03.2\"N 77°02'34.2\"E",
  gpsAccuracy: '±0.05m'
};

export const INITIAL_ARCHIVE_REPORTS: ArchivedReport[] = [];

