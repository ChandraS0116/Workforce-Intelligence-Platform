import type { IPersonalityConfig } from "./types";

// Internal registry
const registry = new Map<string, IPersonalityConfig>();

export function registerPersonality(config: IPersonalityConfig) {
  registry.set(config.id, config);
}

export function getPersonality(id: string): IPersonalityConfig {
  const config = registry.get(id);
  if (!config) {
    console.warn(`Personality ${id} not found, falling back to first available.`);
    return Array.from(registry.values())[0];
  }
  return config;
}

export function getAllPersonalities(): IPersonalityConfig[] {
  return Array.from(registry.values());
}
