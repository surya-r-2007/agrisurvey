import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Farmer, Farm, FieldParcel, SurveyRecord } from '../types';
import { INITIAL_FARMERS, INITIAL_FARMS, INITIAL_FIELDS, INITIAL_SURVEYS } from '../data/initialData';

interface StoreState {
  farmers: Farmer[];
  farms: Farm[];
  parcels: FieldParcel[];
  surveys: SurveyRecord[];
  
  // Actions
  addFarmer: (farmer: Farmer) => void;
  deleteFarmer: (id: string) => void;
  addFarm: (farm: Farm) => void;
  addParcel: (parcel: FieldParcel) => void;
  updateParcel: (parcel: FieldParcel) => void;
  addSurvey: (survey: SurveyRecord) => void;
  updateSurvey: (survey: SurveyRecord) => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      farmers: INITIAL_FARMERS,
      farms: INITIAL_FARMS,
      parcels: INITIAL_FIELDS,
      surveys: INITIAL_SURVEYS,

      addFarmer: (farmer) => set((state) => ({ farmers: [farmer, ...state.farmers] })),
      deleteFarmer: (id) => set((state) => ({ farmers: state.farmers.filter((f) => f.id !== id) })),
      addFarm: (farm) => set((state) => ({ farms: [farm, ...state.farms] })),
      
      addParcel: (parcel) => set((state) => ({ parcels: [parcel, ...state.parcels] })),
      updateParcel: (parcel) => set((state) => ({
        parcels: state.parcels.map((p) => (p.id === parcel.id ? parcel : p))
      })),
      
      addSurvey: (survey) => set((state) => ({ surveys: [survey, ...state.surveys] })),
      updateSurvey: (survey) => set((state) => ({
        surveys: state.surveys.map((s) => (s.id === survey.id ? survey : s))
      })),
    }),
    {
      name: 'agrisurvey-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
