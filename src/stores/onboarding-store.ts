'use client';

import { create } from 'zustand';

import type {
  ExperienceLevel,
  ResearchInterest,
  ResearchPreference,
} from '@/src/types';

type OnboardingState = {
  researchInterests: ResearchInterest[];
  experienceLevel: ExperienceLevel | null;
  researchPreferences: ResearchPreference[];
  responsibleUseAccepted: boolean;
  toggleInterest: (interest: ResearchInterest) => void;
  setExperienceLevel: (level: ExperienceLevel) => void;
  togglePreference: (preference: ResearchPreference) => void;
  setResponsibleUseAccepted: (accepted: boolean) => void;
  reset: () => void;
};

const initialState = {
  researchInterests: [] as ResearchInterest[],
  experienceLevel: null as ExperienceLevel | null,
  researchPreferences: [] as ResearchPreference[],
  responsibleUseAccepted: false,
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
  ...initialState,
  toggleInterest: (interest) =>
    set((state) => ({
      researchInterests: state.researchInterests.includes(interest)
        ? state.researchInterests.filter((item) => item !== interest)
        : [...state.researchInterests, interest],
    })),
  setExperienceLevel: (level) => set({ experienceLevel: level }),
  togglePreference: (preference) =>
    set((state) => ({
      researchPreferences: state.researchPreferences.includes(preference)
        ? state.researchPreferences.filter((item) => item !== preference)
        : [...state.researchPreferences, preference],
    })),
  setResponsibleUseAccepted: (accepted) =>
    set({ responsibleUseAccepted: accepted }),
  reset: () => set(initialState),
}));
