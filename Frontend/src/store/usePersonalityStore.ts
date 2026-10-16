import { create } from 'zustand';
import type { IPersonalityConfig } from "@/sdk/types";
import { getPersonality, getAllPersonalities } from '../sdk/personalityEngine';

interface PersonalityState {
  activeId: string;
  config: IPersonalityConfig;
  setPersonality: (id: string) => void;
  availablePersonalities: IPersonalityConfig[];
}

export const usePersonalityStore = create<PersonalityState>((set) => {
  // Initialize with 'executive' default
  const defaultId = 'executive';
  
  return {
    activeId: defaultId,
    config: getPersonality(defaultId),
    availablePersonalities: getAllPersonalities(),
    setPersonality: (id: string) => {
      const config = getPersonality(id);
      if (config) {
        set({ activeId: id, config });
        // We will apply CSS variables at the root provider layer, not here in the store, 
        // keeping the store pure.
      }
    }
  };
});
