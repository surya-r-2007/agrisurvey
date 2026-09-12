import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Farmer, Farm, FieldParcel, SurveyRecord, Village, Taluk } from '../types';
import { INITIAL_FARMERS, INITIAL_FARMS, INITIAL_FIELDS, INITIAL_SURVEYS } from '../data/initialData';
import { normalizeLocationName, MASTER_TALUKS, MASTER_VILLAGES } from '../data/locationData';

interface StoreState {
  farmers: Farmer[];
  farms: Farm[];
  parcels: FieldParcel[];
  surveys: SurveyRecord[];
  customTaluks: Taluk[];
  customVillages: Village[];

  // Actions
  addFarmer: (farmer: Farmer) => void;
  updateFarmer: (farmer: Farmer) => void;
  deleteFarmer: (id: string) => void;

  addFarm: (farm: Farm) => void;
  updateFarm: (farm: Farm) => void;

  addParcel: (parcel: FieldParcel) => void;
  updateParcel: (parcel: FieldParcel) => void;

  addSurvey: (survey: SurveyRecord) => void;
  updateSurvey: (survey: SurveyRecord) => void;
  deleteSurvey: (id: string) => void;

  // Custom Taluk & Village Management
  addCustomTaluk: (payload: { name: string; districtId: string }) => Taluk | null;
  addCustomVillage: (payload: { name: string; talukId: string; districtId: string }) => Village | null;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      farmers: INITIAL_FARMERS,
      farms: INITIAL_FARMS,
      parcels: INITIAL_FIELDS,
      surveys: INITIAL_SURVEYS,
      customTaluks: [],
      customVillages: [],

      addFarmer: (farmer) => set((state) => ({ farmers: [farmer, ...state.farmers] })),
      updateFarmer: (farmer) => set((state) => ({
        farmers: state.farmers.map((f) => (f.id === farmer.id ? farmer : f))
      })),
      deleteFarmer: (id) => set((state) => ({ farmers: state.farmers.filter((f) => f.id !== id) })),

      addFarm: (farm) => set((state) => ({ farms: [farm, ...state.farms] })),
      updateFarm: (farm) => set((state) => ({
        farms: state.farms.map((f) => (f.id === farm.id ? farm : f))
      })),

      addParcel: (parcel) => set((state) => ({ parcels: [parcel, ...state.parcels] })),
      updateParcel: (parcel) => set((state) => ({
        parcels: state.parcels.map((p) => (p.id === parcel.id ? parcel : p))
      })),

      addSurvey: (survey) => set((state) => ({ surveys: [survey, ...state.surveys] })),
      updateSurvey: (survey) => set((state) => ({
        surveys: state.surveys.map((s) => (s.id === survey.id ? survey : s))
      })),
      deleteSurvey: (id) => set((state) => ({
        surveys: state.surveys.filter((s) => s.id !== id)
      })),

      addCustomTaluk: ({ name, districtId }) => {
        const cleanName = name.trim();
        if (!cleanName || !districtId) return null;

        const normalizedNew = normalizeLocationName(cleanName);
        const { customTaluks } = get();

        // Check duplicates against master taluks for the same district
        const existsInMaster = MASTER_TALUKS.some(
          (t) => t.districtId === districtId && normalizeLocationName(t.name) === normalizedNew
        );
        if (existsInMaster) {
          return MASTER_TALUKS.find(
            (t) => t.districtId === districtId && normalizeLocationName(t.name) === normalizedNew
          ) || null;
        }

        // Check duplicates against already added custom taluks for the same district
        const existingCustom = customTaluks.find(
          (t) => t.districtId === districtId && normalizeLocationName(t.name) === normalizedNew
        );
        if (existingCustom) {
          return existingCustom;
        }

        const newTaluk: Taluk = {
          id: `tlk-custom-${Date.now()}`,
          name: cleanName,
          districtId,
          isCustom: true,
          createdAt: new Date().toISOString()
        };

        set((state) => ({
          customTaluks: [newTaluk, ...state.customTaluks]
        }));

        return newTaluk;
      },

      addCustomVillage: ({ name, talukId, districtId }) => {
        const cleanName = name.trim();
        if (!cleanName || !talukId || !districtId) return null;

        const normalizedNew = normalizeLocationName(cleanName);
        const { customVillages } = get();

        // Check duplicates against master villages for the same taluk
        const existsInMaster = MASTER_VILLAGES.some(
          (v) => v.talukId === talukId && normalizeLocationName(v.name) === normalizedNew
        );
        if (existsInMaster) {
          return MASTER_VILLAGES.find(
            (v) => v.talukId === talukId && normalizeLocationName(v.name) === normalizedNew
          ) || null;
        }

        // Check duplicates against already added custom villages for the same taluk
        const existingCustom = customVillages.find(
          (v) => v.talukId === talukId && normalizeLocationName(v.name) === normalizedNew
        );
        if (existingCustom) {
          return existingCustom;
        }

        const newVillage: Village = {
          id: `vlg-custom-${Date.now()}`,
          name: cleanName,
          talukId,
          districtId,
          isCustom: true,
          createdAt: new Date().toISOString()
        };

        set((state) => ({
          customVillages: [newVillage, ...state.customVillages]
        }));

        return newVillage;
      }
    }),
    {
      name: 'agrisurvey-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

